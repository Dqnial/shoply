"use client";

import Image from "next/image";
import { Product } from "@/types";
import { ShoppingCart, Heart } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { useFavoriteStore } from "@/store/useFavoriteStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { API_URL } from "@/lib/axios";
import { Button } from "@/components/ui/button";

export default function ProductCard({ product }: { product: Product }) {
  const imageUrl = `${API_URL}${product.image}`;
  const addItem = useCartStore((state) => state.addItem);

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
            className="object-contain p-4 md:p-6 transition-transform duration-500 md:group-hover:scale-105"
          />
        </Link>

        {product.countInStock === 0 && (
          <div className="absolute top-2.5 left-2.5 z-20 bg-background/90 backdrop-blur-sm text-[8px] md:text-[9px] font-bold uppercase px-2 py-0.5 rounded-md border border-border shadow-sm">
            Нет в наличии
          </div>
        )}

        <div className="absolute top-2.5 right-2.5 z-20 flex flex-col gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 translate-y-0 md:translate-y-[-4px] md:group-hover:translate-y-0">
          <Button
            variant={favorite ? "default" : "secondary"}
            size="icon"
            onClick={handleFavoriteToggle}
            className={cn(
              "cursor-pointer h-9 w-9 md:h-10 md:w-10 rounded-full shadow-md transition-all active:scale-90",
              favorite
                ? "bg-primary text-primary-foreground"
                : "bg-background/80 backdrop-blur-md border border-border text-foreground"
            )}
          >
            <Heart size={18} className={cn(favorite && "fill-current")} />
          </Button>

          <Button
            variant="default"
            size="icon"
            onClick={handleAddToCart}
            disabled={product.countInStock === 0}
            className="cursor-pointer h-9 w-9 md:h-10 md:w-10 rounded-full shadow-md transition-transform active:scale-90"
          >
            <ShoppingCart size={18} />
          </Button>
        </div>
      </div>

      <div className="mt-3 px-1 space-y-1">
        <div className="flex flex-col">
          <Link href={`/product/${product._id}`}>
            <h3 className="text-[13px] md:text-sm font-medium text-foreground line-clamp-1 md:group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-[9px] md:text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
            {product.brand}
          </p>
        </div>

        <div className="flex items-center justify-between pt-0.5">
          <span className="text-[15px] md:text-base font-black text-foreground">
            {product.price.toLocaleString()} ₸
          </span>
        </div>
      </div>
    </div>
  );
}
