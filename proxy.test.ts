import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from './proxy';

/**
 * Helper to create a NextRequest with optional cookies.
 */
function createRequest(
  path: string,
  cookies: Record<string, string> = {}
): NextRequest {
  const url = new URL(path, 'http://localhost:3000');
  const request = new NextRequest(url);

  for (const [name, value] of Object.entries(cookies)) {
    request.cookies.set(name, value);
  }

  return request;
}

/**
 * Helper to check if a response is a redirect to /login.
 */
function isRedirectToLogin(response: ReturnType<typeof proxy>): boolean {
  if (!response) return false;
  const location = response.headers.get('location');
  return (
    response.status === 307 &&
    location !== null &&
    location.includes('/login')
  );
}

describe('proxy - route protection', () => {
  describe('unauthenticated access', () => {
    it('should redirect to /login when accessing /student/* without cookies', () => {
      const request = createRequest('/student/dashboard');
      const response = proxy(request);
      expect(isRedirectToLogin(response)).toBe(true);
    });

    it('should redirect to /login when accessing /admin/* without cookies', () => {
      const request = createRequest('/admin/dashboard');
      const response = proxy(request);
      expect(isRedirectToLogin(response)).toBe(true);
    });

    it('should redirect to /login when only auth_token is present without role', () => {
      const request = createRequest('/student/dashboard', {
        auth_token: 'some-jwt-token',
      });
      const response = proxy(request);
      expect(isRedirectToLogin(response)).toBe(true);
    });
  });

  describe('role-based access control', () => {
    it('should allow STUDENT to access /student/* routes', () => {
      const request = createRequest('/student/dashboard', {
        auth_token: 'valid-token',
        user_role: 'STUDENT',
      });
      const response = proxy(request);
      // NextResponse.next() returns a 200 with x-middleware-next header
      expect(response.status).toBe(200);
      expect(response.headers.get('x-middleware-next')).toBe('1');
    });

    it('should allow ADMIN to access /admin/* routes', () => {
      const request = createRequest('/admin/dashboard', {
        auth_token: 'valid-token',
        user_role: 'ADMIN',
      });
      const response = proxy(request);
      expect(response.status).toBe(200);
      expect(response.headers.get('x-middleware-next')).toBe('1');
    });

    it('should redirect STUDENT trying to access /admin/* routes', () => {
      const request = createRequest('/admin/dashboard', {
        auth_token: 'valid-token',
        user_role: 'STUDENT',
      });
      const response = proxy(request);
      expect(isRedirectToLogin(response)).toBe(true);
    });

    it('should redirect ADMIN trying to access /student/* routes', () => {
      const request = createRequest('/student/dashboard', {
        auth_token: 'valid-token',
        user_role: 'ADMIN',
      });
      const response = proxy(request);
      expect(isRedirectToLogin(response)).toBe(true);
    });
  });

  describe('token expiry handling', () => {
    it('should redirect and clear cookies when token is expired', () => {
      const expiredTimestamp = Date.now() - 60000; // 1 minute ago
      const request = createRequest('/student/dashboard', {
        auth_token: 'expired-token',
        user_role: `STUDENT:${expiredTimestamp}`,
      });
      const response = proxy(request);
      expect(isRedirectToLogin(response)).toBe(true);

      // Check that auth cookies are cleared via Set-Cookie headers
      const setCookies = response.headers.getSetCookie();
      // NextResponse.cookies.delete() sets the cookie with an empty value and past expiry
      const hasAuthClear = setCookies.some(
        (c) => c.includes('auth_token')
      );
      const hasRoleClear = setCookies.some(
        (c) => c.includes('user_role')
      );
      expect(hasAuthClear).toBe(true);
      expect(hasRoleClear).toBe(true);
    });

    it('should allow access when token is not yet expired', () => {
      const futureTimestamp = Date.now() + 3600000; // 1 hour from now
      const request = createRequest('/student/dashboard', {
        auth_token: 'valid-token',
        user_role: `STUDENT:${futureTimestamp}`,
      });
      const response = proxy(request);
      expect(response.status).toBe(200);
      expect(response.headers.get('x-middleware-next')).toBe('1');
    });

    it('should allow access when no expiry timestamp in role cookie', () => {
      const request = createRequest('/admin/kurikulum', {
        auth_token: 'valid-token',
        user_role: 'ADMIN',
      });
      const response = proxy(request);
      expect(response.status).toBe(200);
      expect(response.headers.get('x-middleware-next')).toBe('1');
    });
  });

  describe('non-protected routes', () => {
    it('should allow access to /login without any cookies', () => {
      const request = createRequest('/login');
      const response = proxy(request);
      expect(response.status).toBe(200);
      expect(response.headers.get('x-middleware-next')).toBe('1');
    });

    it('should allow access to root / without any cookies', () => {
      const request = createRequest('/');
      const response = proxy(request);
      expect(response.status).toBe(200);
      expect(response.headers.get('x-middleware-next')).toBe('1');
    });
  });

  describe('nested route protection', () => {
    it('should protect deeply nested student routes', () => {
      const request = createRequest('/student/kurikulum/materi-1/bab-1');
      const response = proxy(request);
      expect(isRedirectToLogin(response)).toBe(true);
    });

    it('should protect deeply nested admin routes', () => {
      const request = createRequest('/admin/quiz-builder/chapter-123');
      const response = proxy(request);
      expect(isRedirectToLogin(response)).toBe(true);
    });

    it('should allow authenticated student access to nested routes', () => {
      const request = createRequest('/student/chapter/abc/video', {
        auth_token: 'valid-token',
        user_role: 'STUDENT',
      });
      const response = proxy(request);
      expect(response.status).toBe(200);
      expect(response.headers.get('x-middleware-next')).toBe('1');
    });
  });
});
