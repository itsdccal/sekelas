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

  // Mock placement logic based on answer count
  const answeredCount = answers.length;
  let startBabIndex = 0;
  let totalBabsSkipped = 0;
  let xpEarned = 0;

  if (answeredCount >= 5) {
    startBabIndex = 2;
    totalBabsSkipped = 2;
    xpEarned = 600;
  } else if (answeredCount >= 3) {
    startBabIndex = 1;
    totalBabsSkipped = 1;
    xpEarned = 300;
  }

  const babNames = ['Aljabar Linear', 'Geometri Dasar', 'Aritmatika'];
  const startBabName = babNames[startBabIndex] || 'Bab Pertama';

  return NextResponse.json({
    materiId,
    startBabIndex,
    startBabName,
    totalBabsSkipped,
    xpEarned,
    message: totalBabsSkipped > 0
      ? `Berdasarkan hasil Pre Test, kamu memulai dari "${startBabName}". Kamu melewati ${totalBabsSkipped} bab dan mendapat ${xpEarned} XP!`
      : `Kamu akan memulai dari awal: "${startBabName}". Selamat belajar!`,
  });
}
