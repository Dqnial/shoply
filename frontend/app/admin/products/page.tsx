"use client";

import { useEffect, useState, useCallback } from "react";
import { adminApi, API_URL } from "@/lib/axios";
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
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Upload,
  X,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    product: any | null;
  }>({ isOpen: false, product: null });

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    brand: "",
    category: "",
    description: "",
    countInStock: "",
    image: "",
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await adminApi.getProducts({
        params: { page: currentPage, limit: 10 },
      });
      if (data.products) {
        setProducts(data.products);
        setTotalPages(data.totalPages || 1);
      } else {
        setProducts(data);
        setTotalPages(1);
      }
    } catch (error) {
      toast.error("Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleDeleteProduct = async () => {
    if (!confirmDelete.product) return;
    try {
      await adminApi.deleteProduct(confirmDelete.product._id);
      toast.success("Товар успешно удален");
      loadProducts();
    } catch (error) {
      toast.error("Ошибка при удалении");
    } finally {
      setConfirmDelete({ isOpen: false, product: null });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const bodyFormData = new FormData();
    bodyFormData.append("image", file);

    try {
      setUploading(true);
      const { data } = await adminApi.uploadImage(bodyFormData);
      setFormData((prev) => ({ ...prev, image: data.image }));
      toast.success("Изображение загружено");
    } catch (error) {
      toast.error("Ошибка загрузки файла");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!formData.image) return;
    try {
      setUploading(true);
      await adminApi.deleteImage(formData.image);
      setFormData((prev) => ({ ...prev, image: "" }));
      toast.success("Изображение удалено");
    } catch (error) {
      toast.error("Ошибка при удалении файла");
    } finally {
      setUploading(false);
    }
  };

  const handleCreateProduct = async () => {
    if (!formData.name) return toast.error("Название обязательно");

    try {
      setCreating(true);
      const payload = {
        ...formData,
        price: Number(formData.price) || 0,
        countInStock: Number(formData.countInStock) || 0,
      };

      await adminApi.createProduct(payload);
      toast.success("Товар успешно создан");
      setIsDialogOpen(false);
      setFormData({
        name: "",
        price: "",
        brand: "",
        category: "",
        description: "",
        countInStock: "",
        image: "",
      });
      loadProducts();
    } catch (error) {
      toast.error("Не удалось создать товар");
    } finally {
      setCreating(false);
    }
  };

  const filteredProducts = products.filter((p: any) =>
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
            onClick={loadProducts}
            className="cursor-pointer h-11 px-4 rounded-xl gap-2 font-medium border-muted-foreground/20"
          >
            <RotateCcw size={16} />
            Обновить список
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-11 px-6 rounded-xl gap-2 font-semibold tracking-wide shadow-md cursor-pointer">
                <Plus size={19} strokeWidth={2.5} />
                Создать товар
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2rem] border-none shadow-2xl p-8 sm:max-w-[700px] max-h-[95vh] overflow-y-auto bg-background">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold tracking-tight">
                  Новый товар
                </DialogTitle>
                <DialogDescription className="text-muted-foreground pt-1">
                  Заполните информацию о товаре и загрузите фото.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
                <div className="space-y-4">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Фото
                  </Label>
                  <div className="relative aspect-square rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-muted/10 overflow-hidden">
                    {formData.image ? (
                      <>
                        <img
                          src={
                            formData.image.startsWith("http")
                              ? formData.image
                              : `${API_URL}${formData.image}`
                          }
                          className="w-full h-full object-cover"
                          alt="Превью"
                        />
                        <button
                          onClick={handleRemoveImage}
                          disabled={uploading}
                          className="absolute top-2 right-2 p-1.5 bg-destructive text-white rounded-lg shadow-lg cursor-pointer disabled:opacity-50"
                        >
                          {uploading ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <X size={16} />
                          )}
                        </button>
                      </>
                    ) : (
                      <Label
                        htmlFor="modal-upload"
                        className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-muted/20"
                      >
                        {uploading ? (
                          <Loader2
                            className="animate-spin text-primary"
                            size={28}
                          />
                        ) : (
                          <>
                            <Upload
                              className="text-muted-foreground/40"
                              size={32}
                            />
                            <span className="text-[10px] font-bold uppercase mt-3 text-muted-foreground">
                              Загрузить
                            </span>
                          </>
                        )}
                      </Label>
                    )}
                    <input
                      id="modal-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Название
                    </Label>
                    <Input
                      placeholder="iPhone 15 Pro"
                      className="rounded-xl h-11 border-muted-foreground/20"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Цена
                      </Label>
                      <Input
                        type="number"
                        placeholder="₸"
                        className="rounded-xl h-11 border-muted-foreground/20 font-semibold"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Склад
                      </Label>
                      <Input
                        type="number"
                        placeholder="0"
                        className="rounded-xl h-11 border-muted-foreground/20"
                        value={formData.countInStock}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            countInStock: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Бренд & Категория
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Бренд"
                        className="rounded-xl h-11 border-muted-foreground/20"
                        value={formData.brand}
                        onChange={(e) =>
                          setFormData({ ...formData, brand: e.target.value })
                        }
                      />
                      <Input
                        placeholder="Категория"
                        className="rounded-xl h-11 border-muted-foreground/20"
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Описание
                  </Label>
                  <Textarea
                    placeholder="Описание товара..."
                    className="rounded-xl min-h-[80px] border-muted-foreground/20 resize-none"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  onClick={handleCreateProduct}
                  disabled={creating || uploading}
                  className="w-full h-12 rounded-xl font-bold uppercase tracking-widest shadow-lg cursor-pointer"
                >
                  {creating ? (
                    <Loader2 className="animate-spin mr-2" />
                  ) : (
                    <Plus className="mr-2" size={18} />
                  )}
                  Опубликовать товар
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
              filteredProducts.map((product) => (
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
                        <DropdownMenuItem
                          asChild
                          className="rounded-lg cursor-pointer"
                        >
                          <Link href={`/admin/products/${product._id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" /> Изменить
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          asChild
                          className="rounded-lg cursor-pointer"
                        >
                          <Link
                            href={`/product/${product._id}`}
                            target="_blank"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" /> Перейти
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1" />
                        <DropdownMenuItem
                          onClick={() =>
                            setConfirmDelete({ isOpen: true, product })
                          }
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

      <AlertDialog
        open={confirmDelete.isOpen}
        onOpenChange={(open) =>
          setConfirmDelete({ ...confirmDelete, isOpen: open })
        }
      >
        <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold uppercase tracking-tighter">
              Удаление товара
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-medium pt-2 leading-relaxed">
              Вы собираетесь безвозвратно удалить товар{" "}
              <span className="text-foreground font-semibold">
                {confirmDelete.product?.name}
              </span>
              . Это действие нельзя отменить. Продолжить?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4 gap-2">
            <AlertDialogCancel className="cursor-pointer rounded-xl font-medium border-muted-foreground/20">
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="cursor-pointer rounded-xl font-medium bg-destructive text-white border-none"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
