"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
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
import { Input } from "@/components/ui/input";
import {
  Search,
  Mail,
  MoreHorizontal,
  ShieldAlert,
  RotateCcw,
  Trash2,
  Loader2,
  Banknote,
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
import { toast } from "sonner";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [confirmData, setConfirmData] = useState<{
    type: "delete" | "role" | "topup" | null;
    user: any | null;
    value?: string;
  }>({ type: null, user: null });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getUsers();
      setUsers(data);
    } catch (error) {
      toast.error("Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleExecuteAction = async () => {
    const { type, user, value } = confirmData;
    if (!user) return;
    try {
      if (type === "delete") {
        await adminApi.deleteUser(user._id);
        toast.success("Аккаунт успешно удален");
      } else if (type === "role") {
        await adminApi.updateUser(user._id, { isAdmin: !user.isAdmin });
        toast.success("Привилегии пользователя обновлены");
      } else if (type === "topup") {
        if (!value || isNaN(Number(value)))
          return toast.error("Укажите корректную сумму");
        await adminApi.adminTopUpBalance(user._id, Number(value));
        toast.success("Баланс успешно пополнен");
      }
      loadUsers();
    } catch (error) {
      toast.error("Произошла ошибка");
    } finally {
      setConfirmData({ type: null, user: null });
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 space-y-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1 mb-10">
          <h1 className="text-4xl font-bold uppercase tracking-tighter text-primary">
            Пользователи
          </h1>
          <p className="text-muted-foreground">
            Найдено в базе:{" "}
            <span className="text-foreground font-medium">{users.length}</span>
          </p>
        </div>

        <Button
          variant="outline"
          onClick={loadUsers}
          className="cursor-pointer h-10 px-4 rounded-xl gap-2 font-medium border-muted-foreground/20 transition-all hover:bg-muted"
        >
          <RotateCcw size={16} />
          Обновить список
        </Button>
      </div>

      {/* SEARCH */}
      <div className="space-y-2">
        <label className="text-sm font-semibold">Поиск</label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по имени или почте..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 rounded-xl border-muted-foreground/20 text-md focus:border-primary/50"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-[2rem] border border-muted-foreground/10 bg-background overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent border-b border-muted-foreground/10">
              <TableHead className="h-14 px-6 font-bold text-[11px] uppercase tracking-widest text-muted-foreground">
                Клиент
              </TableHead>
              <TableHead className="h-14 font-bold text-[11px] uppercase tracking-widest text-muted-foreground">
                Баланс
              </TableHead>
              <TableHead className="h-14 font-bold text-[11px] uppercase tracking-widest text-muted-foreground">
                Роль
              </TableHead>
              <TableHead className="h-14 px-6 text-right font-bold text-[11px] uppercase tracking-widest text-muted-foreground">
                Действие
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow
                key={user._id}
                className="border-b border-muted-foreground/10 last:border-0 hover:bg-muted/5 transition-colors"
              >
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-primary-foreground font-bold text-xs overflow-hidden relative ${
                        !(
                          user.image &&
                          !user.image.includes("default-avatar.png")
                        )
                          ? "bg-primary shadow-lg shadow-primary/20"
                          : ""
                      }`}
                    >
                      {user.image &&
                      !user.image.includes("default-avatar.png") ? (
                        <Image
                          src={user.image}
                          alt={user.name}
                          fill
                          className="object-cover rounded-xl"
                          unoptimized
                        />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex flex-col leading-tight">
                      <span className="font-bold text-foreground">
                        {user.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-medium">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-bold text-sm text-foreground">
                    {user.balance?.toLocaleString()} ₸
                  </span>
                </TableCell>
                <TableCell>
                  {user.isAdmin ? (
                    <Badge className="rounded-lg bg-primary text-primary-foreground border-none px-2 py-0.5 font-bold text-[10px]">
                      ADMIN
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="rounded-lg text-muted-foreground border-muted-foreground/20 px-2 py-0.5 font-bold text-[10px]"
                    >
                      USER
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
                      className="rounded-xl w-52 p-1.5 border-muted-foreground/10 shadow-xl"
                    >
                      <DropdownMenuItem
                        onClick={() => setConfirmData({ type: "topup", user })}
                        className="cursor-pointer rounded-lg p-2.5 focus:bg-muted font-medium text-sm"
                      >
                        <Banknote className="mr-2 h-4 w-4 text-muted-foreground" />
                        Пополнить баланс
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setConfirmData({ type: "role", user })}
                        className="cursor-pointer rounded-lg p-2.5 focus:bg-muted font-medium text-sm"
                      >
                        <ShieldAlert className="mr-2 h-4 w-4 text-muted-foreground" />
                        Изменить роль
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-1 opacity-50" />
                      <DropdownMenuItem
                        disabled={user.isAdmin}
                        onClick={() => setConfirmData({ type: "delete", user })}
                        className="cursor-pointer rounded-lg p-2.5 text-destructive focus:text-destructive focus:bg-destructive/5 font-medium text-sm"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Удалить аккаунт
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* CONFIRMATION MODALS */}
      <AlertDialog
        open={!!confirmData.type}
        onOpenChange={() => setConfirmData({ type: null, user: null })}
      >
        <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold uppercase tracking-tighter">
              {confirmData.type === "topup" ? "Пополнение" : "Подтверждение"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-medium pt-2 leading-relaxed">
              {confirmData.type === "delete" && (
                <>
                  Вы собираетесь безвозвратно удалить аккаунт{" "}
                  <span className="text-foreground font-semibold">
                    {confirmData.user?.name}
                  </span>
                  . Продолжить?
                </>
              )}
              {confirmData.type === "role" && (
                <>
                  Изменить роль для пользователя{" "}
                  <span className="text-foreground font-semibold">
                    {confirmData.user?.name}
                  </span>{" "}
                  на{" "}
                  <span className="text-primary font-bold uppercase">
                    {confirmData.user?.isAdmin ? "User" : "Admin"}
                  </span>
                  ?
                </>
              )}
              {confirmData.type === "topup" && (
                <>
                  Укажите сумму, которую необходимо зачислить на основной баланс{" "}
                  <span className="text-foreground font-semibold">
                    {confirmData.user?.name}
                  </span>
                  .
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {confirmData.type === "topup" && (
            <div className="py-4">
              <Input
                type="number"
                placeholder="Сумма в ₸"
                className="h-12 rounded-xl font-medium border-muted-foreground/20 focus:ring-primary/20"
                onChange={(e) =>
                  setConfirmData({ ...confirmData, value: e.target.value })
                }
              />
            </div>
          )}

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
    </div>
  );
}
