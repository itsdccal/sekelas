import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock admin kelas detail endpoint (PUT, DELETE).
 * Uses the same in-memory store as the parent route.
 * Note: In real app this would share a database — for mock we re-import the pattern.
 */

// Mirror of parent route store (in real app: shared DB)
const kelasData = [
  { id: 'kelas-1', name: '10A', studentCount: 8, createdAt: '2024-01-01T00:00:00Z' },
  { id: 'kelas-2', name: '10B', studentCount: 7, createdAt: '2024-01-01T00:00:00Z' },
  { id: 'kelas-3', name: '10C', studentCount: 6, createdAt: '2024-01-01T00:00:00Z' },
  { id: 'kelas-4', name: '11 IPA', studentCount: 4, createdAt: '2024-01-15T00:00:00Z' },
];

// PUT — update kelas name
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ kelasId: string }> }
) {
  const { kelasId } = await params;
  const body = await request.json();
  const name = body.name?.trim();

  if (!name || name.length < 1) {
    return NextResponse.json({ message: 'Nama kelas wajib diisi' }, { status: 400 });
  }

  if (name.length > 50) {
    return NextResponse.json({ message: 'Nama kelas maksimal 50 karakter' }, { status: 400 });
  }

  const index = kelasData.findIndex((k) => k.id === kelasId);
  if (index === -1) {
    return NextResponse.json({ message: 'Kelas tidak ditemukan' }, { status: 404 });
  }

  // Check duplicate (exclude self)
  const duplicate = kelasData.find(
    (k) => k.name.toLowerCase() === name.toLowerCase() && k.id !== kelasId
  );
  if (duplicate) {
    return NextResponse.json({ message: 'Nama kelas sudah ada' }, { status: 409 });
  }

  kelasData[index] = { ...kelasData[index], name };
  return NextResponse.json(kelasData[index]);
}

// DELETE — remove kelas
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ kelasId: string }> }
) {
  const { kelasId } = await params;

  const index = kelasData.findIndex((k) => k.id === kelasId);
  if (index === -1) {
    return NextResponse.json({ message: 'Kelas tidak ditemukan' }, { status: 404 });
  }

  if (kelasData[index].studentCount > 0) {
    return NextResponse.json(
      { message: `Tidak dapat menghapus kelas "${kelasData[index].name}" karena masih memiliki ${kelasData[index].studentCount} siswa` },
      { status: 400 }
    );
  }

  kelasData.splice(index, 1);
  return NextResponse.json({ success: true, message: 'Kelas berhasil dihapus' });
}
