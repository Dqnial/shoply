"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutGrid,
  ShoppingCart,
  Heart,
  User,
  Package,
  Settings,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import AuthModal from "./AuthModal";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

export default function MobileNav({ cartCount }: { cartCount: number }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const getInitials = (name: string) => name?.charAt(0).toUpperCase() || "U";

  const navItems = [
    { href: "/", icon: Home, label: "Главная" },
    { href: "/catalog", icon: LayoutGrid, label: "Каталог" },
    { href: "/cart", icon: ShoppingCart, label: "Корзина", badge: cartCount },
    { href: "/favorites", icon: Heart, label: "Избранное" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border touch-manipulation pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center flex-1 h-full transition-all active:scale-95 select-none pointer-events-auto"
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />

                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-primary text-primary-foreground text-[9px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center font-bold border-2 border-background shadow-sm">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] mt-1 font-bold transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        {user ? (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button className="flex flex-col items-center justify-center flex-1 h-full transition-all active:scale-95 outline-none select-none pointer-events-auto cursor-pointer">
                <User
                  className={`w-6 h-6 ${
                    pathname.startsWith("/profile")
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                />
                <span
                  className={`text-[10px] mt-1 font-bold ${
                    pathname.startsWith("/profile")
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  Профиль
                </span>
              </button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="rounded-t-[24px] px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] border-t border-border bg-card"
            >
              <SheetHeader className="text-left mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 font-bold text-lg overflow-hidden relative ${
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
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      getInitials(user.name)
                    )}
                  </div>
                  <div className="flex flex-col">
                    <SheetTitle className="text-lg font-black leading-none flex items-center gap-2">
                      {user.name || "Пользователь"}
                      {user.isAdmin && (
                        <span className="bg-primary/10 text-primary text-[8px] px-1.5 py-0.5 rounded-md border border-primary/20 uppercase tracking-tighter">
                          Admin
                        </span>
                      )}
                    </SheetTitle>
                    <p className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">
                      {user.email}
                    </p>
                  </div>
                </div>
              </SheetHeader>

              <div className="bg-primary/5 rounded-2xl p-3 mb-4 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Ваш баланс
                </span>
                <span className="text-lg font-black text-primary">
                  {user.balance?.toLocaleString()} ₸
                </span>
              </div>

              <div className="space-y-1">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-primary/5 active:bg-primary/10 transition-colors"
                >
                  <User size={18} className="text-muted-foreground" />
                  <span className="font-semibold text-sm">Профиль</span>
                </Link>
                <Link
                  href="/profile/orders"
                  className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-primary/5 active:bg-primary/10 transition-colors"
                >
                  <Package size={18} className="text-muted-foreground" />
                  <span className="font-semibold text-sm">Мои заказы</span>
                </Link>
                <Link
                  href="/profile/settings"
                  className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-primary/5 active:bg-primary/10 transition-colors"
                >
                  <Settings size={18} className="text-muted-foreground" />
                  <span className="font-semibold text-sm">Настройки</span>
                </Link>
                {user.isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-primary/5 active:bg-primary/10 transition-colors"
                  >
                    <ShieldCheck size={18} className="text-muted-foreground" />
                    <span className="font-semibold text-sm">Админ-панель</span>
                  </Link>
                )}

                <Separator className="my-2 opacity-50" />

                <button
                  onClick={() => {
                    logout();
                    toast.success("Вы успешно вышли");
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-destructive active:bg-destructive/5 transition-colors w-full cursor-pointer"
                >
                  <LogOut size={18} />
                  <span className="font-bold text-sm">Выйти</span>
                </button>
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <AuthModal>
            <button className="flex flex-col items-center justify-center flex-1 h-full transition-all active:scale-95 cursor-pointer outline-none select-none pointer-events-auto">
              <User className="w-6 h-6 text-muted-foreground" />
              <span className="text-[10px] mt-1 font-bold text-muted-foreground">
                Войти
              </span>
            </button>
          </AuthModal>
        )}
      </div>
    </div>
  );
}
