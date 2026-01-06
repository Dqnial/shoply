import { Request, Response } from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

/**
 * @desc    Генерация JWT токена и установка его в HttpOnly Cookie
 * @param   res - Объект ответа Express
 * @param   userId - ID пользователя для полезной нагрузки (payload) токена
 */
const generateToken = (res: Response, userId: string): void => {
  // Создаем токен, подписываем его секретом из .env
  const token = jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: "30d", // Токен будет валиден 30 дней
  });

  // Устанавливаем куку с токеном
  res.cookie("jwt", token, {
    httpOnly: true, // Кука недоступна для JS в браузере (защита от XSS)
    secure: process.env.NODE_ENV !== "development", // Только HTTPS в продакшене
    sameSite: "strict", // Защита от CSRF атак
    maxAge: 30 * 24 * 60 * 60 * 1000, // Срок жизни куки (в мс) - 30 дней
  });
};

/**
 * @desc    Регистрация нового пользователя
 * @route   POST /api/users
 * @access  Public
 */
export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    // Проверяем, существует ли уже такой пользователь
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "Email уже занят" });

    // Создаем пользователя в БД (пароль хешируется автоматически в модели)
    const user = await User.create({ name, email, password });

    if (user) {
      // Генерируем токен для мгновенного входа после регистрации
      generateToken(res, user._id.toString());

      res.status(201).json({
        _id: user._id,
        name: user.name,
        isAdmin: user.isAdmin,
        email: user.email,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера при регистрации" });
  }
};

/**
 * @desc    Авторизация пользователя (Логин)
 * @route   POST /api/users/login
 * @access  Public
 */
export const authUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Ищем пользователя в БД по email
    const user = await User.findOne({ email });

    // Проверяем существование пользователя и валидность пароля через метод модели
    if (user && (await user.matchPassword(password))) {
      // Генерируем и отправляем токен
      generateToken(res, user._id.toString());

      res.json({
        _id: user._id,
        name: user.name,
        isAdmin: user.isAdmin,
        email: user.email,
      });
    } else {
      res.status(401).json({ message: "Неверный пароль или email" });
    }
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера при входе" });
  }
};

/**
 * @desc    Выход пользователя из системы / Очистка куки
 * @route   POST /api/users/logout
 * @access  Private (хотя технически можно и Public)
 */
export const logoutUser = (_req: Request, res: Response) => {
  // Заменяем текущую куку на пустую и ставим срок годности на прошедшую дату
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Вышли из системы" });
};
