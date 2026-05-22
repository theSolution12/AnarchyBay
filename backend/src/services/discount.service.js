import {
  createDiscountCode as createDiscountRepo,
  updateDiscountCode as updateDiscountRepo,
  deleteDiscountCode as deleteDiscountRepo,
  findDiscountCodeById,
  findDiscountCodeByCode,
  findDiscountCodesByCreator,
  incrementDiscountUsage,
  associateDiscountWithProduct,
  removeDiscountProductAssociation,
  findProductsForDiscount,
  isDiscountValidForProduct,
} from "../repositories/discount.repository.js";
import { generateDiscountCode, calculateDiscount } from "../lib/license.js";

export const createDiscount = async (creatorId, discountData) => {
  const code = discountData.code || generateDiscountCode();

  return await createDiscountRepo({
    creator_id: creatorId,
    code: code.toUpperCase(),
    type: discountData.type,
    value: discountData.value,
    applies_to: discountData.appliesTo || "all",
    usage_limit: discountData.usageLimit || null,
    times_used: 0,
    expires_at: discountData.expiresAt || null,
    is_active: true,
  });
};

export const updateDiscount = async (creatorId, discountId, discountData) => {
  const { data: discount, error: findError } = await findDiscountCodeById(discountId);

  if (findError || !discount) {
    return { error: { message: "Discount code not found", status: 404 } };
  }

  if (discount.creator_id !== creatorId) {
    return { error: { message: "Unauthorized", status: 403 } };
  }

  const updateData = {};
  if (discountData.type) updateData.type = discountData.type;
  if (discountData.value !== undefined) updateData.value = discountData.value;
  if (discountData.appliesTo) updateData.applies_to = discountData.appliesTo;
  if (discountData.usageLimit !== undefined) updateData.usage_limit = discountData.usageLimit;
  if (discountData.expiresAt !== undefined) updateData.expires_at = discountData.expiresAt;
  if (discountData.isActive !== undefined) updateData.is_active = discountData.isActive;

  return await updateDiscountRepo(discountId, updateData);
};

export const deleteDiscount = async (creatorId, discountId) => {
  const { data: discount, error: findError } = await findDiscountCodeById(discountId);

  if (findError || !discount) {
    return { error: { message: "Discount code not found", status: 404 } };
  }

  if (discount.creator_id !== creatorId) {
    return { error: { message: "Unauthorized", status: 403 } };
  }

  return await deleteDiscountRepo(discountId);
};

export const getDiscount = async (discountId) => {
  return await findDiscountCodeById(discountId);
};

export const getMyDiscounts = async (creatorId, options = {}) => {
  return await findDiscountCodesByCreator(creatorId, options);
};

export const validateDiscount = async (code, productId, price) => {
  const { data: discount, error } = await findDiscountCodeByCode(code);

  if (error || !discount) {
    return { valid: false, error: { message: "Invalid discount code" } };
  }

  if (!discount.is_active) {
    return { valid: false, error: { message: "Discount code is inactive" } };
  }

  if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
    return { valid: false, error: { message: "Discount code has expired" } };
  }

  if (discount.usage_limit && discount.times_used >= discount.usage_limit) {
    return { valid: false, error: { message: "Discount code usage limit reached" } };
  }

  if (productId && discount.applies_to !== "all") {
    const isValid = await isDiscountValidForProduct(discount.id, productId);
    if (!isValid) {
      return { valid: false, error: { message: "Discount code not valid for this product" } };
    }
  }

  const discountAmount = calculateDiscount(price, {
    type: discount.type,
    value: discount.value,
  });

  return {
    valid: true,
    discount: {
      id: discount.id,
      code: discount.code,
      type: discount.type,
      value: discount.value,
      discountAmount,
      finalPrice: price - discountAmount,
    },
  };
};

export const useDiscount = async (discountId) => {
  return await incrementDiscountUsage(discountId);
};

export const addProductToDiscount = async (creatorId, discountId, productId) => {
  const { data: discount } = await findDiscountCodeById(discountId);

  if (!discount || discount.creator_id !== creatorId) {
    return { error: { message: "Unauthorized", status: 403 } };
  }

  return await associateDiscountWithProduct(discountId, productId);
};

export const removeProductFromDiscount = async (creatorId, discountId, productId) => {
  const { data: discount } = await findDiscountCodeById(discountId);

  if (!discount || discount.creator_id !== creatorId) {
    return { error: { message: "Unauthorized", status: 403 } };
  }

  return await removeDiscountProductAssociation(discountId, productId);
};

export const getDiscountProducts = async (discountId) => {
  return await findProductsForDiscount(discountId);
};
