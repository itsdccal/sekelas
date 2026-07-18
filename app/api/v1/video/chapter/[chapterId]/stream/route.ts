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

  // Big Buck Bunny - freely available sample video
  const sampleVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  return NextResponse.redirect(sampleVideoUrl);
}
