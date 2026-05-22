import { Router } from "express";
import {
  createReviewController,
  updateReviewController,
  deleteReviewController,
  getReviewController,
  getProductReviewsController,
  getUserReviewController,
} from "../controllers/review.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/product/:productId", getProductReviewsController);
router.get("/my/:productId", requireAuth, getUserReviewController);
router.get("/:id", getReviewController);

router.post("/product/:productId", requireAuth, createReviewController);
router.put("/:id", requireAuth, updateReviewController);
router.delete("/:id", requireAuth, deleteReviewController);

export default router;
