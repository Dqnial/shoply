import express from 'express';
import {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    getMyOrders,
    getOrders
} from '../controllers/orderController.js';
import {protect, admin} from '../middleware/authMiddleware.js';

const router = express.Router();

// Путь: /api/orders
router.route('/')
    .post(protect, addOrderItems) // Создать заказ (Любой вошедший)
    .get(protect, admin, getOrders); // Получить все заказы (Только админ)

// Путь: /api/orders/myorders
router.route('/myorders')
    .get(protect, getMyOrders); // Получить заказы текущего пользователя

// Путь: /api/orders/:id
router.route('/:id')
    .get(protect, getOrderById); // Получить детали конкретного заказа

// Путь: /api/orders/:id/pay
router.route('/:id/pay')
    .put(protect, updateOrderToPaid); // Отметить как оплаченный (Моковая оплата)

export default router;