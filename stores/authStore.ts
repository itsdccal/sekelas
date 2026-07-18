import { create } from 'zustand';
import { authApi } from '@/lib/api';
import type { User } from '@/lib/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login({ email, password });
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Email atau password salah',
      });
    }
  },

  logout: () => {
    authApi.logout().catch(() => {
      // Fire-and-forget: cookie cleanup is best-effort
    });
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    // Redirect ke login tanpa perlu refresh manual
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const user = await authApi.checkAuth();
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
