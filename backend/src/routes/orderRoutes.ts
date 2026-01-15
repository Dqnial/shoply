import express from "express";
import {
  addOrderItems,
  getOrderById,
  getMyOrders,
  getOrders,
  getOrderSummary,
  updateOrderToPaid,
  updateOrderToDelivered,
  deleteOrder,
} from "../controllers/orderController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/summary").get(protect, admin, getOrderSummary);
router.route("/myorders").get(protect, getMyOrders);

router.route("/").post(protect, addOrderItems).get(protect, admin, getOrders);

router
  .route("/:id")
  .get(protect, getOrderById)
  .delete(protect, admin, deleteOrder);

router.route("/:id/pay").put(protect, admin, updateOrderToPaid);
router.route("/:id/deliver").put(protect, admin, updateOrderToDelivered);

export default router;
