import rateLimit from "express-rate-limit";

// Ограничиваем перебор пароля/спам-регистрации: 20 попыток за 15 минут с одного IP.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Слишком много попыток. Попробуйте позже." },
});

// Баланс — денежные операции; лимит мягче, чем auth (эти роуты уже за
// protect/admin), но без throttling вообще нет дешёвой защиты на случай
// логической гонки/бага в контроллере баланса.
export const balanceLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Слишком много запросов. Попробуйте позже." },
});
