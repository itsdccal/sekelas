import { NextRequest, NextResponse } from 'next/server';

/**
 * Admin milestone management endpoint (mock).
 * GET - List all milestones (sorted by xpThreshold)
 * POST - Create a new milestone
 */

const mockMilestones = [
  {
    id: 'm1',
    name: 'Pemula',
    description: 'Langkah awal perjalanan belajarmu. Kumpulkan 500 XP!',
    imageUrl: '/badges/studious-517982.png',
    xpThreshold: 500,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'm2',
    name: 'Penjelajah',
    description: 'Kamu mulai menguasai materi. Terus semangat!',
    imageUrl: '/badges/quickie-6ac5d7.png',
    xpThreshold: 1000,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'm3',
    name: 'Ambisius',
    description: 'Pencapaian luar biasa! Kamu sudah menyelesaikan banyak materi.',
    imageUrl: '/badges/ambitious-17cb0d.png',
    xpThreshold: 2500,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'm4',
    name: 'Ahli',
    description: 'Kamu sudah menjadi ahli di bidangmu!',
    imageUrl: '/badges/perfectionist-47e1e6.png',
    xpThreshold: 5000,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'm5',
    name: 'Legenda',
    description: 'Pencapaian tertinggi. Kamu adalah inspirasi!',
    imageUrl: '/badges/ambitious-17cb0d.png',
    xpThreshold: 10000,
    isActive: false,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
  },
];

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 150));

  // Return sorted by xpThreshold ascending
  const sorted = [...mockMilestones].sort((a, b) => a.xpThreshold - b.xpThreshold);
  return NextResponse.json(sorted);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, description, imageUrl, xpThreshold, isActive } = body;

  // Validation
  if (!name || !description || !imageUrl || xpThreshold === undefined) {
    return NextResponse.json(
      { message: 'Field wajib: name, description, imageUrl, xpThreshold' },
      { status: 400 }
    );
  }

  if (name.length > 50) {
    return NextResponse.json(
      { message: 'Nama milestone maksimal 50 karakter' },
      { status: 400 }
    );
  }

  if (description.length > 200) {
    return NextResponse.json(
      { message: 'Deskripsi milestone maksimal 200 karakter' },
      { status: 400 }
    );
  }

  if (typeof xpThreshold !== 'number' || xpThreshold <= 0) {
    return NextResponse.json(
      { message: 'XP Threshold harus angka positif' },
      { status: 400 }
    );
  }

  await new Promise((resolve) => setTimeout(resolve, 200));

  const newMilestone = {
    id: `milestone-${Date.now()}`,
    name,
    description,
    imageUrl,
    xpThreshold: Number(xpThreshold),
    isActive: isActive ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(newMilestone, { status: 201 });
}
