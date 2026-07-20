import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ materiId: string }> }
) {
  const { materiId } = await params;
  await new Promise((resolve) => setTimeout(resolve, 300));

  const questions = [
    { id: 'post-q1', text: 'Penyelesaian dari persamaan 2x + 4 = 10 adalah...', options: [
      { id: 'post-opt-1a', text: 'x = 2', order: 0 }, { id: 'post-opt-1b', text: 'x = 3', order: 1 },
      { id: 'post-opt-1c', text: 'x = 4', order: 2 }, { id: 'post-opt-1d', text: 'x = 5', order: 3 },
    ]},
    { id: 'post-q2', text: 'Sistem persamaan linear 2x + y = 7 dan x - y = 2, maka nilai y adalah...', options: [
      { id: 'post-opt-2a', text: '1', order: 0 }, { id: 'post-opt-2b', text: '2', order: 1 },
      { id: 'post-opt-2c', text: '3', order: 2 }, { id: 'post-opt-2d', text: '4', order: 3 },
    ]},
    { id: 'post-q3', text: 'Himpunan penyelesaian dari 2x - 1 >= 5 adalah...', options: [
      { id: 'post-opt-3a', text: 'x >= 2', order: 0 }, { id: 'post-opt-3b', text: 'x >= 3', order: 1 },
      { id: 'post-opt-3c', text: 'x > 3', order: 2 }, { id: 'post-opt-3d', text: 'x <= 3', order: 3 },
    ]},
    { id: 'post-q4', text: 'Gradien garis yang melalui titik (0, 3) dan (2, 7) adalah...', options: [
      { id: 'post-opt-4a', text: '1', order: 0 }, { id: 'post-opt-4b', text: '2', order: 1 },
      { id: 'post-opt-4c', text: '3', order: 2 }, { id: 'post-opt-4d', text: '4', order: 3 },
    ]},
    { id: 'post-q5', text: 'Jika f(x) = 3x - 2, maka f(4) = ...', options: [
      { id: 'post-opt-5a', text: '8', order: 0 }, { id: 'post-opt-5b', text: '10', order: 1 },
      { id: 'post-opt-5c', text: '12', order: 2 }, { id: 'post-opt-5d', text: '14', order: 3 },
    ]},
  ];

  return NextResponse.json(questions);
}
