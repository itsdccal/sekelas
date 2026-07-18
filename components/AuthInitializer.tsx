'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore, useUIStore } from '@/stores';

/**
 * AuthInitializer restores authentication state from the HttpOnly cookie
 * on page reload or new tab. Also sets a default semester if none selected.
 * Placed in the root layout so it runs once on app mount regardless of route.
 *
 * Validates: Requirement 16.7
 */
export function AuthInitializer() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const pathname = usePathname();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Don't check auth on login page — there's no cookie yet
    if (pathname !== '/login') {
      checkAuth();
    }

    // Set default semester for development
    const { selectedSemesterId, setSelectedSemester, setAvailableSemesters } = useUIStore.getState();
    if (!selectedSemesterId) {
      setAvailableSemesters([
        { id: 'sem-1', name: 'Semester 1 (2024/2025)' },
        { id: 'sem-2', name: 'Semester 2 (2024/2025)' },
      ]);
      setSelectedSemester('sem-1');
    }
  }, [checkAuth, pathname]);

  return null;
}
