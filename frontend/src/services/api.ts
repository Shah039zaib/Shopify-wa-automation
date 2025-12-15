import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get('refreshToken');
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data.data;
        Cookies.set('accessToken', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),

  logout: () => api.post('/auth/logout'),

  me: () => api.get('/auth/me'),
};

// Dashboard API
export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentActivity: () => api.get('/dashboard/recent'),
};

// Customers API
export const customersApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/customers', { params }),

  getById: (id: string) => api.get(`/customers/${id}`),

  update: (id: string, data: any) => api.put(`/customers/${id}`, data),

  block: (id: string) => api.post(`/customers/${id}/block`),

  unblock: (id: string) => api.post(`/customers/${id}/unblock`),
};

// Conversations API
export const conversationsApi = {
  getAll: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/conversations', { params }),

  getById: (id: string) => api.get(`/conversations/${id}`),

  getMessages: (id: string, params?: { limit?: number; offset?: number }) =>
    api.get(`/conversations/${id}/messages`, { params }),

  sendMessage: (id: string, message: string) =>
    api.post(`/conversations/${id}/messages`, { message }),

  close: (id: string) => api.post(`/conversations/${id}/close`),

  reopen: (id: string) => api.post(`/conversations/${id}/reopen`),
};

// Orders API
export const ordersApi = {
  getAll: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/orders', { params }),

  getById: (id: string) => api.get(`/orders/${id}`),

  updateStatus: (id: string, status: string) =>
    api.put(`/orders/${id}/status`, { status }),

  create: (data: any) => api.post('/orders', data),
};

// Packages API
export const packagesApi = {
  getAll: () => api.get('/packages'),

  getById: (id: string) => api.get(`/packages/${id}`),

  create: (data: any) => api.post('/packages', data),

  update: (id: string, data: any) => api.put(`/packages/${id}`, data),

  delete: (id: string) => api.delete(`/packages/${id}`),
};

// WhatsApp API
export const whatsappApi = {
  getAccounts: () => api.get('/whatsapp/accounts'),

  createAccount: (name: string) => api.post('/whatsapp/accounts', { name }),

  getQRCode: (accountId: string) => api.get(`/whatsapp/accounts/${accountId}/qr`),

  disconnect: (accountId: string) => api.post(`/whatsapp/accounts/${accountId}/disconnect`),

  getStatus: (accountId: string) => api.get(`/whatsapp/accounts/${accountId}/status`),
};

// AI API
export const aiApi = {
  getProviders: () => api.get('/ai/providers'),

  updateProvider: (id: string, data: any) => api.put(`/ai/providers/${id}`, data),

  getPrompts: () => api.get('/ai/prompts'),

  updatePrompt: (id: string, data: any) => api.put(`/ai/prompts/${id}`, data),

  testProvider: (provider: string) => api.post(`/ai/test/${provider}`),
};

// Analytics API
export const analyticsApi = {
  getSales: (params?: { start_date?: string; end_date?: string }) =>
    api.get('/analytics/sales', { params }),

  getConversations: (params?: { start_date?: string; end_date?: string }) =>
    api.get('/analytics/conversations', { params }),

  getCustomers: (params?: { start_date?: string; end_date?: string }) =>
    api.get('/analytics/customers', { params }),

  getAI: (params?: { start_date?: string; end_date?: string }) =>
    api.get('/analytics/ai', { params }),
};

// Settings API
export const settingsApi = {
  getAll: () => api.get('/settings'),

  update: (key: string, value: any) => api.put(`/settings/${key}`, { value }),

  getPaymentMethods: () => api.get('/payments/methods'),

  updatePaymentMethod: (id: string, data: any) => api.put(`/payments/methods/${id}`, data),
};

export default api;
