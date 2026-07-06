"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import UsersTable from "@/components/admin/UsersTable";
import ConfirmActionDialog from "@/components/admin/ConfirmActionDialog";
import type { User } from "@/types";

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const [confirmData, setConfirmData] = useState<{
    type: "delete" | "role" | "topup" | null;
    user: User | null;
    value?: string;
  }>({ type: null, user: null });

  const {
    data: users = [],
    isPending,
    refetch,
  } = useQuery({
    queryKey: ["users", "admin"],
    queryFn: async () => {
      const { data } = await adminApi.getUsers();
      return data;
    },
  });

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

  if (isPending) {
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
          onClick={() => refetch()}
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

      <UsersTable
        users={filteredUsers}
        onTopUpRequest={(user) => setConfirmData({ type: "topup", user })}
        onRoleRequest={(user) => setConfirmData({ type: "role", user })}
        onDeleteRequest={(user) => setConfirmData({ type: "delete", user })}
      />

      <ConfirmActionDialog
        open={!!confirmData.type}
        onOpenChange={() => setConfirmData({ type: null, user: null })}
        onConfirm={handleExecuteAction}
        destructive={confirmData.type === "delete"}
        title={confirmData.type === "topup" ? "Пополнение" : "Подтверждение"}
        description={
          <>
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
          </>
        }
      >
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
      </ConfirmActionDialog>
    </div>
  );
}
