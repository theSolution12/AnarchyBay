import { Router } from "express";
import {
  addToCartController,
  removeFromCartController,
  getCartController,
  clearCartController,
  checkCartController,
} from "../controllers/cart.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, getCartController);
router.post("/", requireAuth, addToCartController);
router.delete("/clear", requireAuth, clearCartController);
router.delete("/:productId", requireAuth, removeFromCartController);
router.get("/check/:productId", requireAuth, checkCartController);

export default router;
