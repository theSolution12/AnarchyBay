import { Router } from "express";
import {
  getUploadUrlController,
  confirmUploadController,
  updateFileController,
  deleteFileController,
  getFileController,
  getMyFilesController,
  linkFileToProductController,
  linkFileToVariantController,
  unlinkFileFromProductController,
  downloadFileController,
} from "../controllers/file.controller.js";
import { requireAuth, requireCreator } from "../middleware/auth.js";

const router = Router();

router.post("/upload-url", requireAuth, requireCreator, getUploadUrlController);
router.post("/confirm", requireAuth, requireCreator, confirmUploadController);
router.get("/my", requireAuth, requireCreator, getMyFilesController);
router.get("/download/:id", requireAuth, downloadFileController);
router.get("/:id", requireAuth, getFileController);
router.put("/:id", requireAuth, requireCreator, updateFileController);
router.delete("/:id", requireAuth, requireCreator, deleteFileController);

router.post("/link/product", requireAuth, requireCreator, linkFileToProductController);
router.post("/link/variant", requireAuth, requireCreator, linkFileToVariantController);
router.post("/unlink/product", requireAuth, requireCreator, unlinkFileFromProductController);

export default router;