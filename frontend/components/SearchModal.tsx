"use client";

import * as React from "react";
import { Search, Package, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import api, { API_URL } from "@/lib/axios";
import Image from "next/image";

export function SearchModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [products, setProducts] = React.useState<any[]>([]);
  const [isMac, setIsMac] = React.useState(false); // Состояние для определения ОС
  const router = useRouter();

  // Определяем ОС один раз при загрузке клиента
  React.useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
  }, []);

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get("/products");
        setProducts(data.products || data);
      } catch (error) {
        console.error("Search fetch error:", error);
      }
    };
    fetchProducts();
  }, []);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (
        (e.key.toLowerCase() === "k" || e.key.toLowerCase() === "л") &&
        (e.metaKey || e.ctrlKey)
      ) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {children}
      </div>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        className="w-[calc(100%-2.5rem)] sm:max-w-[650px] rounded-[28px] overflow-hidden shadow-2xl border-none top-[50%] translate-y-[-50%]"
      >
        <div className="flex items-center border-b px-4">
          <CommandInput
            placeholder="Что вы ищете?"
            className="h-16 text-base font-medium placeholder:text-muted-foreground/50 border-none focus:ring-0"
          />
        </div>
        <CommandList className="max-h-[400px] sm:max-h-[450px] overflow-y-auto p-3 custom-scrollbar">
          <CommandEmpty className="py-14 text-center">
            <div className="flex flex-col items-center gap-3">
              <Package className="h-12 w-12 text-muted-foreground/10" />
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">
                Ничего не найдено
              </p>
            </div>
          </CommandEmpty>

          <CommandGroup
            heading={
              <span className="px-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                Результаты поиска
              </span>
            }
          >
            <div className="space-y-1 mt-2">
              {products.map((product) => (
                <CommandItem
                  key={product._id}
                  value={product.name}
                  onSelect={() => {
                    runCommand(() => router.push(`/product/${product._id}`));
                  }}
                  className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-[20px] cursor-pointer data-[selected=true]:bg-primary/5 data-[selected=true]:text-foreground transition-all group"
                >
                  <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-secondary/50 flex-shrink-0 overflow-hidden border border-border/50">
                    <Image
                      src={`${API_URL}${product.image}`}
                      alt={product.name}
                      fill
                      className="object-contain p-2 transition-transform group-hover:scale-110"
                      unoptimized
                    />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-bold text-sm sm:text-[15px] leading-tight text-foreground truncate">
                      {product.name}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">
                      {product.brand}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <span className="font-black text-xs sm:text-sm tabular-nums tracking-tighter whitespace-nowrap">
                      {product.price.toLocaleString()} ₸
                    </span>
                    <div className="hidden sm:flex w-8 h-8 rounded-lg bg-primary/5 items-center justify-center opacity-0 group-data-[selected=true]:opacity-100 transition-opacity">
                      <ArrowRight size={14} className="text-primary" />
                    </div>
                  </div>
                </CommandItem>
              ))}
            </div>
          </CommandGroup>
        </CommandList>

        {/* ФУТЕР: hidden на мобилках, flex на десктопе */}
        <div className="hidden sm:flex items-center justify-between border-t p-4 bg-secondary/5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <kbd className="pointer-events-none flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100">
                {/* Меняем ⌘ на Ctrl в зависимости от ОС */}
                <span className="text-xs">{isMac ? "⌘" : "Ctrl"}</span>K
              </kbd>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                Открыть
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="pointer-events-none flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100">
                esc
              </kbd>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                Закрыть
              </span>
            </div>
          </div>
        </div>
      </CommandDialog>
    </>
  );
}
