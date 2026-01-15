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
  const orders = await Order.find({})
    .populate("user", "id name")
    .sort({ createdAt: -1 });
  res.json(orders);
};

/**
 * @desc    Получить расширенную статистику для дашборда (Админ)
 * @route   GET /api/orders/summary
 * @access  Private/Admin
 */
export const getOrderSummary = async (req: Request, res: Response) => {
  const numOrders = await Order.countDocuments();
  const numUsers = await User.countDocuments();
  const numProducts = await Product.countDocuments();

  const totalSalesGroup = await Order.aggregate([
    { $group: { _id: null, totalSales: { $sum: "$totalPrice" } } },
  ]);
  const totalSales =
    totalSalesGroup.length > 0 ? totalSalesGroup[0].totalSales : 0;

  const salesData = await Order.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        sales: { $sum: "$totalPrice" },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 15 },
  ]);

  const categoryData = await Order.aggregate([
    { $unwind: "$orderItems" },
    {
      $lookup: {
        from: "products",
        localField: "orderItems.product",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    { $unwind: "$productDetails" },
    {
      $group: {
        _id: "$productDetails.category",
        count: { $sum: "$orderItems.qty" },
      },
    },
    { $sort: { count: -1 } },
  ]);

  const topProducts = await Order.aggregate([
    { $unwind: "$orderItems" },
    {
      $group: {
        _id: "$orderItems.product",
        name: { $first: "$orderItems.name" },
        image: { $first: "$orderItems.image" },
        category: { $sum: 1 },
        salesCount: { $sum: "$orderItems.qty" },
      },
    },
    { $sort: { salesCount: -1 } },
    { $limit: 5 },
  ]);

  // 6. Последние заказы (для списка)
  const latestOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("user", "name");

  res.json({
    numOrders,
    numUsers,
    numProducts,
    totalSales,
    salesData,
    categoryData,
    topProducts,
    latestOrders,
  });
};

/**
 * @desc    Обновить статус оплаты заказа
 * @route   PUT /api/orders/:id/pay
 * @access  Private/Admin
 */
export const updateOrderToPaid = async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = new Date();
    order.status = "Оплачен";

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Заказ не найден");
  }
};

/**
 * @desc    Обновить статус доставки
 * @route   PUT /api/orders/:id/deliver
 * @access  Private/Admin
 */
export const updateOrderToDelivered = async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = new Date();
    order.status = "Завершен";

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Заказ не найден");
  }
};

/**
 * @desc    Удалить заказ
 * @route   DELETE /api/orders/:id
 * @access  Private/Admin
 */
export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      await order.deleteOne();
      res.json({ message: "Заказ успешно удален" });
    } else {
      res.status(404).json({ message: "Заказ не найден" });
    }
  } catch (error) {
    res.status(500).json({ message: "Ошибка при удалении заказа" });
  }
};
