import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock Post Test status endpoint.
 * Returns whether Post Test is available and completed for a Bab.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ babId: string }> }
) {
  const { babId } = await params;

  // For demo:
  // bab-3: post test passed (completed)
  // bab-1, bab-2: post test available but not yet completed (for testing)
  const completedBabs = ['bab-3'];
  const availableBabs = ['bab-1', 'bab-2', 'bab-3', 'bab-4'];

  const isCompleted = completedBabs.includes(babId);
  const isAvailable = availableBabs.includes(babId);

  return NextResponse.json({
    available: isAvailable,
    completed: isCompleted,
    lastScore: isCompleted ? 85 : null,
    passed: isCompleted,
  });
}
