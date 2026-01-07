"use client";

import Image from "next/image";
import { Product } from "@/types";
import { ShoppingCart, Heart } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { useFavoriteStore } from "@/store/useFavoriteStore"; // Импортируем стор
import { toast } from "sonner";
import { cn } from "@/lib/utils"; // Для удобной работы с классами

export default function ProductCard({ product }: { product: Product }) {
  const imageUrl = `http://localhost:5000${product.image}`;
  const addItem = useCartStore((state) => state.addItem);

  // Подключаем функции избранного
  const { addToFavorites, removeFromFavorites, isFavorite } =
    useFavoriteStore();
  const favorite = isFavorite(product._id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ ...product, qty: 1 });
    toast.success("Товар добавлен в корзину!", {
      description: product.name,
    });
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (favorite) {
      removeFromFavorites(product._id);
      toast.info("Удалено из избранного");
    } else {
      addToFavorites(product);
      toast.success("Добавлено в избранное!", {
        icon: <Heart size={14} className="fill-current" />,
      });
    }
  };

  return (
    <div className="group relative flex flex-col bg-transparent w-full">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-secondary transition-colors duration-300">
        <Link
          href={`/product/${product._id}`}
          className="absolute inset-0 z-10"
        >
          <Image
            unoptimized
            src={imageUrl}
            alt={product.name}
            fill
            className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {product.countInStock === 0 && (
          <div className="absolute top-2.5 left-2.5 z-20 bg-background/90 backdrop-blur-sm text-[9px] font-bold uppercase px-2 py-0.5 rounded-md border border-border shadow-sm">
            Нет в наличии
          </div>
        )}

        {/* Кнопки действий */}
        <div className="absolute top-2.5 right-2.5 z-20 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-[-4px] group-hover:translate-y-0">
          <button
            onClick={handleFavoriteToggle}
            className={cn(
              "cursor-pointer flex h-8 w-8 items-center justify-center rounded-full border shadow-sm transition-all active:scale-90",
              favorite
                ? "bg-primary border-primary text-primary-foreground"
                : "bg-background border-border text-foreground hover:text-destructive"
            )}
          >
            <Heart size={16} className={cn(favorite && "fill-current")} />
          </button>

          <button
            onClick={handleAddToCart}
            disabled={product.countInStock === 0}
            className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform active:scale-90 disabled:bg-muted disabled:text-muted-foreground"
          >
            <ShoppingCart size={15} />
          </button>
        </div>
      </div>

      <div className="mt-3 px-0.5 space-y-1">
        <div className="flex flex-col">
          <Link href={`/product/${product._id}`}>
            <h3 className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary/80 transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
            {product.brand}
          </p>
        </div>

        <div className="flex items-center justify-between pt-0.5">
          <span className="text-[15px] font-black text-foreground">
            {product.price.toLocaleString()} ₸
          </span>

          <button
            onClick={handleAddToCart}
            disabled={product.countInStock === 0}
            className="md:hidden text-primary transition-transform active:scale-90"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
