import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';

// Mock the API module
vi.mock('@/lib/api', () => ({
  authApi: {
    login: vi.fn(),
    logout: vi.fn(),
    checkAuth: vi.fn(),
  },
}));

import { authApi } from '@/lib/api';

const mockedAuthApi = authApi as {
  login: ReturnType<typeof vi.fn>;
  logout: ReturnType<typeof vi.fn>;
  checkAuth: ReturnType<typeof vi.fn>;
};

describe('authStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('has null user and is not authenticated', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('login', () => {
    const mockUser = {
      id: '1',
      email: 'student@sekelas.id',
      name: 'Budi Santoso',
      firstName: 'Budi',
      role: 'STUDENT' as const,
      kelas: '10A',
    };

    it('sets user and isAuthenticated on success', async () => {
      mockedAuthApi.login.mockResolvedValue({
        user: mockUser,
        expiresAt: '2025-01-01T00:00:00Z',
      });

      await useAuthStore.getState().login('student@sekelas.id', 'password123');

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('sets isLoading to true during login', async () => {
      let resolveLogin: (value: unknown) => void;
      mockedAuthApi.login.mockReturnValue(
        new Promise((resolve) => { resolveLogin = resolve; })
      );

      const loginPromise = useAuthStore.getState().login('a@b.com', 'pass');
      expect(useAuthStore.getState().isLoading).toBe(true);

      resolveLogin!({ user: mockUser, expiresAt: '2025-01-01T00:00:00Z' });
      await loginPromise;

      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('sets error message on failure', async () => {
      mockedAuthApi.login.mockRejectedValue(new Error('Unauthorized'));

      await useAuthStore.getState().login('bad@email.com', 'wrong');

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Email atau password salah');
    });

    it('clears previous error on new login attempt', async () => {
      // First: fail
      mockedAuthApi.login.mockRejectedValueOnce(new Error('fail'));
      await useAuthStore.getState().login('a@b.com', 'x');
      expect(useAuthStore.getState().error).toBe('Email atau password salah');

      // Second: succeed
      mockedAuthApi.login.mockResolvedValueOnce({
        user: mockUser,
        expiresAt: '2025-01-01T00:00:00Z',
      });
      await useAuthStore.getState().login('student@sekelas.id', 'password123');
      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  describe('logout', () => {
    it('clears user state', () => {
      mockedAuthApi.logout.mockResolvedValue(undefined);

      // Set authenticated state first
      useAuthStore.setState({
        user: { id: '1', email: 'a@b.com', name: 'A', firstName: 'A', role: 'STUDENT' },
        isAuthenticated: true,
      });

      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBeNull();
    });

    it('calls authApi.logout', () => {
      mockedAuthApi.logout.mockResolvedValue(undefined);
      useAuthStore.getState().logout();
      expect(mockedAuthApi.logout).toHaveBeenCalled();
    });

    it('clears state even if API call fails', () => {
      mockedAuthApi.logout.mockRejectedValue(new Error('network'));

      useAuthStore.setState({
        user: { id: '1', email: 'a@b.com', name: 'A', firstName: 'A', role: 'STUDENT' },
        isAuthenticated: true,
      });

      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('checkAuth', () => {
    const mockUser = {
      id: '1',
      email: 'admin@sekelas.id',
      name: 'Admin',
      firstName: 'Admin',
      role: 'ADMIN' as const,
    };

    it('sets user when cookie is valid', async () => {
      mockedAuthApi.checkAuth.mockResolvedValue(mockUser);

      await useAuthStore.getState().checkAuth();

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('clears state when cookie is invalid', async () => {
      mockedAuthApi.checkAuth.mockRejectedValue(new Error('401'));

      await useAuthStore.getState().checkAuth();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });

    it('sets isLoading during check', async () => {
      let resolveCheck: (value: unknown) => void;
      mockedAuthApi.checkAuth.mockReturnValue(
        new Promise((resolve) => { resolveCheck = resolve; })
      );

      const checkPromise = useAuthStore.getState().checkAuth();
      expect(useAuthStore.getState().isLoading).toBe(true);

      resolveCheck!(mockUser);
      await checkPromise;

      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('clearError', () => {
    it('clears the error state', () => {
      useAuthStore.setState({ error: 'Email atau password salah' });

      useAuthStore.getState().clearError();

      expect(useAuthStore.getState().error).toBeNull();
    });
  });
});
