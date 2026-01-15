import axios from "axios";

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  }
  return config;
});

export const adminApi = {
  // --- ТОВАРЫ (Products) ---
  getProducts: (config?: any) => api.get("/products", config),
  getProductById: (id: string | string[]) => api.get(`/products/${id}`),
  createProduct: (data = {}) => api.post("/products", data),
  updateProduct: (id: string, data: any) => api.put(`/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
  uploadImage: (data: FormData) => api.post("/upload", data),
  deleteImage: (imagePath: string) =>
    api.delete("/upload", { data: { path: imagePath } }),
  // --- ЗАКАЗЫ (Orders) ---
  getOrders: () => api.get("/orders"),
  getSummary: () => api.get("/orders/summary"),
  payOrder: (id: string) => api.put(`/orders/${id}/pay`),
  deliverOrder: (id: string) => api.put(`/orders/${id}/deliver`),
  deleteOrder: (id: string) => api.delete(`/orders/${id}`),

  // --- ПОЛЬЗОВАТЕЛИ (Users) ---
  getUsers: () => api.get("/users"),
  getUserById: (id: string) => api.get(`/users/${id}`),
  updateUser: (id: string, data: any) => api.put(`/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
  adminTopUpBalance: (id: string, amount: number) =>
    api.put(`/users/${id}/balance`, { amount }),
};

export const userApi = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data: any) => api.put("/users/profile", data),
  getMyOrders: () => api.get("/orders/myorders"),
  getOrderDetails: (id: string) => api.get(`/orders/${id}`),
  login: (credentials: any) => api.post("/users/login", credentials),
  register: (userData: any) => api.post("/users/register", userData),
  logout: () => api.post("/users/logout"),
};

export default api;
