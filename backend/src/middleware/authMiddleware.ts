import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User.js";
import { getTokenFromCookies, getCsrfFromCookies } from "../utils/token.js";

export interface AuthRequest extends Request {
  user?: IUser | null;
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = getTokenFromCookies(req.cookies);

  if (!token) {
    return res
      .status(401)
      .json({ message: "Нет авторизации, токен отсутствует" });
  }

  // Double-submit CSRF check: the JWT cookie is httpOnly and gets attached
  // to requests automatically by the browser (including cross-site ones),
  // but a cross-site attacker can't read the (non-httpOnly) csrf cookie to
  // forge a matching header, since it lives on our origin.
  if (!SAFE_METHODS.has(req.method)) {
    const csrfCookie = getCsrfFromCookies(req.cookies);
    const csrfHeader = req.headers["x-csrf-token"];
    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      return res.status(403).json({ message: "Недействительный CSRF-токен" });
    }
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    req.user = await User.findById(decoded.userId).select("-password");
    next();
  } catch (error) {
    console.error("Ошибка авторизации:", error);
    return res.status(401).json({ message: "Токен не валиден или просрочен" });
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
