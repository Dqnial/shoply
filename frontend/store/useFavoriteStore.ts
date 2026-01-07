import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoriteStore {
  favorites: any[];
  addToFavorites: (product: any) => void;
  removeFromFavorites: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
}

export const useFavoriteStore = create<FavoriteStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      addToFavorites: (product) => {
        const isExist = get().favorites.find(
          (item) => item._id === product._id
        );
        if (!isExist) {
          set({ favorites: [...get().favorites, product] });
        }
      },
      removeFromFavorites: (productId) => {
        set({
          favorites: get().favorites.filter((item) => item._id !== productId),
        });
      },
      isFavorite: (productId) => {
        return !!get().favorites.find((item) => item._id === productId);
      },
    }),
    { name: "favorites-storage" }
  )
);
