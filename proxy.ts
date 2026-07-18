import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Cookie names used for authentication.
 * - auth_token: HttpOnly cookie set by the backend containing the JWT
 * - user_role: Non-HttpOnly cookie set alongside auth_token for middleware access
 *   (since HttpOnly cookie payload can't be decoded on Edge without the secret)
 */
const AUTH_COOKIE = 'auth_token';
const ROLE_COOKIE = 'user_role';

/**
 * Route protection proxy for the Sekelas LMS.
 *
 * Checks:
 * 1. Presence of auth cookie for protected routes (/student/*, /admin/*)
 * 2. Role-based access: STUDENT for /student/*, ADMIN for /admin/*
 * 3. Token expiry: redirects to /login on expired sessions
 *
 * Validates Requirements 1.5 and 1.8
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isStudentRoute = pathname.startsWith('/student');
  const isAdminRoute = pathname.startsWith('/admin');

  // Only enforce protection on student and admin routes
  if (!isStudentRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  // Check for authentication cookie
  const authToken = request.cookies.get(AUTH_COOKIE)?.value;

  if (!authToken) {
    // No auth token → redirect to login
    return redirectToLogin(request);
  }

  // Check for role cookie to validate role-based access
  const userRole = request.cookies.get(ROLE_COOKIE)?.value;

  if (!userRole) {
    // No role info available → redirect to login (session may be incomplete)
    return redirectToLogin(request);
  }

  // Check token expiry via an optional expires cookie or timestamp in role cookie
  // The role cookie format is: "ROLE" or "ROLE:expiresTimestamp"
  const { role, expiresAt } = parseRoleCookie(userRole);

  if (expiresAt && Date.now() > expiresAt) {
    // Token has expired → clear auth state and redirect to login
    return clearAuthAndRedirect(request);
  }

  // Validate role matches route prefix
  if (isStudentRoute && role !== 'STUDENT') {
    // Non-student trying to access student routes → redirect to login
    return redirectToLogin(request);
  }

  if (isAdminRoute && role !== 'ADMIN') {
    // Non-admin trying to access admin routes → redirect to login
    return redirectToLogin(request);
  }

  // All checks passed — allow the request
  return NextResponse.next();
}

/**
 * Parses the role cookie value.
 * Supports two formats:
 * - Simple: "STUDENT" or "ADMIN"
 * - With expiry: "STUDENT:1700000000000" (role:expiresTimestamp)
 */
function parseRoleCookie(value: string): { role: string; expiresAt: number | null } {
  const parts = value.split(':');
  const role = parts[0];
  const expiresAt = parts[1] ? parseInt(parts[1], 10) : null;

  return {
    role,
    expiresAt: expiresAt && !isNaN(expiresAt) ? expiresAt : null,
  };
}

/**
 * Creates a redirect response to /login.
 */
function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL('/login', request.url);
  return NextResponse.redirect(loginUrl);
}

/**
 * Clears auth cookies and redirects to /login.
 * Handles token expiry case (Requirement 1.8).
 */
function clearAuthAndRedirect(request: NextRequest): NextResponse {
  const loginUrl = new URL('/login', request.url);
  const response = NextResponse.redirect(loginUrl);

  // Clear both auth-related cookies
  response.cookies.delete(AUTH_COOKIE);
  response.cookies.delete(ROLE_COOKIE);

  return response;
}

/**
 * Matcher configuration: only run proxy on protected routes.
 * This avoids running on static assets, API routes, and public pages.
 */
export const config = {
  matcher: ['/student/:path*', '/admin/:path*'],
};
