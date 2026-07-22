import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { subjectId, answers } = body;

  if (!subjectId || !answers || !Array.isArray(answers)) {
    return NextResponse.json(
      { message: 'Missing required fields: subjectId, answers' },
      { status: 400 }
    );
  }

  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock placement logic based on answer count
  const answeredCount = answers.length;
  let startSectionIndex = 0;
  let totalSectionsSkipped = 0;
  let xpEarned = 0;

  if (answeredCount >= 5) {
    startSectionIndex = 2;
    totalSectionsSkipped = 2;
    xpEarned = 600;
  } else if (answeredCount >= 3) {
    startSectionIndex = 1;
    totalSectionsSkipped = 1;
    xpEarned = 300;
  }

  const sectionNames = ['Aljabar Linear', 'Geometri Dasar', 'Aritmatika'];
  const startsectionName = sectionNames[startSectionIndex] || 'Bab Pertama';

  return NextResponse.json({
    subjectId,
    startSectionIndex,
    startsectionName,
    totalSectionsSkipped,
    xpEarned,
    message: totalSectionsSkipped > 0
      ? `Berdasarkan hasil Pre Test, kamu memulai dari "${startsectionName}". Kamu melewati ${totalSectionsSkipped} bab dan mendapat ${xpEarned} XP!`
      : `Kamu akan memulai dari awal: "${startsectionName}". Selamat belajar!`,
  });
}

