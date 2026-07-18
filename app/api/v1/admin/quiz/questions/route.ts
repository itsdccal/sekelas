import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock admin quiz question creation endpoint for development.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { patternId, questionText, options, correctOptionId } = body;

  if (!patternId || !questionText || !options || !correctOptionId) {
    return NextResponse.json(
      { message: 'Missing required fields: patternId, questionText, options, correctOptionId' },
      { status: 400 }
    );
  }

  // Simulate creation delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  const newQuestion = {
    id: `q-${Date.now()}`,
    patternId,
    questionText,
    options: options.map((opt: { text: string }, index: number) => ({
      id: `opt-${Date.now()}-${index}`,
      text: opt.text,
      orderIndex: index,
    })),
    correctOptionId,
    explanation: body.explanation || '',
    orderIndex: body.orderIndex || 0,
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json(newQuestion, { status: 201 });
}
