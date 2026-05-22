import { Router } from "express";
import {
  requestPayoutController,
  getPayoutController,
  getMyPayoutsController,
  getPayoutEligibilityController,
} from "../controllers/payout.controller.js";
import { requireAuth, requireCreator } from "../middleware/auth.js";

const router = Router();

router.post("/request", requireAuth, requireCreator, requestPayoutController);
router.get("/eligibility", requireAuth, requireCreator, getPayoutEligibilityController);
router.get("/my", requireAuth, requireCreator, getMyPayoutsController);
router.get("/:id", requireAuth, requireCreator, getPayoutController);

export default router;
