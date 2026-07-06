"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api, { adminApi, API_URL } from "@/lib/axios";
import { toast } from "sonner";
import {
  Package,
  MapPin,
  Wallet,
  CheckCircle2,
  Clock,
  Loader2,
  Truck,
  User,
  Hash,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { PopulatedOrder } from "@/types";

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const [updating, setUpdating] = useState<"pay" | "deliver" | null>(null);

  const {
    data: order,
    isPending,
    refetch,
  } = useQuery({
    queryKey: ["orders", id],
    queryFn: async () => {
      const { data } = await api.get<PopulatedOrder>(`/orders/${id}`);
      return data;
    },
  });

  const handlePay = async () => {
    if (!order) return;
    setUpdating("pay");
    try {
      await adminApi.payOrder(order._id);
      toast.success("Статус оплаты обновлен");
      await refetch();
    } catch (error) {
      toast.error("Произошла ошибка");
    } finally {
      setUpdating(null);
    }
  };

  const handleDeliver = async () => {
    if (!order) return;
    setUpdating("deliver");
    try {
      await adminApi.deliverOrder(order._id);
      toast.success("Заказ отмечен как доставленный");
      await refetch();
    } catch (error) {
      toast.error("Произошла ошибка");
    } finally {
      setUpdating(null);
    }
  };

  if (isPending)
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="text-primary/20" size={32} />
      </div>
    );

  if (!order) return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold uppercase tracking-tighter">
              Заказ{" "}
              <span className="text-muted-foreground/30 font-mono text-2xl">
                #{order._id.slice(-8).toUpperCase()}
              </span>
            </h1>
            <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <span className="flex items-center gap-1.5">
                <Clock size={12} className="text-primary/60" />
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
              <span className="opacity-20">|</span>
              <span>
                {new Date(order.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!order.isPaid && (
            <Button
              onClick={handlePay}
              disabled={updating !== null}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 h-10 px-5 font-bold uppercase text-[10px] tracking-widest shadow-sm border-none cursor-pointer"
            >
              {updating === "pay" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Подтвердить оплату"
              )}
            </Button>
          )}
          {!order.isDelivered && (
            <Button
              onClick={handleDeliver}
              disabled={updating !== null}
              className="rounded-xl bg-primary h-10 px-5 font-bold uppercase text-[10px] tracking-widest shadow-sm border-none cursor-pointer"
            >
              {updating === "deliver" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Отметить доставку"
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-[2rem] border border-border/50 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-muted/20 border-b border-border/50 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <Package size={14} className="text-primary/60" /> Содержимое
              </span>
              <span className="text-[10px] font-bold text-muted-foreground/60">
                {order.orderItems.length} позиция
              </span>
            </div>
            <div className="p-6">
              {order.orderItems.map((item, index) => (
                <div
                  key={item._id}
                  className={`flex items-center gap-5 ${
                    index !== 0 ? "mt-6 pt-6 border-t border-border/40" : ""
                  }`}
                >
                  <div className="relative w-16 h-16 bg-secondary/30 rounded-2xl overflow-hidden flex-shrink-0 border border-border/50">
                    <Image
                      src={`${API_URL}${item.image}`}
                      alt={item.name}
                      fill
                      className="object-contain p-2"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base text-foreground leading-tight truncate">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {item.qty} шт.
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        × {item.price.toLocaleString()} ₸
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-base text-foreground tracking-tight">
                      {(item.qty * item.price).toLocaleString()} ₸
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card p-6 rounded-[2rem] border border-border/50 space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <User size={14} className="text-primary/60" /> Заказчик
              </div>
              <div>
                <p className="font-bold text-lg leading-tight">
                  {order.user.name}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {order.user.email}
                </p>
              </div>
            </div>

            <div className="bg-card p-6 rounded-[2rem] border border-border/50 space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <MapPin size={14} className="text-primary/60" /> Локация
              </div>
              <div>
                <p className="font-bold text-lg leading-tight">
                  {order.shippingAddress.city}
                </p>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {order.shippingAddress.address}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card p-8 rounded-[2rem] border border-border shadow-sm space-y-8">
            <div className="space-y-5">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Статус транзакции
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-muted-foreground">Платеж</span>
                  {order.isPaid ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Подтвержден
                    </span>
                  ) : (
                    <span className="text-amber-500">В ожидании</span>
                  )}
                </div>

                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-muted-foreground">Логистика</span>
                  {order.isDelivered ? (
                    <span className="text-blue-500 flex items-center gap-1">
                      <Truck size={12} /> Доставлено
                    </span>
                  ) : (
                    <span className="text-muted-foreground/40 px-2 py-0.5 border border-border rounded text-[9px]">
                      Обработка
                    </span>
                  )}
                </div>

                <div className="h-px bg-border/60 my-6" />

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Сумма заказа
                  </span>
                  <p className="text-4xl font-bold tracking-tighter text-foreground">
                    {order.totalPrice.toLocaleString()} ₸
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/30 rounded-2xl border border-border/50 flex items-center gap-3">
              <div className="p-2 bg-background rounded-xl border border-border">
                <Wallet className="text-primary/60" size={16} />
              </div>
              <div>
                <p className="text-[9px] font-bold text-muted-foreground uppercase leading-none">
                  Метод
                </p>
                <p className="text-xs font-bold uppercase mt-1 tracking-wide">
                  {order.paymentMethod}
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-muted/10 rounded-2xl border border-border/50 flex items-center justify-between">
            <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest flex items-center gap-2">
              <Hash size={10} /> ID {order._id.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
