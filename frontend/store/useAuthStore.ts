import { create } from "zustand";
import { userApi } from "@/lib/axios";

interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  phone?: string;
  country?: string;
  city?: string;
  street?: string;
  house?: string;
  image?: string;
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
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isChecking: true,
  isAuthChecked: false,
  isAuthLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  checkAuth: async () => {
    if (get().isAuthChecked) {
      set({ isChecking: false });
      return;
    }

    try {
      const { data } = await userApi.getProfile();
      set({ user: data, isAuthChecked: true });
    } catch {
      set({ user: null, isAuthChecked: true });
    } finally {
      set({ isChecking: false });
    }
  },

  login: async (formData) => {
    set({ isAuthLoading: true, error: null });
    try {
      const { data } = await userApi.login(formData);
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
      await userApi.logout();
      set({ user: null, isAuthChecked: true });
    } finally {
      set({ isAuthLoading: false });
    }
  },

  updateProfile: async (formData) => {
    set({ isAuthLoading: true, error: null });
    try {
      const { data } = await userApi.updateProfile(formData);
      set({ user: data });
    } catch (err: any) {
      const msg = err.response?.data?.message || "Ошибка обновления профиля";
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ isAuthLoading: false });
    }
  },
}));
