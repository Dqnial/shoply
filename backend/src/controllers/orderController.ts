import { Request, Response } from "express";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

/**
 * @desc    Создать новый заказ и оплатить с баланса
 * @route   POST /api/orders
 * @access  Private
 */
export const addOrderItems = async (req: AuthRequest, res: Response) => {
  const { orderItems, shippingAddress, totalPrice, paymentMethod } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error("Нет товаров в заказе");
  }

  const user = await User.findById(req.user?._id);

  if (!user) {
    res.status(404);
    throw new Error("Пользователь не найден");
  }

  if (paymentMethod === "Balance") {
    if (user.balance < totalPrice) {
      res.status(400);
      throw new Error("Недостаточно средств на личном счету");
    }
    user.balance -= totalPrice;
    await user.save();
  }

  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (product) {
      if (product.countInStock < item.qty) {
        res.status(400);
        throw new Error(`Товара ${product.name} недостаточно на складе`);
      }
      product.countInStock -= item.qty;
      await product.save();
    } else {
      res.status(404);
      throw new Error("Товар не найден");
    }
  }

  const order = new Order({
    user: req.user?._id,
    orderItems: orderItems.map((x: any) => ({
      ...x,
      product: x.product,
      _id: undefined,
    })),
    shippingAddress,
    totalPrice,
    paymentMethod: paymentMethod || "Balance",
    isPaid: paymentMethod === "Balance",
    paidAt: paymentMethod === "Balance" ? new Date() : null,
    status: paymentMethod === "Balance" ? "Оплачен" : "В обработке",
  });

  const createdOrder = await order.save();
  res.status(201).json(createdOrder);
};

/**
 * @desc    Получить заказ по ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
export const getOrderById = async (req: AuthRequest, res: Response) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (order) {
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

/**
 * @desc    Получить заказы текущего пользователя
 * @route   GET /api/orders/myorders
 * @access  Private
 */
export const getMyOrders = async (req: AuthRequest, res: Response) => {
  const orders = await Order.find({ user: req.user?._id });
  res.json(orders);
};

/**
 * @desc    Получить все заказы (Админ)
 * @route   GET /api/orders
 * @access  Private/Admin
 */
export const getOrders = async (req: Request, res: Response) => {
  const orders = await Order.find({}).populate("user", "id name");
  res.json(orders);
};
