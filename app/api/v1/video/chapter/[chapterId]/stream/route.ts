import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock video stream endpoint for development.
 * Redirects to a public sample video (Big Buck Bunny).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  await params; // consume params

  // Sample video served from public folder (no CORS issues)
  const sampleVideoUrl = new URL('/sample-video.mp4', request.url).toString();

  return NextResponse.redirect(sampleVideoUrl);
}
