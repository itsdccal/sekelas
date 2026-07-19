import { NextRequest, NextResponse } from 'next/server';

/**
 * Admin single milestone endpoint (mock).
 * PUT - Update a milestone
 * DELETE - Delete a milestone
 */

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ milestoneId: string }> }
) {
  const { milestoneId } = await params;
  const body = await request.json();
  const { name, description, imageUrl, xpThreshold, isActive } = body;

  if (name && name.length > 50) {
    return NextResponse.json(
      { message: 'Nama milestone maksimal 50 karakter' },
      { status: 400 }
    );
  }

  if (description && description.length > 200) {
    return NextResponse.json(
      { message: 'Deskripsi milestone maksimal 200 karakter' },
      { status: 400 }
    );
  }

  if (xpThreshold !== undefined && (typeof xpThreshold !== 'number' || xpThreshold <= 0)) {
    return NextResponse.json(
      { message: 'XP Threshold harus angka positif' },
      { status: 400 }
    );
  }

  await new Promise((resolve) => setTimeout(resolve, 200));

  const updatedMilestone = {
    id: milestoneId,
    name: name ?? 'Milestone',
    description: description ?? '',
    imageUrl: imageUrl ?? '/badges/default.png',
    xpThreshold: xpThreshold ?? 1000,
    isActive: isActive ?? true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(updatedMilestone);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ milestoneId: string }> }
) {
  const { milestoneId } = await params;

  if (!milestoneId) {
    return NextResponse.json(
      { message: 'Milestone ID diperlukan' },
      { status: 400 }
    );
  }

  await new Promise((resolve) => setTimeout(resolve, 150));

  return NextResponse.json({ message: 'Milestone berhasil dihapus' });
}
