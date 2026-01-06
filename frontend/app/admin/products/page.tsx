"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  Edit,
  Loader2,
  Image as ImageIcon,
  MoreHorizontal,
  ExternalLink,
  Search,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data } = await adminApi.getProducts();
      setProducts(data);
    } catch (error) {
      toast.error("Ошибка загрузки товаров");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter((p: any) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const deleteHandler = async (id: string) => {
    if (confirm("Удалить этот товар?")) {
      try {
        await adminApi.deleteProduct(id);
        toast.success("Товар удален");
        setProducts(products.filter((p: any) => p._id !== id));
      } catch (error) {
        toast.error("Не удалось удалить товар");
      }
    }
  };

  if (loading)
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary" size={32} />
        <p className="text-muted-foreground text-sm">Загрузка каталога...</p>
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Шапка страницы */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Товары
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Всего {products.length} позиций в каталоге
          </p>
        </div>

        <Button
          onClick={() => adminApi.createProduct().then(() => loadProducts())}
          className="rounded-xl px-4 h-10 shadow-sm transition-all active:scale-95"
        >
          <Plus className="mr-2 h-4 w-4" /> Создать товар
        </Button>
      </div>

      {/* Панель фильтров */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={16}
        />
        <Input
          placeholder="Поиск по названию..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-xl pl-10 h-10 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/20"
        />
      </div>

      {/* Контейнер таблицы */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent border-b">
              <TableHead className="w-[80px] py-3">Фото</TableHead>
              <TableHead className="font-medium">Наименование</TableHead>
              <TableHead className="hidden md:table-cell font-medium">
                Категория
              </TableHead>
              <TableHead className="font-medium">Цена</TableHead>
              <TableHead className="font-medium text-center">Склад</TableHead>
              <TableHead className="text-right font-medium pr-6">
                Опции
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  {searchQuery ? "Ничего не найдено" : "Список товаров пуст"}
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product: any) => (
                <TableRow
                  key={product._id}
                  className="group hover:bg-muted/20 transition-colors"
                >
                  <TableCell>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-background overflow-hidden shadow-sm">
                      {product.image ? (
                        <img
                          src={`http://localhost:5000${product.image}`}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="text-muted-foreground/50 h-5 w-5" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium leading-none">
                        {product.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground mt-1 uppercase tracking-wider">
                        {product.brand || "No brand"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {product.category}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">
                      {product.price.toLocaleString()} ₸
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      {product.countInStock > 0 ? (
                        <Badge
                          variant="secondary"
                          className="rounded-md font-normal text-xs bg-emerald-500/5 text-emerald-600 border-emerald-500/10"
                        >
                          {product.countInStock} шт.
                        </Badge>
                      ) : (
                        <Badge
                          variant="destructive"
                          className="rounded-md font-normal text-[10px] uppercase"
                        >
                          Нет
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 rounded-lg p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="rounded-xl w-44 p-1 shadow-md border-border"
                      >
                        <DropdownMenuItem
                          asChild
                          className="rounded-lg cursor-pointer py-2"
                        >
                          <Link
                            href={`/admin/products/${product._id}/edit`}
                            className="flex items-center text-sm"
                          >
                            <Edit className="mr-2 h-4 w-4 text-muted-foreground" />
                            Изменить
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          asChild
                          className="rounded-lg cursor-pointer py-2"
                        >
                          <Link
                            href={`/product/${product._id}`}
                            target="_blank"
                            className="flex items-center text-sm"
                          >
                            <ExternalLink className="mr-2 h-4 w-4 text-muted-foreground" />
                            Открыть
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => deleteHandler(product._id)}
                          className="rounded-lg cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive py-2 text-sm"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Удалить
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
