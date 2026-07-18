import axios, { AxiosInstance, AxiosError } from 'axios';

/**
 * Custom error class for 403 Forbidden responses.
 * Components can check `error instanceof ForbiddenError` to display
 * inline "access denied" messages without redirecting.
 *
 * Validates: Requirement 16.3
 */
export class ForbiddenError extends Error {
  constructor(message = 'Anda tidak memiliki akses ke resource ini.') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000, // 10 second timeout
  withCredentials: true, // Send HttpOnly cookies
});

// Response interceptor for 401 and 403 handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Don't redirect if already on login page (prevents infinite loop)
      if (typeof window !== 'undefined' && window.location.pathname === '/login') {
        return Promise.reject(error);
      }

      // Don't redirect for /auth/me calls (session check on page load)
      const requestUrl = error.config?.url || '';
      if (requestUrl.includes('/auth/me')) {
        return Promise.reject(error);
      }

      // Clear auth state and redirect to login (Requirement 16.2)
      try {
        const { useAuthStore } = await import('@/stores/authStore');
        useAuthStore.getState().logout();
      } catch {
        // Auth store not available yet
      }

      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    if (error.response?.status === 403) {
      // Return a ForbiddenError so components can show inline messages
      // without losing navigation (Requirement 16.3)
      return Promise.reject(new ForbiddenError());
    }

    return Promise.reject(error);
  }
);

export default apiClient;
