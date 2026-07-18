'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores';

/**
 * AuthInitializer restores authentication state from the HttpOnly cookie
 * on page reload or new tab. Placed in the root layout so it runs once
 * on app mount regardless of route.
 *
 * Validates: Requirement 16.7
 */
export function AuthInitializer() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return null;
}
