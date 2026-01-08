import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User.js";

export interface AuthRequest extends Request {
  user?: IUser | null;
  [key: string]: any;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
      };

      req.user = await User.findById(decoded.userId).select("-password");
      next();
    } catch (error) {
      console.error("Ошибка авторизации:", error);
      return res
        .status(401)
        .json({ message: "Токен не валиден или просрочен" });
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Нет авторизации, токен отсутствует" });
  }
};

export const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res.status(403).json({
      message: "Доступ запрещен: требуется аккаунт администратора",
    });
  }
};
