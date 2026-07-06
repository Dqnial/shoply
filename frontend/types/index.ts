export interface Product {
  _id: string;
  name: string;
  image: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  countInStock: number;
  rating: number;
  numReviews: number;
}

export interface CartItem extends Product {
  qty: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  balance: number;
  phone?: string;
  country?: string;
  city?: string;
  street?: string;
  house?: string;
  image?: string;
}

export interface AuthFormData {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export interface OrderItem {
  _id?: string;
  name: string;
  qty: number;
  image: string;
  price: number;
  product: string;
}

export interface ShippingAddress {
  address: string;
  city: string;
  postalCode?: string;
  country?: string;
}

export type PaymentMethod = "Balance" | "Card";

export type OrderStatus =
  | "В обработке"
  | "Оплачен"
  | "Доставляется"
  | "Завершен"
  | "Отменен";

export interface PopulatedOrderUser {
  _id: string;
  name: string;
  email?: string;
}

export interface Order {
  _id: string;
  user: string;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

/** An `Order` whose `user` field was populated by the API (`getOrderById`, `getOrders`, `getOrderSummary`). */
export interface PopulatedOrder extends Omit<Order, "user"> {
  user: PopulatedOrderUser;
}

export interface OrderSummary {
  numOrders: number;
  numUsers: number;
  numProducts: number;
  totalSales: number;
  salesData: { _id: string; sales: number }[];
  categoryData: { _id: string; count: number }[];
  statusData: { _id: string; count: number }[];
  usersData: { _id: string; count: number }[];
  topProducts: {
    _id: string;
    name: string;
    image: string;
    salesCount: number;
  }[];
  latestOrders: PopulatedOrder[];
}
