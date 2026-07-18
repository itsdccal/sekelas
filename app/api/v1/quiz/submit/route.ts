import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock quiz submission endpoint for development.
 * Calculates score based on answers. For demo, passes if > 3 correct.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { chapterId, answers } = body;

  if (!chapterId || !answers || !Array.isArray(answers)) {
    return NextResponse.json(
      { message: 'Missing required fields: chapterId, answers' },
      { status: 400 }
    );
  }

  // Simulate grading delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Correct answers map
  const correctAnswers: Record<string, string> = {
    'q-1': 'opt-1b',
    'q-2': 'opt-2c',
    'q-3': 'opt-3c',
    'q-4': 'opt-4b',
    'q-5': 'opt-5b',
    'q-p1': 'opt-p1b',
    'q-p2': 'opt-p2a',
    'q-p3': 'opt-p3c',
    'q-p4': 'opt-p4b',
    'q-p5': 'opt-p5b',
  };

  // Count correct answers
  let correctCount = 0;
  const results = answers.map((answer: { questionId: string; selectedOptionId: string }) => {
    const isCorrect = correctAnswers[answer.questionId] === answer.selectedOptionId;
    if (isCorrect) correctCount++;
    return {
      questionId: answer.questionId,
      selectedOptionId: answer.selectedOptionId,
      correctOptionId: correctAnswers[answer.questionId] || answer.selectedOptionId,
      isCorrect,
    };
  });

  const totalQuestions = answers.length;
  const score = Math.round((correctCount / totalQuestions) * 100);

  // Pass if more than 3 correct (for demo reliability) or score >= 70
  const passed = correctCount > 3 || score >= 70;
  const finalScore = passed ? Math.max(score, 80) : Math.min(score, 50);

  const xpEarned = passed ? 150 : 0;

  return NextResponse.json({
    chapterId,
    score: finalScore,
    passed,
    correctCount,
    totalQuestions,
    xpEarned,
    results,
    message: passed
      ? 'Selamat! Kamu berhasil lulus kuis ini.'
      : 'Maaf, kamu belum berhasil. Silakan tonton ulang video dan coba lagi.',
  });
}
