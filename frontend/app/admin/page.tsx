"use client";

import { useQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";
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
  Receipt,
  PieChart as PieChartIcon,
  UserPlus,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  Pie,
  PieChart,
  Cell,
  Bar,
  BarChart,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Validated categorical set (node scripts/validate_palette.js) — kept out of
// the red/amber/green hue families below since those are already reserved
// for order status meaning on this same dashboard.
const CATEGORY_COLORS = {
  light: ["#2a78d6", "#1baf7a", "#eda100", "#eb6834", "#008300"],
  dark: ["#3987e5", "#199e70", "#c98500", "#d95926", "#008300"],
};
const CATEGORY_OTHER = { light: "#898781", dark: "#c3c2b7" };
const MAX_CATEGORY_SLICES = CATEGORY_COLORS.light.length;

// Sequential single-hue (magnitude, not identity) — kept distinct from the
// "Оплачен" status slot since the two never appear in the same chart.
const SEQUENTIAL_BLUE = { light: "#2a78d6", dark: "#3987e5" };

// Order status is a fixed, reserved meaning (not "series N") — every order
// carries exactly one of these five values (backend/src/models/Order.ts).
const STATUS_COLORS: Record<string, { light: string; dark: string }> = {
  "В обработке": { light: "#eda100", dark: "#c98500" },
  Оплачен: { light: "#2a78d6", dark: "#3987e5" },
  Доставляется: { light: "#1baf7a", dark: "#199e70" },
  Завершен: { light: "#0ca30c", dark: "#008300" },
  Отменен: { light: "#d03b3b", dark: "#e66767" },
};
const STATUS_FALLBACK = { light: "#898781", dark: "#c3c2b7" };

/** Folds anything past the 5 validated slots into "Другое" instead of generating a new hue. */
function groupCategoryTail(data: { _id: string; count: number }[]) {
  if (data.length <= MAX_CATEGORY_SLICES) return data;
  const head = data.slice(0, MAX_CATEGORY_SLICES - 1);
  const tailCount = data
    .slice(MAX_CATEGORY_SLICES - 1)
    .reduce((sum, d) => sum + d.count, 0);
  return [...head, { _id: "Другое", count: tailCount }];
}

const chartConfig = {
  sales: { label: "Выручка", color: "var(--primary)" },
  count: { label: "Количество", color: "var(--primary)" },
} satisfies ChartConfig;

export default function AdminDashboard() {
  const { resolvedTheme } = useTheme();
  const mode = resolvedTheme === "dark" ? "dark" : "light";

  const { data: summary, isPending } = useQuery({
    queryKey: ["admin", "summary"],
    queryFn: async () => {
      const { data } = await adminApi.getSummary();
      return data;
    },
  });

  if (isPending) {
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {[
          {
            label: "Выручка",
            val: `${summary?.totalSales?.toLocaleString()} ₸`,
            icon: DollarSign,
          },
          { label: "Заказы", val: summary?.numOrders, icon: ShoppingCart },
          {
            label: "Средний чек",
            val: `${Math.round(
              (summary?.totalSales || 0) / (summary?.numOrders || 1)
            ).toLocaleString()} ₸`,
            icon: Receipt,
          },
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
                <defs>
                  <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--primary)"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--primary)"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="sales"
                  type="monotone"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="url(#fillSales)"
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </div>

        {/* ЗАКАЗЫ ПО СТАТУСАМ */}
        <div className="lg:col-span-4 rounded-[2rem] border border-muted-foreground/10 bg-background overflow-hidden shadow-sm">
          <div className="px-8 py-6 border-b border-muted-foreground/10 bg-muted/30">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <PieChartIcon size={14} /> Заказы по статусам
            </h3>
          </div>
          <div className="p-6 flex flex-col items-center gap-6">
            <ChartContainer config={chartConfig} className="h-55 w-full">
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent hideLabel className="rounded-xl" />
                  }
                />
                <Pie
                  data={summary?.statusData || []}
                  dataKey="count"
                  nameKey="_id"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {(summary?.statusData || []).map((entry) => (
                    <Cell
                      key={entry._id}
                      fill={
                        (STATUS_COLORS[entry._id] || STATUS_FALLBACK)[mode]
                      }
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="w-full space-y-2">
              {summary?.statusData?.map((s) => (
                <div
                  key={s._id}
                  className="flex items-center justify-between text-xs font-medium"
                >
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: (STATUS_COLORS[s._id] ||
                          STATUS_FALLBACK)[mode],
                      }}
                    />
                    {s._id}
                  </span>
                  <span className="text-foreground font-bold">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* НОВЫЕ ПОЛЬЗОВАТЕЛИ */}
        <div className="lg:col-span-6 rounded-[2rem] border border-muted-foreground/10 bg-background overflow-hidden shadow-sm">
          <div className="px-8 py-6 border-b border-muted-foreground/10 bg-muted/30">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <UserPlus size={14} /> Новые пользователи
            </h3>
          </div>
          <div className="p-6">
            <ChartContainer config={chartConfig} className="h-55 w-full">
              <BarChart
                data={summary?.usersData || []}
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
                      hideLabel
                      className="rounded-xl"
                      formatter={(value) => ` ${value}`}
                    />
                  }
                />
                <Bar
                  dataKey="count"
                  fill={SEQUENTIAL_BLUE[mode]}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </div>

        {/* КАТЕГОРИИ */}
        <div className="lg:col-span-6 rounded-[2rem] border border-muted-foreground/10 bg-background overflow-hidden shadow-sm">
          <div className="px-8 py-6 border-b border-muted-foreground/10 bg-muted/30">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <ShoppingBag size={14} /> Склад по категориям
            </h3>
          </div>
          <div className="p-6 flex flex-col sm:flex-row items-center gap-6">
            <ChartContainer
              config={chartConfig}
              className="h-55 w-full sm:w-55 shrink-0"
            >
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent hideLabel className="rounded-xl" />
                  }
                />
                <Pie
                  data={groupCategoryTail(summary?.categoryData || [])}
                  dataKey="count"
                  nameKey="_id"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {groupCategoryTail(summary?.categoryData || []).map(
                    (entry, i) => (
                      <Cell
                        key={entry._id}
                        fill={
                          entry._id === "Другое"
                            ? CATEGORY_OTHER[mode]
                            : CATEGORY_COLORS[mode][i]
                        }
                      />
                    )
                  )}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="w-full space-y-2">
              {groupCategoryTail(summary?.categoryData || []).map((c, i) => (
                <div
                  key={c._id}
                  className="flex items-center justify-between text-xs font-medium"
                >
                  <span className="flex items-center gap-2 text-muted-foreground uppercase tracking-tighter font-bold">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{
                        backgroundColor:
                          c._id === "Другое"
                            ? CATEGORY_OTHER[mode]
                            : CATEGORY_COLORS[mode][i],
                      }}
                    />
                    {c._id}
                  </span>
                  <span className="text-foreground font-bold">{c.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ТОП ТОВАРОВ */}
        <div className="lg:col-span-6 rounded-[2rem] border border-muted-foreground/10 bg-background overflow-hidden shadow-sm">
          <div className="px-8 py-6 border-b border-muted-foreground/10 bg-muted/30">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Trophy size={14} /> Лидеры продаж
            </h3>
          </div>
          <div className="p-6 space-y-6">
            {summary?.topProducts?.map((item, idx) => (
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
        <div className="lg:col-span-6 rounded-[2rem] border border-muted-foreground/10 bg-background overflow-hidden shadow-sm">
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
                {summary?.latestOrders?.map((order) => (
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
