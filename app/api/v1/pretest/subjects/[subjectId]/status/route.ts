import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subjectId: string }> }
) {
  const { subjectId } = await params;

  // Demo: materi-1 completed, materi-2 pending placement, others not started
  if (subjectId === 'materi-1') {
    return NextResponse.json({
      completed: true,
      pendingPlacement: false,
      startSectionIndex: 1,
    });
  }

  if (subjectId === 'materi-pending') {
    return NextResponse.json({
      completed: true,
      pendingPlacement: true,
      startSectionIndex: 0,
    });
  }

  return NextResponse.json({
    completed: false,
    pendingPlacement: false,
    startSectionIndex: 0,
  });
}
