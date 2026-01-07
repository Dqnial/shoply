"use client";

import { useEffect, useState } from "react";
import { userApi } from "@/lib/axios";
import {
  Loader2,
  PackageOpen,
  ShoppingBag,
  ChevronRight,
  Calendar,
  Hash,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link"; // Импортируем Link

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userApi
      .getMyOrders()
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/10 blur-[120px] rounded-full" />
        <div className="relative flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="space-y-1 mb-10">
        <h1 className="text-4xl font-bold uppercase tracking-tighter text-primary">
          Мои заказы
        </h1>
        <p className="text-muted-foreground">
          История ваших покупок и данные об оплате
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* КАРТОЧКА СТАТИСТИКИ */}
        <Card className="rounded-[2.5rem] border-none bg-secondary/20 shadow-none overflow-hidden">
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-[1.5rem] bg-primary flex items-center justify-center text-primary-foreground shadow-xl shadow-primary/20">
                <ShoppingBag size={32} />
              </div>
              <div className="text-left">
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary/50">
                  Всего заказов
                </h2>
                <p className="text-4xl font-black text-primary leading-none">
                  {orders.length}
                </p>
              </div>
            </div>

            <Badge className="rounded-xl px-6 py-2 bg-background text-primary font-bold uppercase text-[10px] tracking-widest border-none shadow-sm">
              Активность: {orders.length > 0 ? "Есть заказы" : "Нет заказов"}
            </Badge>
          </CardContent>
        </Card>

        {/* СПИСОК ЗАКАЗОВ */}
        <Card className="rounded-[2.5rem] border-none bg-secondary/20 shadow-none">
          <CardHeader className="pt-8 px-8">
            <CardTitle className="text-[11px] uppercase font-bold tracking-[0.2em] text-primary/50 flex items-center gap-2">
              <Calendar size={16} /> История транзакций
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-2">
            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <PackageOpen size={48} className="text-primary/10 mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest text-primary/40">
                  Заказов не найдено
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order: any) => (
                  <Link
                    key={order._id}
                    href={`/profile/orders/${order._id}`}
                    className="block cursor-pointer"
                  >
                    <div className="group bg-background rounded-3xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm border border-transparent transition-all hover:border-primary/10">
                      {/* Левая часть элемента: ID и Дата */}
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-primary shrink-0">
                          <Hash size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-sm uppercase tracking-tight">
                            Заказ #{order._id.slice(-6).toUpperCase()}
                          </p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            {new Date(order.createdAt).toLocaleDateString(
                              "ru-RU"
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Правая часть элемента: Сумма и Статус */}
                      <div className="flex items-center justify-between w-full md:w-auto md:gap-8 pt-4 md:pt-0 border-t md:border-none">
                        <div className="text-left md:text-right">
                          <p className="font-black text-lg tracking-tighter leading-none mb-1">
                            {order.totalPrice.toLocaleString()} ₸
                          </p>
                          <Badge
                            className={`rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase tracking-tighter border-none shadow-none ${
                              order.isPaid
                                ? "bg-emerald-500/10 text-emerald-500"
                                : "bg-destructive/10 text-destructive"
                            }`}
                          >
                            {order.isPaid ? "Оплачен" : "Ожидает оплаты"}
                          </Badge>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <ChevronRight size={18} />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
