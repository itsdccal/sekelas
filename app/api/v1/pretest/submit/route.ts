import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock Pre Test submission endpoint.
 * Evaluates answers to determine placement (which Chapter to start from).
 * Pre Test does NOT have pass/fail — it determines starting level.
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

  // Mock placement logic:
  // More answers given = potentially higher placement
  // For demo: if student answered 4+ questions, place at chapter 2
  // Otherwise start from chapter 0
  const answeredCount = answers.length;
  let startChapterIndex = 0;
  let totalChaptersSkipped = 0;
  let xpEarned = 0;

  if (answeredCount >= 5) {
    // "Advanced" — place at chapter 3 (skip 3 chapters)
    startChapterIndex = 3;
    totalChaptersSkipped = 3;
    xpEarned = 450; // 150 XP per skipped chapter
  } else if (answeredCount >= 3) {
    // "Intermediate" — place at chapter 1 (skip 1 chapter)
    startChapterIndex = 1;
    totalChaptersSkipped = 1;
    xpEarned = 150;
  }
  // else: "Beginner" — start from chapter 0, no XP

  const chapterNames = [
    'Persamaan Linear Satu Variabel',
    'Persamaan Linear Dua Variabel',
    'Sistem Persamaan Linear',
    'Pertidaksamaan Linear',
  ];

  const startChapterName = chapterNames[startChapterIndex] || 'Chapter Pertama';

  return NextResponse.json({
    babId,
    startChapterIndex,
    startChapterName,
    totalChaptersSkipped,
    xpEarned,
    message: totalChaptersSkipped > 0
      ? `Berdasarkan hasil Pre Test, kamu memulai dari "${startChapterName}". Kamu melewati ${totalChaptersSkipped} chapter dan mendapat ${xpEarned} XP!`
      : `Kamu akan memulai dari awal: "${startChapterName}". Selamat belajar!`,
  });
}
