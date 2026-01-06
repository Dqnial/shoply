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

  const isCustomImage = formData.image !== DEFAULT_AVATAR;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-10 space-y-1">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-primary">
          Настройки
        </h1>
        <p className="text-muted-foreground">
          Управляйте своим профилем и личными данными
        </p>
      </div>

      <Tabs
        defaultValue="profile"
        className="flex flex-col md:flex-row gap-8 items-start"
      >
        <TabsList className="flex md:flex-col bg-secondary/30 p-1.5 rounded-[2rem] h-auto w-full md:w-72 shrink-0">
          <TabsTrigger
            value="profile"
            className="flex-1 md:w-full justify-start gap-3 rounded-[1.5rem] py-4 px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm cursor-pointer"
          >
            <UserIcon size={20} />
            <span className="font-bold uppercase text-[11px] tracking-widest">
              Профиль
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="address"
            className="flex-1 md:w-full justify-start gap-3 rounded-[1.5rem] py-4 px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm cursor-pointer"
          >
            <MapPin size={20} />
            <span className="font-bold uppercase text-[11px] tracking-widest">
              Адрес
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="flex-1 md:w-full justify-start gap-3 rounded-[1.5rem] py-4 px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm cursor-pointer"
          >
            <ShieldCheck size={20} />
            <span className="font-bold uppercase text-[11px] tracking-widest">
              Защита
            </span>
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 w-full">
          <form onSubmit={handleSubmit} className="space-y-6">
            <TabsContent value="profile" className="m-0 outline-none">
              <Card className="rounded-[2.5rem] border-none bg-secondary/20 shadow-none">
                <CardHeader className="pt-8 px-8">
                  <CardTitle className="text-[11px] uppercase font-black tracking-[0.2em] text-primary/50">
                    Основная информация
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-4 space-y-8">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div
                      className="relative group w-32 h-32 cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="w-full h-full rounded-[2.5rem] overflow-hidden border-4 border-background shadow-xl relative flex items-center justify-center bg-background">
                        {isCustomImage ? (
                          <Image
                            src={formData.image}
                            alt="Avatar"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <UserIcon
                            size={40}
                            className="text-muted-foreground"
                          />
                        )}
                        <div className="absolute inset-0 bg-primary/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
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
                        size="sm"
                        onClick={removeAvatar}
                        className="rounded-xl h-10 px-4 font-bold uppercase text-[10px] tracking-widest cursor-pointer"
                      >
                        <Trash2 size={14} className="mr-2" />
                        Удалить фото
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase tracking-wider ml-1 text-muted-foreground">
                        Ваше имя
                      </Label>
                      <Input
                        className="rounded-2xl h-14 bg-background border-none shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold uppercase tracking-wider ml-1 text-muted-foreground">
                        Телефон
                      </Label>
                      <Input
                        className="rounded-2xl h-14 bg-background border-none shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="+7 (___) ___ __ __"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="address" className="m-0 outline-none">
              <Card className="rounded-[2.5rem] border-none bg-secondary/20">
                <CardHeader className="pt-8 px-8">
                  <CardTitle className="text-[11px] uppercase font-black tracking-[0.2em] text-primary/50">
                    Доставка
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-4 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
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
                    <div className="space-y-3">
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
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-3">
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
                    <div className="space-y-3">
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
              <Card className="rounded-[2.5rem] border-none bg-secondary/20">
                <CardHeader className="pt-8 px-8">
                  <CardTitle className="text-[11px] uppercase font-black tracking-[0.2em] text-primary/50">
                    Безопасность
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-4 space-y-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase tracking-wider ml-1 text-muted-foreground">
                      Новый пароль
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        className="rounded-2xl h-14 bg-background border-none shadow-sm pr-12"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                      >
                        {!showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase tracking-wider ml-1 text-muted-foreground">
                      Подтвердите пароль
                    </Label>
                    <Input
                      type={showPassword ? "text" : "password"}
                      className="rounded-2xl h-14 bg-background border-none shadow-sm"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <div className="flex justify-end pt-4">
              <Button
                disabled={isAuthLoading}
                className="w-full md:w-auto px-12 h-14 rounded-[1.5rem] font-bold uppercase text-[12px] tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95 cursor-pointer"
              >
                {isAuthLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Сохранить изменения"
                )}
              </Button>
            </div>
          </form>
        </div>
      </Tabs>
    </div>
  );
}
