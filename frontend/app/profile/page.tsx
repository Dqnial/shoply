"use client";

import { useAuthStore } from "@/store/useAuthStore";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Phone,
  Mail,
  User as UserIcon,
  Globe,
  Home,
  Hash,
  Settings2,
  ChevronRight,
} from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-10">
      {/* ЗАГОЛОВОК СТРАНИЦЫ */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-primary">
            Мой профиль
          </h1>
          <p className="text-muted-foreground">
            Персональная информация и данные аккаунта
          </p>
        </div>

        <Link href="/settings">
          <Button className="rounded-[1.5rem] px-8 h-14 font-bold uppercase text-[12px] tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95 cursor-pointer">
            <Settings2 size={18} className="mr-2" />
            Редактировать
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* ЛЕВАЯ КОЛОНКА: АВАТАР И ОСНОВНОЕ */}
        <Card className="lg:col-span-1 rounded-[2.5rem] border-none bg-secondary/20 shadow-none overflow-hidden">
          <CardContent className="p-8 flex flex-col items-center text-center">
            <div className="relative w-40 h-40 mb-6">
              <div className="w-full h-full rounded-[2.5rem] overflow-hidden border-4 border-background shadow-xl relative flex items-center justify-center bg-background">
                {user.image && user.image !== "/uploads/default-avatar.png" ? (
                  <Image
                    src={user.image}
                    alt={user.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <UserIcon size={64} className="text-muted-foreground/40" />
                )}
              </div>
              <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-xl px-4 py-1.5 font-black uppercase text-[10px] tracking-wider shadow-lg">
                {user.isAdmin ? "Администратор" : "Покупатель"}
              </Badge>
            </div>

            <h2 className="text-2xl font-black uppercase tracking-tight text-primary break-all">
              {user.name}
            </h2>
            <p className="text-muted-foreground font-medium mb-6 flex items-center gap-2">
              <Mail size={14} />
              {user.email}
            </p>

            <Separator className="bg-background/50 mb-6" />

            <div className="w-full space-y-3">
              <div className="flex items-center justify-between text-[11px] uppercase font-bold tracking-widest text-primary/40 px-2">
                <span>Дата регистрации</span>
                <span className="text-primary/70">12.05.2024</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ПРАВАЯ КОЛОНКА: ИНФОРМАЦИЯ */}
        <div className="lg:col-span-2 space-y-6">
          {/* КАРТОЧКА: ЛИЧНЫЕ ДАННЫЕ */}
          <Card className="rounded-[2.5rem] border-none bg-secondary/20 shadow-none">
            <CardHeader className="pt-8 px-8">
              <CardTitle className="text-[11px] uppercase font-black tracking-[0.2em] text-primary/50 flex items-center gap-2">
                <UserIcon size={16} /> Основная информация
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-background rounded-2xl p-5 flex items-center justify-between shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    Телефон
                  </span>
                  <span className="font-bold">{user.phone || "—"}</span>
                </div>
                <div className="bg-background rounded-2xl p-5 flex items-center justify-between shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    ID Аккаунта
                  </span>
                  <span className="font-mono text-[11px] font-bold opacity-60">
                    #{user._id.slice(-8)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* КАРТОЧКА: АДРЕС */}
          <Card className="rounded-[2.5rem] border-none bg-secondary/20 shadow-none">
            <CardHeader className="pt-8 px-8">
              <CardTitle className="text-[11px] uppercase font-black tracking-[0.2em] text-primary/50 flex items-center gap-2">
                <MapPin size={16} /> Адрес доставки
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-2">
              {user.city ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-background rounded-2xl p-5 space-y-1 shadow-sm">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                      <Globe size={10} /> Регион
                    </p>
                    <p className="font-black text-primary">
                      {user.country}, {user.city}
                    </p>
                  </div>
                  <div className="bg-background rounded-2xl p-5 space-y-1 shadow-sm">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                      <Home size={10} /> Улица / Дом
                    </p>
                    <p className="font-black text-primary uppercase">
                      {user.street}, {user.house}
                    </p>
                  </div>
                </div>
              ) : (
                <Link href="/settings">
                  <div className="group flex flex-col items-center justify-center py-10 border-2 border-dashed rounded-[2rem] border-primary/10 hover:border-primary/30 transition-all cursor-pointer bg-background/30">
                    <MapPin
                      className="text-primary/20 group-hover:text-primary/40 transition-colors mb-2"
                      size={32}
                    />
                    <p className="text-sm font-bold uppercase tracking-widest text-primary/40">
                      Адрес не указан
                    </p>
                    <span className="text-[10px] text-primary/30 mt-1 flex items-center gap-1">
                      Нажмите, чтобы добавить <ChevronRight size={12} />
                    </span>
                  </div>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
