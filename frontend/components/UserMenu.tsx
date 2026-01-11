"use client";

import Link from "next/link";
import Image from "next/image";
import {
  User,
  Package,
  Settings,
  ShieldCheck,
  LogOut,
  Wallet,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

export default function UserMenu({ user }: { user: any }) {
  const { logout } = useAuthStore();
  const getInitials = (name: string) => name?.charAt(0).toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex cursor-pointer items-center gap-2 pl-2 pr-4 py-2 bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-2xl transition-all outline-none group h-auto"
        >
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 font-bold text-xs overflow-hidden relative ${
              !(user.image && !user.image.includes("default-avatar.png"))
                ? "bg-primary"
                : ""
            }`}
          >
            {user.image && !user.image.includes("default-avatar.png") ? (
              <Image
                src={user.image}
                alt={user.name}
                fill
                className="object-cover rounded-xl"
                unoptimized
              />
            ) : (
              getInitials(user.name).toUpperCase()
            )}
          </div>
          <div className="flex flex-col items-start hidden md:flex max-w-[120px]">
            <div className="flex flex-row gap-2 items-center w-full">
              <span className="text-xs font-bold leading-none truncate text-left">
                {user.name || "Пользователь"}
              </span>
              {user.isAdmin && (
                <span className="bg-primary/10 text-primary text-[8px] px-1.5 py-0.5 rounded-md border border-primary/20 uppercase tracking-tighter shrink-0">
                  Admin
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-primary">
              <Wallet size={10} />
              <span className="text-[10px] font-bold">
                {user.balance?.toLocaleString()} ₸
              </span>
            </div>
          </div>
          <ChevronDown
            size={14}
            className="text-muted-foreground group-data-[state=open]:rotate-180 transition-transform"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 rounded-2xl p-1.5 bg-card border-border shadow-xl overflow-hidden"
      >
        <div className="px-3 py-2 mb-1 bg-primary/5 rounded-xl">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Баланс
          </span>
          <span className="text-sm font-black text-primary">
            {user.balance?.toLocaleString()} ₸
          </span>
        </div>
        <div className="p-1 space-y-0.5">
          <DropdownMenuItem
            asChild
            className="rounded-xl focus:bg-primary/5 cursor-pointer px-3 py-2.5 transition-colors"
          >
            <Link href="/profile" className="flex items-center gap-3">
              <User size={16} className="text-muted-foreground" />
              <span className="font-medium text-sm">Профиль</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            asChild
            className="rounded-xl focus:bg-primary/5 cursor-pointer px-3 py-2.5 transition-colors"
          >
            <Link href="/profile/orders" className="flex items-center gap-3">
              <Package size={16} className="text-muted-foreground" />
              <span className="font-medium text-sm">Мои заказы</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            asChild
            className="rounded-xl focus:bg-primary/5 cursor-pointer px-3 py-2.5 transition-colors"
          >
            <Link href="/profile/settings" className="flex items-center gap-3">
              <Settings size={16} className="text-muted-foreground" />
              <span className="font-medium text-sm">Настройки</span>
            </Link>
          </DropdownMenuItem>
          {user.isAdmin && (
            <DropdownMenuItem
              asChild
              className="rounded-xl focus:bg-primary/5 cursor-pointer px-3 py-2.5 transition-colors"
            >
              <Link href="/admin" className="flex items-center gap-3">
                <ShieldCheck size={16} className="text-muted-foreground" />
                <span className="font-medium text-sm">Админ-панель</span>
              </Link>
            </DropdownMenuItem>
          )}
        </div>
        <DropdownMenuSeparator className="opacity-50" />
        <div className="p-1">
          <DropdownMenuItem
            onClick={() => {
              logout();
              toast.success("Вы успешно вышли");
            }}
            className="rounded-xl focus:bg-destructive/5 cursor-pointer px-3 py-2.5 text-destructive focus:text-destructive transition-colors"
          >
            <div className="flex items-center gap-3 w-full font-semibold text-sm">
              <LogOut size={16} className="text-destructive" />
              <span>Выйти</span>
            </div>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
