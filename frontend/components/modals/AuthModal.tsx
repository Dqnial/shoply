"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
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
import { User, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function AuthModal({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const {
    login,
    register,
    isAuthLoading,
    error: serverError,
    clearError,
  } = useAuthStore();

  const resetFormState = () => {
    setFormData({ name: "", email: "", password: "", confirmPassword: "" });
    setShowPassword(false);
    setLocalError(null);
    clearError();
  };

  const handleSwitchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    resetFormState();
  };

  const handleInputChange = (field: string, value: string) => {
    setLocalError(null);
    clearError();
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (mode === "register") {
      if (formData.password.length < 6) {
        setLocalError("Пароль должен быть не менее 6 символов");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setLocalError("Пароли не совпадают!");
        return;
      }
    }

    try {
      if (mode === "login") {
        await login({ email: formData.email, password: formData.password });
        toast.success("Успешный вход!");
      } else {
        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
        toast.success("Аккаунт успешно создан!");
      }
      setOpen(false);
      resetFormState();
    } catch (err: any) {}
  };

  const displayError = localError || serverError;

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) resetFormState();
      }}
    >
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-2xl transition-all"
          >
            <User className="w-5! h-5!" />
          </Button>
        )}
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

        {displayError && (
          <div className="flex items-center gap-2 p-3 text-xs font-medium text-destructive bg-destructive/5 border border-destructive/10 rounded-lg animate-in fade-in slide-in-from-top-1">
            <AlertCircle size={14} className="shrink-0" />
            {displayError}
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
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Иван Иванов"
                className="rounded-lg border-border h-10 text-sm"
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
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="example@mail.com"
              className="rounded-lg border-border h-10 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="password"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80"
            >
              Пароль
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="••••••••"
                className="rounded-lg border-border h-10 text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                {!showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {mode === "register" && (
            <div className="space-y-1.5">
              <Label
                htmlFor="confirmPassword"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80"
              >
                Подтверждение
              </Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                required
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                placeholder="••••••••"
                className="rounded-lg border-border h-10 text-sm"
              />
            </div>
          )}

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
            className="cursor-pointer p-0 h-auto text-sm text-primary hover:underline transition-all font-semibold"
          >
            {mode === "login" ? "Зарегистрироваться" : "Войти"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
