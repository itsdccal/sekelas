import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock login endpoint for development.
 * Accepts any email/password and returns a user based on email pattern.
 *
 * Test accounts:
 * - Student: student@sekelas.id / password123
 * - Admin:   admin@sekelas.id / password123
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password } = body;

  // Simple validation
  if (!email || !password || password.length < 8) {
    return NextResponse.json(
      { message: 'Email atau password salah' },
      { status: 401 }
    );
  }

  // Determine role based on email
  const isAdmin = email.toLowerCase().includes('admin');

  const user = isAdmin
    ? {
        id: 'admin-001',
        email: email,
        name: 'Admin Sekelas',
        firstName: 'Admin',
        role: 'ADMIN' as const,
      }
    : {
        id: 'student-001',
        email: email,
        name: 'Budi Santoso',
        firstName: 'Budi',
        role: 'STUDENT' as const,
        kelas: '10A',
      };

  const response = NextResponse.json({
    user,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });

  // Set cookies for middleware auth check
  response.cookies.set('auth_token', 'mock-jwt-token-' + user.id, {
    httpOnly: true,
    path: '/',
    maxAge: 86400,
  });
  response.cookies.set('user_role', user.role, {
    path: '/',
    maxAge: 86400,
  });

  return response;
}
