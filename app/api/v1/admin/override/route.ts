import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock admin override endpoint for development.
 * Simulates adjusting a student's chapter — luluskan dengan skor tertentu.
 *
 * Payload: { userId, chapterId, action, reason, score }
 * - action: FORCE_COMPLETE (satu-satunya aksi sesuai PRD)
 * - score: 0–100 (wajib)
 * - reason: min 10 chars
 */
export async function POST(request: NextRequest) {
  const body = await request.json();

  const studentId = body.studentId || body.userId;
  const chapterId = body.chapterId;
  const reason = body.reason;
  const score = body.score;

  // Validation: check required fields
  if (!studentId || !chapterId || !reason) {
    return NextResponse.json(
      { message: 'Field wajib: userId, chapterId, reason' },
      { status: 400 }
    );
  }

  if (reason.length < 10) {
    return NextResponse.json(
      { message: 'Alasan harus minimal 10 karakter' },
      { status: 400 }
    );
  }

  if (score === undefined || score === null) {
    return NextResponse.json(
      { message: 'Skor wajib diisi' },
      { status: 400 }
    );
  }

  if (typeof score !== 'number' || score < 0 || score > 100) {
    return NextResponse.json(
      { message: 'Skor harus antara 0–100' },
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
      action: 'FORCE_COMPLETE',
      reason,
      score,
      newStatus: 'COMPLETED',
      adminId: 'admin-001',
      adminName: 'Admin Sekelas',
      createdAt: new Date().toISOString(),
    },
    message: `Penyesuaian berhasil. Chapter ${chapterId} diluluskan dengan skor ${score}%.`,
  }, { status: 201 });
}
