"use client";

import { Suspense } from "react";
import ProductCard from "@/components/product/ProductCard";
import { useCatalogFilters } from "@/hooks/useCatalogFilters";
import {
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import CatalogSkeleton from "@/components/skeletons/CatalogSkeleton";
import { ProductGridSkeleton } from "@/components/skeletons/ProductGridSkeleton";

export default function CatalogPage() {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <CatalogView />
    </Suspense>
  );
}

function CatalogView() {
  const {
    category,
    brand,
    sortBy,
    currentPage,
    totalPages,
    searchInput,
    setSearchInput,
    minPriceInput,
    setMinPriceInput,
    maxPriceInput,
    setMaxPriceInput,
    products,
    totalCount,
    availableCategories,
    availableBrands,
    isInitialLoading,
    loading,
    updateFilters,
    resetFilters,
    handlePageChange,
  } = useCatalogFilters();

  if (isInitialLoading) return <CatalogSkeleton />;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div className="space-y-1 mb-10">
          <h1 className="text-4xl font-bold uppercase tracking-tighter text-primary">
            Каталог
          </h1>
          <p className="text-muted-foreground">
            Найдено товаров:{" "}
            <span className="text-foreground font-medium">{totalCount}</span>
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
        <aside className="lg:col-span-3">
          <div className="sticky top-24 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Поиск</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Модель, бренд..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
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
                  <SelectValue placeholder="Все категории" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  {availableCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
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
                  <SelectValue placeholder="Все бренды" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все бренды</SelectItem>
                  {availableBrands.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
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
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                  className="rounded-xl border-muted-foreground/20"
                />
                <Input
                  type="number"
                  placeholder="До"
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                  className="rounded-xl border-muted-foreground/20"
                />
              </div>
            </div>
          </div>
        </aside>

        <div className="lg:col-span-9">
          {loading ? (
            <ProductGridSkeleton />
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed rounded-3xl bg-muted/5">
              <X className="h-12 w-12 text-muted-foreground/20 mb-4" />
              <p className="text-muted-foreground font-medium">
                Ничего не найдено
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        className={`cursor-pointer ${
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }`}
                        onClick={() => handlePageChange(currentPage - 1)}
                      />
                    </PaginationItem>

                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              isActive={currentPage === page}
                              onClick={() => handlePageChange(page)}
                              className="cursor-pointer rounded-xl"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                      if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}

                    <PaginationItem>
                      <PaginationNext
                        className={`cursor-pointer ${
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : ""
                        }`}
                        onClick={() => handlePageChange(currentPage + 1)}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
