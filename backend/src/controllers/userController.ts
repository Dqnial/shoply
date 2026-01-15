import { Request, Response } from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import type { AuthRequest } from "../middleware/authMiddleware.js";

const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: "30d",
  });
};

export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Email уже занят" });

    const user = await User.create({ name, email, password });
    if (user) {
      const token = generateToken(user._id.toString());
      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        balance: user.balance,
        image: user.image,
        createdAt: user.createdAt,
        token: token,
      });
    }
    return res.status(400).json({ message: "Неверные данные пользователя" });
  } catch (error) {
    return res.status(500).json({ message: "Ошибка сервера при регистрации" });
  }
};

export const authUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id.toString());
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        balance: user.balance,
        image: user.image,
        createdAt: user.createdAt,
        phone: user.phone,
        country: user.country,
        city: user.city,
        street: user.street,
        house: user.house,
        token: token,
      });
    }
    return res.status(401).json({ message: "Неверный пароль или email" });
  } catch (error) {
    return res.status(500).json({ message: "Ошибка сервера при входе" });
  }
};

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);
    if (user) {
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        phone: user.phone,
        image: user.image,
        createdAt: user.createdAt,
        balance: user.balance,
        country: user.country,
        city: user.city,
        street: user.street,
        house: user.house,
      });
    }
    return res.status(404).json({ message: "Пользователь не найден" });
  } catch (error) {
    return res.status(500).json({ message: "Ошибка сервера" });
  }
};

export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.image = req.body.image || user.image;
      user.country = req.body.country || user.country;
      user.city = req.body.city || user.city;
      user.street = req.body.street || user.street;
      user.house = req.body.house || user.house;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      const token = generateToken(updatedUser._id.toString());

      return res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
        phone: updatedUser.phone,
        country: updatedUser.country,
        city: updatedUser.city,
        street: updatedUser.street,
        house: updatedUser.house,
        isAdmin: updatedUser.isAdmin,
        balance: updatedUser.balance,
        token: token,
      });
    }
    return res.status(404).json({ message: "Пользователь не найден" });
  } catch (error) {
    return res.status(500).json({ message: "Ошибка при обновлении профиля" });
  }
};

export const logoutUser = (_req: Request, res: Response) => {
  return res.status(200).json({ message: "Вышли из системы" });
};

export const getUserBalance = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id);
    if (user) {
      return res.status(200).json({ balance: user.balance });
    }
    return res.status(404).json({ message: "Пользователь не найден" });
  } catch (error) {
    return res.status(500).json({ message: "Ошибка сервера" });
  }
};

export const topUpBalance = async (req: AuthRequest, res: Response) => {
  const { amount } = req.body;
  const amountNum = Number(amount);

  try {
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ message: "Укажите корректную сумму" });
    }

    const user = await User.findById(req.user?._id);
    if (user) {
      user.balance += amountNum;
      const updatedUser = await user.save();
      return res.status(200).json({
        message: "Баланс успешно пополнен",
        balance: updatedUser.balance,
      });
    }
    return res.status(404).json({ message: "Пользователь не найден" });
  } catch (error) {
    return res.status(500).json({ message: "Ошибка сервера" });
  }
};

export const withdrawBalance = async (req: AuthRequest, res: Response) => {
  const { amount } = req.body;
  const amountNum = Number(amount);

  try {
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ message: "Укажите корректную сумму" });
    }

    const user = await User.findById(req.user?._id);
    if (user) {
      if (user.balance < amountNum) {
        return res.status(400).json({ message: "Недостаточно средств" });
      }
      user.balance -= amountNum;
      const updatedUser = await user.save();
      return res.status(200).json({
        message: "Средства выведены",
        balance: updatedUser.balance,
      });
    }
    return res.status(404).json({ message: "Пользователь не найден" });
  } catch (error) {
    return res.status(500).json({ message: "Ошибка сервера" });
  }
};

export const adminTopUpBalance = async (req: Request, res: Response) => {
  const { amount } = req.body;
  const amountNum = Number(amount);

  try {
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ message: "Укажите корректную сумму" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    user.balance += amountNum;
    await user.save();
    return res.status(200).json({
      message: `Баланс пользователя ${user.name} обновлен`,
      balance: user.balance,
    });
  } catch (error) {
    return res.status(500).json({ message: "Ошибка сервера" });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при получении пользователей" });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "Пользователь не найден" });
    }
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.isAdmin = req.body.isAdmin ?? user.isAdmin;

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
      });
    } else {
      res.status(404).json({ message: "Пользователь не найден" });
    }
  } catch (error) {
    res.status(500).json({ message: "Ошибка при обновлении" });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      if (user.isAdmin) {
        return res
          .status(400)
          .json({ message: "Нельзя удалить администратора" });
      }
      await user.deleteOne();
      res.json({ message: "Пользователь удален" });
    } else {
      res.status(404).json({ message: "Пользователь не найден" });
    }
  } catch (error) {
    res.status(500).json({ message: "Ошибка при удалении" });
  }
};
