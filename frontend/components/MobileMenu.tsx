"use client";

import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden cursor-pointer p-3 text-muted-foreground hover:bg-primary/5 rounded-2xl transition-all"
        >
          <Menu size={22} />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[300px] rounded-l-[2rem] border-l-border bg-background p-6"
      >
        <SheetHeader className="mb-8">
          <SheetTitle className="text-2xl font-black text-primary text-left">
            SHOPLY.
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-2">
          <Link
            href="/"
            className="text-lg font-bold p-4 hover:bg-primary/5 rounded-2xl transition-all"
          >
            ГЛАВНАЯ
          </Link>
          <Link
            href="/catalog"
            className="text-lg font-bold p-4 hover:bg-primary/5 rounded-2xl transition-all"
          >
            КАТАЛОГ
          </Link>
          <Link
            href="/about"
            className="text-lg font-bold p-4 hover:bg-primary/5 rounded-2xl transition-all"
          >
            О НАС
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
