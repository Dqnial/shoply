import { Request, Response } from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import type { AuthRequest } from "../middleware/authMiddleware.js";

const generateToken = (res: Response, userId: string): void => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: "30d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    partitioned: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Email уже занят" });

    const user = await User.create({ name, email, password });

    if (user) {
      generateToken(res, user._id.toString());

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        balance: user.balance,
        image: user.image,
        createdAt: user.createdAt,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера при регистрации" });
  }
};

export const authUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      generateToken(res, user._id.toString());

      res.json({
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
      });
    } else {
      res.status(401).json({ message: "Неверный пароль или email" });
    }
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера при входе" });
  }
};

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user?._id);

  if (user) {
    res.json({
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
  } else {
    res.status(404).json({ message: "Пользователь не найден" });
  }
};

export const updateUserProfile = async (req: AuthRequest, res: Response) => {
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

    res.json({
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
    });
  } else {
    res.status(404).json({ message: "Пользователь не найден" });
  }
};

export const logoutUser = (_req: Request, res: Response) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Вышли из системы" });
};

export const getUserBalance = async (req: any, res: Response) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.status(200).json({ balance: user.balance });
  } else {
    res.status(404).json({ message: "Пользователь не найден" });
  }
};

export const topUpBalance = async (req: any, res: Response) => {
  const { amount } = req.body;
  const user = await User.findById(req.user._id);

  if (user) {
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Укажите корректную сумму" });
    }

    user.balance += Number(amount);
    const updatedUser = await user.save();

    res.status(200).json({
      message: "Баланс успешно пополнен",
      balance: updatedUser.balance,
    });
  } else {
    res.status(404).json({ message: "Пользователь не найден" });
  }
};

export const withdrawBalance = async (req: any, res: Response) => {
  const { amount } = req.body;
  const user = await User.findById(req.user._id);

  if (user) {
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Укажите корректную сумму" });
    }

    if (user.balance < amount) {
      return res
        .status(400)
        .json({ message: "Недостаточно средств на балансе" });
    }

    user.balance -= Number(amount);
    const updatedUser = await user.save();

    res.status(200).json({
      message: "Средства выведены",
      balance: updatedUser.balance,
    });
  } else {
    res.status(404).json({ message: "Пользователь не найден" });
  }
};

export const adminTopUpBalance = async (req: Request, res: Response) => {
  const { amount } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "Пользователь не найден" });
  }

  if (!amount || amount <= 0) {
    return res
      .status(400)
      .json({ message: "Укажите корректную сумму больше нуля" });
  }

  user.balance += Number(amount);
  await user.save();

  res.status(200).json({
    message: `Баланс пользователя ${user.name} успешно обновлен`,
    balance: user.balance,
  });
};
