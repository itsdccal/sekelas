import apiClient from './client';
import { withRetry } from './retry';
import type { LoginRequest, LoginResponse, User } from '@/lib/types';

/**
 * Login with email and password.
 * Returns user data on success. The backend sets an HttpOnly cookie.
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/api/v1/auth/login', credentials);
  return response.data;
}

/**
 * Logout the current user.
 * Clears the HttpOnly cookie on the server.
 */
export async function logout(): Promise<void> {
  await apiClient.post('/api/v1/auth/logout');
}

/**
 * Check if the current session is valid.
 * Used on page load to restore auth state from cookie.
 * Retries on server/connection errors.
 */
export async function checkAuth(): Promise<User> {
  return withRetry(async () => {
    const response = await apiClient.get<User>('/api/v1/auth/me');
    return response.data;
  });
}
