import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/v1/admin/monitoring/students/[userId]/submissions/grade
 *
 * Admin grades a SHORT_ANSWER question from a student submission.
 * Body: { submissionId, questionId, score, note? }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const body = await request.json();
  const { submissionId, questionId, score, note } = body;

  if (!submissionId || !questionId || score === undefined) {
    return NextResponse.json(
      { message: 'Missing required fields: submissionId, questionId, score' },
      { status: 400 }
    );
  }

  if (typeof score !== 'number' || score < 0 || score > 100) {
    return NextResponse.json(
      { message: 'score must be a number between 0 and 100' },
      { status: 400 }
    );
  }

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  return NextResponse.json({
    success: true,
    userId,
    submissionId,
    questionId,
    score,
    note: note ?? null,
    gradedAt: new Date().toISOString(),
  });
}
