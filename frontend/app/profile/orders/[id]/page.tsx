"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api, { API_URL } from "@/lib/axios";
import {
  Package,
  MapPin,
  Wallet,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Loader2,
  ShoppingBag,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import OrderDetailsSkeleton from "@/components/OrderDetailsSkeleton";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data);
      } catch (err) {
        console.error("Order Load Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <OrderDetailsSkeleton />;

  if (!order)
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold uppercase tracking-tighter mb-4">
          Заказ не найден
        </h1>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/profile/orders">Назад к списку</Link>
        </Button>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Заголовок в стиле Корзины */}
      <div className="space-y-1 mb-10">
        <h1 className="text-4xl font-bold uppercase tracking-tighter text-primary">
          Заказ #{order._id.slice(-8)}
        </h1>
        <p className="text-muted-foreground">
          Оформлен {new Date(order.createdAt).toLocaleDateString()} в{" "}
          {new Date(order.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Левая часть: Список товаров и Адрес */}
        <div className="lg:col-span-2 space-y-6">
          {/* Товары */}
          <div className="space-y-3">
            {order.orderItems.map((item: any, index: number) => (
              <div
                key={index}
                className="group flex items-center gap-6 bg-card p-4 rounded-2xl border border-border/60 transition-all hover:border-primary/20"
              >
                <div className="relative w-24 h-24 bg-secondary/40 rounded-xl overflow-hidden flex-shrink-0">
                  <Image
                    src={`${API_URL}${item.image}`}
                    alt={item.name}
                    fill
                    className="object-contain p-2"
                    unoptimized
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground text-lg truncate mb-1">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                    <span>{item.qty} шт.</span>
                    <span className="opacity-30">•</span>
                    <span>{item.price.toLocaleString()} ₸</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-black text-foreground">
                    {(item.qty * item.price).toLocaleString()} ₸
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Инфо-блоки (Доставка и Оплата) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card p-6 rounded-3xl border border-border/60 space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <MapPin size={14} className="text-primary" /> Адрес доставки
              </div>
              <div className="space-y-1">
                <p className="font-bold">{order.shippingAddress.city}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {order.shippingAddress.address}
                </p>
              </div>
            </div>

            <div className="bg-card p-6 rounded-3xl border border-border/60 space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <Wallet size={14} className="text-primary" /> Оплата
              </div>
              <div className="space-y-1">
                <p className="font-bold">Личный счет</p>
                <div className="flex items-center gap-1.5">
                  {order.isPaid ? (
                    <span className="text-[10px] font-bold text-emerald-500 uppercase flex items-center gap-1">
                      <CheckCircle2 size={12} /> Оплачено
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-500 uppercase flex items-center gap-1">
                      <Clock size={12} /> Ожидание
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Правая часть: Итоговый чек в стиле корзины */}
        <div className="sticky top-28">
          <div className="bg-card p-8 rounded-3xl border border-border shadow-sm space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                Итог заказа
              </h3>

              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Статус заказа</span>
                <span className="font-bold px-2 py-0.5 bg-secondary rounded text-[10px] uppercase">
                  {order.status || "В обработке"}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Доставка</span>
                <span className="text-emerald-500 font-bold uppercase text-[10px]">
                  Бесплатно
                </span>
              </div>

              <div className="h-px bg-border my-4" />

              <div className="flex justify-between items-end">
                <span className="font-bold text-sm">Всего:</span>
                <span className="text-3xl font-black tracking-tighter text-foreground">
                  {order.totalPrice.toLocaleString()} ₸
                </span>
              </div>
            </div>

            <Button
              asChild
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10 cursor-pointer"
            >
              <Link href="/catalog">Продолжить покупки</Link>
            </Button>

            <p className="text-[9px] text-center text-muted-foreground uppercase tracking-tighter">
              ID: {order._id}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
