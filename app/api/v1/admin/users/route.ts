import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock admin user management endpoint.
 * GET — list users (paginated, searchable, filterable by role)
 * POST — create new user
 */

const allUsers = [
  { id: 'user-001', name: 'Budi Santoso', email: 'budi@sekelas.id', role: 'STUDENT', kelas: '10A', isActive: true, createdAt: '2024-01-05T08:00:00Z' },
  { id: 'user-002', name: 'Sari Dewi', email: 'sari@sekelas.id', role: 'STUDENT', kelas: '10A', isActive: true, createdAt: '2024-01-05T08:00:00Z' },
  { id: 'user-003', name: 'Ahmad Rizki', email: 'ahmad@sekelas.id', role: 'STUDENT', kelas: '10A', isActive: true, createdAt: '2024-01-06T08:00:00Z' },
  { id: 'user-004', name: 'Putri Anggraini', email: 'putri@sekelas.id', role: 'STUDENT', kelas: '10B', isActive: true, createdAt: '2024-01-03T08:00:00Z' },
  { id: 'user-005', name: 'Dimas Pratama', email: 'dimas@sekelas.id', role: 'STUDENT', kelas: '10B', isActive: false, createdAt: '2024-01-04T08:00:00Z' },
  { id: 'user-006', name: 'Rina Wulandari', email: 'rina@sekelas.id', role: 'STUDENT', kelas: '10B', isActive: true, createdAt: '2024-01-05T08:00:00Z' },
  { id: 'user-007', name: 'Fajar Hidayat', email: 'fajar@sekelas.id', role: 'STUDENT', kelas: '10C', isActive: true, createdAt: '2024-01-06T08:00:00Z' },
  { id: 'user-008', name: 'Lina Maharani', email: 'lina@sekelas.id', role: 'STUDENT', kelas: '10C', isActive: true, createdAt: '2024-01-07T08:00:00Z' },
  { id: 'user-009', name: 'Rendi Kurniawan', email: 'rendi@sekelas.id', role: 'STUDENT', kelas: '10A', isActive: true, createdAt: '2024-01-08T08:00:00Z' },
  { id: 'user-010', name: 'Anisa Fitriani', email: 'anisa@sekelas.id', role: 'STUDENT', kelas: '10C', isActive: true, createdAt: '2024-01-09T08:00:00Z' },
  { id: 'admin-001', name: 'Admin Sekelas', email: 'admin@sekelas.id', role: 'ADMIN', isActive: true, createdAt: '2024-01-01T08:00:00Z' },
  { id: 'admin-002', name: 'Pak Dwi Susanto', email: 'dwi.guru@sekelas.id', role: 'ADMIN', isActive: true, createdAt: '2024-01-02T08:00:00Z' },
  { id: 'admin-003', name: 'Bu Ratna Sari', email: 'ratna.guru@sekelas.id', role: 'ADMIN', isActive: true, createdAt: '2024-01-02T08:00:00Z' },
  { id: 'admin-004', name: 'Pak Hendra', email: 'hendra.guru@sekelas.id', role: 'ADMIN', isActive: false, createdAt: '2024-01-03T08:00:00Z' },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase() || '';
  const role = searchParams.get('role') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

  let filtered = [...allUsers];

  if (search) {
    filtered = filtered.filter(
      (u) => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search)
    );
  }

  if (role) {
    filtered = filtered.filter((u) => u.role === role);
  }

  const total = filtered.length;
  const startIndex = (page - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);

  return NextResponse.json({
    data: paginated,
    total,
    page,
    pageSize,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, password, role, kelas } = body;

  // Validation
  if (!name || name.length < 2) {
    return NextResponse.json({ message: 'Nama wajib diisi (minimal 2 karakter)' }, { status: 400 });
  }
  if (!email || !email.includes('@')) {
    return NextResponse.json({ message: 'Email tidak valid' }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ message: 'Password minimal 8 karakter' }, { status: 400 });
  }
  if (!role || !['STUDENT', 'ADMIN'].includes(role)) {
    return NextResponse.json({ message: 'Role harus STUDENT atau ADMIN' }, { status: 400 });
  }
  if (role === 'STUDENT' && !kelas) {
    return NextResponse.json({ message: 'Kelas wajib diisi untuk siswa' }, { status: 400 });
  }

  // Check duplicate email
  if (allUsers.some((u) => u.email === email)) {
    return NextResponse.json({ message: 'Email sudah terdaftar' }, { status: 409 });
  }

  await new Promise((resolve) => setTimeout(resolve, 200));

  const newUser = {
    id: `user-${Date.now()}`,
    name,
    email,
    role,
    kelas: role === 'STUDENT' ? kelas : undefined,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json(newUser, { status: 201 });
}
