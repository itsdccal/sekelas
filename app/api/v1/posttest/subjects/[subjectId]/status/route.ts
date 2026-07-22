import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subjectId: string }> }
) {
  const { subjectId } = await params;

  // Demo: no materi post test completed yet
  return NextResponse.json({
    available: subjectId === 'materi-1', // available if all sections completed
    completed: false,
    lastScore: null,
    passed: false,
  });
}
