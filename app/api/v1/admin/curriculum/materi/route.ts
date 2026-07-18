import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock admin materi creation endpoint for development.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, description, semesterId, orderIndex } = body;

  if (!name || !semesterId) {
    return NextResponse.json(
      { message: 'Missing required fields: name, semesterId' },
      { status: 400 }
    );
  }

  // Simulate creation delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  const newMateri = {
    id: `materi-${Date.now()}`,
    name,
    description: description || '',
    semesterId,
    orderIndex: orderIndex || 1,
    babCount: 0,
    isPublished: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(newMateri, { status: 201 });
}
