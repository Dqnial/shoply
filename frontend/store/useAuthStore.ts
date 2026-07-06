import { create } from "zustand";
import { persist, type PersistStorage } from "zustand/middleware";
import { userApi } from "@/lib/axios";
import { getErrorMessage } from "@/lib/utils";
import type { AuthFormData, User } from "@/types";

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

type PersistedAuth = Pick<AuthState, "user">;

// The JWT itself lives in an httpOnly cookie now (set by the backend) and is
// never readable from JS. This only caches the non-sensitive user profile
// under the pre-existing "userInfo" key so the UI can render optimistically
// before checkAuth() confirms the session with the server.
const userInfoStorage: PersistStorage<PersistedAuth> = {
  getItem: (name) => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(name);
    return raw ? { state: { user: JSON.parse(raw) } } : null;
  },
  setItem: (name, value) => {
    if (typeof window === "undefined") return;
    if (value.state.user) {
      localStorage.setItem(name, JSON.stringify(value.state.user));
    } else {
      localStorage.removeItem(name);
    }
  },
  removeItem: (name) => {
    if (typeof window !== "undefined") localStorage.removeItem(name);
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isChecking: true,
      isAuthChecked: false,
      isAuthLoading: false,
      error: null,

      clearError: () => set({ error: null }),

      checkAuth: async () => {
        if (!get().user) {
          set({ isAuthChecked: true, isChecking: false });
          return;
        }

        try {
          const { data } = await userApi.getProfile();
          set((state) => ({
            user: { ...state.user, ...data },
            isAuthChecked: true,
          }));
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
        } catch (err) {
          const msg = getErrorMessage(err, "Ошибка входа");
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
        } catch (err) {
          const msg = getErrorMessage(err, "Ошибка регистрации");
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
          set({ user: null, isAuthChecked: true, isAuthLoading: false });
        }
      },

      updateProfile: async (formData) => {
        set({ isAuthLoading: true, error: null });
        try {
          const { data } = await userApi.updateProfile(formData);
          set((state) => ({ user: { ...state.user, ...data } }));
        } catch (err) {
          const msg = getErrorMessage(err, "Ошибка обновления профиля");
          set({ error: msg });
          throw new Error(msg);
        } finally {
          set({ isAuthLoading: false });
        }
      },

      updateBalance: (newBalance) => {
        set((state) =>
          state.user ? { user: { ...state.user, balance: newBalance } } : state
        );
      },
    }),
    {
      name: "userInfo",
      storage: userInfoStorage,
      partialize: (state) => ({ user: state.user }),
    }
  )
);
