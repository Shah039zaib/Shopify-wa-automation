// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  created_at: string;
}

// Customer types
export interface Customer {
  id: string;
  phone_number: string;
  name: string | null;
  email: string | null;
  language_preference: 'urdu' | 'roman_urdu' | 'english';
  status: 'active' | 'blocked';
  total_orders: number;
  total_spent: number;
  last_interaction: string | null;
  created_at: string;
}

// Conversation types
export interface Conversation {
  id: string;
  customer_id: string;
  whatsapp_account_id: string;
  status: 'active' | 'closed';
  messages_count: number;
  last_message_at: string | null;
  customer_name?: string;
  phone_number?: string;
  created_at: string;
}

// Message types
export interface Message {
  id: string;
  conversation_id: string;
  sender: 'customer' | 'bot' | 'admin';
  message_text: string;
  message_type: 'text' | 'image' | 'document' | 'audio' | 'video';
  media_url: string | null;
  ai_used: string | null;
  read_at: string | null;
  timestamp: string;
}

// Order types
export interface Order {
  id: string;
  customer_id: string;
  package_id: string;
  amount: number;
  status: 'pending' | 'payment_pending' | 'paid' | 'in_progress' | 'completed' | 'cancelled';
  payment_screenshot_url: string | null;
  store_details: Record<string, any>;
  customer_name?: string;
  customer_phone?: string;
  package_name?: string;
  created_at: string;
  paid_at: string | null;
  completed_at: string | null;
}

// Package types
export interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  is_active: boolean;
  display_order: number;
}

// WhatsApp Account types
export interface WhatsAppAccount {
  id: string;
  phone_number: string | null;
  name: string;
  status: 'disconnected' | 'qr_received' | 'connected' | 'ready';
  messages_sent_today: number;
  risk_level: 'low' | 'medium' | 'high';
  created_at: string;
}

// AI Provider types
export interface AIProvider {
  id: string;
  name: string;
  is_enabled: boolean;
  priority: number;
  model: string;
  api_key_configured: boolean;
}

// Dashboard stats types
export interface DashboardStats {
  total_customers: number;
  active_conversations: number;
  total_orders: number;
  total_revenue: number;
  orders_today: number;
  revenue_today: number;
  new_customers_today: number;
  messages_today: number;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
