import axios from "axios";

export const API_URL = process.env.NEXT_PUBLIC_API_URL;
const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

export const adminApi = {
  getProducts: () => api.get("/products"),
  getProductById: (id: string | string[]) => api.get(`/products/${id}`),
  createProduct: () => api.post("/products"),
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
  updateProduct: (id: string, data: any) => api.put(`/products/${id}`, data),
  uploadImage: (data: FormData) => api.post("/upload", data),
  getOrders: () => api.get("/orders"),
  getUsers: () => api.get("/users"),
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
