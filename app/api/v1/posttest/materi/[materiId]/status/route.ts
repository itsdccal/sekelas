import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ materiId: string }> }
) {
  const { materiId } = await params;

  // Demo: no materi post test completed yet
  return NextResponse.json({
    available: materiId === 'materi-1', // available if all babs completed
    completed: false,
    lastScore: null,
    passed: false,
  });
}
