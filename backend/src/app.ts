import path from "path";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// Must run before anything below reads process.env (e.g. the cors config a
// few lines down) — ESM import evaluation means this module's own code runs
// in full as soon as index.ts imports it, so loading .env can't be deferred
// to index.ts without risking it happening too late.
dotenv.config();

// Builds the API surface (middleware + routes + /uploads static) without the
// root test route or error handlers — the piece the unified server.ts reuses
// so it can add its own Next.js catch-all afterwards. The standalone `app`
// below (used by index.ts and the test suite) adds those back on top.
export function createApiApp() {
  const app = express();

  app.use(
    helmet({
      // Продукты и аватары раздаются с /uploads и грузятся фронтендом с
      // другого origin (localhost:3000) — по умолчанию helmet это блокирует.
      crossOriginResourcePolicy: { policy: "cross-origin" },
      // helmet's default CSP (script-src 'self', no 'unsafe-inline'/nonce)
      // blocks Next.js's own inline hydration bootstrap script now that this
      // same Express app serves the frontend pages too — the page loads
      // (200 OK) but React never hydrates and no client-side code ever
      // runs, since the browser silently refuses to execute the blocked
      // script. A correct CSP for Next.js needs per-request nonces wired
      // through middleware; skipping CSP entirely is the simpler tradeoff
      // for now. The other helmet protections (frameguard, HSTS, noSniff,
      // etc.) stay on — only CSP conflicts with Next.js here.
      contentSecurityPolicy: false,
    })
  );
  app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Эндпоинты API
  app.use("/api/users", userRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/upload", uploadRoutes);

  // Статическая папка для загрузок
  const __dirname = path.resolve();
  app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

  return app;
}

const app = createApiApp();

// Базовый роут для проверки сервера
app.get("/", (req: Request, res: Response) => {
  res.send("API is running...");
});

// Хендлеры ошибок
app.use(notFound);
app.use(errorHandler);

export default app;
