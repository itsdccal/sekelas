import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock video progress tracking (heartbeat) endpoint for development.
 * Accepts a progress heartbeat and returns updated progress.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { chapterId, currentTimeSeconds, totalDurationSeconds } = body;

  if (!chapterId || currentTimeSeconds === undefined || !totalDurationSeconds) {
    return NextResponse.json(
      { message: 'Missing required fields: chapterId, currentTimeSeconds, totalDurationSeconds' },
      { status: 400 }
    );
  }

  const watchedPercentage = Math.min(
    Math.round((currentTimeSeconds / totalDurationSeconds) * 100),
    100
  );

  // Simulate determining status based on percentage
  let status = 'WATCHING';
  if (watchedPercentage >= 90) {
    status = 'QUIZ_AVAILABLE';
  }

  // Small delay to simulate network
  await new Promise((resolve) => setTimeout(resolve, 150));

  return NextResponse.json({
    chapterId,
    watchedPercentage,
    status,
    currentTimeSeconds,
    totalDurationSeconds,
  });
}
