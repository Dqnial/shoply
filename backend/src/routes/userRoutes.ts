import express from "express";
import {
  authUser,
  registerUser,
  logoutUser,
  updateUserProfile,
  getUserProfile,
} from "../controllers/userController.js";
import { protect, AuthRequest } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", authUser);
router.post("/register", registerUser);
router.post("/logout", logoutUser);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
export default router;
