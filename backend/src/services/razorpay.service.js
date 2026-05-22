import { razorpayClient } from "../lib/razorpay.js";
import crypto from "crypto";
import { logger } from "../lib/logger.js";
import { supabase } from "../lib/supabase.js";
import {
  createPurchase,
  updatePurchase,
} from "../repositories/purchase.repository.js";
import { findProductById } from "../repositories/product.repository.js";
import { findVariantById } from "../repositories/variant.repository.js";
import {
  generateLicenseKey,
  calculatePlatformFee,
  calculateDiscount,
} from "../lib/license.js";
import { validateDiscount, useDiscount } from "./discount.service.js";

export const createRazorpayOrder = async ({
  productId,
  productIds,
  variantId,
  customerId,
  discountAmount = 0,
  discountCodeId = null,
  discountCode = null,
}) => {
  if (!razorpayClient) {
    logger.error(
      "Razorpay client not configured. Missing RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET.",
    );
    throw new Error(
      "Payment configuration error: missing Razorpay authentication keys.",
    );
  }
  let finalAmount = 0;
  let currency = "INR";
  const items = [];
  let validatedDiscount = null;

  if (productIds && Array.isArray(productIds)) {
    for (const id of productIds) {
      const { data: product, error: productError } = await findProductById(id);
      if (productError || !product) throw new Error(`Product ${id} not found`);
      finalAmount += parseFloat(product.price);
      currency = product.currency || "INR";
      items.push(product);
    }
  } else if (productId) {
    const { data: product, error: productError } =
      await findProductById(productId);
    if (productError || !product) throw new Error("Product not found");
    let price = parseFloat(product.price);
    if (variantId) {
      const { data: variant, error: variantError } =
        await findVariantById(variantId);
      if (variantError || !variant) throw new Error("Variant not found");
      price = parseFloat(variant.price);
    }
    finalAmount = price;
    currency = product.currency || "INR";
    items.push(product);
  } else {
    throw new Error("No products specified");
  }

  // Validate and apply discount code if provided
  let totalDiscountAmount = 0;
  if (discountCode) {
    const validation = await validateDiscount(discountCode, null, finalAmount);
    if (!validation.valid) {
      throw new Error(validation.error.message);
    }
    validatedDiscount = validation.discount;

    // Calculate discount amount
    if (validatedDiscount.type === "percentage") {
      totalDiscountAmount = (finalAmount * validatedDiscount.value) / 100;
    } else {
      totalDiscountAmount = validatedDiscount.value;
    }

    // Ensure discount doesn't exceed total
    totalDiscountAmount = Math.min(totalDiscountAmount, finalAmount);
  } else if (discountAmount > 0) {
    // Use provided discount amount if no code specified
    totalDiscountAmount = discountAmount;
  }

  finalAmount = Math.max(0, finalAmount - totalDiscountAmount);
  const amountInPaise = Math.round(finalAmount * 100);

  const options = {
    amount: amountInPaise,
    currency: currency,
    receipt: `receipt_${Date.now()}`,
  };

  try {
    const order = await razorpayClient.orders.create(options);
    const purchaseIds = [];

    for (const item of items) {
      const itemAmount = parseFloat(item.price);

      // Calculate proportional discount for this item if discount is applied
      let itemDiscount = 0;
      if (totalDiscountAmount > 0 && items.length > 1) {
        // Proportional discount based on item price
        const subtotal = items.reduce((sum, i) => sum + parseFloat(i.price), 0);
        itemDiscount = (itemAmount / subtotal) * totalDiscountAmount;
      } else if (totalDiscountAmount > 0 && items.length === 1) {
        // Single item gets full discount
        itemDiscount = totalDiscountAmount;
      }

      const finalItemAmount = itemAmount - itemDiscount;
      const platformFee = calculatePlatformFee(finalItemAmount);
      const creatorEarnings = finalItemAmount - platformFee;
      const licenseKey = generateLicenseKey();

      const { data: purchase, error: purchaseError } = await createPurchase({
        customer_id: customerId,
        product_id: item.id,
        seller_id: item.creator_id,
        variant_id: productId === item.id ? variantId || null : null,
        payment_provider: "razorpay",
        razorpay_order_id: order.id,
        amount: itemAmount,
        currency: currency,
        platform_fee: platformFee,
        creator_earnings: creatorEarnings,
        license_key: licenseKey,
        status: "pending",
        discount_code_id: validatedDiscount
          ? validatedDiscount.id
          : discountCodeId || null,
        discount_amount: itemDiscount,
      });

      if (purchaseError) throw new Error("Failed to create purchase record");
      purchaseIds.push(purchase.id);
    }

    // Increment discount usage after successful order creation
    if (validatedDiscount) {
      await useDiscount(validatedDiscount.id);
    }

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      purchaseId: purchaseIds[0], // For backward compatibility
      purchaseIds: purchaseIds,
    };
  } catch (error) {
    logger.error({ error: error.message }, "Razorpay order creation failed");
    throw error;
  }
};

export const verifyRazorpayPayment = async ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) => {
  if (process.env.RAZORPAY_TEST_MODE === "true") {
    const { data: purchases, error: findError } = await supabase
      .from("purchases")
      .select("id")
      .eq("razorpay_order_id", razorpay_order_id);

    if (findError || !purchases || purchases.length === 0) {
      throw new Error("Purchases not found");
    }

    const results = [];
    for (const purchase of purchases) {
      const { data: updated, error: updateError } = await updatePurchase(
        purchase.id,
        {
          status: "completed",
          razorpay_payment_id:
            razorpay_payment_id || `test_payment_${razorpay_order_id}`,
          purchased_at: new Date().toISOString(),
        },
      );

      if (updateError) {
        throw new Error(`Failed to update purchase ${purchase.id}`);
      }

      results.push(updated);
    }

    return results[0];
  }

  if (!process.env.RAZORPAY_KEY_SECRET) {
    logger.error(
      "Missing RAZORPAY_KEY_SECRET environment variable. Cannot verify payment signature.",
    );
    throw new Error(
      "Payment configuration error: missing Razorpay secret key for signature verification.",
    );
  }
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  const isSignatureValid = expectedSignature === razorpay_signature;

  if (!isSignatureValid) {
    throw new Error("Invalid payment signature");
  }

  // Find all purchases with this order ID
  const { data: purchases, error: findError } = await supabase
    .from("purchases")
    .select("id")
    .eq("razorpay_order_id", razorpay_order_id);

  if (findError || !purchases) {
    throw new Error("Purchases not found");
  }

  const results = [];
  for (const p of purchases) {
    const { data: updated, error: updateError } = await updatePurchase(p.id, {
      status: "completed",
      razorpay_payment_id: razorpay_payment_id,
      purchased_at: new Date().toISOString(),
    });
    if (updateError) throw new Error(`Failed to update purchase ${p.id}`);
    results.push(updated);
  }

  return results[0]; // Return the first one for compatibility
};
