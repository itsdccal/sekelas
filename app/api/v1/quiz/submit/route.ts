import { NextRequest, NextResponse } from 'next/server';
import { isOfflineMode } from '@/lib/config/offlineMode';

/**
 * Mock quiz submission endpoint for development.
 * Calculates score based on answers. For demo, passes if > 3 correct.
 * Returns reviewDetails when PASSED (for quiz review feature).
 * Returns PENDING_REVIEW if any essay/short_answer questions detected.
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

  // Mode Offline: always pass, no remediation flow
  if (isOfflineMode) {
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Simple scoring for record-keeping
    const correctAnswers: Record<string, string> = {
      'q-1': 'opt-1b', 'q-2': 'opt-2c', 'q-3': 'opt-3c', 'q-4': 'opt-4b', 'q-5': 'opt-5b',
      'q-p1': 'opt-p1b', 'q-p2': 'opt-p2a', 'q-p3': 'opt-p3c', 'q-p4': 'opt-p4b', 'q-p5': 'opt-p5b',
    };
    let correctCount = 0;
    const mcAnswers = answers.filter((a: { textAnswer?: string }) => !a.textAnswer);
    mcAnswers.forEach((answer: { questionId: string; selectedOptionId?: string }) => {
      if (correctAnswers[answer.questionId] === answer.selectedOptionId) correctCount++;
    });
    const score = mcAnswers.length > 0 ? Math.round((correctCount / mcAnswers.length) * 100) : 0;

    return NextResponse.json({
      status: 'PASSED',
      score,
      passingGrade: 70,
      passed: true,
      nextStatus: 'COMPLETED',
      message: 'Quiz selesai. Chapter berikutnya telah terbuka.',
      xpEarned: 150,
    });
  }

  // Simulate grading delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock question data for review
  const questionTexts: Record<string, string> = {
    'q-1': 'Apa yang dimaksud dengan variabel dalam pemrograman?',
    'q-2': 'Manakah tipe data yang digunakan untuk menyimpan bilangan desimal?',
    'q-3': 'Apa output dari console.log(typeof null)?',
    'q-4': 'Manakah yang merupakan operator perbandingan ketat?',
    'q-5': 'Fungsi apa yang digunakan untuk mengonversi string ke integer?',
    'q-p1': 'Apa perbedaan antara let dan const?',
    'q-p2': 'Manakah yang merupakan method array?',
    'q-p3': 'Apa output dari 2 + "2" di JavaScript?',
    'q-p4': 'Manakah yang termasuk higher-order function?',
    'q-p5': 'Apa yang dilakukan operator spread (...)?',
  };

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

  // Detect if any answers are text-based (essay/short_answer)
  const hasTextAnswers = answers.some(
    (answer: { questionId: string; selectedOptionId?: string; textAnswer?: string }) =>
      answer.textAnswer !== undefined && answer.textAnswer !== null
  );

  // Count correct answers (only for multiple choice)
  let correctCount = 0;
  const reviewDetails = answers.map(
    (answer: { questionId: string; selectedOptionId?: string; textAnswer?: string }) => {
      const isTextAnswer = !!answer.textAnswer;
      const isCorrect = isTextAnswer
        ? null // pending review for text answers
        : correctAnswers[answer.questionId] === answer.selectedOptionId;

      if (isCorrect === true) correctCount++;

      return {
        questionId: answer.questionId,
        questionText: questionTexts[answer.questionId] || `Soal ${answer.questionId}`,
        questionType: isTextAnswer ? ('ESSAY' as const) : ('MULTIPLE_CHOICE' as const),
        isCorrect,
        selectedOptionId: answer.selectedOptionId || undefined,
        correctOptionId: correctAnswers[answer.questionId] || undefined,
        textAnswer: answer.textAnswer || undefined,
      };
    }
  );

  const mcQuestions = answers.filter(
    (a: { textAnswer?: string }) => !a.textAnswer
  ).length;
  const totalQuestions = answers.length;
  const score = mcQuestions > 0 ? Math.round((correctCount / mcQuestions) * 100) : 0;

  // Determine status
  let status: 'PASSED' | 'FAILED' | 'PENDING_REVIEW';
  if (hasTextAnswers) {
    // If there are text-based answers, mark as pending review
    status = score >= 70 ? 'PENDING_REVIEW' : 'FAILED';
  } else {
    // Pass if more than 3 correct (for demo reliability) or score >= 70
    const passed = correctCount > 3 || score >= 70;
    status = passed ? 'PASSED' : 'FAILED';
  }

  const finalScore = status === 'PASSED' ? Math.max(score, 80) : status === 'PENDING_REVIEW' ? score : Math.min(score, 50);
  const xpEarned = status === 'PASSED' ? 150 : 0;

  const messages: Record<string, string> = {
    PASSED: 'Selamat! Kamu berhasil lulus kuis ini.',
    FAILED: 'Maaf, kamu belum berhasil. Silakan tonton ulang video dan coba lagi.',
    PENDING_REVIEW: 'Jawaban esai/singkat kamu sedang ditinjau. Hasil akhir akan diperbarui setelah review selesai.',
  };

  // Return format sesuai frontend QuizResult type
  return NextResponse.json({
    status,
    score: finalScore,
    passingGrade: 70,
    nextStatus: status === 'PASSED' ? 'COMPLETED' : status === 'PENDING_REVIEW' ? 'UNLOCKED' : 'REMEDIATION_REQUIRED',
    message: messages[status],
    xpEarned,
    // Include reviewDetails when PASSED (for quiz review section)
    ...(status === 'PASSED' && { reviewDetails }),
    // Also include for PENDING_REVIEW so student sees what was submitted
    ...(status === 'PENDING_REVIEW' && { reviewDetails }),
  });
}
