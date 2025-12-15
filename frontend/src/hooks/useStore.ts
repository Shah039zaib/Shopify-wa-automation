import { create } from 'zustand';
import { User, Conversation, Message } from '@/types';
import Cookies from 'js-cookie';
import { authApi } from '@/services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  checkAuth: () => Promise<void>;
}

interface ChatState {
  activeConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  setActiveConversation: (conversation: Conversation | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setLoading: (loading: boolean) => void;
}

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

// Auth Store
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: (accessToken, refreshToken) => {
    Cookies.set('accessToken', accessToken, { expires: 1 }); // 1 day
    Cookies.set('refreshToken', refreshToken, { expires: 7 }); // 7 days
    set({ isAuthenticated: true });
  },

  logout: () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user, isAuthenticated: true }),

  checkAuth: async () => {
    const token = Cookies.get('accessToken');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const response = await authApi.me();
      set({
        user: response.data.data,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

// Chat Store
export const useChatStore = create<ChatState>((set) => ({
  activeConversation: null,
  messages: [],
  isLoading: false,

  setActiveConversation: (conversation) => set({ activeConversation: conversation }),

  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  setLoading: (loading) => set({ isLoading: loading }),
}));

// UI Store
export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
