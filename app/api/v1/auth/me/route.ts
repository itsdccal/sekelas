import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock auth check endpoint for development.
 * Returns user data if auth_token cookie is present.
 */
export async function GET(request: NextRequest) {
  const authToken = request.cookies.get('auth_token')?.value;
  const userRole = request.cookies.get('user_role')?.value;

  if (!authToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const isAdmin = userRole === 'ADMIN';

  const user = isAdmin
    ? {
        id: 'admin-001',
        email: 'admin@sekelas.id',
        name: 'Admin Sekelas',
        firstName: 'Admin',
        role: 'ADMIN' as const,
      }
    : {
        id: 'student-001',
        email: 'student@sekelas.id',
        name: 'Budi Santoso',
        firstName: 'Budi',
        role: 'STUDENT' as const,
        kelas: '10A',
      };

  return NextResponse.json(user);
}
