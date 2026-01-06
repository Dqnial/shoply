import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
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

export default api;
