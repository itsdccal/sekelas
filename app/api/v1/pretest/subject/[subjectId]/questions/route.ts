import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subjectId: string }> }
) {
  const { subjectId } = await params;
  await new Promise((resolve) => setTimeout(resolve, 300));

  const babLabels = ['Aljabar Linear', 'Geometri Dasar', 'Aritmatika', 'Statistika'];

  // Mix of normal, LaTeX, and image questions
  const specialQuestions = [
    {
      id: 'pre-q1',
      text: 'Tentukan nilai $x$ dari persamaan $2x + 5 = 15$',
      questionType: 'MULTIPLE_CHOICE',
      materiLabel: 'Aljabar Linear',
      imageUrl: null,
      options: [
        { id: 'pre-opt-1a', text: '$x = 3$', order: 0 },
        { id: 'pre-opt-1b', text: '$x = 5$', order: 1 },
        { id: 'pre-opt-1c', text: '$x = 7$', order: 2 },
        { id: 'pre-opt-1d', text: '$x = 10$', order: 3 },
      ],
    },
    {
      id: 'pre-q2',
      text: 'Hasil dari $\\frac{3^2 + 4^2}{5}$ adalah...',
      questionType: 'MULTIPLE_CHOICE',
      materiLabel: 'Aljabar Linear',
      imageUrl: null,
      options: [
        { id: 'pre-opt-2a', text: '$3$', order: 0 },
        { id: 'pre-opt-2b', text: '$5$', order: 1 },
        { id: 'pre-opt-2c', text: '$7$', order: 2 },
        { id: 'pre-opt-2d', text: '$25$', order: 3 },
      ],
    },
    {
      id: 'pre-q3',
      text: 'Perhatikan grafik fungsi berikut. Tentukan nilai $f(2)$ berdasarkan grafik.',
      questionType: 'MULTIPLE_CHOICE',
      materiLabel: 'Aljabar Linear',
      imageUrl: 'https://placehold.co/400x250/e2e8f0/64748b?text=Grafik+f(x)%3D2x%2B1',
      options: [
        { id: 'pre-opt-3a', text: '$f(2) = 3$', order: 0 },
        { id: 'pre-opt-3b', text: '$f(2) = 5$', order: 1 },
        { id: 'pre-opt-3c', text: '$f(2) = 7$', order: 2 },
        { id: 'pre-opt-3d', text: '$f(2) = 4$', order: 3 },
      ],
    },
    {
      id: 'pre-q4',
      text: 'Selesaikan sistem persamaan berikut: $$x + y = 7$$ $$x - y = 3$$',
      questionType: 'MULTIPLE_CHOICE',
      materiLabel: 'Aljabar Linear',
      imageUrl: null,
      options: [
        { id: 'pre-opt-4a', text: '$x = 5, y = 2$', order: 0 },
        { id: 'pre-opt-4b', text: '$x = 4, y = 3$', order: 1 },
        { id: 'pre-opt-4c', text: '$x = 3, y = 4$', order: 2 },
        { id: 'pre-opt-4d', text: '$x = 6, y = 1$', order: 3 },
      ],
    },
    {
      id: 'pre-q5',
      text: 'Gradien garis yang melalui titik $A(1, 2)$ dan $B(3, 8)$ adalah...',
      questionType: 'MULTIPLE_CHOICE',
      materiLabel: 'Aljabar Linear',
      imageUrl: null,
      options: [
        { id: 'pre-opt-5a', text: '$m = 2$', order: 0 },
        { id: 'pre-opt-5b', text: '$m = 3$', order: 1 },
        { id: 'pre-opt-5c', text: '$m = 4$', order: 2 },
        { id: 'pre-opt-5d', text: '$m = 6$', order: 3 },
      ],
    },
    {
      id: 'pre-q6',
      text: 'Perhatikan gambar segitiga berikut. Hitunglah luas segitiga tersebut.',
      questionType: 'MULTIPLE_CHOICE',
      materiLabel: 'Geometri Dasar',
      imageUrl: 'https://placehold.co/400x250/e2e8f0/64748b?text=Segitiga+a%3D6+t%3D4',
      options: [
        { id: 'pre-opt-6a', text: '$10$ cm²', order: 0 },
        { id: 'pre-opt-6b', text: '$12$ cm²', order: 1 },
        { id: 'pre-opt-6c', text: '$24$ cm²', order: 2 },
        { id: 'pre-opt-6d', text: '$8$ cm²', order: 3 },
      ],
    },
    {
      id: 'pre-q7',
      text: 'Luas lingkaran dengan jari-jari $r = 7$ cm adalah... (gunakan $\\pi = \\frac{22}{7}$)',
      questionType: 'MULTIPLE_CHOICE',
      materiLabel: 'Geometri Dasar',
      imageUrl: null,
      options: [
        { id: 'pre-opt-7a', text: '$154$ cm²', order: 0 },
        { id: 'pre-opt-7b', text: '$44$ cm²', order: 1 },
        { id: 'pre-opt-7c', text: '$22$ cm²', order: 2 },
        { id: 'pre-opt-7d', text: '$308$ cm²', order: 3 },
      ],
    },
  ];

  // Fill remaining with generic
  const remaining = Array.from({ length: 13 }, (_, i) => {
    const idx = i + 8;
    const babIndex = Math.floor(idx / 5);
    return {
      id: `pre-q${idx}`,
      text: `Soal nomor ${idx}: Tentang ${babLabels[babIndex] || 'Statistika'}. Manakah jawaban yang paling tepat?`,
      questionType: 'MULTIPLE_CHOICE',
      materiLabel: babLabels[babIndex] || 'Statistika',
      options: [
        { id: `pre-opt-${idx}a`, text: `Pilihan A`, order: 0 },
        { id: `pre-opt-${idx}b`, text: `Pilihan B`, order: 1 },
        { id: `pre-opt-${idx}c`, text: `Pilihan C`, order: 2 },
        { id: `pre-opt-${idx}d`, text: `Pilihan D`, order: 3 },
      ],
    };
  });

  return NextResponse.json([...specialQuestions, ...remaining]);
}
