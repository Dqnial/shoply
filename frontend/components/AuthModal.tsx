"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button"; // Импорт Button
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Loader2, AlertCircle } from "lucide-react";

export default function AuthModal() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const { login, register, isAuthLoading, error, clearError } = useAuthStore();

  const handleSwitchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === "login") {
        await login({ email: formData.email, password: formData.password });
        toast.success("Успешный вход!");
      } else {
        await register(formData);
        toast.success("Аккаунт успешно создан!");
      }
      setOpen(false);
      setFormData({ name: "", email: "", password: "" });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Произошла ошибка");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) clearError();
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-2xl transition-all"
        >
          <User className="w-5! h-5!" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[380px] rounded-2xl border-border bg-card p-6 gap-6 shadow-xl">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
            {mode === "login" ? "Войти" : "Создать аккаунт"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {mode === "login"
              ? "Введите свои данные для доступа в кабинет"
              : "Заполните форму, чтобы создать аккаунт"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 p-3 text-xs font-medium text-destructive bg-destructive/5 border border-destructive/10 rounded-lg">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div className="space-y-1.5">
              <Label
                htmlFor="name"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80"
              >
                Имя
              </Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Иван Иванов"
                className="rounded-lg border-border h-10 text-sm focus-visible:ring-1"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label
              htmlFor="email"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="example@mail.com"
              className="rounded-lg border-border h-10 text-sm focus-visible:ring-1"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="password"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80"
            >
              Пароль
            </Label>
            <Input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="••••••••"
              className="rounded-lg border-border h-10 text-sm focus-visible:ring-1"
            />
          </div>

          <Button
            type="submit"
            disabled={isAuthLoading}
            className="cursor-pointer w-full h-11 rounded-lg font-semibold text-sm transition-all active:scale-[0.98]"
          >
            {isAuthLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === "login" ? (
              "Войти"
            ) : (
              "Зарегистрироваться"
            )}
          </Button>
        </form>

        <div className="text-center flex flex-row justify-center gap-1">
          <p className="text-sm text-muted-foreground font-medium">
            {mode === "login" ? "Нет аккаунта?" : "Уже есть аккаунт?"}
          </p>
          <Button
            variant="link"
            onClick={handleSwitchMode}
            className="cursor-pointer p-0 h-auto text-sm text-primary hover:underline hover:underline-offset-4 transition-all font-semibold"
          >
            {mode === "login" ? "Зарегистрироваться" : "Войти"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
