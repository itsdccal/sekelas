import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock admin override endpoint for development.
 * Simulates adjusting a student's chapter status/score.
 *
 * Payload: { userId, chapterId, action, reason, score? }
 * - action: FORCE_COMPLETE | RESET_QUIZ | UNLOCK_NEXT | RESET_PROGRESS
 * - score: required if action = FORCE_COMPLETE (0–100)
 * - reason: min 10 chars
 */
export async function POST(request: NextRequest) {
  const body = await request.json();

  // Support both payload formats
  const studentId = body.studentId || body.userId;
  const chapterId = body.chapterId;
  const reason = body.reason;
  const action = body.action || 'FORCE_COMPLETE';
  const score = body.score;

  // Validation: check required fields
  if (!studentId || !chapterId || !reason) {
    return NextResponse.json(
      { message: 'Field wajib: userId, chapterId, reason' },
      { status: 400 }
    );
  }

  // Validate reason length (min 10 chars as per spec)
  if (reason.length < 10) {
    return NextResponse.json(
      { message: 'Alasan harus minimal 10 karakter' },
      { status: 400 }
    );
  }

  // Validate score for FORCE_COMPLETE
  if (action === 'FORCE_COMPLETE') {
    if (score === undefined || score === null) {
      return NextResponse.json(
        { message: 'Skor wajib diisi untuk aksi Luluskan Chapter' },
        { status: 400 }
      );
    }
    if (typeof score !== 'number' || score < 0 || score > 100) {
      return NextResponse.json(
        { message: 'Skor harus antara 0–100' },
        { status: 400 }
      );
    }
  }

  // Validate action value
  const validActions = ['FORCE_COMPLETE', 'RESET_QUIZ', 'UNLOCK_NEXT', 'RESET_PROGRESS'];
  if (!validActions.includes(action)) {
    return NextResponse.json(
      { message: `Aksi tidak valid. Pilihan: ${validActions.join(', ')}` },
      { status: 400 }
    );
  }

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Determine new status based on action
  const newStatusMap: Record<string, string> = {
    FORCE_COMPLETE: 'COMPLETED',
    RESET_QUIZ: 'UNLOCKED',
    UNLOCK_NEXT: 'UNLOCKED',
    RESET_PROGRESS: 'LOCKED',
  };

  return NextResponse.json({
    success: true,
    override: {
      id: `override-${Date.now()}`,
      studentId,
      chapterId,
      action,
      reason,
      score: action === 'FORCE_COMPLETE' ? score : null,
      newStatus: newStatusMap[action],
      adminId: 'admin-001',
      adminName: 'Admin Sekelas',
      createdAt: new Date().toISOString(),
    },
    message: `Penyesuaian berhasil. Aksi "${action}" diterapkan untuk chapter ${chapterId}.`,
  }, { status: 201 });
}
