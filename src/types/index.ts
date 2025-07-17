export interface Business {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Plan {
  _id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  photoLimit: number;
  productsLimit: number;
  customersLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessSubscription {
  _id: string;
  business: string | Business;
  plan: string | Plan;
  status: 'active' | 'inactive' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  _id: string;
  business: string | Business;
  name: string;
  description: string;
  price: number;
  category: string;
  photos: Photo[];
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  _id: string;
  business: string | Business;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  _id: string;
  business: string | Business;
  customer: string | Customer;
  products: {
    product: string | Product;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Photo {
  _id: string;
  business: string | Business;
  product?: string | Product;
  filename: string;
  url: string;
  size: number;
  mimetype: string;
  uploadDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardMetrics {
  totalProducts: number;
  totalCustomers: number;
  totalOrders: number;
  activeSubscriptions: number;
  photosUsed: number;
  photosLimit: number;
  recentOrders: Order[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  businessName: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  business: Business;
}