"use client";

import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const { cartItems, removeItem, updateQty } = useCartStore();
  const total = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  const handleQtyChange = (item: any, newQty: number) => {
    if (newQty < 1) return;
    updateQty(item._id, newQty);
  };

  const handleInputChange = (item: any, value: string) => {
    if (value === "") {
      updateQty(item._id, 0);
      return;
    }

    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      updateQty(item._id, numValue);
    }
  };

  const handleBlur = (item: any) => {
    if (item.qty < 1) {
      updateQty(item._id, 1);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="bg-secondary/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={40} className="text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-black mb-2">Корзина пуста</h1>
        <p className="text-muted-foreground mb-8">
          Самое время добавить в неё что-нибудь интересное
        </p>
        <Link href="/">
          <Button className="rounded-xl px-8 h-12 font-bold uppercase tracking-widest text-xs">
            Перейти к покупкам
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-end gap-3 mb-10">
        <h1 className="text-4xl font-black tracking-tighter uppercase">
          Корзина
        </h1>
        <span className="text-muted-foreground font-medium mb-1">
          ({cartItems.length} товара)
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-3">
          {cartItems.map((item) => (
            <div
              key={item._id}
              className="group flex items-center gap-6 bg-card p-4 rounded-2xl border border-border/60 transition-all hover:border-primary/20"
            >
              <div className="relative w-24 h-24 bg-secondary/50 rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src={`http://localhost:5000${item.image}`}
                  alt={item.name}
                  unoptimized
                  fill
                  className="object-contain p-2 transition-transform group-hover:scale-110"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-foreground text-lg truncate leading-tight mb-1">
                  {item.name}
                </h3>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-2">
                  {item.brand}
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-secondary/50 rounded-lg border border-border/40 p-0.5">
                    <button
                      type="button"
                      onClick={() => handleQtyChange(item, item.qty - 1)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-background rounded-md transition-colors text-muted-foreground hover:text-foreground active:scale-90"
                    >
                      <Minus size={14} />
                    </button>

                    <input
                      type="number"
                      value={item.qty === 0 ? "" : item.qty}
                      onChange={(e) => handleInputChange(item, e.target.value)}
                      onBlur={() => handleBlur(item)}
                      className="w-9 bg-transparent text-center text-sm font-bold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />

                    <button
                      type="button"
                      onClick={() => handleQtyChange(item, item.qty + 1)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-background rounded-md transition-colors text-muted-foreground hover:text-foreground active:scale-90"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="font-black text-foreground">
                    {(item.price * item.qty).toLocaleString()} ₸
                  </span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors"
                onClick={() => removeItem(item._id)}
              >
                <Trash2 size={20} />
              </Button>
            </div>
          ))}
        </div>

        <div className="sticky top-28 bg-card p-8 rounded-3xl border border-border shadow-sm space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
              Детали заказа
            </h3>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">
                Товары ({cartItems.length})
              </span>
              <span className="font-bold">{total.toLocaleString()} ₸</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Доставка</span>
              <span className="text-emerald-500 font-bold uppercase text-[10px]">
                Бесплатно
              </span>
            </div>
            <div className="h-px bg-border my-4" />
            <div className="flex justify-between items-end">
              <span className="font-bold">Итого:</span>
              <span className="text-3xl font-black tracking-tighter text-foreground">
                {total.toLocaleString()} ₸
              </span>
            </div>
          </div>

          <Button className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs group shadow-xl shadow-primary/20 transition-all active:scale-[0.98]">
            Оформить заказ
            <ArrowRight
              size={16}
              className="ml-2 transition-transform group-hover:translate-x-1"
            />
          </Button>

          <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
            Нажимая кнопку, вы соглашаетесь с условиями <br />
            публичной оферты и политикой конфиденциальности.
          </p>
        </div>
      </div>
    </div>
  );
}
