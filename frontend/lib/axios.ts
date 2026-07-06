import axios, { AxiosRequestConfig } from "axios";
import { queryClient } from "./queryClient";
import { getCookie } from "./utils";
import {
  AuthFormData,
  Order,
  OrderSummary,
  PopulatedOrder,
  Product,
  User,
} from "@/types";

// Empty by default: the unified server (backend/src/server.ts) serves the
// frontend and the API from the same origin, so a relative "/api" and
// relative "/uploads/..." image paths already resolve correctly. Only set
// NEXT_PUBLIC_API_URL if the API genuinely lives on a different origin.
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

const SAFE_METHODS = new Set(["get", "head", "options"]);

const api = axios.create({
  baseURL: `${API_URL}/api`,
  // The JWT lives in an httpOnly cookie set by the backend — the browser
  // attaches it automatically, but only if credentials are sent cross-origin.
  withCredentials: true,
});

// Double-submit CSRF protection: the backend also sets a readable
// "csrf-token" cookie alongside the httpOnly JWT one. Echoing it back in a
// header proves the request came from our own frontend JS — a cross-site
// attacker can trigger the request but can't read the cookie to forge it.
api.interceptors.request.use((config) => {
  if (!SAFE_METHODS.has((config.method ?? "get").toLowerCase())) {
    const csrfToken = getCookie("csrf-token");
    if (csrfToken) {
      config.headers["X-CSRF-Token"] = csrfToken;
    }
  }
  return config;
});

// Any write to /products, /orders or /users invalidates the matching cached
// queries (both the public storefront's and the admin panel's — they share
// a key prefix, e.g. ["products", "admin", ...], so one invalidation call
// catches both) so the next visit reflects the change instead of showing
// stale cached data.
api.interceptors.response.use((response) => {
  const method = response.config.method?.toLowerCase();
  const url = response.config.url ?? "";

  if (method && method !== "get") {
    if (url.includes("/products")) {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product-filters"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
    }
    if (url.includes("/orders")) {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    }
    if (url.includes("/users")) {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    }
    // Almost any admin mutation can shift the dashboard's numbers.
    queryClient.invalidateQueries({ queryKey: ["admin", "summary"] });
  }

  return response;
});

export const adminApi = {
  // --- ТОВАРЫ (Products) ---
  getProducts: (config?: AxiosRequestConfig) =>
    api.get<{ products: Product[]; totalCount: number; totalPages: number }>(
      "/products",
      config
    ),
  getProductById: (id: string | string[]) =>
    api.get<Product>(`/products/${id}`),
  createProduct: (data: Partial<Product> = {}) =>
    api.post<Product>("/products", data),
  updateProduct: (id: string, data: Partial<Product>) =>
    api.put<Product>(`/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
  uploadImage: (data: FormData) => api.post<{ image: string }>("/upload", data),
  deleteImage: (imagePath: string) =>
    api.delete("/upload", { data: { path: imagePath } }),
  // --- ЗАКАЗЫ (Orders) ---
  getOrders: () => api.get<PopulatedOrder[]>("/orders"),
  getSummary: () => api.get<OrderSummary>("/orders/summary"),
  payOrder: (id: string) => api.put<PopulatedOrder>(`/orders/${id}/pay`),
  deliverOrder: (id: string) => api.put<PopulatedOrder>(`/orders/${id}/deliver`),
  deleteOrder: (id: string) => api.delete(`/orders/${id}`),

  // --- ПОЛЬЗОВАТЕЛИ (Users) ---
  getUsers: () => api.get<User[]>("/users"),
  getUserById: (id: string) => api.get<User>(`/users/${id}`),
  updateUser: (id: string, data: Partial<User>) =>
    api.put<User>(`/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
  adminTopUpBalance: (id: string, amount: number) =>
    api.put<{ message: string; balance: number }>(`/users/${id}/balance`, {
      amount,
    }),
};

export const userApi = {
  getProfile: () => api.get<User>("/users/profile"),
  updateProfile: (data: Partial<User> & { password?: string }) =>
    api.put<User>("/users/profile", data),
  getMyOrders: () => api.get<Order[]>("/orders/myorders"),
  getOrderDetails: (id: string) => api.get<PopulatedOrder>(`/orders/${id}`),
  login: (credentials: AuthFormData) =>
    api.post<User>("/users/login", credentials),
  register: (userData: AuthFormData) =>
    api.post<User>("/users/register", userData),
  logout: () => api.post("/users/logout"),
};

export default api;
