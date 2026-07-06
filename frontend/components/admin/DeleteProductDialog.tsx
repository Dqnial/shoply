"use client";

import { adminApi } from "@/lib/axios";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { Product } from "@/types";

export default function DeleteProductDialog({
  product,
  onOpenChange,
  onDeleted,
}: {
  product: Product | null;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}) {
  const handleDelete = async () => {
    if (!product) return;
    try {
      await adminApi.deleteProduct(product._id);
      toast.success("Товар успешно удален");
      onDeleted();
    } catch (error) {
      toast.error("Ошибка при удалении");
    } finally {
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={!!product} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl p-8">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold uppercase tracking-tighter">
            Удаление товара
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground font-medium pt-2 leading-relaxed">
            Вы собираетесь безвозвратно удалить товар{" "}
            <span className="text-foreground font-semibold">
              {product?.name}
            </span>
            . Это действие нельзя отменить. Продолжить?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="pt-4 gap-2">
          <AlertDialogCancel className="cursor-pointer rounded-xl font-medium border-muted-foreground/20">
            Отмена
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="cursor-pointer rounded-xl font-medium bg-destructive text-white border-none"
          >
            Удалить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
