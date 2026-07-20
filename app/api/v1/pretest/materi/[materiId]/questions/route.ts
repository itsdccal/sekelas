import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ materiId: string }> }
) {
  const { materiId } = await params;
  await new Promise((resolve) => setTimeout(resolve, 300));

  const questions = [
    { id: 'pre-q1', text: 'Manakah yang merupakan bentuk persamaan linear satu variabel?', options: [
      { id: 'pre-opt-1a', text: '2x + 3 = 7', order: 0 }, { id: 'pre-opt-1b', text: 'x² + 2x = 0', order: 1 },
      { id: 'pre-opt-1c', text: 'sin(x) = 0.5', order: 2 }, { id: 'pre-opt-1d', text: 'log(x) = 2', order: 3 },
    ]},
    { id: 'pre-q2', text: 'Jika 3x - 6 = 0, maka x = ...', options: [
      { id: 'pre-opt-2a', text: '1', order: 0 }, { id: 'pre-opt-2b', text: '2', order: 1 },
      { id: 'pre-opt-2c', text: '3', order: 2 }, { id: 'pre-opt-2d', text: '6', order: 3 },
    ]},
    { id: 'pre-q3', text: 'Himpunan penyelesaian dari x + 5 > 8 adalah...', options: [
      { id: 'pre-opt-3a', text: 'x > 3', order: 0 }, { id: 'pre-opt-3b', text: 'x > 2', order: 1 },
      { id: 'pre-opt-3c', text: 'x < 3', order: 2 }, { id: 'pre-opt-3d', text: 'x > 13', order: 3 },
    ]},
    { id: 'pre-q4', text: 'Sistem persamaan x + y = 5 dan x - y = 1, nilai x adalah...', options: [
      { id: 'pre-opt-4a', text: '2', order: 0 }, { id: 'pre-opt-4b', text: '3', order: 1 },
      { id: 'pre-opt-4c', text: '4', order: 2 }, { id: 'pre-opt-4d', text: '5', order: 3 },
    ]},
    { id: 'pre-q5', text: 'Gradien garis y = 2x + 1 adalah...', options: [
      { id: 'pre-opt-5a', text: '1', order: 0 }, { id: 'pre-opt-5b', text: '2', order: 1 },
      { id: 'pre-opt-5c', text: '3', order: 2 }, { id: 'pre-opt-5d', text: '-1', order: 3 },
    ]},
  ];

  return NextResponse.json(questions);
}
