import axios, { AxiosInstance, AxiosError } from 'axios';

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000, // 10 second timeout
  withCredentials: true, // Send HttpOnly cookies
});

// Response interceptor for 401 handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Lazy import to avoid circular dependency and initialization issues
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
    return Promise.reject(error);
  }
);

export default apiClient;
