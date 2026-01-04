import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  brand: string;
  qty: number;
}

interface CartState {
  cartItems: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],

      addItem: (item) => {
        const items = get().cartItems;
        const exist = items.find((x) => x._id === item._id);

        if (exist) {
          set({
            cartItems: items.map((x) =>
              x._id === item._id ? { ...x, qty: x.qty + 1 } : x
            ),
          });
        } else {
          set({ cartItems: [...items, { ...item, qty: 1 }] });
        }
      },

      updateQty: (id, qty) => {
        set({
          cartItems: get().cartItems.map((x) =>
            x._id === id ? { ...x, qty } : x
          ),
        });
      },

      removeItem: (id) =>
        set({ cartItems: get().cartItems.filter((x) => x._id !== id) }),

      clearCart: () => set({ cartItems: [] }),
    }),
    { name: "cart-storage" }
  )
);
