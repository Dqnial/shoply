"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Search, ShoppingBag, Loader2, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import OrdersTable from "@/components/admin/OrdersTable";
import ConfirmActionDialog from "@/components/admin/ConfirmActionDialog";
import type { PopulatedOrder } from "@/types";

export default function AdminOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const [confirmData, setConfirmData] = useState<{
    type: "delete" | "pay" | "deliver" | null;
    order: PopulatedOrder | null;
  }>({ type: null, order: null });

  const {
    data: orders = [],
    isPending,
    refetch,
  } = useQuery({
    queryKey: ["orders", "admin"],
    queryFn: async () => {
      const { data } = await adminApi.getOrders();
      return data;
    },
  });

  const handleExecuteAction = async () => {
    const { type, order } = confirmData;
    if (!order) return;

    try {
      if (type === "delete") {
        await adminApi.deleteOrder(order._id);
        toast.success("Заказ удален");
      } else if (type === "pay") {
        await adminApi.payOrder(order._id);
        toast.success("Статус оплаты обновлен");
      } else if (type === "deliver") {
        await adminApi.deliverOrder(order._id);
        toast.success("Заказ отмечен как доставленный");
      }
    } catch (error) {
      toast.error("Произошла ошибка");
    } finally {
      setConfirmData({ type: null, order: null });
    }
  };

  const filteredOrders = orders.filter(
    (o) =>
      o._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1 mb-10">
          <h1 className="text-4xl font-bold uppercase tracking-tighter text-primary">
            Заказы
          </h1>
          <p className="text-muted-foreground">
            Всего в базе:{" "}
            <span className="text-foreground">{orders.length}</span>
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => refetch()}
          className="cursor-pointer h-10 px-4 rounded-xl gap-2 font-medium border-muted-foreground/20 transition-all hover:bg-muted"
        >
          <RotateCcw size={16} />
          Обновить список
        </Button>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold ml-1">Поиск</label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ID заказа или имя клиента..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 rounded-xl border-muted-foreground/20 text-md focus:border-primary/50"
          />
        </div>
      </div>

      <OrdersTable
        orders={filteredOrders}
        onPayRequest={(order) => setConfirmData({ type: "pay", order })}
        onDeliverRequest={(order) => setConfirmData({ type: "deliver", order })}
        onDeleteRequest={(order) => setConfirmData({ type: "delete", order })}
      />

      <ConfirmActionDialog
        open={!!confirmData.type}
        onOpenChange={() => setConfirmData({ type: null, order: null })}
        onConfirm={handleExecuteAction}
        destructive={confirmData.type === "delete"}
        title={confirmData.type === "delete" ? "Удаление" : "Статус заказа"}
        description={
          <>
            {confirmData.type === "delete" && (
              <>
                Вы уверены, что хотите удалить заказ{" "}
                <span className="text-foreground font-semibold">
                  #{confirmData.order?._id.slice(-6).toUpperCase()}
                </span>
                ? Это действие необратимо.
              </>
            )}
            {confirmData.type === "pay" && (
              <>
                Подтвердить получение оплаты для заказа{" "}
                <span className="text-foreground font-semibold">
                  #{confirmData.order?._id.slice(-6).toUpperCase()}
                </span>
                ?
              </>
            )}
            {confirmData.type === "deliver" && (
              <>
                Установить статус{" "}
                <span className="text-blue-600 font-bold uppercase">
                  Доставлен
                </span>{" "}
                для заказа клиента{" "}
                <span className="text-foreground font-semibold">
                  {confirmData.order?.user?.name}
                </span>
                ?
              </>
            )}
          </>
        }
      />

      {filteredOrders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground space-y-4">
          <ShoppingBag size={48} className="opacity-10" />
          <p className="font-medium tracking-tight opacity-50">
            Заказы не найдены
          </p>
        </div>
      )}
    </div>
  );
}
