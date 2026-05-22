import {
  createReview as createReviewRepo,
  updateReview as updateReviewRepo,
  deleteReview as deleteReviewRepo,
  findReviewById,
  findReviewsByProduct,
  findUserReviewForProduct,
  getProductRatingStats,
} from "../repositories/review.repository.js";
import { findProductById, updateProduct } from "../repositories/product.repository.js";

export const createReview = async (userId, productId, reviewData) => {
  const { data: existing } = await findUserReviewForProduct(productId, userId);
  if (existing) {
    return { error: { message: "You already reviewed this product", status: 400 } };
  }

  const { data: product } = await findProductById(productId);
  if (!product) {
    return { error: { message: "Product not found", status: 404 } };
  }

  if (product.creator_id === userId) {
    return { error: { message: "Cannot review your own product", status: 400 } };
  }

  const { data, error } = await createReviewRepo({
    product_id: productId,
    user_id: userId,
    rating: reviewData.rating,
    comment: reviewData.comment,
    media_urls: reviewData.media_urls || [],
  });

  if (!error) {
    await updateProductRatingStats(productId);
  }

  return { data, error };
};

export const updateReview = async (reviewId, userId, reviewData) => {
  const { data: existing, error: findError } = await findReviewById(reviewId);

  if (findError || !existing) {
    return { error: { message: "Review not found", status: 404 } };
  }

  if (existing.user_id !== userId) {
    return { error: { message: "Unauthorized", status: 403 } };
  }

  const { data, error } = await updateReviewRepo(reviewId, {
    rating: reviewData.rating,
    comment: reviewData.comment,
    media_urls: reviewData.media_urls,
  });

  if (!error) {
    await updateProductRatingStats(existing.product_id);
  }

  return { data, error };
};

export const deleteReview = async (reviewId, userId) => {
  const { data: existing, error: findError } = await findReviewById(reviewId);

  if (findError || !existing) {
    return { error: { message: "Review not found", status: 404 } };
  }

  if (existing.user_id !== userId) {
    return { error: { message: "Unauthorized", status: 403 } };
  }

  const productId = existing.product_id;
  const { error } = await deleteReviewRepo(reviewId);

  if (!error) {
    await updateProductRatingStats(productId);
  }

  return { error };
};

export const getReview = async (reviewId) => {
  return await findReviewById(reviewId);
};

export const getProductReviews = async (productId, options = {}) => {
  const [reviewsResult, stats] = await Promise.all([
    findReviewsByProduct(productId, options),
    getProductRatingStats(productId),
  ]);

  return {
    data: reviewsResult.data,
    count: reviewsResult.count,
    stats,
    error: reviewsResult.error,
  };
};

export const getUserReviewForProduct = async (productId, userId) => {
  return await findUserReviewForProduct(productId, userId);
};

const updateProductRatingStats = async (productId) => {
  const stats = await getProductRatingStats(productId);
  await updateProduct(productId, {
    rating_avg: stats.avg,
    rating_count: stats.count,
  });
};
