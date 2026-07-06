import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/axios";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";
import type { CartItem, Order } from "@/types";

/**
 * Owns the cart page's checkout flow: payment-method selection, the
 * idempotency-keyed order submission, balance update on success, and the
 * qty-input handlers — leaves the page to just render the cart/summary JSX.
 */
export function useCheckout() {
  const router = useRouter();
  const { cartItems, removeItem, updateQty, clearCart } = useCartStore();
  const { user, updateBalance } = useAuthStore();
  const [isPending, setIsPending] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"Card" | "Balance">(
    "Balance"
  );
  // Generated once per visit to this page and reused for every retry of the
  // same checkout attempt — if a request is retried after a flaky network
  // response or a double-click, the server recognizes the key and returns
  // the original order instead of creating (and charging) a second one.
  const [idempotencyKey] = useState(() => crypto.randomUUID());

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
        idempotencyKey,
      };

      const { data } = await api.post<Order>("/orders", orderData);

      if (paymentMethod === "Balance") {
        const newBalance = (user.balance || 0) - data.totalPrice;
        updateBalance(newBalance);
      }

      toast.success("Заказ успешно оплачен и оформлен!");
      clearCart();
      router.push(`/profile/orders/${data._id}`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Не удалось создать заказ"));
    } finally {
      setIsPending(false);
    }
  };

  const handleQtyChange = (item: CartItem, newQty: number) => {
    if (newQty < 1) return;
    updateQty(item._id, newQty);
  };

  const handleInputChange = (item: CartItem, value: string) => {
    if (value === "") {
      updateQty(item._id, 0);
      return;
    }
    const numValue = parseInt(value);
    if (!isNaN(numValue)) updateQty(item._id, numValue);
  };

  return {
    cartItems,
    removeItem,
    updateQty,
    user,
    isPending,
    paymentMethod,
    total,
    handlePaymentMethodChange,
    checkoutHandler,
    handleQtyChange,
    handleInputChange,
  };
}
