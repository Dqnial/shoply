"use client";

import { useState } from "react";
import { adminApi, API_URL } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus, Upload, X } from "lucide-react";
import { toast } from "sonner";

const EMPTY_FORM = {
  name: "",
  price: "",
  brand: "",
  category: "",
  description: "",
  countInStock: "",
  image: "",
};

export default function CreateProductDialog({
  onCreated,
}: {
  onCreated: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

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
      setIsOpen(false);
      setFormData(EMPTY_FORM);
      onCreated();
    } catch (error) {
      toast.error("Не удалось создать товар");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                    <Loader2 className="animate-spin text-primary" size={28} />
                  ) : (
                    <>
                      <Upload className="text-muted-foreground/40" size={32} />
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
  );
}
