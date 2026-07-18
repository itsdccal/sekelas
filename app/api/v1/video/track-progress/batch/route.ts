import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock batch video progress tracking endpoint for development.
 * Accepts multiple heartbeats in one request.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { heartbeats } = body;

  if (!heartbeats || !Array.isArray(heartbeats)) {
    return NextResponse.json(
      { message: 'Missing required field: heartbeats (array)' },
      { status: 400 }
    );
  }

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  return NextResponse.json({
    processed: heartbeats.length,
    timestamp: new Date().toISOString(),
  });
}
