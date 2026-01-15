"use client";

import { useEffect, useState } from "react";
import { adminApi, API_URL } from "@/lib/axios";
import Image from "next/image";
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  Loader2,
  Trophy,
  Activity,
  ShoppingBag,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  Bar,
  BarChart,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  sales: { label: "Выручка", color: "hsl(var(--primary))" },
  count: { label: "Товаров", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

export default function AdminDashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await adminApi.getSummary();
        setSummary(data);
      } catch (error) {
        console.error("Ошибка:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="text-primary animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 space-y-6">
      {/* HEADER - Убрали mb-10 для нормального отступа */}
      <div className="space-y-1">
        <h1 className="text-4xl font-bold uppercase tracking-tighter text-primary">
          Дашборд
        </h1>
        <p className="text-muted-foreground">
          Всего заказов:{" "}
          <span className="text-foreground font-medium">
            {summary?.numOrders}
          </span>
        </p>
      </div>

      {/* KPI КАРТОЧКИ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Выручка",
            val: `${summary?.totalSales?.toLocaleString()} ₸`,
            icon: DollarSign,
          },
          { label: "Заказы", val: summary?.numOrders, icon: ShoppingCart },
          { label: "Клиенты", val: summary?.numUsers, icon: Users },
          { label: "Товары", val: summary?.numProducts, icon: Package },
        ].map((kpi, i) => (
          <div
            key={i}
            className="rounded-[2rem] border border-muted-foreground/10 bg-background p-6 shadow-sm flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 shrink-0">
              <kpi.icon size={22} />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">
                {kpi.label}
              </span>
              <span className="text-xl font-bold text-foreground">
                {kpi.val || 0}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ГРАФИК ВЫРУЧКИ */}
        <div className="lg:col-span-8 rounded-[2rem] border border-muted-foreground/10 bg-background overflow-hidden shadow-sm">
          <div className="px-8 py-6 border-b border-muted-foreground/10 bg-muted/30 flex justify-between items-center">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Activity size={14} /> Динамика выручки
            </h3>
          </div>
          <div className="p-6">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <AreaChart
                data={summary?.salesData || []}
                margin={{ left: 12, right: 12 }}
              >
                <CartesianGrid vertical={false} strokeOpacity={0.1} />
                <XAxis
                  dataKey="_id"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(val) =>
                    val.split("-").reverse().slice(0, 2).join(".")
                  }
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="rounded-xl border-muted-foreground/10 shadow-xl"
                      indicator="line" // Добавляет индикатор, создавая визуальный отступ
                      formatter={(value) =>
                        ` ${Number(value).toLocaleString()} ₸`
                      } // Пробел перед ценой
                    />
                  }
                />
                <Area
                  dataKey="sales"
                  type="monotone"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="hsl(var(--primary))"
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </div>

        {/* КАТЕГОРИИ */}
        <div className="lg:col-span-4 rounded-[2rem] border border-muted-foreground/10 bg-background overflow-hidden shadow-sm">
          <div className="px-8 py-6 border-b border-muted-foreground/10 bg-muted/30">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <ShoppingBag size={14} /> Склад по категориям
            </h3>
          </div>
          <div className="p-6">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart
                data={summary?.categoryData || []}
                layout="vertical"
                margin={{ left: -20 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="_id"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fontWeight: 700 }}
                  width={80}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent hideLabel className="rounded-xl" />
                  }
                />
                <Bar
                  dataKey="count"
                  fill="hsl(var(--primary))"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </div>

        {/* ТОП ТОВАРОВ */}
        <div className="lg:col-span-5 rounded-[2rem] border border-muted-foreground/10 bg-background overflow-hidden shadow-sm">
          <div className="px-8 py-6 border-b border-muted-foreground/10 bg-muted/30">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Trophy size={14} /> Лидеры продаж
            </h3>
          </div>
          <div className="p-6 space-y-6">
            {summary?.topProducts?.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-muted-foreground/10 bg-white shrink-0">
                  <Image
                    src={
                      item.image.startsWith("http")
                        ? item.image
                        : `${API_URL}${item.image}`
                    }
                    alt={item.name}
                    fill
                    className="object-contain p-1"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-foreground truncate uppercase tracking-tighter">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-widest">
                    {item.salesCount} продаж
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ПОСЛЕДНИЕ ЗАКАЗЫ */}
        <div className="lg:col-span-7 rounded-[2rem] border border-muted-foreground/10 bg-background overflow-hidden shadow-sm">
          <div className="px-8 py-6 border-b border-muted-foreground/10 bg-muted/30">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Последние заказы
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-muted-foreground/10 text-left">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Клиент
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Сумма
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">
                    Статус
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted-foreground/10">
                {summary?.latestOrders?.map((order: any) => (
                  <tr
                    key={order._id}
                    className="hover:bg-muted/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-foreground uppercase tracking-tighter">
                          {order.user?.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-sm">
                      {order.totalPrice.toLocaleString()} ₸
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Badge
                        className={`rounded-lg px-2 py-0.5 font-bold text-[10px] uppercase border-none ${
                          order.status === "Завершен"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {order.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
