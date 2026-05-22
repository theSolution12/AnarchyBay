import { Router } from "express";
import {
  validateLicenseController,
  activateLicenseController,
  deactivateLicenseController,
  revokeAllActivationsController,
  getLicenseActivationsController,
  revokeLicenseController,
} from "../controllers/license.controller.js";
import { requireAuth, requireCreator } from "../middleware/auth.js";

const router = Router();

router.post("/validate", validateLicenseController);
router.post("/activate", activateLicenseController);
router.post("/deactivate", deactivateLicenseController);

router.get("/:licenseKey/activations", requireAuth, getLicenseActivationsController);
router.delete("/:licenseKey/activations", requireAuth, requireCreator, revokeAllActivationsController);
router.delete("/:licenseKey/revoke", requireAuth, requireCreator, revokeLicenseController);

export default router;
