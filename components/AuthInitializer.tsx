'use client';

import { useEffect } from 'react';
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
  const selectedSemesterId = useUIStore((state) => state.selectedSemesterId);
  const setSelectedSemester = useUIStore((state) => state.setSelectedSemester);
  const setAvailableSemesters = useUIStore((state) => state.setAvailableSemesters);

  useEffect(() => {
    checkAuth();

    // Set default semester for development
    if (!selectedSemesterId) {
      setAvailableSemesters([
        { id: 'sem-1', name: 'Semester 1 (2024/2025)' },
        { id: 'sem-2', name: 'Semester 2 (2024/2025)' },
      ]);
      setSelectedSemester('sem-1');
    }
  }, [checkAuth, selectedSemesterId, setSelectedSemester, setAvailableSemesters]);

  return null;
}
