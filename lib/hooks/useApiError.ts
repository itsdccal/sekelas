'use client';

import { useState, useCallback } from 'react';
import { ForbiddenError } from '@/lib/api/client';
import { getErrorMessage } from '@/lib/api/retry';

export interface UseApiErrorReturn {
  /** Human-readable error message, or null if no error */
  error: string | null;
  /** Whether the error is a 403 Forbidden (inline display, no redirect) */
  isForbidden: boolean;
  /** Set error from a caught exception */
  handleError: (err: unknown) => void;
  /** Clear the current error */
  clearError: () => void;
}

/**
 * Hook for consistent API error handling across components.
 * - 403 errors are flagged as `isForbidden` so components show inline messages
 * - Other errors use the standard error classifier for user-facing messages
 * - 401 errors are handled globally by the interceptor (redirect to /login)
 *
 * Validates: Requirements 16.3, 16.6
 */
export function useApiError(): UseApiErrorReturn {
  const [error, setError] = useState<string | null>(null);
  const [isForbidden, setIsForbidden] = useState(false);

  const handleError = useCallback((err: unknown) => {
    if (err instanceof ForbiddenError) {
      setError(err.message);
      setIsForbidden(true);
    } else {
      setError(getErrorMessage(err));
      setIsForbidden(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setIsForbidden(false);
  }, []);

  return { error, isForbidden, handleError, clearError };
}
