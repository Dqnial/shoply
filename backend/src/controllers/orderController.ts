import { Request, Response } from "express";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

class OrderError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

// MongoDB's duplicate-key error code — thrown when the idempotencyKey
// unique index rejects a second insert with the same key.
function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}

/**
 * @desc    Создать новый заказ и оплатить с баланса
 * @route   POST /api/orders
 * @access  Private
 *
 * Цена, название и изображение каждой позиции берутся из БД, а не из
 * тела запроса — клиенту нельзя доверять итоговую сумму заказа.
 * Списание склада выполняется атомарно внутри транзакции, чтобы
 * параллельные заказы не могли продать больше, чем есть в наличии.
 *
 * `idempotencyKey` защищает от двойного заказа/списания при повторной
 * отправке одной и той же попытки оплаты (обрыв связи, двойной клик, две
 * вкладки) — если заказ с таким ключом уже создан, возвращаем его же,
 * а не создаём новый.
 */
export const addOrderItems = async (req: AuthRequest, res: Response) => {
  const { orderItems, shippingAddress, paymentMethod, idempotencyKey } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: "Нет товаров в заказе" });
  }

  if (!idempotencyKey) {
    return res.status(400).json({ message: "Отсутствует idempotencyKey" });
  }

  const existingOrder = await Order.findOne({
    idempotencyKey,
    user: req.user?._id,
  });
  if (existingOrder) {
    return res.status(200).json(existingOrder);
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const user = await User.findById(req.user?._id).session(session);
    if (!user) {
      throw new OrderError("Пользователь не найден", 404);
    }

    let totalPrice = 0;
    const resolvedItems = [];

    for (const item of orderItems) {
      const product = await Product.findOneAndUpdate(
        { _id: item.product, countInStock: { $gte: item.qty } },
        { $inc: { countInStock: -item.qty } },
        { returnDocument: "after", session }
      );

      if (!product) {
        const exists = await Product.findById(item.product).session(session);
        throw new OrderError(
          exists
            ? `Товара "${exists.name}" недостаточно на складе`
            : "Товар не найден",
          exists ? 400 : 404
        );
      }

      totalPrice += product.price * item.qty;
      resolvedItems.push({
        name: product.name,
        qty: item.qty,
        image: product.image,
        price: product.price,
        product: product._id,
      });
    }

    if (paymentMethod === "Balance") {
      if (user.balance < totalPrice) {
        throw new OrderError("Недостаточно средств на личном счету");
      }
      user.balance -= totalPrice;
      await user.save({ session });
    }

    const [order] = await Order.create(
      [
        {
          user: req.user?._id,
          idempotencyKey,
          orderItems: resolvedItems,
          shippingAddress,
          totalPrice,
          paymentMethod: paymentMethod || "Balance",
          isPaid: paymentMethod === "Balance",
          paidAt: paymentMethod === "Balance" ? new Date() : null,
          status: paymentMethod === "Balance" ? "Оплачен" : "В обработке",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    res.status(201).json(order);
  } catch (error) {
    await session.abortTransaction();

    // Two concurrent requests with the same key both passed the findOne
    // check above before either committed — the unique index on
    // idempotencyKey caught the second insert. The first one won; return it.
    if (isDuplicateKeyError(error)) {
      const raceWinner = await Order.findOne({ idempotencyKey, user: req.user?._id });
      if (raceWinner) {
        return res.status(200).json(raceWinner);
      }
    }

    if (error instanceof OrderError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      console.error("Ошибка при создании заказа:", error);
      res.status(500).json({ message: "Ошибка при создании заказа" });
    }
  } finally {
    session.endSession();
  }
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

  const statusData = await Order.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const usersData = await User.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 15 },
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
    statusData,
    usersData,
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
