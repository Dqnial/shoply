"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import { Product } from "@/types";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  ChevronLeft,
  ShieldCheck,
  Truck,
  Loader2,
  Heart,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    api.get(`/products/${id}`).then((res) => setProduct(res.data));
  }, [id]);

  if (!product)
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/10 blur-[120px] rounded-full" />

        <div className="relative flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-10">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="cursor-pointer inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors font-medium"
      >
        <ChevronLeft size={20} /> Назад
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-card p-6 md:p-10 rounded-3xl border border-border shadow-sm">
        <div className="relative h-[400px] md:h-[600px] bg-secondary/50 rounded-2xl overflow-hidden border border-border/50">
          <Image
            src={`http://localhost:5000${product.image}`}
            alt={product.name}
            fill
            className="object-contain p-10 transition-transform duration-500 hover:scale-105"
            unoptimized
          />
        </div>

        <div className="flex flex-col justify-center">
          <div className="mb-6">
            <span className="text-primary font-bold uppercase tracking-[0.2em] text-xs bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
              {product.brand}
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-foreground mt-4 leading-tight tracking-tight">
              {product.name}
            </h1>
          </div>

          <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-xl">
            {product.description}
          </p>

          <div className="flex items-center gap-4 mb-10">
            <div className="text-4xl font-black text-foreground">
              {product.price.toLocaleString()} ₸
            </div>
            {product.countInStock > 0 ? (
              <span className="text-emerald-500 font-bold text-sm bg-emerald-500/10 px-3 py-1 rounded-full">
                В наличии
              </span>
            ) : (
              <span className="text-destructive font-bold text-sm bg-destructive/10 px-3 py-1 rounded-full">
                Нет в наличии
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/30 border border-border/50">
              <Truck size={24} className="text-primary" />
              <div>
                <p className="font-bold text-sm text-foreground">
                  Бесплатная доставка
                </p>
                <p className="text-xs text-muted-foreground">
                  Завтра в вашем городе
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/30 border border-border/50">
              <ShieldCheck size={24} className="text-primary" />
              <div>
                <p className="font-bold text-sm text-foreground">
                  Официальная гарантия
                </p>
                <p className="text-xs text-muted-foreground">
                  Полная поддержка бренда
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              size="lg"
              className="cursor-pointer flex-1 h-16 text-lg font-bold bg-primary text-primary-foreground hover:opacity-90 gap-3 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
              disabled={product.countInStock === 0}
              onClick={() => addItem({ ...product, qty: 1 })}
            >
              <ShoppingCart size={24} />
              {product.countInStock > 0
                ? "Добавить в корзину"
                : "Нет в наличии"}
            </Button>

            <Button
              variant="secondary"
              className="cursor-pointer group h-16 w-16 rounded-2xl border border-border hover:bg-secondary transition-all active:scale-[0.98]"
            >
              <Heart
                size={24}
                className="transition-colors group-hover:fill-destructive group-hover:text-destructive"
              />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
