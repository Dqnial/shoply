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
import { authLimiter, balanceLimiter } from "../middleware/rateLimit.js";
import { validate } from "../middleware/validate.js";
import {
  registerSchema,
  loginSchema,
} from "../validators/authValidators.js";
import {
  updateProfileSchema,
  adminUpdateUserSchema,
} from "../validators/userValidators.js";

const router = express.Router();

// --- Публичные роуты ---
router.post("/login", authLimiter, validate(loginSchema), authUser);
router.post("/register", authLimiter, validate(registerSchema), registerUser);
router.post("/logout", logoutUser);

// --- Роуты авторизованного пользователя ---
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, validate(updateProfileSchema), updateUserProfile);

router.get("/balance", protect, getUserBalance);
router.put("/balance/withdraw", protect, balanceLimiter, withdrawBalance);

// --- АДМИНСКИЕ РОУТЫ ---

// GET /api/users - Получить всех
router.route("/").get(protect, admin, getUsers);

// GET /api/users/:id, DELETE /api/users/:id, PUT /api/users/:id
router
  .route("/:id")
  .put(protect, admin, validate(adminUpdateUserSchema), updateUser)
  .delete(protect, admin, deleteUser);

// Специальные админские действия
router.put("/balance/topup", protect, admin, balanceLimiter, topUpBalance);
router.put("/:id/balance", protect, admin, balanceLimiter, adminTopUpBalance);

export default router;
