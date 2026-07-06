"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation";
import type { Product } from "@/types";
import CreateProductDialog from "@/components/admin/CreateProductDialog";
import DeleteProductDialog from "@/components/admin/DeleteProductDialog";
import ProductsTable from "@/components/admin/ProductsTable";

export default function AdminProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const { data, isPending, refetch } = useQuery({
    // "products" prefix so any write to /products (see lib/axios.ts)
    // invalidates this alongside the public catalog's own product queries.
    queryKey: ["products", "admin", currentPage],
    queryFn: async () => {
      const { data } = await adminApi.getProducts({
        params: { page: currentPage, limit: 10 },
      });
      return data;
    },
  });

  const products = data?.products ?? [];
  const totalPages = data?.totalPages || 1;

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-10 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1 mb-6">
          <h1 className="text-4xl font-bold uppercase tracking-tighter text-primary">
            Товары
          </h1>
          <p className="text-muted-foreground">
            Найдено позиций:{" "}
            <span className="text-foreground font-medium">
              {products.length}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="cursor-pointer h-11 px-4 rounded-xl gap-2 font-medium border-muted-foreground/20"
          >
            <RotateCcw size={16} />
            Обновить список
          </Button>

          <CreateProductDialog onCreated={refetch} />
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск по названию..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 rounded-xl border-muted-foreground/20 shadow-sm"
        />
      </div>

      <ProductsTable
        products={filteredProducts}
        loading={isPending}
        onDeleteRequest={setDeleteTarget}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="ghost"
            disabled={currentPage === 1}
            onClick={() => router.push(`?page=${currentPage - 1}`)}
            className="rounded-xl h-10 px-3 cursor-pointer"
          >
            <ChevronLeft size={18} />
          </Button>
          <div className="flex gap-1.5 p-1 bg-muted/20 rounded-xl">
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i + 1}
                variant={currentPage === i + 1 ? "default" : "ghost"}
                className={`w-9 h-9 rounded-lg font-bold text-xs cursor-pointer ${
                  currentPage === i + 1 ? "shadow-md" : ""
                }`}
                onClick={() => router.push(`?page=${i + 1}`)}
              >
                {i + 1}
              </Button>
            ))}
          </div>
          <Button
            variant="ghost"
            disabled={currentPage === totalPages}
            onClick={() => router.push(`?page=${currentPage + 1}`)}
            className="rounded-xl h-10 px-3 cursor-pointer"
          >
            <ChevronRight size={18} />
          </Button>
        </div>
      )}

      <DeleteProductDialog
        product={deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onDeleted={refetch}
      />
    </div>
  );
}
