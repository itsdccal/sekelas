import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock quiz questions endpoint for development.
 * Returns 5 questions per chapter with 4 options each.
 * Uses Indonesian math/science questions.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  const { chapterId } = await params;

  // Different question sets based on chapter theme
  const mathQuestions = [
    {
      id: 'q-1',
      questionText: 'Jika 2x + 5 = 15, maka nilai x adalah...',
      options: [
        { id: 'opt-1a', text: '3', orderIndex: 0 },
        { id: 'opt-1b', text: '5', orderIndex: 1 },
        { id: 'opt-1c', text: '7', orderIndex: 2 },
        { id: 'opt-1d', text: '10', orderIndex: 3 },
      ],
      orderIndex: 0,
      correctOptionId: 'opt-1b',
    },
    {
      id: 'q-2',
      questionText: 'Hasil dari 3² + 4² adalah...',
      options: [
        { id: 'opt-2a', text: '7', orderIndex: 0 },
        { id: 'opt-2b', text: '14', orderIndex: 1 },
        { id: 'opt-2c', text: '25', orderIndex: 2 },
        { id: 'opt-2d', text: '49', orderIndex: 3 },
      ],
      orderIndex: 1,
      correctOptionId: 'opt-2c',
    },
    {
      id: 'q-3',
      questionText: 'Penyelesaian dari persamaan x² - 9 = 0 adalah...',
      options: [
        { id: 'opt-3a', text: 'x = 3', orderIndex: 0 },
        { id: 'opt-3b', text: 'x = -3', orderIndex: 1 },
        { id: 'opt-3c', text: 'x = 3 atau x = -3', orderIndex: 2 },
        { id: 'opt-3d', text: 'x = 9', orderIndex: 3 },
      ],
      orderIndex: 2,
      correctOptionId: 'opt-3c',
    },
    {
      id: 'q-4',
      questionText: 'Jika y = 2x - 1 dan x = 4, maka y = ...',
      options: [
        { id: 'opt-4a', text: '5', orderIndex: 0 },
        { id: 'opt-4b', text: '7', orderIndex: 1 },
        { id: 'opt-4c', text: '8', orderIndex: 2 },
        { id: 'opt-4d', text: '9', orderIndex: 3 },
      ],
      orderIndex: 3,
      correctOptionId: 'opt-4b',
    },
    {
      id: 'q-5',
      questionText: 'Gradien garis yang melalui titik (1,2) dan (3,8) adalah...',
      options: [
        { id: 'opt-5a', text: '2', orderIndex: 0 },
        { id: 'opt-5b', text: '3', orderIndex: 1 },
        { id: 'opt-5c', text: '4', orderIndex: 2 },
        { id: 'opt-5d', text: '6', orderIndex: 3 },
      ],
      orderIndex: 4,
      correctOptionId: 'opt-5b',
    },
  ];

  const physicsQuestions = [
    {
      id: 'q-p1',
      questionText: 'Sebuah benda bermassa 5 kg diberi gaya 20 N. Percepatan benda tersebut adalah...',
      options: [
        { id: 'opt-p1a', text: '2 m/s²', orderIndex: 0 },
        { id: 'opt-p1b', text: '4 m/s²', orderIndex: 1 },
        { id: 'opt-p1c', text: '10 m/s²', orderIndex: 2 },
        { id: 'opt-p1d', text: '100 m/s²', orderIndex: 3 },
      ],
      orderIndex: 0,
      correctOptionId: 'opt-p1b',
    },
    {
      id: 'q-p2',
      questionText: 'Hukum Newton I dikenal juga sebagai hukum...',
      options: [
        { id: 'opt-p2a', text: 'Kelembaman', orderIndex: 0 },
        { id: 'opt-p2b', text: 'Aksi-Reaksi', orderIndex: 1 },
        { id: 'opt-p2c', text: 'Gravitasi', orderIndex: 2 },
        { id: 'opt-p2d', text: 'Kekekalan Energi', orderIndex: 3 },
      ],
      orderIndex: 1,
      correctOptionId: 'opt-p2a',
    },
    {
      id: 'q-p3',
      questionText: 'Satuan SI untuk gaya adalah...',
      options: [
        { id: 'opt-p3a', text: 'Joule', orderIndex: 0 },
        { id: 'opt-p3b', text: 'Watt', orderIndex: 1 },
        { id: 'opt-p3c', text: 'Newton', orderIndex: 2 },
        { id: 'opt-p3d', text: 'Pascal', orderIndex: 3 },
      ],
      orderIndex: 2,
      correctOptionId: 'opt-p3c',
    },
    {
      id: 'q-p4',
      questionText: 'Sebuah mobil bergerak dengan kecepatan awal 0 m/s dan percepatan 2 m/s². Kecepatan setelah 5 detik adalah...',
      options: [
        { id: 'opt-p4a', text: '5 m/s', orderIndex: 0 },
        { id: 'opt-p4b', text: '10 m/s', orderIndex: 1 },
        { id: 'opt-p4c', text: '15 m/s', orderIndex: 2 },
        { id: 'opt-p4d', text: '25 m/s', orderIndex: 3 },
      ],
      orderIndex: 3,
      correctOptionId: 'opt-p4b',
    },
    {
      id: 'q-p5',
      questionText: 'Benda jatuh bebas dari ketinggian 20 m. Waktu yang dibutuhkan untuk sampai ke tanah adalah... (g = 10 m/s²)',
      options: [
        { id: 'opt-p5a', text: '1 s', orderIndex: 0 },
        { id: 'opt-p5b', text: '2 s', orderIndex: 1 },
        { id: 'opt-p5c', text: '4 s', orderIndex: 2 },
        { id: 'opt-p5d', text: '5 s', orderIndex: 3 },
      ],
      orderIndex: 4,
      correctOptionId: 'opt-p5b',
    },
  ];

  // Return physics questions for physics chapters, math for others
  const physicsChapters = ['ch-10', 'ch-11', 'ch-12', 'ch-13', 'ch-14'];
  const rawQuestions = physicsChapters.includes(chapterId) ? physicsQuestions : mathQuestions;

  // Map ke format yang diharapkan frontend (Question type)
  const questions = rawQuestions.map(q => ({
    id: q.id,
    patternId: 'pattern-1',
    text: q.questionText,
    options: q.options.map(opt => ({
      id: opt.id,
      text: opt.text,
      order: opt.orderIndex,
    })),
    correctOptionId: q.correctOptionId,
  }));

  // Simulate small delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Return array langsung (frontend expect Question[])
  return NextResponse.json(questions);
}
