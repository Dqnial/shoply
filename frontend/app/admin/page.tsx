"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Users,
  Package,
  CreditCard,
  ArrowUpRight,
  Download,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Дашборд
          </h1>
          <p className="text-sm text-muted-foreground">
            Обзор показателей магазина SHOPLY.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Доход"
          value="2,450,000 ₸"
          icon={<TrendingUp size={18} className="text-emerald-500" />}
          trend="+18% за месяц"
          trendPositive={true}
        />
        <StatCard
          title="Заказы"
          value="+12"
          icon={<Package size={18} className="text-blue-500" />}
          trend="4 в обработке"
          trendPositive={null}
        />
        <StatCard
          title="Клиенты"
          value="1,240"
          icon={<Users size={18} className="text-amber-500" />}
          trend="+48 сегодня"
          trendPositive={true}
        />
        <StatCard
          title="Средний чек"
          value="15,400 ₸"
          icon={<CreditCard size={18} className="text-purple-500" />}
          trend="+2.4% рост"
          trendPositive={true}
        />
      </div>

      <Card className="rounded-xl border border-border shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/10 py-4">
          <div className="space-y-1">
            <CardTitle className="text-lg font-medium">
              Последние заказы
            </CardTitle>
            <CardDescription className="text-xs">
              Оперативная информация о транзакциях
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-lg h-8 text-xs font-medium"
            asChild
          >
            <Link href="/admin/orders">
              Все заказы <ArrowUpRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="py-3 px-4 font-medium">ID</TableHead>
                <TableHead className="font-medium">Покупатель</TableHead>
                <TableHead className="font-medium text-center">
                  Статус
                </TableHead>
                <TableHead className="text-right font-medium pr-6">
                  Сумма
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <RecentOrderRow
                id="#ORD-7421"
                user="Даниал С."
                status="Paid"
                amount="45,000 ₸"
              />
              <RecentOrderRow
                id="#ORD-7420"
                user="Мария К."
                status="Processing"
                amount="12,500 ₸"
              />
              <RecentOrderRow
                id="#ORD-7419"
                user="Арман И."
                status="Shipped"
                amount="89,900 ₸"
              />
              <RecentOrderRow
                id="#ORD-7418"
                user="Елена В."
                status="Paid"
                amount="5,400 ₸"
              />
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon, trend, trendPositive }: any) {
  return (
    <Card className="rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        <div className="p-2 bg-muted/50 rounded-lg">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        <div className="flex items-center mt-1">
          <span
            className={`text-[11px] font-medium ${
              trendPositive ? "text-emerald-600" : "text-muted-foreground"
            }`}
          >
            {trend}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentOrderRow({ id, user, status, amount }: any) {
  const statusConfig: any = {
    Paid: {
      label: "Оплачен",
      class: "bg-emerald-500/5 text-emerald-600 border-emerald-500/10",
    },
    Processing: {
      label: "В работе",
      class: "bg-blue-500/5 text-blue-600 border-blue-500/10",
    },
    Shipped: {
      label: "Доставка",
      class: "bg-amber-500/5 text-amber-600 border-amber-500/10",
    },
  };

  return (
    <TableRow className="border-b last:border-0 hover:bg-muted/10 transition-colors">
      <TableCell className="px-4 py-3 text-sm font-medium">{id}</TableCell>
      <TableCell className="text-sm text-muted-foreground">{user}</TableCell>
      <TableCell className="text-center">
        <Badge
          variant="outline"
          className={`rounded-md px-2 py-0.5 text-[10px] font-normal border ${statusConfig[status].class}`}
        >
          {statusConfig[status].label}
        </Badge>
      </TableCell>
      <TableCell className="text-right pr-6 font-medium text-sm text-foreground">
        {amount}
      </TableCell>
    </TableRow>
  );
}
