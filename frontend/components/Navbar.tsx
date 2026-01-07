"use client";

import Link from "next/link";
import {
  ShoppingCart,
  User,
  Search,
  Heart,
  Menu,
  Package,
  Settings,
  LogOut,
  ChevronDown,
  Loader2,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import AuthModal from "./AuthModal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import Image from "next/image";
import { SearchModal } from "./SearchModal";

export default function Navbar() {
  const cartItems = useCartStore((state) => state.cartItems);
  const { user, logout, isChecking, isAuthChecked } = useAuthStore();

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const getInitials = (name: string) => name?.charAt(0).toUpperCase() || "U";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link
            href="/"
            className="text-3xl font-black text-primary tracking-tighter"
          >
            SHOPLY.
          </Link>

          <div className="hidden lg:flex items-center space-x-8 font-semibold text-sm">
            <Link
              href="/"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              ГЛАВНАЯ
            </Link>
            <Link
              href="/catalog"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              КАТАЛОГ
            </Link>
            <Link
              href="/about"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              О НАС
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <SearchModal>
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-2xl transition-all"
            >
              <Search className="w-5! h-5!" />
            </Button>
          </SearchModal>

          <Button
            variant="ghost"
            size="icon"
            asChild
            className="cursor-pointer text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-2xl transition-all"
          >
            <Link href="/favorites">
              <Heart className="w-5! h-5!" />
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            asChild
            className="relative cursor-pointer text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-2xl transition-all"
          >
            <Link href="/cart">
              <ShoppingCart className="w-5! h-5!" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-primary text-primary-foreground text-[10px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold border border-background">
                  {cartCount}
                </span>
              )}
            </Link>
          </Button>

          <div className="h-6 w-[1px] bg-border mx-2 hidden md:block" />

          {!isAuthChecked && isChecking ? (
            <div className="w-10 h-10 flex items-center justify-center animate-pulse bg-primary/5 rounded-2xl">
              <Loader2 size={18} className="animate-spin text-primary/40" />
            </div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex cursor-pointer items-center gap-2 pl-2 pr-4 py-2 bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-2xl transition-all outline-none group h-auto"
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 font-bold text-xs overflow-hidden relative ${
                      !(
                        user.image && !user.image.includes("default-avatar.png")
                      )
                        ? "bg-primary"
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
                    <Link
                      href="/profile/orders"
                      className="flex items-center gap-3"
                    >
                      <Package size={16} className="text-muted-foreground" />
                      <span className="font-medium text-sm">Мои заказы</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    asChild
                    className="rounded-xl focus:bg-primary/5 cursor-pointer px-3 py-2.5 transition-colors"
                  >
                    <Link
                      href="/profile/settings"
                      className="flex items-center gap-3"
                    >
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
                        <ShieldCheck
                          size={16}
                          className="text-muted-foreground"
                        />
                        <span className="font-medium text-sm">
                          Админ-панель
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                </div>

                <DropdownMenuSeparator className="opacity-50" />

                <div className="p-1">
                  <DropdownMenuItem
                    onClick={() => {
                      logout();
                      toast.success("Вы успешно вышли из аккаунта");
                    }}
                    className="rounded-xl focus:bg-destructive/5 cursor-pointer px-3 py-2.5 text-destructive focus:text-destructive transition-colors"
                  >
                    <div className="flex items-center gap-3 w-full font-semibold text-sm">
                      <LogOut size={16} />
                      <span>Выйти</span>
                    </div>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <AuthModal />
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden cursor-pointer p-3 text-muted-foreground hover:bg-primary/5 rounded-2xl transition-all"
          >
            <Menu size={22} />
          </Button>
        </div>
      </div>
    </nav>
  );
}
