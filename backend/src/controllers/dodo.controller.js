import { createCheckoutSession, verifyAndCompletePurchase } from "../services/dodo.service.js";
import { validateDiscount } from "../services/discount.service.js";
import { findProductById } from "../repositories/product.repository.js";

export const createDodoCheckoutController = async (req, res) => {
  try {
    const { productId, variantId, discountCode } = req.body;

    if (!productId) {
      return res.status(400).json({ error: "productId is required" });
    }

    const { data: product, error: productError } = await findProductById(productId);
    if (productError || !product) {
      return res.status(404).json({ error: "Product not found" });
    }

    let discountAmount = 0;
    let discountCodeId = null;

    if (discountCode) {
      const validation = await validateDiscount(discountCode, productId, parseFloat(product.price));
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error.message });
      }
      discountAmount = validation.discount.discountAmount;
      discountCodeId = validation.discount.id;
    }

    const { data, error } = await createCheckoutSession({
      productId,
      variantId,
      customerId: req.user.id,
      customerEmail: req.user.email,
      customerName: req.user.name,
      discountCodeId,
      discountAmount,
    });

    if (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }

    return res.status(201).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const verifyPurchaseController = async (req, res) => {
  try {
    const { purchaseId } = req.params;
    const { paymentId } = req.query;

    if (!purchaseId) {
      return res.status(400).json({ error: "purchaseId is required" });
    }

    const { data, error } = await verifyAndCompletePurchase(purchaseId, paymentId);

    if (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};