import { z } from "zod";

// Название/бренд/категорию/описание/картинку допустимо не передавать —
// контроллер подставляет плейсхолдеры для быстрого создания черновика товара.
// Здесь важно отсечь заведомо некорректные числа (отрицательные/дробные).
export const productSchema = z.object({
  name: z.string().trim().min(1).optional(),
  price: z.number().nonnegative("Цена не может быть отрицательной").optional(),
  brand: z.string().trim().optional(),
  category: z.string().trim().optional(),
  description: z.string().trim().optional(),
  countInStock: z
    .number()
    .int("Количество должно быть целым числом")
    .nonnegative("Количество не может быть отрицательным")
    .optional(),
  image: z.string().trim().optional(),
});
