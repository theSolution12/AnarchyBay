import { Router } from "express";
import {
  addToWishlistController,
  removeFromWishlistController,
  getWishlistController,
  checkWishlistController,
} from "../controllers/wishlist.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, getWishlistController);
router.post("/", requireAuth, addToWishlistController);
router.delete("/:productId", requireAuth, removeFromWishlistController);
router.get("/check/:productId", requireAuth, checkWishlistController);

export default router;
