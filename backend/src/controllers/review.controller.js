import {
  createReview,
  updateReview,
  deleteReview,
  getReview,
  getProductReviews,
  getUserReviewForProduct,
} from "../services/review.service.js";

export const createReviewController = async (req, res) => {
  try {
    const { data, error } = await createReview(
      req.user.id,
      req.params.productId,
      req.body
    );
    if (error) {
      return res.status(error.status || 400).json({ error: error.message });
    }
    return res.status(201).json({ review: data });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateReviewController = async (req, res) => {
  try {
    const { data, error } = await updateReview(req.params.id, req.user.id, req.body);
    if (error) {
      return res.status(error.status || 400).json({ error: error.message });
    }
    return res.status(200).json({ review: data });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteReviewController = async (req, res) => {
  try {
    const { error } = await deleteReview(req.params.id, req.user.id);
    if (error) {
      return res.status(error.status || 400).json({ error: error.message });
    }
    return res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getReviewController = async (req, res) => {
  try {
    const { data, error } = await getReview(req.params.id);
    if (error || !data) {
      return res.status(404).json({ error: "Review not found" });
    }
    return res.status(200).json({ review: data });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getProductReviewsController = async (req, res) => {
  try {
    const { page = 1, limit = 20, sortBy = "created_at", sortOrder = "desc" } = req.query;
    const result = await getProductReviews(req.params.productId, {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder,
    });
    return res.status(200).json({
      reviews: result.data || [],
      total: result.count || 0,
      stats: result.stats,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserReviewController = async (req, res) => {
  try {
    const { data, error } = await getUserReviewForProduct(
      req.params.productId,
      req.user.id
    );
    if (error || !data) {
      return res.status(200).json({ review: null });
    }
    return res.status(200).json({ review: data });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
