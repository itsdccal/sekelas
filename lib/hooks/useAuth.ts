'use client';

import { useAuthStore } from '@/stores';
import { useShallow } from 'zustand/shallow';
import type { User } from '@/lib/types';

export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook wrapping authStore for cleaner component access.
 * Uses shallow comparison to prevent unnecessary re-renders.
 *
 * Validates: Requirements 16.1
 */
export function useAuth(): UseAuthReturn {
  const { user, isAuthenticated, isLoading, error, login, logout } =
    useAuthStore(
      useShallow((state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
        error: state.error,
        login: state.login,
        logout: state.logout,
      }))
    );

  return {
    user,
    isAuthenticated,
    login,
    logout,
    isLoading,
    error,
  };
}
