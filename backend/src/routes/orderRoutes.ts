import express from "express";
import {
  addOrderItems,
  getOrderById,
  getMyOrders,
  getOrders,
} from "../controllers/orderController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @desc    /api/orders
 */
router.route("/").post(protect, addOrderItems).get(protect, admin, getOrders);

/**
 * @desc    /api/orders/myorders
 */
router.route("/myorders").get(protect, getMyOrders);

/**
 * @desc    /api/orders/:id
 */
router.route("/:id").get(protect, getOrderById);

export default router;
