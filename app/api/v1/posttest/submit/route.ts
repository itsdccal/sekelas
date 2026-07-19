import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock Post Test submission endpoint.
 * Scores answers and determines pass/fail based on passing grade.
 * On pass: unlocks next Bab.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { babId, answers } = body;

  if (!babId || !answers || !Array.isArray(answers)) {
    return NextResponse.json(
      { message: 'Missing required fields: babId, answers' },
      { status: 400 }
    );
  }

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Correct answers for Post Test
  const correctAnswers: Record<string, string> = {
    'post-q1': 'post-opt-1b',
    'post-q2': 'post-opt-2a',
    'post-q3': 'post-opt-3b',
    'post-q4': 'post-opt-4b',
    'post-q5': 'post-opt-5b',
  };

  // XP per question
  const xpMap: Record<string, number> = {
    'post-q1': 50,
    'post-q2': 75,
    'post-q3': 50,
    'post-q4': 75,
    'post-q5': 50,
  };

  // Count correct and calculate XP
  let correctCount = 0;
  let xpEarned = 0;

  for (const answer of answers as { questionId: string; selectedOptionId: string }[]) {
    const isCorrect = correctAnswers[answer.questionId] === answer.selectedOptionId;
    if (isCorrect) {
      correctCount++;
      xpEarned += xpMap[answer.questionId] || 0;
    }
  }

  const totalQuestions = answers.length;
  const score = Math.round((correctCount / totalQuestions) * 100);
  const passingGrade = 70; // Configurable by admin in real implementation

  const passed = score >= passingGrade;

  // Next bab mapping (for demo)
  const nextBabMap: Record<string, string> = {
    'bab-1': 'bab-2',
    'bab-2': 'bab-3',
    'bab-4': 'bab-5',
  };

  const nextBabId = nextBabMap[babId] || undefined;

  return NextResponse.json({
    status: passed ? 'PASSED' : 'FAILED',
    score,
    passingGrade,
    xpEarned: passed ? xpEarned : 0,
    message: passed
      ? `Selamat! Kamu lulus Post Test dengan skor ${score}%. Bab berikutnya telah terbuka.`
      : `Skor kamu ${score}% belum mencapai batas kelulusan ${passingGrade}%. Tonton ulang video materi yang belum dipahami lalu coba lagi.`,
    nextBabUnlocked: passed && !!nextBabId,
    nextBabId: passed ? nextBabId : undefined,
    remediationChapterIds: passed ? undefined : ['ch-3', 'ch-4'], // Demo: chapters to rewatch
  });
}
