import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { materiId, answers } = body;

  if (!materiId || !answers || !Array.isArray(answers)) {
    return NextResponse.json(
      { message: 'Missing required fields: materiId, answers' },
      { status: 400 }
    );
  }

  await new Promise((resolve) => setTimeout(resolve, 500));

  const correctAnswers: Record<string, string> = {
    'post-q1': 'post-opt-1b',
    'post-q2': 'post-opt-2a',
    'post-q3': 'post-opt-3b',
    'post-q4': 'post-opt-4b',
    'post-q5': 'post-opt-5b',
  };

  let correctCount = 0;
  for (const answer of answers as { questionId: string; selectedOptionId: string }[]) {
    if (correctAnswers[answer.questionId] === answer.selectedOptionId) correctCount++;
  }

  const score = Math.round((correctCount / answers.length) * 100);
  const passingGrade = 70;
  const passed = score >= passingGrade;

  return NextResponse.json({
    status: passed ? 'PASSED' : 'FAILED',
    score,
    passingGrade,
    xpEarned: passed ? 300 : 0,
    message: passed
      ? `Selamat! Kamu lulus Post Test dengan skor ${score}%.`
      : `Skor kamu ${score}% belum mencapai batas kelulusan ${passingGrade}%.`,
    remediationSectionIds: passed ? undefined : ['bab-2', 'bab-3'],
    remediationSectionNames: passed ? undefined : ['Geometri Dasar', 'Aritmatika'],
  });
}
