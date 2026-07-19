import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock Post Test questions endpoint.
 * Returns questions WITH correctOptionId for scoring.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ babId: string }> }
) {
  const { babId } = await params;

  // Simulate loading delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const questions = [
    {
      id: 'post-q1',
      patternId: 'post-pattern-1',
      text: 'Penyelesaian dari persamaan 2x + 4 = 10 adalah...',
      xpPerQuestion: 50,
      options: [
        { id: 'post-opt-1a', text: 'x = 2', order: 0 },
        { id: 'post-opt-1b', text: 'x = 3', order: 1 },
        { id: 'post-opt-1c', text: 'x = 4', order: 2 },
        { id: 'post-opt-1d', text: 'x = 5', order: 3 },
      ],
      correctOptionId: 'post-opt-1b',
    },
    {
      id: 'post-q2',
      patternId: 'post-pattern-1',
      text: 'Sistem persamaan linear 2x + y = 7 dan x - y = 2, maka nilai y adalah...',
      xpPerQuestion: 75,
      options: [
        { id: 'post-opt-2a', text: '1', order: 0 },
        { id: 'post-opt-2b', text: '2', order: 1 },
        { id: 'post-opt-2c', text: '3', order: 2 },
        { id: 'post-opt-2d', text: '4', order: 3 },
      ],
      correctOptionId: 'post-opt-2a',
    },
    {
      id: 'post-q3',
      patternId: 'post-pattern-1',
      text: 'Himpunan penyelesaian dari 2x - 1 ≥ 5 adalah...',
      xpPerQuestion: 50,
      options: [
        { id: 'post-opt-3a', text: 'x ≥ 2', order: 0 },
        { id: 'post-opt-3b', text: 'x ≥ 3', order: 1 },
        { id: 'post-opt-3c', text: 'x > 3', order: 2 },
        { id: 'post-opt-3d', text: 'x ≤ 3', order: 3 },
      ],
      correctOptionId: 'post-opt-3b',
    },
    {
      id: 'post-q4',
      patternId: 'post-pattern-1',
      text: 'Gradien garis yang melalui titik (0, 3) dan (2, 7) adalah...',
      xpPerQuestion: 75,
      options: [
        { id: 'post-opt-4a', text: '1', order: 0 },
        { id: 'post-opt-4b', text: '2', order: 1 },
        { id: 'post-opt-4c', text: '3', order: 2 },
        { id: 'post-opt-4d', text: '4', order: 3 },
      ],
      correctOptionId: 'post-opt-4b',
    },
    {
      id: 'post-q5',
      patternId: 'post-pattern-1',
      text: 'Jika f(x) = 3x - 2, maka f(4) = ...',
      xpPerQuestion: 50,
      options: [
        { id: 'post-opt-5a', text: '8', order: 0 },
        { id: 'post-opt-5b', text: '10', order: 1 },
        { id: 'post-opt-5c', text: '12', order: 2 },
        { id: 'post-opt-5d', text: '14', order: 3 },
      ],
      correctOptionId: 'post-opt-5b',
    },
  ];

  return NextResponse.json(questions);
}
