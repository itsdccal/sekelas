import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock admin kelas (class) CRUD endpoint.
 * In-memory store for development — resets on server restart.
 */

// Simulated in-memory store
const kelasData = [
  { id: 'kelas-1', name: '10A', studentCount: 8, createdAt: '2024-01-01T00:00:00Z' },
  { id: 'kelas-2', name: '10B', studentCount: 7, createdAt: '2024-01-01T00:00:00Z' },
  { id: 'kelas-3', name: '10C', studentCount: 6, createdAt: '2024-01-01T00:00:00Z' },
  { id: 'kelas-4', name: '11 IPA', studentCount: 4, createdAt: '2024-01-15T00:00:00Z' },
];

let nextId = 5;

// GET — list all kelas
export async function GET() {
  return NextResponse.json(kelasData);
}

// POST — create new kelas
export async function POST(request: NextRequest) {
  const body = await request.json();
  const name = body.name?.trim();

  if (!name || name.length < 1) {
    return NextResponse.json({ message: 'Nama kelas wajib diisi' }, { status: 400 });
  }

  if (name.length > 50) {
    return NextResponse.json({ message: 'Nama kelas maksimal 50 karakter' }, { status: 400 });
  }

  // Check duplicate
  const exists = kelasData.find((k) => k.name.toLowerCase() === name.toLowerCase());
  if (exists) {
    return NextResponse.json({ message: 'Nama kelas sudah ada' }, { status: 409 });
  }

  const newKelas = {
    id: `kelas-${nextId++}`,
    name,
    studentCount: 0,
    createdAt: new Date().toISOString(),
  };

  kelasData.push(newKelas);
  return NextResponse.json(newKelas, { status: 201 });
}
