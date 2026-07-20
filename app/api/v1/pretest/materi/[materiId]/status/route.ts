import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ materiId: string }> }
) {
  const { materiId } = await params;

  // Demo: materi-1 pre test completed, others not
  const completedMateri = ['materi-1'];
  const isCompleted = completedMateri.includes(materiId);

  return NextResponse.json({
    completed: isCompleted,
    startBabIndex: isCompleted ? 1 : 0,
  });
}
