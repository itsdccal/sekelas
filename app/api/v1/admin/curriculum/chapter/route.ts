import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock admin chapter creation endpoint for development.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, description, babId, orderIndex, videoUrl, passingGrade } = body;

  if (!title || !babId) {
    return NextResponse.json(
      { message: 'Missing required fields: title, babId' },
      { status: 400 }
    );
  }

  // Simulate creation delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  const newChapter = {
    id: `ch-${Date.now()}`,
    title,
    description: description || '',
    babId,
    orderIndex: orderIndex || 1,
    videoUrl: videoUrl || '',
    videoDurationMinutes: 0,
    passingGrade: passingGrade || 70,
    isPublished: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(newChapter, { status: 201 });
}
