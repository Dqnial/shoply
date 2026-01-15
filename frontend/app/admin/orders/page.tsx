"use client";

import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/lib/axios";
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
  RotateCcw,
  Search,
  ShoppingBag,
  Loader2,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [confirmData, setConfirmData] = useState<{
    type: "delete" | "pay" | "deliver" | null;
    order: any | null;
  }>({ type: null, order: null });

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getOrders();
      setOrders(data);
    } catch (error) {
      toast.error("Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

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
      loadOrders();
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

  if (loading && orders.length === 0) {
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
          onClick={loadOrders}
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
            {filteredOrders.map((order) => (
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
                        onClick={() => setConfirmData({ type: "pay", order })}
                        className="cursor-pointer rounded-lg p-2.5 focus:bg-muted font-medium text-sm text-emerald-600"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Отметить оплату
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={!order.isPaid || order.isDelivered}
                        onClick={() =>
                          setConfirmData({ type: "deliver", order })
                        }
                        className="cursor-pointer rounded-lg p-2.5 focus:bg-muted font-medium text-sm text-blue-600"
                      >
                        <Truck className="mr-2 h-4 w-4" />
                        Отметить доставку
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-1 opacity-50" />
                      <DropdownMenuItem
                        onClick={() =>
                          setConfirmData({ type: "delete", order })
                        }
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

      <AlertDialog
        open={!!confirmData.type}
        onOpenChange={() => setConfirmData({ type: null, order: null })}
      >
        <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold uppercase tracking-tighter">
              {confirmData.type === "delete" ? "Удаление" : "Статус заказа"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-medium pt-2 leading-relaxed">
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
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4 gap-2">
            <AlertDialogCancel className="cursor-pointer rounded-xl font-medium border-muted-foreground/20">
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExecuteAction}
              className={`cursor-pointer rounded-xl font-medium ${
                confirmData.type === "delete"
                  ? "bg-destructive hover:bg-destructive/90"
                  : "bg-primary hover:bg-primary/90"
              }`}
            >
              Подтвердить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {!loading && filteredOrders.length === 0 && (
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
