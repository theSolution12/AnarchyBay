import { Router } from "express";
import {
  getDownloadUrlController,
  getDownloadUrlsController,
  checkDownloadAccessController,
} from "../controllers/download.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/access/:productId", requireAuth, checkDownloadAccessController);
router.get("/:purchaseId", requireAuth, getDownloadUrlsController);
router.get("/:purchaseId/:fileId", requireAuth, getDownloadUrlController);

export default router;
