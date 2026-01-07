"use client";

import { useFavoriteStore } from "@/store/useFavoriteStore";
import { Heart, ShoppingBag, HeartOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/axios";

export default function FavoritesPage() {
  const { favorites, removeFromFavorites } = useFavoriteStore();

  if (favorites.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        {/* Placeholder в стиле корзины */}
        <div className="bg-secondary/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
          <HeartOff size={40} />
        </div>
        <h1 className="text-2xl font-black mb-2 uppercase tracking-tighter">
          Список пуст
        </h1>
        <p className="text-muted-foreground mb-8 text-sm">
          Вы еще не добавили ни одного товара в избранное
        </p>
        <Button
          asChild
          className="rounded-xl px-8 h-12 font-bold uppercase tracking-widest text-xs shadow-lg cursor-pointer"
        >
          <Link href="/catalog">В каталог</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="space-y-1 mb-10">
        <h1 className="text-4xl font-bold uppercase tracking-tighter text-primary">
          Избранное
        </h1>
        <p className="text-muted-foreground">
          У вас {favorites.length}{" "}
          {favorites.length === 1
            ? "сохраненный товар"
            : "товаров в списке желаний"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {favorites.map((product) => (
          <div
            key={product._id}
            className="group bg-card rounded-3xl border border-border/60 overflow-hidden transition-all hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5"
          >
            <div className="relative aspect-square bg-secondary/40 p-6 overflow-hidden">
              <Image
                src={`${API_URL}${product.image}`}
                alt={product.name}
                fill
                className="object-contain p-4 transition-transform group-hover:scale-110"
                unoptimized
              />
              <button
                onClick={() => removeFromFavorites(product._id)}
                className="absolute top-4 right-4 w-10 h-10 bg-background/80 backdrop-blur-md rounded-xl flex items-center justify-center text-destructive shadow-sm hover:bg-destructive hover:text-white transition-all cursor-pointer z-10"
              >
                <HeartOff size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">
                  {product.brand}
                </p>
                <Link
                  href={`/product/${product._id}`}
                  className="font-bold block truncate hover:text-primary transition-colors text-lg"
                >
                  {product.name}
                </Link>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="font-black text-xl tracking-tighter">
                  {product.price.toLocaleString()} ₸
                </span>
                <Button
                  asChild
                  size="sm"
                  variant="secondary"
                  className="rounded-xl h-10 px-4 font-bold text-[10px] uppercase tracking-widest cursor-pointer"
                >
                  <Link href={`/product/${product._id}`}>Смотреть</Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
