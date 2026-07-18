import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock admin quiz pattern creation endpoint for development.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, description, chapterId } = body;

  if (!name || !chapterId) {
    return NextResponse.json(
      { message: 'Missing required fields: name, chapterId' },
      { status: 400 }
    );
  }

  // Simulate creation delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  const newPattern = {
    id: `pattern-${Date.now()}`,
    name,
    description: description || '',
    chapterId,
    questionCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(newPattern, { status: 201 });
}
