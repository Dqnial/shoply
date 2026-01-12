"use client";

import { useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  ShoppingBag,
  ArrowRight,
  Minus,
  Plus,
  Loader2,
  Wallet,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api, { API_URL } from "@/lib/axios";
import { toast } from "sonner";
import { cn, getPlural } from "@/lib/utils";

export default function CartPage() {
  const router = useRouter();
  const { cartItems, removeItem, updateQty, clearCart } = useCartStore();
  const { user, updateBalance } = useAuthStore();
  const [isPending, setIsPending] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"Card" | "Balance">(
    "Balance"
  );

  const total = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  const handlePaymentMethodChange = (method: "Card" | "Balance") => {
    if (method === "Card") {
      toast.info(
        "Оплата картой временно недоступна. Пожалуйста, используйте личный счет."
      );
      return;
    }
    setPaymentMethod(method);
  };

  const checkoutHandler = async () => {
    if (!user) {
      toast.error("Пожалуйста, войдите в аккаунт");
      router.push("/login?redirect=/cart");
      return;
    }

    if (!user.city || !user.street) {
      toast.error("Заполните адрес доставки в профиле");
      router.push("/profile");
      return;
    }

    if (paymentMethod === "Balance" && (user.balance || 0) < total) {
      toast.error("Недостаточно средств на личном счету");
      return;
    }

    try {
      setIsPending(true);
      const orderData = {
        orderItems: cartItems.map((item) => ({
          name: item.name,
          qty: item.qty,
          image: item.image,
          price: item.price,
          product: item._id,
        })),
        shippingAddress: {
          city: user.city,
          address: `${user.street}, ${user.house || ""}`,
          postalCode: "000000",
          country: user.country || "Kazakhstan",
        },
        paymentMethod: paymentMethod,
        itemsPrice: total,
        shippingPrice: 0,
        totalPrice: total,
      };

      const { data } = await api.post("/orders", orderData);

      if (paymentMethod === "Balance") {
        const newBalance = (user.balance || 0) - total;
        updateBalance(newBalance);
      }

      toast.success("Заказ успешно оплачен и оформлен!");
      clearCart();
      router.push(`/profile/orders/${data._id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Не удалось создать заказ");
    } finally {
      setIsPending(false);
    }
  };

  const handleQtyChange = (item: any, newQty: number) => {
    if (newQty < 1) return;
    updateQty(item._id, newQty);
  };

  const handleInputChange = (item: any, value: string) => {
    if (value === "") {
      updateQty(item._id, 0);
      return;
    }
    const numValue = parseInt(value);
    if (!isNaN(numValue)) updateQty(item._id, numValue);
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="bg-secondary/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
          <ShoppingBag size={40} />
        </div>
        <h1 className="text-2xl font-black mb-2 uppercase tracking-tighter">
          Корзина пуста
        </h1>
        <p className="text-muted-foreground mb-8 text-sm">
          Добавьте товары в корзину, чтобы оформить заказ
        </p>
        <Button
          asChild
          className="rounded-xl px-8 h-12 font-bold uppercase tracking-widest text-xs shadow-lg cursor-pointer"
        >
          <Link href="/catalog">В каталог</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      <div className="space-y-1 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tighter text-primary">
          Корзина
        </h1>
        <p className="text-sm text-muted-foreground font-medium">
          У вас {cartItems.length}{" "}
          {getPlural(cartItems.length, ["товар", "товара", "товаров"])} в списке
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item._id}
              className="group relative grid grid-cols-[auto_1fr_auto] items-center gap-3 md:gap-6 bg-card p-3 md:p-4 rounded-2xl border border-border/60 transition-all hover:border-primary/20 md:hover:shadow-sm"
            >
              <div className="relative w-20 h-20 md:w-24 md:h-24 bg-secondary/50 rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src={`${API_URL}${item.image}`}
                  alt={item.name}
                  unoptimized
                  fill
                  className="object-contain p-2 transition-transform group-hover:scale-110"
                />
              </div>

              <div className="flex flex-col min-w-0 h-full justify-between py-1">
                <div>
                  <h3 className="font-bold text-foreground text-sm md:text-lg truncate leading-tight">
                    {item.name}
                  </h3>
                  <p className="text-[9px] md:text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">
                    {item.brand}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <div className="flex items-center bg-secondary/50 rounded-lg border border-border/40 p-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleQtyChange(item, item.qty - 1)}
                      className="cursor-pointer w-7 h-7 flex items-center justify-center hover:bg-background rounded-md transition-all active:scale-90"
                    >
                      <Minus size={12} />
                    </Button>
                    <input
                      type="number"
                      value={item.qty === 0 ? "" : item.qty}
                      onChange={(e) => handleInputChange(item, e.target.value)}
                      onBlur={() => item.qty < 1 && updateQty(item._id, 1)}
                      className="w-8 bg-transparent text-center text-xs font-bold focus:outline-none appearance-none"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleQtyChange(item, item.qty + 1)}
                      className="cursor-pointer w-7 h-7 flex items-center justify-center hover:bg-background rounded-md transition-all active:scale-90"
                    >
                      <Plus size={12} />
                    </Button>
                  </div>
                  <span className="font-black text-foreground text-sm md:text-base whitespace-nowrap">
                    {(item.price * item.qty).toLocaleString()} ₸
                  </span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="cursor-pointer self-start md:self-center rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors h-9 w-9"
                onClick={() => removeItem(item._id)}
              >
                <Trash2 size={18} />
              </Button>
            </div>
          ))}
        </div>

        <div className="sticky top-28 space-y-4 pb-20 md:pb-0">
          <div className="bg-card p-6 rounded-3xl border border-border shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
              Способ оплаты
            </h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setPaymentMethod("Balance")}
                className={cn(
                  "relative flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer",
                  paymentMethod === "Balance"
                    ? "border-primary bg-primary/5 ring-4 ring-primary/5"
                    : "border-transparent bg-secondary/50 hover:bg-secondary/80"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      paymentMethod === "Balance"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground"
                    )}
                  >
                    <Wallet size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold leading-none">
                      Личный счет
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                      Баланс: {user?.balance?.toLocaleString()} ₸
                    </p>
                  </div>
                </div>
                {paymentMethod === "Balance" && (
                  <CheckCircle2 size={18} className="text-primary" />
                )}
              </button>
              <button
                onClick={() => handlePaymentMethodChange("Card")}
                className="group relative flex items-center justify-between p-4 rounded-2xl border-2 border-transparent bg-secondary/30 transition-all cursor-pointer opacity-60 hover:opacity-80"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-background text-muted-foreground group-hover:bg-secondary/50">
                    <CreditCard size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold leading-none">Карта</p>
                    <p className="text-[9px] text-primary font-bold uppercase tracking-tighter mt-1">
                      Скоро
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-card p-6 md:p-8 rounded-3xl border border-border shadow-sm space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                Детали заказа
              </h3>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Товары</span>
                <span className="font-bold">{total.toLocaleString()} ₸</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Доставка</span>
                <span className="text-emerald-500 font-bold uppercase text-[10px]">
                  Бесплатно
                </span>
              </div>
              <div className="h-px bg-border my-4" />
              <div className="flex justify-between items-end">
                <span className="font-bold">Итого:</span>
                <span className="text-2xl md:text-3xl font-black tracking-tighter text-foreground">
                  {total.toLocaleString()} ₸
                </span>
              </div>
            </div>

            <Button
              onClick={checkoutHandler}
              disabled={
                isPending ||
                (paymentMethod === "Balance" && (user?.balance || 0) < total)
              }
              className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] group shadow-xl shadow-primary/20 transition-all active:scale-[0.98] cursor-pointer"
            >
              {isPending ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <span className="flex items-center">
                  Оформить и оплатить{" "}
                  <ArrowRight
                    size={16}
                    className="ml-2 transition-transform group-hover:translate-x-1"
                  />
                </span>
              )}
            </Button>
            {paymentMethod === "Balance" && user && user.balance < total && (
              <p className="text-[10px] text-center text-destructive font-bold uppercase tracking-tight">
                Недостаточно средств
              </p>
            )}
            <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
              Нажимая кнопку, вы подтверждаете списание средств.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
