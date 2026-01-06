"use client";
import { useEffect, useState } from "react";
import { userApi } from "@/lib/axios";
import { Loader2, PackageOpen } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userApi
      .getMyOrders()
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 py-10 flex flex-col md:flex-row gap-8">
      <div className="flex-1 bg-card p-8 rounded-3xl border border-border shadow-sm">
        <h2 className="text-2xl font-bold mb-6">История заказов</h2>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-10 flex flex-col items-center gap-4 text-muted-foreground">
            <PackageOpen size={48} />
            <p>У вас пока нет заказов</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <div
                key={order._id}
                className="p-4 rounded-2xl border border-border flex justify-between items-center hover:bg-secondary/20 transition-all"
              >
                <div>
                  <p className="font-bold text-sm">
                    Заказ #{order._id.slice(-6).toUpperCase()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="text-right">
                    <p className="font-black">
                      {order.totalPrice.toLocaleString()} ₸
                    </p>
                    <p
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        order.isPaid
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {order.isPaid ? "Оплачен" : "Не оплачен"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
