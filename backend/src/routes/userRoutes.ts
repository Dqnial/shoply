import express from "express";
import {
  authUser,
  registerUser,
  logoutUser,
  updateUserProfile,
  getUserProfile,
  getUserBalance,
  topUpBalance,
  withdrawBalance,
  adminTopUpBalance,
} from "../controllers/userController.js";
import { protect, AuthRequest, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", authUser);
router.post("/register", registerUser);
router.post("/logout", logoutUser);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.get("/balance", protect, getUserBalance);

router.put("/balance/withdraw", protect, withdrawBalance);

router.put("/balance/topup", protect, admin, topUpBalance);

router.put("/:id/balance", protect, admin, adminTopUpBalance);

export default router;
