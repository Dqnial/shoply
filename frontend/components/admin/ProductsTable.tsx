"use client";

import { API_URL } from "@/lib/axios";
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
  Trash2,
  Edit,
  Loader2,
  Image as ImageIcon,
  MoreHorizontal,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Product } from "@/types";

export default function ProductsTable({
  products,
  loading,
  onDeleteRequest,
}: {
  products: Product[];
  loading: boolean;
  onDeleteRequest: (product: Product) => void;
}) {
  return (
    <div className="rounded-3xl border border-muted-foreground/10 bg-background overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="border-b border-muted-foreground/10 hover:bg-transparent">
            <TableHead className="h-12 px-6 font-bold text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
              Фото
            </TableHead>
            <TableHead className="h-12 font-bold text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
              Название
            </TableHead>
            <TableHead className="h-12 font-bold text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
              Категория
            </TableHead>
            <TableHead className="h-12 font-bold text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
              Цена
            </TableHead>
            <TableHead className="h-12 font-bold text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
              Наличие
            </TableHead>
            <TableHead className="h-12 px-6 text-right font-bold text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
              Действия
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="h-40 text-center">
                <Loader2
                  className="animate-spin inline-block text-primary/30"
                  size={30}
                />
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow
                key={product._id}
                className="border-b border-muted-foreground/5 last:border-0 hover:bg-muted/5"
              >
                <TableCell className="px-6 py-3">
                  <div className="w-12 h-12 rounded-xl bg-muted/50 border border-muted-foreground/10 overflow-hidden">
                    {product.image ? (
                      <img
                        src={
                          product.image.startsWith("http")
                            ? product.image
                            : `${API_URL}${product.image}`
                        }
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ImageIcon
                          className="text-muted-foreground/20"
                          size={20}
                        />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">
                      {product.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase">
                      {product.brand}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="rounded-md border-muted-foreground/20 text-[10px] font-bold"
                  >
                    {product.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="font-bold text-sm">
                    {product.price?.toLocaleString()} ₸
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    className={`rounded-md border-none px-2 py-0 text-[10px] font-bold ${
                      product.countInStock > 0
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {product.countInStock > 0
                      ? `${product.countInStock} ШТ`
                      : "НЕТ"}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-lg h-8 w-8 cursor-pointer"
                      >
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="rounded-xl w-48 p-1.5 shadow-xl border-muted-foreground/10"
                    >
                      <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                        <Link href={`/admin/products/${product._id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" /> Изменить
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                        <Link href={`/product/${product._id}`} target="_blank">
                          <ExternalLink className="mr-2 h-4 w-4" /> Перейти
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-1" />
                      <DropdownMenuItem
                        onClick={() => onDeleteRequest(product)}
                        className="rounded-lg text-destructive focus:bg-destructive/5 cursor-pointer font-medium"
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
  );
}
