import { Request, Response } from "express";
import Order from "../models/Order.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

// @desc    Создать новый заказ
// @route   POST /api/orders
// @access  Private
export const addOrderItems = async (req: AuthRequest, res: Response) => {
  const { orderItems, shippingAddress, totalPrice } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error("Нет товаров в заказе");
  } else {
    const order = new Order({
      user: req.user?._id,
      orderItems: orderItems.map((x: any) => ({
        ...x,
        product: x.product, // ID товара
        _id: undefined,
      })),
      shippingAddress,
      totalPrice,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  }
};

// @desc    Получить заказ по ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req: AuthRequest, res: Response) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (order) {
    // Если ты не админ И заказ не твой — 403
    if (
      !req.user?.isAdmin &&
      order.user._id.toString() !== req.user?._id.toString()
    ) {
      res.status(403);
      throw new Error("Нет прав на просмотр этого заказа");
    }
    res.json(order);
  } else {
    res.status(404);
    throw new Error("Заказ не найден");
  }
};

// @desc    Обновить статус оплаты (Моковая оплата)
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = new Date();

    // В реальном проекте здесь сохраняются данные от Stripe/PayPal
    // order.paymentResult = { id: req.body.id, status: req.body.status, ... }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Заказ не найден");
  }
};

// @desc    Получить заказы текущего пользователя
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req: AuthRequest, res: Response) => {
  const orders = await Order.find({ user: req.user?._id });
  res.json(orders);
};

// @desc    Получить все заказы (Админ)
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req: Request, res: Response) => {
  const orders = await Order.find({}).populate("user", "id name");
  res.json(orders);
};
