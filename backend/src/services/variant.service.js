import {
  createVariant as createVariantRepo,
  updateVariant as updateVariantRepo,
  deactivateVariant,
  findVariantById,
  findVariantsByProduct,
} from "../repositories/variant.repository.js";
import { findProductById } from "../repositories/product.repository.js";

export const createVariant = async (creatorId, productId, variantData) => {
  const { data: product, error: productError } = await findProductById(productId);

  if (productError || !product) {
    return { error: { message: "Product not found", status: 404 } };
  }

  if (product.creator_id !== creatorId) {
    return { error: { message: "Unauthorized", status: 403 } };
  }

  return await createVariantRepo({
    ...variantData,
    product_id: productId,
    is_active: true,
  });
};

export const updateVariant = async (creatorId, variantId, variantData) => {
  const { data: variant, error: variantError } = await findVariantById(variantId);

  if (variantError || !variant) {
    return { error: { message: "Variant not found", status: 404 } };
  }

  const { data: product } = await findProductById(variant.product_id);

  if (!product || product.creator_id !== creatorId) {
    return { error: { message: "Unauthorized", status: 403 } };
  }

  return await updateVariantRepo(variantId, variantData);
};

export const deleteVariant = async (creatorId, variantId) => {
  const { data: variant, error: variantError } = await findVariantById(variantId);

  if (variantError || !variant) {
    return { error: { message: "Variant not found", status: 404 } };
  }

  const { data: product } = await findProductById(variant.product_id);

  if (!product || product.creator_id !== creatorId) {
    return { error: { message: "Unauthorized", status: 403 } };
  }

  return await deactivateVariant(variantId);
};

export const getVariant = async (variantId) => {
  return await findVariantById(variantId);
};

export const getProductVariants = async (productId) => {
  return await findVariantsByProduct(productId);
};
