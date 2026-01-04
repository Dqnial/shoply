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
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import AuthModal from "./AuthModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const cartItems = useCartStore((state) => state.cartItems);
  const { user, logout, isChecking, isAuthChecked } = useAuthStore();

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

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
          <button className="cursor-pointer p-3 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-2xl transition-all">
            <Search size={22} />
          </button>

          <Link
            href="/favorites"
            className="p-3 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-2xl transition-all"
          >
            <Heart size={22} />
          </Link>

          <Link
            href="/cart"
            className="relative p-3 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-2xl transition-all"
          >
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold border-2 border-background">
                {cartCount}
              </span>
            )}
          </Link>

          <div className="h-6 w-[1px] bg-border mx-2 hidden md:block" />

          {!isAuthChecked && isChecking ? (
            <div className="w-10 h-10 flex items-center justify-center animate-pulse bg-primary/5 rounded-2xl">
              <Loader2 size={18} className="animate-spin text-primary/40" />
            </div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 pl-2 pr-4 py-2 bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-2xl transition-all outline-none group">
                  <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                    <User size={18} />
                  </div>
                  <div className="flex flex-col items-start hidden md:flex max-w-[120px]">
                    <span className="text-xs font-bold leading-none truncate w-full text-left">
                      {user.name || "Пользователь"}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate w-full">
                      {user.email}
                    </span>
                  </div>
                  <ChevronDown
                    size={14}
                    className="text-muted-foreground group-data-[state=open]:rotate-180 transition-transform"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 rounded-2xl p-1.5 bg-card border-border shadow-xl overflow-hidden"
              >
                <div className="p-1 space-y-0.5">
                  <DropdownMenuItem
                    asChild
                    className="rounded-xl focus:bg-primary/5 cursor-pointer px-3 py-2.5 transition-colors"
                  >
                    <Link href="/profile" className="flex items-center gap-3">
                      <User
                        size={16}
                        className="text-muted-foreground group-hover:text-primary"
                      />
                      <span className="font-medium text-sm">Профиль</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    asChild
                    className="rounded-xl focus:bg-primary/5 cursor-pointer px-3 py-2.5 transition-colors"
                  >
                    <Link href="/orders" className="flex items-center gap-3">
                      <Package size={16} className="text-muted-foreground" />
                      <span className="font-medium text-sm">Мои заказы</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    asChild
                    className="rounded-xl focus:bg-primary/5 cursor-pointer px-3 py-2.5 transition-colors"
                  >
                    <Link href="/settings" className="flex items-center gap-3">
                      <Settings size={16} className="text-muted-foreground" />
                      <span className="font-medium text-sm">Настройки</span>
                    </Link>
                  </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator className="opacity-50" />

                <div className="p-1">
                  <DropdownMenuItem
                    onClick={() => logout()}
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

          <button className="md:hidden p-3 text-muted-foreground hover:bg-primary/5 rounded-2xl transition-all">
            <Menu size={22} />
          </button>
        </div>
      </div>
    </nav>
  );
}
