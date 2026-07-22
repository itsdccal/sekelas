import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock admin quiz pattern creation endpoint for development.
 * Accepts both chapterId (for chapter quiz) and sectionId-as-chapterId (for pre/post test).
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { patternCode, description, chapterId, name } = body;

  // Accept either patternCode or name as the identifier
  const topicName = patternCode || name;
  
  if (!topicName || !chapterId) {
    return NextResponse.json(
      { message: 'Missing required fields: patternCode/name, chapterId' },
      { status: 400 }
    );
  }

  // Simulate creation delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  const newPattern = {
    id: `pattern-${Date.now()}`,
    patternCode: topicName,
    description: description || topicName,
    chapterId,
    quizType: 'CHAPTER_QUIZ',
    questionCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(newPattern, { status: 201 });
}

