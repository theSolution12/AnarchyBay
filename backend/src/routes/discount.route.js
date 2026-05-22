import { Router } from "express";
import {
  createDiscountController,
  updateDiscountController,
  deleteDiscountController,
  getDiscountController,
  getMyDiscountsController,
  validateDiscountController,
  addProductToDiscountController,
  removeProductFromDiscountController,
  getDiscountProductsController,
} from "../controllers/discount.controller.js";
import { requireAuth, requireCreator } from "../middleware/auth.js";

const router = Router();

router.post("/validate", validateDiscountController);

router.post("/", requireAuth, requireCreator, createDiscountController);
router.get("/my", requireAuth, requireCreator, getMyDiscountsController);
router.get("/:id", requireAuth, requireCreator, getDiscountController);
router.put("/:id", requireAuth, requireCreator, updateDiscountController);
router.delete("/:id", requireAuth, requireCreator, deleteDiscountController);
router.get("/:id/products", requireAuth, requireCreator, getDiscountProductsController);
router.post("/:id/products", requireAuth, requireCreator, addProductToDiscountController);
router.delete("/:id/products", requireAuth, requireCreator, removeProductFromDiscountController);

export default router;
