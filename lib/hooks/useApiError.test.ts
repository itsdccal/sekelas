import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useApiError } from './useApiError';
import { ForbiddenError } from '@/lib/api/client';

describe('useApiError', () => {
  it('starts with no error', () => {
    const { result } = renderHook(() => useApiError());
    expect(result.current.error).toBeNull();
    expect(result.current.isForbidden).toBe(false);
  });

  it('handles ForbiddenError by setting isForbidden to true', () => {
    const { result } = renderHook(() => useApiError());

    act(() => {
      result.current.handleError(new ForbiddenError());
    });

    expect(result.current.error).toBe('Anda tidak memiliki akses ke resource ini.');
    expect(result.current.isForbidden).toBe(true);
  });

  it('handles ForbiddenError with custom message', () => {
    const { result } = renderHook(() => useApiError());

    act(() => {
      result.current.handleError(new ForbiddenError('Akses ditolak'));
    });

    expect(result.current.error).toBe('Akses ditolak');
    expect(result.current.isForbidden).toBe(true);
  });

  it('handles generic errors with isForbidden=false', () => {
    const { result } = renderHook(() => useApiError());

    act(() => {
      result.current.handleError(new Error('Something went wrong'));
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.isForbidden).toBe(false);
  });

  it('clearError resets error and isForbidden', () => {
    const { result } = renderHook(() => useApiError());

    act(() => {
      result.current.handleError(new ForbiddenError());
    });

    expect(result.current.isForbidden).toBe(true);

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.isForbidden).toBe(false);
  });
});
