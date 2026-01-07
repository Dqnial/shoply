"use client";

import { useState, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  User as UserIcon,
  MapPin,
  ShieldCheck,
  Camera,
  Loader2,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";
import Image from "next/image";

export default function SettingsPage() {
  const { user, updateProfile, isAuthLoading } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const DEFAULT_AVATAR = "/uploads/default-avatar.png";

  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    country: user?.country || "",
    city: user?.city || "",
    street: user?.street || "",
    house: user?.house || "",
    password: "",
    image: user?.image || DEFAULT_AVATAR,
  });

  const getInitials = (name: string) => name?.charAt(0).toUpperCase() || "U";

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData({ ...formData, image: DEFAULT_AVATAR });
    toast.info("Аватар будет удален после сохранения");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password && formData.password !== confirmPassword) {
      return toast.error("Пароли не совпадают");
    }
    try {
      await updateProfile(formData);
      toast.success("Данные успешно сохранены");
      setConfirmPassword("");
    } catch (err) {
      toast.error("Ошибка при обновлении");
    }
  };

  if (isAuthLoading && !user) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/10 blur-[120px] rounded-full" />
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const isCustomImage =
    formData.image && !formData.image.includes("default-avatar.png");

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="space-y-1 mb-10">
        <h1 className="text-4xl font-bold uppercase tracking-tighter text-primary">
          Настройки
        </h1>
        <p className="text-muted-foreground">
          Управляйте своим профилем и личными данными
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList className="grid grid-cols-3 bg-secondary/20 p-1.5 rounded-[2rem] h-auto w-full max-w-2xl mx-auto md:mx-0">
          <TabsTrigger
            value="profile"
            className="flex items-center justify-center gap-2 rounded-[1.5rem] py-3 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all cursor-pointer"
          >
            <UserIcon size={16} />
            <span className="hidden sm:inline font-bold uppercase text-[10px] tracking-widest">
              Профиль
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="address"
            className="flex items-center justify-center gap-2 rounded-[1.5rem] py-3 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all cursor-pointer"
          >
            <MapPin size={16} />
            <span className="hidden sm:inline font-bold uppercase text-[10px] tracking-widest">
              Адрес
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="flex items-center justify-center gap-2 rounded-[1.5rem] py-3 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all cursor-pointer"
          >
            <ShieldCheck size={16} />
            <span className="hidden sm:inline font-bold uppercase text-[10px] tracking-widest">
              Защита
            </span>
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit} className="space-y-6">
          <TabsContent value="profile" className="m-0 outline-none">
            <Card className="rounded-[2.5rem] border-none bg-secondary/20 shadow-none">
              <CardHeader className="pt-8 px-8">
                <CardTitle className="text-[11px] uppercase font-black tracking-[0.2em] text-primary/50">
                  Основная информация
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-2 space-y-8">
                <div className="flex flex-col items-center md:flex-row gap-6">
                  <div
                    className="relative group w-32 h-32 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div
                      className={`w-full h-full rounded-full overflow-hidden shadow-xl shadow-primary/20 relative flex items-center justify-center text-primary-foreground text-6xl font-black ${
                        !isCustomImage ? "bg-primary" : ""
                      }`}
                    >
                      {isCustomImage ? (
                        <Image
                          src={formData.image}
                          alt="Avatar"
                          fill
                          className="object-cover rounded-full"
                          unoptimized
                        />
                      ) : (
                        getInitials(formData.name).toUpperCase()
                      )}

                      <div className="absolute inset-0 bg-primary/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm rounded-full">
                        <Camera size={24} className="text-white" />
                      </div>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      className="hidden"
                      accept="image/*"
                    />
                  </div>
                  {isCustomImage && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={removeAvatar}
                      className="rounded-xl h-10 px-4 font-bold uppercase text-[10px] tracking-widest"
                    >
                      <Trash2 size={14} className="mr-2" /> Удалить фото
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider ml-1 text-muted-foreground">
                      Имя
                    </Label>
                    <Input
                      className="rounded-2xl h-14 bg-background border-none shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider ml-1 text-muted-foreground">
                      Телефон
                    </Label>
                    <Input
                      className="rounded-2xl h-14 bg-background border-none shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="address" className="m-0 outline-none">
            <Card className="rounded-[2.5rem] border-none bg-secondary/20 shadow-none">
              <CardHeader className="pt-8 px-8">
                <CardTitle className="text-[11px] uppercase font-black tracking-[0.2em] text-primary/50">
                  Данные доставки
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider ml-1 text-muted-foreground">
                      Страна
                    </Label>
                    <Input
                      className="rounded-2xl h-14 bg-background border-none shadow-sm"
                      value={formData.country}
                      onChange={(e) =>
                        setFormData({ ...formData, country: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider ml-1 text-muted-foreground">
                      Город
                    </Label>
                    <Input
                      className="rounded-2xl h-14 bg-background border-none shadow-sm"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                    />
                  </div>
                  <div className="md:col-span-1 space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider ml-1 text-muted-foreground">
                      Улица
                    </Label>
                    <Input
                      className="rounded-2xl h-14 bg-background border-none shadow-sm"
                      value={formData.street}
                      onChange={(e) =>
                        setFormData({ ...formData, street: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider ml-1 text-muted-foreground">
                      Дом / Кв
                    </Label>
                    <Input
                      className="rounded-2xl h-14 bg-background border-none shadow-sm"
                      value={formData.house}
                      onChange={(e) =>
                        setFormData({ ...formData, house: e.target.value })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="m-0 outline-none">
            <Card className="rounded-[2.5rem] border-none bg-secondary/20 shadow-none">
              <CardHeader className="pt-8 px-8">
                <CardTitle className="text-[11px] uppercase font-black tracking-[0.2em] text-primary/50">
                  Безопасность
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-2 space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider ml-1 text-muted-foreground">
                    Новый пароль
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      className="rounded-2xl h-14 bg-background border-none shadow-sm pr-12"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider ml-1 text-muted-foreground">
                    Подтверждение
                  </Label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    className="rounded-2xl h-14 bg-background border-none shadow-sm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="flex justify-center md:justify-end pt-4">
            <Button
              disabled={isAuthLoading}
              className="cursor-pointer w-full md:w-auto px-12 h-14 rounded-[1.5rem] font-bold uppercase text-[12px] tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95"
            >
              {isAuthLoading ? (
                <div className="flex items-center gap-3 fade-in zoom-in duration-300">
                  <Loader2 className="animate-spin" size={18} />
                  <span>Сохранение...</span>
                </div>
              ) : (
                <span className="fade-in duration-300">
                  Сохранить изменения
                </span>
              )}
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  );
}
