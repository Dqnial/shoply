import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/axios";
import { toast } from "sonner";

interface ProductFormData {
  name: string;
  price: number;
  image: string;
  brand: string;
  category: string;
  countInStock: number;
  description: string;
}

const EMPTY_FORM: ProductFormData = {
  name: "",
  price: 0,
  image: "",
  brand: "",
  category: "",
  countInStock: 0,
  description: "",
};

/**
 * Owns the admin edit-product page's fetch-on-mount, image upload, and
 * submit — leaves the page to render the form layout.
 */
export function useEditProductForm(id: string) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>(EMPTY_FORM);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await adminApi.getProductById(id);
        setFormData({
          name: data.name || "",
          price: data.price || 0,
          image: data.image || "",
          brand: data.brand || "",
          category: data.category || "",
          countInStock: data.countInStock || 0,
          description: data.description || "",
        });
      } catch (error) {
        toast.error("Товар не найден");
        router.push("/admin/products");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id, router]);

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
      toast.error("Ошибка загрузки");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await adminApi.updateProduct(id, formData);
      toast.success("Данные обновлены");
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      toast.error("Ошибка сохранения");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    loading,
    submitting,
    uploading,
    formData,
    setFormData,
    handleFileUpload,
    handleSubmit,
  };
}
