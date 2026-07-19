import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock admin student detail endpoint for development.
 * Returns detailed progress for a specific student with full hierarchy
 * (Materi → Bab → Chapter) matching the StudentProgress type.
 *
 * This mock data supports testing override functionality — multiple chapters
 * have statuses other than COMPLETED (LOCKED, UNLOCKED, REMEDIATION_REQUIRED,
 * READY_FOR_RETAKE) which can be targeted for override.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const studentDetails: Record<string, object> = {
    'student-001': {
      userId: 'student-001',
      completedChapters: 7,
      totalChapters: 24,
      totalXP: 1250,
      materiProgress: [
        {
          materiId: 'materi-1',
          materiName: 'Matematika Dasar',
          completionPercentage: 56,
          babs: [
            {
              babId: 'bab-1',
              babName: 'Aljabar Dasar',
              status: 'IN_PROGRESS',
              preTestCompleted: true,
              postTestCompleted: false,
              preTestScore: 60,
              postTestScore: null,
              chapters: [
                { chapterId: 'ch-1', status: 'COMPLETED', watchedPercentage: 100, lastScore: 85, quizAttempts: 1, videoWatchAttempts: 1 },
                { chapterId: 'ch-2', status: 'COMPLETED', watchedPercentage: 100, lastScore: 90, quizAttempts: 1, videoWatchAttempts: 1 },
                { chapterId: 'ch-3', status: 'REMEDIATION_REQUIRED', watchedPercentage: 100, lastScore: 45, quizAttempts: 2, videoWatchAttempts: 2 },
              ],
            },
            {
              babId: 'bab-2',
              babName: 'Geometri',
              status: 'IN_PROGRESS',
              preTestCompleted: true,
              postTestCompleted: false,
              preTestScore: 40,
              postTestScore: null,
              chapters: [
                { chapterId: 'ch-4', status: 'COMPLETED', watchedPercentage: 100, lastScore: 80, quizAttempts: 1, videoWatchAttempts: 1 },
                { chapterId: 'ch-5', status: 'COMPLETED', watchedPercentage: 100, lastScore: 75, quizAttempts: 2, videoWatchAttempts: 1 },
                { chapterId: 'ch-6', status: 'READY_FOR_RETAKE', watchedPercentage: 100, lastScore: 50, quizAttempts: 3, videoWatchAttempts: 3 },
              ],
            },
            {
              babId: 'bab-3',
              babName: 'Statistika',
              status: 'LOCKED',
              preTestCompleted: false,
              postTestCompleted: false,
              preTestScore: null,
              postTestScore: null,
              chapters: [
                { chapterId: 'ch-7', status: 'LOCKED', watchedPercentage: 0, lastScore: null, quizAttempts: 0, videoWatchAttempts: 0 },
                { chapterId: 'ch-8', status: 'LOCKED', watchedPercentage: 0, lastScore: null, quizAttempts: 0, videoWatchAttempts: 0 },
                { chapterId: 'ch-9', status: 'LOCKED', watchedPercentage: 0, lastScore: null, quizAttempts: 0, videoWatchAttempts: 0 },
              ],
            },
          ],
        },
        {
          materiId: 'materi-2',
          materiName: 'Fisika Mekanika',
          completionPercentage: 40,
          babs: [
            {
              babId: 'bab-4',
              babName: 'Hukum Newton',
              status: 'IN_PROGRESS',
              preTestCompleted: true,
              postTestCompleted: false,
              preTestScore: 50,
              postTestScore: null,
              chapters: [
                { chapterId: 'ch-10', status: 'COMPLETED', watchedPercentage: 100, lastScore: 88, quizAttempts: 1, videoWatchAttempts: 1 },
                { chapterId: 'ch-11', status: 'COMPLETED', watchedPercentage: 100, lastScore: 82, quizAttempts: 1, videoWatchAttempts: 1 },
                { chapterId: 'ch-12', status: 'UNLOCKED', watchedPercentage: 30, lastScore: null, quizAttempts: 0, videoWatchAttempts: 1 },
              ],
            },
            {
              babId: 'bab-5',
              babName: 'Gerak dan Energi',
              status: 'LOCKED',
              preTestCompleted: false,
              postTestCompleted: false,
              preTestScore: null,
              postTestScore: null,
              chapters: [
                { chapterId: 'ch-13', status: 'LOCKED', watchedPercentage: 0, lastScore: null, quizAttempts: 0, videoWatchAttempts: 0 },
                { chapterId: 'ch-14', status: 'LOCKED', watchedPercentage: 0, lastScore: null, quizAttempts: 0, videoWatchAttempts: 0 },
              ],
            },
          ],
        },
        {
          materiId: 'materi-3',
          materiName: 'Biologi Sel',
          completionPercentage: 0,
          babs: [
            {
              babId: 'bab-6',
              babName: 'Struktur Sel',
              status: 'LOCKED',
              preTestCompleted: false,
              postTestCompleted: false,
              preTestScore: null,
              postTestScore: null,
              chapters: [
                { chapterId: 'ch-15', status: 'LOCKED', watchedPercentage: 0, lastScore: null, quizAttempts: 0, videoWatchAttempts: 0 },
                { chapterId: 'ch-16', status: 'LOCKED', watchedPercentage: 0, lastScore: null, quizAttempts: 0, videoWatchAttempts: 0 },
                { chapterId: 'ch-17', status: 'LOCKED', watchedPercentage: 0, lastScore: null, quizAttempts: 0, videoWatchAttempts: 0 },
              ],
            },
          ],
        },
      ],
    },
    'student-003': {
      userId: 'student-003',
      completedChapters: 3,
      totalChapters: 24,
      totalXP: 450,
      materiProgress: [
        {
          materiId: 'materi-1',
          materiName: 'Matematika Dasar',
          completionPercentage: 33,
          babs: [
            {
              babId: 'bab-1',
              babName: 'Aljabar Dasar',
              status: 'IN_PROGRESS',
              preTestCompleted: true,
              postTestCompleted: false,
              preTestScore: 30,
              postTestScore: null,
              chapters: [
                { chapterId: 'ch-1', status: 'COMPLETED', watchedPercentage: 100, lastScore: 72, quizAttempts: 2, videoWatchAttempts: 2 },
                { chapterId: 'ch-2', status: 'COMPLETED', watchedPercentage: 100, lastScore: 70, quizAttempts: 3, videoWatchAttempts: 2 },
                { chapterId: 'ch-3', status: 'REMEDIATION_REQUIRED', watchedPercentage: 50, lastScore: 40, quizAttempts: 4, videoWatchAttempts: 3 },
              ],
            },
            {
              babId: 'bab-2',
              babName: 'Geometri',
              status: 'LOCKED',
              preTestCompleted: false,
              postTestCompleted: false,
              preTestScore: null,
              postTestScore: null,
              chapters: [
                { chapterId: 'ch-4', status: 'LOCKED', watchedPercentage: 0, lastScore: null, quizAttempts: 0, videoWatchAttempts: 0 },
                { chapterId: 'ch-5', status: 'LOCKED', watchedPercentage: 0, lastScore: null, quizAttempts: 0, videoWatchAttempts: 0 },
                { chapterId: 'ch-6', status: 'LOCKED', watchedPercentage: 0, lastScore: null, quizAttempts: 0, videoWatchAttempts: 0 },
              ],
            },
          ],
        },
        {
          materiId: 'materi-2',
          materiName: 'Fisika Mekanika',
          completionPercentage: 20,
          babs: [
            {
              babId: 'bab-4',
              babName: 'Hukum Newton',
              status: 'IN_PROGRESS',
              preTestCompleted: true,
              postTestCompleted: false,
              preTestScore: 20,
              postTestScore: null,
              chapters: [
                { chapterId: 'ch-10', status: 'COMPLETED', watchedPercentage: 100, lastScore: 75, quizAttempts: 1, videoWatchAttempts: 1 },
                { chapterId: 'ch-11', status: 'UNLOCKED', watchedPercentage: 60, lastScore: null, quizAttempts: 0, videoWatchAttempts: 1 },
                { chapterId: 'ch-12', status: 'LOCKED', watchedPercentage: 0, lastScore: null, quizAttempts: 0, videoWatchAttempts: 0 },
              ],
            },
          ],
        },
      ],
    },
    'student-004': {
      userId: 'student-004',
      completedChapters: 18,
      totalChapters: 24,
      totalXP: 2850,
      materiProgress: [
        {
          materiId: 'materi-1',
          materiName: 'Matematika Dasar',
          completionPercentage: 100,
          babs: [
            {
              babId: 'bab-1',
              babName: 'Aljabar Dasar',
              status: 'COMPLETED',
              preTestCompleted: true,
              postTestCompleted: true,
              preTestScore: 80,
              postTestScore: 92,
              chapters: [
                { chapterId: 'ch-1', status: 'COMPLETED', watchedPercentage: 100, lastScore: 95, quizAttempts: 1, videoWatchAttempts: 1 },
                { chapterId: 'ch-2', status: 'COMPLETED', watchedPercentage: 100, lastScore: 90, quizAttempts: 1, videoWatchAttempts: 1 },
                { chapterId: 'ch-3', status: 'COMPLETED', watchedPercentage: 100, lastScore: 88, quizAttempts: 1, videoWatchAttempts: 1 },
              ],
            },
            {
              babId: 'bab-2',
              babName: 'Geometri',
              status: 'COMPLETED',
              preTestCompleted: true,
              postTestCompleted: true,
              preTestScore: 70,
              postTestScore: 85,
              chapters: [
                { chapterId: 'ch-4', status: 'COMPLETED', watchedPercentage: 100, lastScore: 92, quizAttempts: 1, videoWatchAttempts: 1 },
                { chapterId: 'ch-5', status: 'COMPLETED', watchedPercentage: 100, lastScore: 87, quizAttempts: 1, videoWatchAttempts: 1 },
                { chapterId: 'ch-6', status: 'COMPLETED', watchedPercentage: 100, lastScore: 85, quizAttempts: 2, videoWatchAttempts: 1 },
              ],
            },
            {
              babId: 'bab-3',
              babName: 'Statistika',
              status: 'COMPLETED',
              preTestCompleted: true,
              postTestCompleted: true,
              preTestScore: 75,
              postTestScore: 90,
              chapters: [
                { chapterId: 'ch-7', status: 'COMPLETED', watchedPercentage: 100, lastScore: 93, quizAttempts: 1, videoWatchAttempts: 1 },
                { chapterId: 'ch-8', status: 'COMPLETED', watchedPercentage: 100, lastScore: 91, quizAttempts: 1, videoWatchAttempts: 1 },
                { chapterId: 'ch-9', status: 'COMPLETED', watchedPercentage: 100, lastScore: 94, quizAttempts: 1, videoWatchAttempts: 1 },
              ],
            },
          ],
        },
        {
          materiId: 'materi-2',
          materiName: 'Fisika Mekanika',
          completionPercentage: 80,
          babs: [
            {
              babId: 'bab-4',
              babName: 'Hukum Newton',
              status: 'COMPLETED',
              preTestCompleted: true,
              postTestCompleted: true,
              preTestScore: 60,
              postTestScore: 88,
              chapters: [
                { chapterId: 'ch-10', status: 'COMPLETED', watchedPercentage: 100, lastScore: 90, quizAttempts: 1, videoWatchAttempts: 1 },
                { chapterId: 'ch-11', status: 'COMPLETED', watchedPercentage: 100, lastScore: 85, quizAttempts: 1, videoWatchAttempts: 1 },
                { chapterId: 'ch-12', status: 'COMPLETED', watchedPercentage: 100, lastScore: 88, quizAttempts: 1, videoWatchAttempts: 1 },
              ],
            },
            {
              babId: 'bab-5',
              babName: 'Gerak dan Energi',
              status: 'IN_PROGRESS',
              preTestCompleted: true,
              postTestCompleted: false,
              preTestScore: 55,
              postTestScore: null,
              chapters: [
                { chapterId: 'ch-13', status: 'COMPLETED', watchedPercentage: 100, lastScore: 92, quizAttempts: 1, videoWatchAttempts: 1 },
                { chapterId: 'ch-14', status: 'READY_FOR_RETAKE', watchedPercentage: 100, lastScore: 55, quizAttempts: 2, videoWatchAttempts: 2 },
              ],
            },
          ],
        },
        {
          materiId: 'materi-3',
          materiName: 'Biologi Sel',
          completionPercentage: 50,
          babs: [
            {
              babId: 'bab-6',
              babName: 'Struktur Sel',
              status: 'IN_PROGRESS',
              preTestCompleted: true,
              postTestCompleted: false,
              preTestScore: 45,
              postTestScore: null,
              chapters: [
                { chapterId: 'ch-15', status: 'COMPLETED', watchedPercentage: 100, lastScore: 80, quizAttempts: 1, videoWatchAttempts: 1 },
                { chapterId: 'ch-16', status: 'COMPLETED', watchedPercentage: 100, lastScore: 78, quizAttempts: 1, videoWatchAttempts: 1 },
                { chapterId: 'ch-17', status: 'COMPLETED', watchedPercentage: 100, lastScore: 82, quizAttempts: 1, videoWatchAttempts: 1 },
                { chapterId: 'ch-18', status: 'COMPLETED', watchedPercentage: 100, lastScore: 85, quizAttempts: 1, videoWatchAttempts: 1 },
                { chapterId: 'ch-19', status: 'COMPLETED', watchedPercentage: 100, lastScore: 79, quizAttempts: 1, videoWatchAttempts: 1 },
                { chapterId: 'ch-20', status: 'UNLOCKED', watchedPercentage: 40, lastScore: null, quizAttempts: 0, videoWatchAttempts: 1 },
                { chapterId: 'ch-21', status: 'LOCKED', watchedPercentage: 0, lastScore: null, quizAttempts: 0, videoWatchAttempts: 0 },
                { chapterId: 'ch-22', status: 'LOCKED', watchedPercentage: 0, lastScore: null, quizAttempts: 0, videoWatchAttempts: 0 },
                { chapterId: 'ch-23', status: 'LOCKED', watchedPercentage: 0, lastScore: null, quizAttempts: 0, videoWatchAttempts: 0 },
                { chapterId: 'ch-24', status: 'LOCKED', watchedPercentage: 0, lastScore: null, quizAttempts: 0, videoWatchAttempts: 0 },
              ],
            },
          ],
        },
      ],
    },
    'student-005': {
      userId: 'student-005',
      completedChapters: 0,
      totalChapters: 24,
      totalXP: 50,
      materiProgress: [
        {
          materiId: 'materi-1',
          materiName: 'Matematika Dasar',
          completionPercentage: 0,
          babs: [
            {
              babId: 'bab-1',
              babName: 'Aljabar Dasar',
              status: 'UNLOCKED',
              preTestCompleted: false,
              postTestCompleted: false,
              preTestScore: null,
              postTestScore: null,
              chapters: [
                { chapterId: 'ch-1', status: 'UNLOCKED', watchedPercentage: 15, lastScore: null, quizAttempts: 0, videoWatchAttempts: 1 },
                { chapterId: 'ch-2', status: 'LOCKED', watchedPercentage: 0, lastScore: null, quizAttempts: 0, videoWatchAttempts: 0 },
                { chapterId: 'ch-3', status: 'LOCKED', watchedPercentage: 0, lastScore: null, quizAttempts: 0, videoWatchAttempts: 0 },
              ],
            },
          ],
        },
      ],
    },
    'student-014': {
      userId: 'student-014',
      completedChapters: 2,
      totalChapters: 24,
      totalXP: 280,
      materiProgress: [
        {
          materiId: 'materi-1',
          materiName: 'Matematika Dasar',
          completionPercentage: 22,
          babs: [
            {
              babId: 'bab-1',
              babName: 'Aljabar Dasar',
              status: 'IN_PROGRESS',
              preTestCompleted: true,
              postTestCompleted: false,
              preTestScore: 25,
              postTestScore: null,
              chapters: [
                { chapterId: 'ch-1', status: 'COMPLETED', watchedPercentage: 100, lastScore: 70, quizAttempts: 3, videoWatchAttempts: 3 },
                { chapterId: 'ch-2', status: 'COMPLETED', watchedPercentage: 100, lastScore: 72, quizAttempts: 2, videoWatchAttempts: 2 },
                { chapterId: 'ch-3', status: 'REMEDIATION_REQUIRED', watchedPercentage: 20, lastScore: 35, quizAttempts: 5, videoWatchAttempts: 4 },
              ],
            },
          ],
        },
      ],
    },
  };

  const student = studentDetails[userId];

  if (!student) {
    // Return generic student data for any unknown userId — useful for testing override
    return NextResponse.json({
      userId,
      completedChapters: 5,
      totalChapters: 24,
      totalXP: 800,
      materiProgress: [
        {
          materiId: 'materi-1',
          materiName: 'Matematika Dasar',
          completionPercentage: 33,
          babs: [
            {
              babId: 'bab-1',
              babName: 'Aljabar Dasar',
              status: 'IN_PROGRESS',
              preTestCompleted: true,
              postTestCompleted: false,
              preTestScore: 50,
              postTestScore: null,
              chapters: [
                { chapterId: 'ch-1', status: 'COMPLETED', watchedPercentage: 100, lastScore: 78, quizAttempts: 1, videoWatchAttempts: 1 },
                { chapterId: 'ch-2', status: 'COMPLETED', watchedPercentage: 100, lastScore: 80, quizAttempts: 1, videoWatchAttempts: 1 },
                { chapterId: 'ch-3', status: 'REMEDIATION_REQUIRED', watchedPercentage: 100, lastScore: 45, quizAttempts: 3, videoWatchAttempts: 2 },
              ],
            },
            {
              babId: 'bab-2',
              babName: 'Geometri',
              status: 'IN_PROGRESS',
              preTestCompleted: true,
              postTestCompleted: false,
              preTestScore: 40,
              postTestScore: null,
              chapters: [
                { chapterId: 'ch-4', status: 'COMPLETED', watchedPercentage: 100, lastScore: 85, quizAttempts: 1, videoWatchAttempts: 1 },
                { chapterId: 'ch-5', status: 'COMPLETED', watchedPercentage: 100, lastScore: 76, quizAttempts: 2, videoWatchAttempts: 1 },
                { chapterId: 'ch-6', status: 'READY_FOR_RETAKE', watchedPercentage: 100, lastScore: 50, quizAttempts: 2, videoWatchAttempts: 2 },
              ],
            },
            {
              babId: 'bab-3',
              babName: 'Statistika',
              status: 'LOCKED',
              preTestCompleted: false,
              postTestCompleted: false,
              preTestScore: null,
              postTestScore: null,
              chapters: [
                { chapterId: 'ch-7', status: 'LOCKED', watchedPercentage: 0, lastScore: null, quizAttempts: 0, videoWatchAttempts: 0 },
                { chapterId: 'ch-8', status: 'LOCKED', watchedPercentage: 0, lastScore: null, quizAttempts: 0, videoWatchAttempts: 0 },
                { chapterId: 'ch-9', status: 'LOCKED', watchedPercentage: 0, lastScore: null, quizAttempts: 0, videoWatchAttempts: 0 },
              ],
            },
          ],
        },
        {
          materiId: 'materi-2',
          materiName: 'Fisika Mekanika',
          completionPercentage: 20,
          babs: [
            {
              babId: 'bab-4',
              babName: 'Hukum Newton',
              status: 'IN_PROGRESS',
              preTestCompleted: true,
              postTestCompleted: false,
              preTestScore: 35,
              postTestScore: null,
              chapters: [
                { chapterId: 'ch-10', status: 'COMPLETED', watchedPercentage: 100, lastScore: 72, quizAttempts: 1, videoWatchAttempts: 1 },
                { chapterId: 'ch-11', status: 'UNLOCKED', watchedPercentage: 50, lastScore: null, quizAttempts: 0, videoWatchAttempts: 1 },
                { chapterId: 'ch-12', status: 'LOCKED', watchedPercentage: 0, lastScore: null, quizAttempts: 0, videoWatchAttempts: 0 },
              ],
            },
          ],
        },
      ],
    });
  }

  return NextResponse.json(student);
}
