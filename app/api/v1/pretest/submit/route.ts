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

  // Cek apakah ada jawaban isian (textAnswer) di submission ini
  const hasShortAnswer = answers.some(
    (a: { questionId: string; selectedOptionId?: string; textAnswer?: string }) =>
      a.textAnswer !== undefined && a.textAnswer !== null && a.textAnswer.trim() !== ''
  );

  // Jika ada soal isian → placement harus menunggu penilaian admin
  if (hasShortAnswer) {
    return NextResponse.json({
      subjectId,
      status: 'PENDING_PLACEMENT',
      startSectionIndex: 0,
      startSectionName: '',
      totalSectionsSkipped: 0,
      xpEarned: 0,
      message:
        'Jawaban kamu sudah diterima. Pre Test mengandung soal isian yang perlu diperiksa oleh guru. Penempatan bab kamu akan ditentukan setelah penilaian selesai.',
    });
  }

  // Semua pilihan ganda → placement langsung
  const answeredCount = (answers as { questionId: string }[]).length;
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
  const startSectionName = sectionNames[startSectionIndex] || 'Bab Pertama';

  return NextResponse.json({
    subjectId,
    status: 'PLACED',
    startSectionIndex,
    startSectionName,
    totalSectionsSkipped,
    xpEarned,
    message:
      totalSectionsSkipped > 0
        ? `Berdasarkan hasil Pre Test, kamu memulai dari "${startSectionName}". Kamu melewati ${totalSectionsSkipped} bab dan mendapat ${xpEarned} XP!`
        : `Kamu akan memulai dari awal: "${startSectionName}". Selamat belajar!`,
  });
}
