import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock admin user management endpoint for individual user.
 * PUT — update user
 * DELETE — delete user
 */

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const body = await request.json();
  const { name, email, role, kelas, isActive } = body;

  if (name !== undefined && name.length < 2) {
    return NextResponse.json({ message: 'Nama minimal 2 karakter' }, { status: 400 });
  }
  if (email !== undefined && !email.includes('@')) {
    return NextResponse.json({ message: 'Email tidak valid' }, { status: 400 });
  }
  if (role !== undefined && !['STUDENT', 'ADMIN'].includes(role)) {
    return NextResponse.json({ message: 'Role harus STUDENT atau ADMIN' }, { status: 400 });
  }

  await new Promise((resolve) => setTimeout(resolve, 200));

  const updatedUser = {
    id: userId,
    name: name ?? 'Pengguna',
    email: email ?? `${userId}@sekelas.id`,
    role: role ?? 'STUDENT',
    kelas: role === 'STUDENT' ? (kelas ?? '10A') : undefined,
    isActive: isActive ?? true,
    createdAt: '2024-01-05T08:00:00Z',
  };

  return NextResponse.json(updatedUser);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  await new Promise((resolve) => setTimeout(resolve, 200));

  return NextResponse.json({
    success: true,
    message: `Pengguna ${userId} berhasil dihapus`,
  });
}
