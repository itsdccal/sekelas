import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ materiId: string }> }
) {
  const { materiId } = await params;
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Generate 20 questions for Pre Test
  const babLabels = ['Aljabar Linear', 'Geometri Dasar', 'Aritmatika', 'Statistika'];
  const questions = Array.from({ length: 20 }, (_, i) => {
    const babIndex = Math.floor(i / 5); // 5 soal per bab
    return {
      id: `pre-q${i + 1}`,
      text: `Soal Pre Test nomor ${i + 1} — Tentang ${babLabels[babIndex] || 'Umum'}. Manakah jawaban yang paling tepat?`,
      questionType: 'MULTIPLE_CHOICE',
      materiLabel: babLabels[babIndex] || 'Umum',
      options: [
        { id: `pre-opt-${i + 1}a`, text: `Pilihan A soal ${i + 1}`, order: 0 },
        { id: `pre-opt-${i + 1}b`, text: `Pilihan B soal ${i + 1}`, order: 1 },
        { id: `pre-opt-${i + 1}c`, text: `Pilihan C soal ${i + 1}`, order: 2 },
        { id: `pre-opt-${i + 1}d`, text: `Pilihan D soal ${i + 1}`, order: 3 },
      ],
    };
  });

  return NextResponse.json(questions);
}
