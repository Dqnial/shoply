"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2, ImageIcon, Upload, X } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface ProductFormData {
  name: string;
  price: number;
  image: string;
  brand: string;
  category: string;
  countInStock: number;
  description: string;
}

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    price: 0,
    image: "",
    brand: "",
    category: "",
    countInStock: 0,
    description: "",
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await adminApi.getProductById(id);
        setFormData(data);
      } catch (error) {
        toast.error("Товар не найден");
        router.push("/admin/products");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id, router]);

  // Функция автоматической загрузки
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const bodyFormData = new FormData();
    bodyFormData.append("image", file);

    try {
      setUploading(true);
      const { data } = await adminApi.uploadImage(bodyFormData);
      setFormData((prev) => ({ ...prev, image: data.image }));
      toast.success("Изображение загружено и применено");
    } catch (error) {
      toast.error("Ошибка при загрузке файла");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await adminApi.updateProduct(id, formData);
      toast.success("Данные успешно обновлены");
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      toast.error("Ошибка сохранения");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/30" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-xl" asChild>
            <Link href="/admin/products">
              <ArrowLeft size={18} />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Настройка товара
            </h1>
            <p className="text-sm text-muted-foreground font-medium">
              Редактирование параметров и медиа
            </p>
          </div>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={submitting || uploading}
          className="rounded-xl h-11 px-6 font-semibold shadow-md transition-all active:scale-[0.98]"
        >
          {submitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Сохранить изменения
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-6">
          <Card className="rounded-xl border-none shadow-sm bg-card/60">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Контент</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground ml-1">
                  Заголовок товара
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="rounded-xl bg-muted/40 border-none h-12 focus-visible:ring-1"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground ml-1">
                  Полное описание
                </Label>
                <Textarea
                  rows={12}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="rounded-xl bg-muted/40 border-none resize-none focus-visible:ring-1 leading-relaxed"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-none shadow-sm bg-card/60">
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                Складской учет
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground ml-1">
                  Цена (₸)
                </Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
                  }
                  className="rounded-xl bg-muted/40 border-none h-12 font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground ml-1">
                  Остаток на складе
                </Label>
                <Input
                  type="number"
                  value={formData.countInStock}
                  onChange={(e) => {
                    console.log(formData);
                    setFormData({
                      ...formData,
                      countInStock: Number(e.target.value),
                    });
                  }}
                  className="rounded-xl bg-muted/40 border-none h-12 font-medium"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-xl border-none shadow-sm bg-card/60 overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-medium">Галерея</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Зона загрузки */}
              <div className="relative aspect-[4/5] rounded-2xl border-2 border-dashed border-muted-foreground/10 bg-muted/20 hover:bg-muted/30 transition-all group overflow-hidden">
                {formData.image ? (
                  <>
                    <img
                      src={
                        formData.image.startsWith("http")
                          ? formData.image
                          : `http://localhost:5000${formData.image}`
                      }
                      className="w-full h-full object-cover shadow-inner"
                      alt="Превью"
                    />
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                      <Label
                        htmlFor="file-upload"
                        className="cursor-pointer bg-white text-black px-4 py-2 rounded-xl text-xs font-semibold shadow-xl hover:scale-105 transition-transform"
                      >
                        Заменить фото
                      </Label>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="rounded-xl h-8 text-[10px]"
                        onClick={() => setFormData({ ...formData, image: "" })}
                      >
                        <X size={14} className="mr-1" /> Удалить
                      </Button>
                    </div>
                  </>
                ) : (
                  <Label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-full h-full cursor-pointer"
                  >
                    {uploading ? (
                      <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
                    ) : (
                      <>
                        <div className="p-4 bg-background/50 rounded-full mb-3 shadow-sm text-muted-foreground/40">
                          <Upload size={24} />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground px-4 text-center">
                          Нажмите для загрузки файла
                        </span>
                      </>
                    )}
                  </Label>
                )}
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">
                  Путь к файлу
                </Label>
                <Input
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  className="rounded-xl bg-muted/40 border-none h-9 text-[10px] font-mono text-muted-foreground"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-none shadow-sm bg-card/60">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground ml-1">
                  Категория
                </Label>
                <Input
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="rounded-xl bg-muted/40 border-none h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground ml-1">
                  Бренд
                </Label>
                <Input
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData({ ...formData, brand: e.target.value })
                  }
                  className="rounded-xl bg-muted/40 border-none h-11"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
