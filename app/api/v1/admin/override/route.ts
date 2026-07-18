import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock admin override endpoint for development.
 * Simulates overriding a student's chapter status.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { studentId, chapterId, action, reason } = body;

  if (!studentId || !chapterId || !action || !reason) {
    return NextResponse.json(
      { message: 'Missing required fields: studentId, chapterId, action, reason' },
      { status: 400 }
    );
  }

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  return NextResponse.json({
    success: true,
    override: {
      id: `override-${Date.now()}`,
      studentId,
      chapterId,
      action,
      reason,
      adminId: 'admin-001',
      adminName: 'Admin Sekelas',
      createdAt: new Date().toISOString(),
    },
    message: `Override berhasil diterapkan untuk siswa ${studentId} pada chapter ${chapterId}`,
  }, { status: 201 });
}
