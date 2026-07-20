import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ materiId: string }> }
) {
  const { materiId } = await params;
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Generate 20 questions for Post Test
  const babLabels = ['Aljabar Linear', 'Geometri Dasar', 'Aritmatika', 'Statistika'];
  const questions = Array.from({ length: 20 }, (_, i) => {
    const babIndex = Math.floor(i / 5);
    const isEssay = i === 9 || i === 19; // soal 10 dan 20 = esai
    const isShortAnswer = i === 4 || i === 14; // soal 5 dan 15 = isian

    let questionType: 'MULTIPLE_CHOICE' | 'ESSAY' | 'SHORT_ANSWER' = 'MULTIPLE_CHOICE';
    if (isEssay) questionType = 'ESSAY';
    else if (isShortAnswer) questionType = 'SHORT_ANSWER';

    return {
      id: `post-q${i + 1}`,
      text: isEssay
        ? `Jelaskan dengan kata-kata sendiri tentang konsep ${babLabels[babIndex] || 'Umum'} yang sudah kamu pelajari.`
        : isShortAnswer
        ? `Berapakah hasil dari perhitungan berikut terkait ${babLabels[babIndex] || 'Umum'}?`
        : `Soal Post Test nomor ${i + 1} — ${babLabels[babIndex] || 'Umum'}. Pilih jawaban yang benar.`,
      questionType,
      materiLabel: babLabels[babIndex] || 'Umum',
      options: questionType === 'MULTIPLE_CHOICE' ? [
        { id: `post-opt-${i + 1}a`, text: `Pilihan A soal ${i + 1}`, order: 0 },
        { id: `post-opt-${i + 1}b`, text: `Pilihan B soal ${i + 1}`, order: 1 },
        { id: `post-opt-${i + 1}c`, text: `Pilihan C soal ${i + 1}`, order: 2 },
        { id: `post-opt-${i + 1}d`, text: `Pilihan D soal ${i + 1}`, order: 3 },
      ] : [],
    };
  });

  return NextResponse.json(questions);
}
