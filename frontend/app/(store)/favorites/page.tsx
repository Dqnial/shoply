"use client";

import { useFavoriteStore } from "@/store/useFavoriteStore";
import { HeartOff } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getPlural } from "@/lib/utils";
import ProductCard from "@/components/product/ProductCard";

export default function FavoritesPage() {
  const { favorites } = useFavoriteStore();

  if (favorites.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
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
        <p className="text-sm text-muted-foreground font-medium">
          У вас {favorites.length}{" "}
          {getPlural(favorites.length, ["товар", "товара", "товаров"])} в списке
          желаний
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {favorites.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
