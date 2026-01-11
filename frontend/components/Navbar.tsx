"use client";

import Link from "next/link";
import { Search, Heart, ShoppingCart, Loader2 } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { SearchModal } from "./SearchModal";
import AuthModal from "./AuthModal";
import UserMenu from "./UserMenu";
import { MobileMenu } from "./MobileMenu";
import MobileNav from "./MobileNav";

export default function Navbar() {
  const cartItems = useCartStore((state) => state.cartItems);
  const { user, isChecking, isAuthChecked } = useAuthStore();
  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <>
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
              className="hidden md:flex cursor-pointer text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-2xl transition-all"
            >
              <Link href="/favorites">
                <Heart className="w-5! h-5!" />
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              asChild
              className="relative hidden md:flex cursor-pointer text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-2xl transition-all"
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

            <div className="hidden md:flex items-center">
              {!isAuthChecked && isChecking ? (
                <div className="w-10 h-10 flex items-center justify-center animate-pulse bg-primary/5 rounded-2xl">
                  <Loader2 size={18} className="animate-spin text-primary/40" />
                </div>
              ) : user ? (
                <UserMenu user={user} />
              ) : (
                <AuthModal />
              )}
            </div>

            <MobileMenu />
          </div>
        </div>
      </nav>

      <MobileNav cartCount={cartCount} />
    </>
  );
}
