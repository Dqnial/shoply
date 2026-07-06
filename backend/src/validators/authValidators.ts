import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Имя должно содержать минимум 2 символа"),
  email: z.string().trim().toLowerCase().email("Некорректный email"),
  password: z.string().min(6, "Пароль должен быть не менее 6 символов"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Некорректный email"),
  password: z.string().min(1, "Введите пароль"),
});
