import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Имя должно содержать минимум 2 символа").optional(),
  email: z.string().trim().toLowerCase().email("Некорректный email").optional(),
  phone: z.string().trim().optional(),
  country: z.string().trim().optional(),
  city: z.string().trim().optional(),
  street: z.string().trim().optional(),
  house: z.string().trim().optional(),
  image: z.string().optional(),
  password: z
    .string()
    .optional()
    .refine(
      (value) => !value || value.length >= 6,
      "Пароль должен быть не менее 6 символов"
    ),
});

export const adminUpdateUserSchema = z.object({
  name: z.string().trim().min(2, "Имя должно содержать минимум 2 символа").optional(),
  email: z.string().trim().toLowerCase().email("Некорректный email").optional(),
  isAdmin: z.boolean().optional(),
});
