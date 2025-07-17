import axios from 'axios';
import { ApiResponse, LoginRequest, RegisterRequest, LoginResponse } from '../types';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('business');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (credentials: LoginRequest) => 
    api.post<ApiResponse<LoginResponse>>('/auth/login', credentials),
  
  register: (data: RegisterRequest) => 
    api.post<ApiResponse<any>>('/auth/register', data),
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('business');
  }
};

// Plans API
export const plansApi = {
  getAll: () => api.get<ApiResponse<any>>('/plans'),
};

// Dashboard API
export const dashboardApi = {
  getMetrics: () => api.get<ApiResponse<any>>('/dashboard'),
};

// Products API
export const productsApi = {
  getAll: () => api.get<ApiResponse<any>>('/products'),
  create: (data: any) => api.post<ApiResponse<any>>('/products', data),
  update: (id: string, data: any) => api.put<ApiResponse<any>>(`/products/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<any>>(`/products/${id}`),
};

// Customers API
export const customersApi = {
  getAll: () => api.get<ApiResponse<any>>('/customers'),
  create: (data: any) => api.post<ApiResponse<any>>('/customers', data),
  update: (id: string, data: any) => api.put<ApiResponse<any>>(`/customers/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<any>>(`/customers/${id}`),
};

// Orders API
export const ordersApi = {
  getAll: () => api.get<ApiResponse<any>>('/orders'),
  create: (data: any) => api.post<ApiResponse<any>>('/orders', data),
  update: (id: string, data: any) => api.put<ApiResponse<any>>(`/orders/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<any>>(`/orders/${id}`),
};

// Subscriptions API
export const subscriptionsApi = {
  getAll: () => api.get<ApiResponse<any>>('/subscriptions'),
  create: (data: any) => api.post<ApiResponse<any>>('/subscriptions', data),
  update: (id: string, data: any) => api.put<ApiResponse<any>>(`/subscriptions/${id}`, data),
};

export default api;