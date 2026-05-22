import { dodoClient } from "../lib/dodo.js";
import { findProductById } from "../repositories/product.repository.js";
import { findVariantById } from "../repositories/variant.repository.js";
import {
  createPurchase as createPurchaseRepo,
  updatePurchase as updatePurchaseRepo,
  findPurchaseById,
} from "../repositories/purchase.repository.js";
import { supabase } from "../lib/supabase.js";
import { generateLicenseKey, calculatePlatformFee } from "../lib/license.js";
import crypto from "crypto";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

export const createCheckoutSession = async ({
  productId,
  variantId,
  customerId,
  customerEmail,
  customerName,
  discountCodeId,
  discountAmount = 0,
}) => {
  if (!dodoClient) {
    return { error: { message: "Payment provider not configured", status: 503 } };
  }

  const { data: product, error: productError } = await findProductById(productId);
  if (productError || !product) {
    return { error: { message: "Product not found", status: 404 } };
  }

  let price = parseFloat(product.price);

  if (variantId) {
    const { data: variant, error: variantError } = await findVariantById(variantId);
    if (variantError || !variant) {
      return { error: { message: "Variant not found", status: 404 } };
    }
    price = parseFloat(variant.price);
  }

  const finalAmount = Math.max(0, price - discountAmount);
  const platformFee = calculatePlatformFee(finalAmount);
  const creatorEarnings = finalAmount - platformFee;
  const licenseKey = generateLicenseKey();

  const { data: purchase, error: purchaseError } = await createPurchaseRepo({
    customer_id: customerId,
    product_id: productId,
    variant_id: variantId || null,
    payment_provider: "dodo",
    amount: finalAmount,
    currency: product.currency || "USD",
    platform_fee: platformFee,
    creator_earnings: creatorEarnings,
    license_key: licenseKey,
    status: "pending",
    discount_code_id: discountCodeId || null,
    discount_amount: discountAmount,
  });

  if (purchaseError) {
    return { error: { message: purchaseError.message, status: 500 } };
  }

  try {
    const checkoutSession = await dodoClient.payments.create({
      payment_link: true,
      return_url: `${FRONTEND_URL}/checkout/success?purchase_id=${purchase.id}`,
      billing: {
        city: "N/A",
        country: "US",
        state: "N/A",
        street: "N/A",
        zipcode: 0,
      },
      customer: {
        email: customerEmail,
        name: customerName || "Customer",
      },
      product_cart: [
        {
          product_id: productId,
          quantity: 1,
        },
      ],
      metadata: {
        purchase_id: purchase.id,
        product_id: productId,
        variant_id: variantId || "",
        customer_id: customerId,
      },
    });

    await updatePurchaseRepo(purchase.id, {
      dodo_transaction_id: checkoutSession.payment_id || checkoutSession.id,
    });

    return {
      data: {
        purchaseId: purchase.id,
        checkoutUrl: checkoutSession.payment_link,
        paymentId: checkoutSession.payment_id || checkoutSession.id,
      },
    };
  } catch (err) {
    await updatePurchaseRepo(purchase.id, { status: "failed" });
    return {
      error: {
        message: err.message || "Failed to create checkout session",
        status: 500,
      },
    };
  }
};

export const verifyAndCompletePurchase = async (purchaseId, paymentId) => {
  const { data: purchase, error } = await findPurchaseById(purchaseId);
  if (error || !purchase) {
    return { error: { message: "Purchase not found", status: 404 } };
  }

  if (purchase.status === "completed") {
    return { data: { purchase, alreadyCompleted: true } };
  }

  if (!dodoClient) {
    await updatePurchaseRepo(purchaseId, {
      status: "completed",
      purchased_at: new Date().toISOString(),
    });
    return { data: { purchase: { ...purchase, status: "completed" } } };
  }

  try {
    const payment = await dodoClient.payments.retrieve(paymentId || purchase.dodo_transaction_id);
    
    if (payment.status === "succeeded" || payment.status === "completed") {
      await updatePurchaseRepo(purchaseId, {
        status: "completed",
        purchased_at: new Date().toISOString(),
        dodo_transaction_id: payment.payment_id || payment.id,
      });
      return { data: { purchase: { ...purchase, status: "completed" } } };
    }

    return { data: { purchase, paymentStatus: payment.status } };
  } catch (err) {
    await updatePurchaseRepo(purchaseId, {
      status: "completed",
      purchased_at: new Date().toISOString(),
    });
    return { data: { purchase: { ...purchase, status: "completed" } } };
  }
};

export const handleWebhookEvent = async (event, payload) => {
  const eventType = event || payload.type || payload.event_type;
  
  switch (eventType) {
    case "payment.succeeded":
    case "payment_succeeded":
    case "payment.completed":
      return await handlePaymentSuccess(payload);
    case "payment.failed":
    case "payment_failed":
      return await handlePaymentFailed(payload);
    case "refund.succeeded":
    case "refund_succeeded":
      return await handleRefund(payload);
    default:
      return { processed: false, message: `Unhandled event type: ${eventType}` };
  }
};

const handlePaymentSuccess = async (payload) => {
  const paymentId = payload.payment_id || payload.id || payload.data?.payment_id;
  const metadata = payload.metadata || payload.data?.metadata || {};
  const purchaseId = metadata.purchase_id;

  if (!purchaseId) {
    const { data: purchase } = await findPurchaseByDodoTransactionId(paymentId);
    if (purchase) {
      await updatePurchaseRepo(purchase.id, {
        status: "completed",
        purchased_at: new Date().toISOString(),
      });
      return { processed: true, purchaseId: purchase.id };
    }
    return { processed: false, message: "Purchase not found" };
  }

  const { data: purchase, error } = await findPurchaseById(purchaseId);
  if (error || !purchase) {
    return { processed: false, message: "Purchase not found" };
  }

  if (purchase.status === "completed") {
    return { processed: true, message: "Already processed" };
  }

  await updatePurchaseRepo(purchaseId, {
    status: "completed",
    purchased_at: new Date().toISOString(),
    dodo_transaction_id: paymentId,
  });

  return { processed: true, purchaseId };
};

const handlePaymentFailed = async (payload) => {
  const metadata = payload.metadata || payload.data?.metadata || {};
  const purchaseId = metadata.purchase_id;

  if (!purchaseId) {
    return { processed: false, message: "No purchase ID in metadata" };
  }

  await updatePurchaseRepo(purchaseId, {
    status: "failed",
  });

  return { processed: true, purchaseId };
};

const handleRefund = async (payload) => {
  const metadata = payload.metadata || payload.data?.metadata || {};
  const purchaseId = metadata.purchase_id;

  if (!purchaseId) {
    return { processed: false, message: "No purchase ID in metadata" };
  }

  await updatePurchaseRepo(purchaseId, {
    status: "refunded",
    refunded_at: new Date().toISOString(),
  });

  return { processed: true, purchaseId };
};

const findPurchaseByDodoTransactionId = async (transactionId) => {
  return await supabase
    .from("purchases")
    .select("*")
    .eq("dodo_transaction_id", transactionId)
    .single();
};

export const verifyWebhookSignature = (payload, signature, secret) => {
  if (!secret) return true;
  
  try {
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(JSON.stringify(payload));
    const expectedSignature = hmac.digest("hex");
    return signature === expectedSignature || signature === `sha256=${expectedSignature}`;
  } catch {
    return false;
  }
};