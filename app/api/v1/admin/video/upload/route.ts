import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock admin video upload endpoint for development.
 * Simulates video upload with a 1s delay and returns URLs.
 */
export async function POST(request: NextRequest) {
  // In real implementation, this would handle multipart form data
  // For mock, we just accept any POST and simulate the upload
  const contentType = request.headers.get('content-type') || '';

  let fileName = 'video-upload';
  if (contentType.includes('multipart/form-data')) {
    try {
      const formData = await request.formData();
      const file = formData.get('file');
      if (file && typeof file === 'object' && 'name' in file) {
        fileName = (file as File).name.replace(/\.[^/.]+$/, '');
      }
    } catch {
      // Ignore form parsing errors in mock
    }
  } else {
    try {
      const body = await request.json();
      fileName = body.fileName || fileName;
    } catch {
      // Ignore JSON parsing errors in mock
    }
  }

  // Simulate upload processing delay (1 second)
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const timestamp = Date.now();

  return NextResponse.json({
    videoUrl: `https://storage.sekelas.id/videos/${fileName}-${timestamp}.mp4`,
    thumbnailUrl: `https://storage.sekelas.id/thumbnails/${fileName}-${timestamp}.jpg`,
    duration: 900, // 15 minutes in seconds
    fileSize: 52428800, // 50MB
    uploadedAt: new Date().toISOString(),
  }, { status: 201 });
}
