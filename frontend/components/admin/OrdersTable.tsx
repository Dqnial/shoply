"use client";

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
  Eye,
  Trash2,
  CheckCircle2,
  Truck,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import type { PopulatedOrder } from "@/types";

export default function OrdersTable({
  orders,
  onPayRequest,
  onDeliverRequest,
  onDeleteRequest,
}: {
  orders: PopulatedOrder[];
  onPayRequest: (order: PopulatedOrder) => void;
  onDeliverRequest: (order: PopulatedOrder) => void;
  onDeleteRequest: (order: PopulatedOrder) => void;
}) {
  return (
    <div className="rounded-[2rem] border border-muted-foreground/10 bg-background overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="hover:bg-transparent border-b border-muted-foreground/10">
            <TableHead className="h-14 px-6 font-bold text-[11px] uppercase tracking-widest text-muted-foreground">
              ID
            </TableHead>
            <TableHead className="h-14 font-bold text-[11px] uppercase tracking-widest text-muted-foreground">
              Дата
            </TableHead>
            <TableHead className="h-14 font-bold text-[11px] uppercase tracking-widest text-muted-foreground">
              Клиент
            </TableHead>
            <TableHead className="h-14 font-bold text-[11px] uppercase tracking-widest text-muted-foreground">
              Сумма
            </TableHead>
            <TableHead className="h-14 font-bold text-[11px] uppercase tracking-widest text-muted-foreground">
              Статус
            </TableHead>
            <TableHead className="h-14 px-6 text-right font-bold text-[11px] uppercase tracking-widest text-muted-foreground">
              Действие
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order._id}
              className="border-b border-muted-foreground/10 last:border-0 hover:bg-muted/5 transition-colors"
            >
              <TableCell className="px-6 py-4 font-mono text-[10px] font-bold text-muted-foreground">
                #{order._id.slice(-6).toUpperCase()}
              </TableCell>
              <TableCell>
                <div className="flex flex-col leading-tight">
                  <span className="font-bold text-foreground text-sm">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-medium uppercase">
                    {new Date(order.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <span className="font-bold text-sm text-foreground">
                  {order.user?.name || "Удален"}
                </span>
              </TableCell>
              <TableCell>
                <span className="font-bold text-sm text-foreground">
                  {order.totalPrice?.toLocaleString()} ₸
                </span>
              </TableCell>
              <TableCell>
                {order.isDelivered ? (
                  <Badge className="rounded-lg bg-blue-500 text-white border-none px-2 py-0.5 font-bold text-[10px]">
                    ДОСТАВЛЕН
                  </Badge>
                ) : order.isPaid ? (
                  <Badge className="rounded-lg bg-primary text-primary-foreground border-none px-2 py-0.5 font-bold text-[10px]">
                    ОПЛАЧЕН
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="rounded-lg text-muted-foreground border-muted-foreground/20 px-2 py-0.5 font-bold text-[10px]"
                  >
                    В ОБРАБОТКЕ
                  </Badge>
                )}
              </TableCell>
              <TableCell className="px-6 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="cursor-pointer rounded-xl h-8 w-8 hover:bg-muted"
                    >
                      <MoreHorizontal
                        size={18}
                        className="text-muted-foreground"
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="rounded-xl w-56 p-1.5 border-muted-foreground/10 shadow-xl"
                  >
                    <DropdownMenuItem
                      asChild
                      className="cursor-pointer rounded-lg p-2.5 focus:bg-muted font-medium text-sm"
                    >
                      <Link href={`/admin/orders/${order._id}`}>
                        <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                        Детали заказа
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1 opacity-50" />
                    <DropdownMenuItem
                      disabled={order.isPaid}
                      onClick={() => onPayRequest(order)}
                      className="cursor-pointer rounded-lg p-2.5 focus:bg-muted font-medium text-sm text-emerald-600"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Отметить оплату
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={!order.isPaid || order.isDelivered}
                      onClick={() => onDeliverRequest(order)}
                      className="cursor-pointer rounded-lg p-2.5 focus:bg-muted font-medium text-sm text-blue-600"
                    >
                      <Truck className="mr-2 h-4 w-4" />
                      Отметить доставку
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1 opacity-50" />
                    <DropdownMenuItem
                      onClick={() => onDeleteRequest(order)}
                      className="cursor-pointer rounded-lg p-2.5 text-destructive focus:text-destructive focus:bg-destructive/5 font-medium text-sm"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Удалить заказ
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
