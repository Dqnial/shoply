import path from "path";
import { fileURLToPath } from "url";
import nextFactory from "next";
import { createApiApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// next's CJS/ESM type declarations don't resolve to a callable under
// NodeNext module resolution (a known upstream typing friction, not a real
// type error) — the runtime export genuinely is the factory function.
const next = nextFactory as unknown as (options: {
  dev: boolean;
  dir: string;
}) => {
  prepare(): Promise<void>;
  getRequestHandler(): (
    req: import("http").IncomingMessage,
    res: import("http").ServerResponse
  ) => Promise<void>;
};

const dev = process.env.NODE_ENV !== "production";
// This file compiles to backend/dist/server.js, so ../../frontend from
// there is backend/dist/ -> backend/ -> repo root -> frontend/.
const nextApp = next({ dev, dir: path.join(__dirname, "../../frontend") });
const handleNext = nextApp.getRequestHandler();

async function main() {
  await connectDB();
  await nextApp.prepare();

  const server = createApiApp();

  // Only requests that actually start with /api and matched none of the
  // routers above fall through to these — scoping them to /api keeps a
  // typo'd API call reporting a proper 404 instead of silently rendering
  // whatever Next.js does with an unknown path.
  server.use("/api", notFound);
  server.use("/api", errorHandler);

  // Anything else — actual pages, RSC payloads, /_next/static assets — goes
  // to Next.js. A plain RegExp (not the string "*") matches every path
  // under Express 5's path-to-regexp v6.
  server.all(/.*/, (req, res) => handleNext(req, res));

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () =>
    console.log(`Unified server (API + frontend) running on port ${PORT}`)
  );
}

main();
