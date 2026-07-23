import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock admin bab creation endpoint for development.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, description, subjectId, orderIndex } = body;

  if (!name || !subjectId) {
    return NextResponse.json(
      { message: 'Missing required fields: name, subjectId' },
      { status: 400 }
    );
  }

  // Simulate creation delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  const newBab = {
    id: `bab-${Date.now()}`,
    name,
    description: description || '',
    subjectId,
    orderIndex: orderIndex || 1,
    chapterCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(newBab, { status: 201 });
}

