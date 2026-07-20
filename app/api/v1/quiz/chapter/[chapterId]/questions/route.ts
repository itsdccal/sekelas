import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock quiz questions endpoint for development.
 * Returns 5 questions with LaTeX, images, and mixed types.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  const { chapterId } = await params;
  await new Promise((resolve) => setTimeout(resolve, 200));

  const mathQuestions = [
    {
      id: 'q-1',
      patternId: 'pattern-1',
      text: 'Tentukan nilai $x$ dari persamaan $2x + 5 = 15$',
      questionType: 'MULTIPLE_CHOICE',
      options: [
        { id: 'opt-1a', text: '$x = 3$', order: 0 },
        { id: 'opt-1b', text: '$x = 5$', order: 1 },
        { id: 'opt-1c', text: '$x = 7$', order: 2 },
        { id: 'opt-1d', text: '$x = 10$', order: 3 },
      ],
      correctOptionId: 'opt-1b',
    },
    {
      id: 'q-2',
      patternId: 'pattern-1',
      text: 'Hasil dari $3^2 + 4^2$ adalah...',
      questionType: 'MULTIPLE_CHOICE',
      options: [
        { id: 'opt-2a', text: '$7$', order: 0 },
        { id: 'opt-2b', text: '$14$', order: 1 },
        { id: 'opt-2c', text: '$25$', order: 2 },
        { id: 'opt-2d', text: '$49$', order: 3 },
      ],
      correctOptionId: 'opt-2c',
    },
    {
      id: 'q-3',
      patternId: 'pattern-1',
      text: 'Perhatikan grafik berikut. Tentukan persamaan garis yang digambarkan.',
      questionType: 'MULTIPLE_CHOICE',
      imageUrl: 'https://placehold.co/400x200/e2e8f0/64748b?text=Grafik+Garis+y%3D2x%2B1',
      options: [
        { id: 'opt-3a', text: '$y = x + 1$', order: 0 },
        { id: 'opt-3b', text: '$y = 2x + 1$', order: 1 },
        { id: 'opt-3c', text: '$y = 2x - 1$', order: 2 },
        { id: 'opt-3d', text: '$y = x - 1$', order: 3 },
      ],
      correctOptionId: 'opt-3b',
    },
    {
      id: 'q-4',
      patternId: 'pattern-1',
      text: 'Jika $f(x) = 3x - 2$, maka nilai $f(4)$ adalah...',
      questionType: 'MULTIPLE_CHOICE',
      options: [
        { id: 'opt-4a', text: '$8$', order: 0 },
        { id: 'opt-4b', text: '$10$', order: 1 },
        { id: 'opt-4c', text: '$12$', order: 2 },
        { id: 'opt-4d', text: '$14$', order: 3 },
      ],
      correctOptionId: 'opt-4b',
    },
    {
      id: 'q-5',
      patternId: 'pattern-1',
      text: 'Berapakah hasil dari $\\frac{6x + 12}{6}$ jika $x = 3$?',
      questionType: 'SHORT_ANSWER',
      options: [],
    },
  ];

  const physicsQuestions = [
    {
      id: 'q-p1',
      patternId: 'pattern-1',
      text: 'Sebuah benda bermassa $5$ kg diberi gaya $F = 20$ N. Berdasarkan Hukum Newton II ($F = ma$), percepatan benda tersebut adalah...',
      questionType: 'MULTIPLE_CHOICE',
      options: [
        { id: 'opt-p1a', text: '$2 \\ m/s^2$', order: 0 },
        { id: 'opt-p1b', text: '$4 \\ m/s^2$', order: 1 },
        { id: 'opt-p1c', text: '$10 \\ m/s^2$', order: 2 },
        { id: 'opt-p1d', text: '$100 \\ m/s^2$', order: 3 },
      ],
      correctOptionId: 'opt-p1b',
    },
    {
      id: 'q-p2',
      patternId: 'pattern-1',
      text: 'Perhatikan diagram gaya berikut. Tentukan resultan gaya yang bekerja pada benda.',
      questionType: 'MULTIPLE_CHOICE',
      imageUrl: 'https://placehold.co/400x200/e2e8f0/64748b?text=Diagram+Gaya+F1%3D10N+F2%3D5N',
      options: [
        { id: 'opt-p2a', text: '$5$ N ke kanan', order: 0 },
        { id: 'opt-p2b', text: '$15$ N ke kanan', order: 1 },
        { id: 'opt-p2c', text: '$5$ N ke kiri', order: 2 },
        { id: 'opt-p2d', text: '$10$ N ke kanan', order: 3 },
      ],
      correctOptionId: 'opt-p2a',
    },
    {
      id: 'q-p3',
      patternId: 'pattern-1',
      text: 'Satuan SI untuk gaya adalah...',
      questionType: 'MULTIPLE_CHOICE',
      options: [
        { id: 'opt-p3a', text: 'Joule', order: 0 },
        { id: 'opt-p3b', text: 'Watt', order: 1 },
        { id: 'opt-p3c', text: 'Newton', order: 2 },
        { id: 'opt-p3d', text: 'Pascal', order: 3 },
      ],
      correctOptionId: 'opt-p3c',
    },
    {
      id: 'q-p4',
      patternId: 'pattern-1',
      text: 'Sebuah mobil bergerak dengan $v_0 = 0$ dan $a = 2 \\ m/s^2$. Kecepatan setelah $t = 5$ detik adalah...',
      questionType: 'MULTIPLE_CHOICE',
      options: [
        { id: 'opt-p4a', text: '$5 \\ m/s$', order: 0 },
        { id: 'opt-p4b', text: '$10 \\ m/s$', order: 1 },
        { id: 'opt-p4c', text: '$15 \\ m/s$', order: 2 },
        { id: 'opt-p4d', text: '$25 \\ m/s$', order: 3 },
      ],
      correctOptionId: 'opt-p4b',
    },
    {
      id: 'q-p5',
      patternId: 'pattern-1',
      text: 'Sebutkan bunyi Hukum Newton I!',
      questionType: 'SHORT_ANSWER',
      options: [],
    },
  ];

  const physicsChapters = ['ch-10', 'ch-11', 'ch-12', 'ch-13', 'ch-14'];
  const questions = physicsChapters.includes(chapterId) ? physicsQuestions : mathQuestions;

  return NextResponse.json(questions);
}
