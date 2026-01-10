"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import api from "@/lib/axios";
import {
  Loader2,
  Search,
  X,
  ArrowDownNarrowWide,
  ArrowUpWideNarrow,
  Clock,
  RotateCcw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Product } from "@/types";
import CatalogSkeleton from "@/components/CatalogSkeleton";

const ITEMS_PER_PAGE = 2;

export default function CatalogPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayLimit, setDisplayLimit] = useState(ITEMS_PER_PAGE);

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "all";
  const brand = searchParams.get("brand") || "all";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sortBy = searchParams.get("sortBy") || "newest";

  const { ref, inView } = useInView({ threshold: 0.1 });

  const updateFilters = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      if (name === "category") params.delete("brand");
      setDisplayLimit(ITEMS_PER_PAGE);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get("/products");
        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = useMemo(
    () => ["all", ...new Set(products.map((p) => p.category))],
    [products]
  );

  const availableBrands = useMemo(() => {
    const filteredByCategory =
      category === "all"
        ? products
        : products.filter((p) => p.category === category);
    return ["all", ...new Set(filteredByCategory.map((p) => p.brand))];
  }, [products, category]);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (category !== "all")
      result = result.filter((p) => p.category === category);
    if (brand !== "all") result = result.filter((p) => p.brand === brand);
    if (search)
      result = result.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    if (minPrice) result = result.filter((p) => p.price >= Number(minPrice));
    if (maxPrice) result = result.filter((p) => p.price <= Number(maxPrice));

    if (sortBy === "price-asc") result.sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") result.sort((a, b) => b.price - a.price);
    if (sortBy === "newest") result.reverse();
    return result;
  }, [products, category, brand, search, minPrice, maxPrice, sortBy]);

  const visibleProducts = filteredProducts.slice(0, displayLimit);

  useEffect(() => {
    if (inView && displayLimit < filteredProducts.length) {
      setDisplayLimit((prev) => prev + ITEMS_PER_PAGE);
    }
  }, [inView, filteredProducts.length, displayLimit]);

  const resetFilters = () => router.push(pathname);

  if (!loading) return <CatalogSkeleton />;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div className="space-y-1 mb-10">
          <h1 className="text-4xl font-bold uppercase tracking-tighter text-primary">
            Каталог
          </h1>
          <p className="text-muted-foreground">
            Найдено товаров:{" "}
            <span className="text-foreground font-medium">
              {filteredProducts.length}
            </span>
          </p>
        </div>

        <Button
          variant="outline"
          onClick={resetFilters}
          className="cursor-pointer w-fit h-10 px-4 rounded-xl gap-2 shadow-sm transition-all"
        >
          <RotateCcw size={16} />
          Сбросить фильтры
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-3 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Поиск</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Модель, бренд..."
                value={search}
                onChange={(e) => updateFilters("search", e.target.value)}
                className="pl-9 rounded-xl border-muted-foreground/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Категория</label>
            <Select
              value={category}
              onValueChange={(v) => updateFilters("category", v)}
            >
              <SelectTrigger className="rounded-xl border-muted-foreground/20 w-full bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem
                    key={c}
                    value={c}
                    className="capitalize font-medium"
                  >
                    {c === "all" ? "Все категории" : c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Бренд</label>
            <Select
              value={brand}
              onValueChange={(v) => updateFilters("brand", v)}
            >
              <SelectTrigger className="rounded-xl border-muted-foreground/20 w-full bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableBrands.map((b) => (
                  <SelectItem
                    key={b}
                    value={b}
                    className="capitalize font-medium"
                  >
                    {b === "all" ? "Все бренды" : b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Сортировка</label>
            <Select
              value={sortBy}
              onValueChange={(v) => updateFilters("sortBy", v)}
            >
              <SelectTrigger className="rounded-xl border-muted-foreground/20 w-full bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>Сначала новые</span>
                  </div>
                </SelectItem>
                <SelectItem value="price-asc">
                  <div className="flex items-center gap-2">
                    <ArrowDownNarrowWide size={14} />
                    <span>Дешевле</span>
                  </div>
                </SelectItem>
                <SelectItem value="price-desc">
                  <div className="flex items-center gap-2">
                    <ArrowUpWideNarrow size={14} />
                    <span>Дороже</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Цена (₸)</label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="От"
                value={minPrice}
                onChange={(e) => updateFilters("minPrice", e.target.value)}
                className="rounded-xl border-muted-foreground/20"
              />
              <Input
                type="number"
                placeholder="До"
                value={maxPrice}
                onChange={(e) => updateFilters("maxPrice", e.target.value)}
                className="rounded-xl border-muted-foreground/20"
              />
            </div>
          </div>
        </aside>

        <main className="lg:col-span-9">
          {visibleProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed rounded-3xl bg-muted/5">
              <X className="h-12 w-12 text-muted-foreground/20 mb-4" />
              <p className="text-muted-foreground font-medium">
                Ничего не найдено
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {visibleProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              {displayLimit < filteredProducts.length && (
                <div ref={ref} className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
