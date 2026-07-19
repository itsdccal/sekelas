import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock Pre Test status endpoint.
 * Returns whether Pre Test has been completed for a Bab.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ babId: string }> }
) {
  const { babId } = await params;

  // For demo: first bab is completed, others are not
  const completedBabs = ['bab-1', 'bab-3', 'bab-4'];
  const isCompleted = completedBabs.includes(babId);

  return NextResponse.json({
    completed: isCompleted,
    startChapterIndex: isCompleted ? 2 : 0, // If completed, started at chapter index 2
  });
}
