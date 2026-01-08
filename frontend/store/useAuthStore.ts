import { create } from "zustand";
import { userApi } from "@/lib/axios";

interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: Date;
  balance: number;
  phone?: string;
  country?: string;
  city?: string;
  street?: string;
  house?: string;
  image?: string;
  token?: string;
}

interface AuthFormData {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface AuthState {
  user: User | null;
  isChecking: boolean;
  isAuthChecked: boolean;
  isAuthLoading: boolean;
  error: string | null;
  clearError: () => void;
  checkAuth: () => Promise<void>;
  login: (data: AuthFormData) => Promise<void>;
  register: (data: AuthFormData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User> & { password?: string }) => Promise<void>;
  updateBalance: (newBalance: number) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("userInfo") || "null")
      : null,
  isChecking: true,
  isAuthChecked: false,
  isAuthLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  checkAuth: async () => {
    if (typeof window !== "undefined" && !localStorage.getItem("userInfo")) {
      set({ user: null, isAuthChecked: true, isChecking: false });
      return;
    }

    try {
      const { data } = await userApi.getProfile();
      const localData = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const updatedUser = { ...localData, ...data };

      localStorage.setItem("userInfo", JSON.stringify(updatedUser));
      set({ user: updatedUser, isAuthChecked: true });
    } catch {
      localStorage.removeItem("userInfo");
      set({ user: null, isAuthChecked: true });
    } finally {
      set({ isChecking: false });
    }
  },

  login: async (formData) => {
    set({ isAuthLoading: true, error: null });
    try {
      const { data } = await userApi.login(formData);
      localStorage.setItem("userInfo", JSON.stringify(data));
      set({ user: data, isAuthChecked: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || "Ошибка входа";
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ isAuthLoading: false });
    }
  },

  register: async (formData) => {
    set({ isAuthLoading: true, error: null });
    try {
      const { data } = await userApi.register(formData);
      localStorage.setItem("userInfo", JSON.stringify(data));
      set({ user: data, isAuthChecked: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || "Ошибка регистрации";
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ isAuthLoading: false });
    }
  },

  logout: async () => {
    set({ isAuthLoading: true });
    try {
      await userApi.logout().catch(() => {});
    } finally {
      localStorage.removeItem("userInfo");
      set({ user: null, isAuthChecked: true, isAuthLoading: false });
    }
  },

  updateProfile: async (formData) => {
    set({ isAuthLoading: true, error: null });
    try {
      const { data } = await userApi.updateProfile(formData);
      const localData = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const updatedUser = { ...localData, ...data };

      localStorage.setItem("userInfo", JSON.stringify(updatedUser));
      set({ user: updatedUser });
    } catch (err: any) {
      const msg = err.response?.data?.message || "Ошибка обновления профиля";
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ isAuthLoading: false });
    }
  },

  updateBalance: (newBalance) => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, balance: newBalance };
      localStorage.setItem("userInfo", JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  },
}));
