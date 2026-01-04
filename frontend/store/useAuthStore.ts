import { create } from "zustand";
import api from "@/lib/axios";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface AuthFormData {
  name?: string;
  email: string;
  password?: string;
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
      const { data } = await api.get<User>("/users/profile");
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
      const { data } = await api.post<User>("/users/login", formData);
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
      const { data } = await api.post<User>("/users/register", formData);
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
      await api.post("/users/logout");
      set({ user: null, isAuthChecked: true });
    } finally {
      set({ isAuthLoading: false });
    }
  },
}));
