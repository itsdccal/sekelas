import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subjectId: string }> }
) {
  const { subjectId } = await params;

  // Demo: materi-1 pre test completed, others not
  const completedSubjects = ['materi-1'];
  const isCompleted = completedSubjects.includes(subjectId);

  return NextResponse.json({
    completed: isCompleted,
    startSectionIndex: isCompleted ? 1 : 0,
  });
}
