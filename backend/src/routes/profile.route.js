import express from "express";
import { 
    createUserProfileController, 
    getTotalUsersController, 
    getMyProfileController,
    updateMyProfileController,
    uploadProfileImageController,
    getPublicProfileController,
    getProfileByUsernameController,
    getSellerProductsController,
    checkUsernameController,
    searchProfilesController
} from "../controllers/profile.controller.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validation.js";
import { updateProfileSchema } from "../validators/profile.validator.js";
import { upload, handleMulterError } from "../middleware/upload.js";

const router = express.Router();

router.post("/create-user-profile", createUserProfileController);
router.get("/get-total-users", getTotalUsersController);

router.get("/me", requireAuth, getMyProfileController);
router.put("/me", requireAuth, validate(updateProfileSchema), updateMyProfileController);
router.post("/me/image", requireAuth, upload.single('image'), handleMulterError, uploadProfileImageController);

router.get("/search", searchProfilesController);
router.get("/check-username/:username", optionalAuth, checkUsernameController);
router.get("/u/:username", getProfileByUsernameController);
router.get("/user/:userId", getPublicProfileController);
router.get("/user/:userId/products", getSellerProductsController);

export default router;