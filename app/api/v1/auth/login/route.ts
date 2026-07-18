import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock login endpoint for development.
 *
 * Akun yang tersedia:
 * - Siswa:  student@sekelas.id / password123
 * - Admin:  admin@sekelas.id / password123
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password } = body;

  // Validasi input dasar
  if (!email || !password) {
    return NextResponse.json(
      { message: 'Email atau password salah' },
      { status: 401 }
    );
  }

  // Hanya terima akun yang valid
  const validAccounts: Record<string, { password: string; role: 'STUDENT' | 'ADMIN' }> = {
    'admin': { password: '123', role: 'ADMIN' },
    'siswa': { password: '123', role: 'STUDENT' },
  };

  const account = validAccounts[email.toLowerCase()];

  if (!account || account.password !== password) {
    return NextResponse.json(
      { message: 'Email atau password salah' },
      { status: 401 }
    );
  }

  const user = account.role === 'ADMIN'
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

  // Set cookies untuk middleware auth check
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
