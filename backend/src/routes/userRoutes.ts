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
  getUsers,
  deleteUser,
  updateUser,
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// --- Публичные роуты ---
router.post("/login", authUser);
router.post("/register", registerUser);
router.post("/logout", logoutUser);

// --- Роуты авторизованного пользователя ---
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.get("/balance", protect, getUserBalance);
router.put("/balance/withdraw", protect, withdrawBalance);

// --- АДМИНСКИЕ РОУТЫ ---

// GET /api/users - Получить всех
router.route("/").get(protect, admin, getUsers);

// GET /api/users/:id, DELETE /api/users/:id, PUT /api/users/:id
router
  .route("/:id")
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

// Специальные админские действия
router.put("/balance/topup", protect, admin, topUpBalance);
router.put("/:id/balance", protect, admin, adminTopUpBalance);

export default router;
