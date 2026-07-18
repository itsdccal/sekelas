import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock admin student detail endpoint for development.
 * Returns detailed progress for a specific student.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const studentDetails: Record<string, object> = {
    'student-001': {
      userId: 'student-001',
      name: 'Budi Santoso',
      email: 'budi@sekelas.id',
      kelas: '10A',
      joinedAt: '2024-01-05T08:00:00Z',
      lastActive: '2024-01-20T08:30:00Z',
      totalXP: 1250,
      completedChapters: 7,
      totalChapters: 24,
      progressPercentage: 29,
      averageScore: 82,
      totalQuizAttempts: 9,
      totalVideoWatchTime: 185, // minutes
      streakDays: 5,
      materiProgress: [
        {
          materiId: 'materi-1',
          materiName: 'Matematika Dasar',
          completionPercentage: 60,
          averageScore: 85,
          chaptersCompleted: 5,
          totalChapters: 9,
        },
        {
          materiId: 'materi-2',
          materiName: 'Fisika Mekanika',
          completionPercentage: 25,
          averageScore: 78,
          chaptersCompleted: 2,
          totalChapters: 5,
        },
        {
          materiId: 'materi-3',
          materiName: 'Biologi Sel',
          completionPercentage: 0,
          averageScore: null,
          chaptersCompleted: 0,
          totalChapters: 5,
        },
      ],
      recentActivity: [
        { type: 'VIDEO_WATCHED', chapterId: 'ch-3', chapterTitle: 'Sistem Persamaan Linear', timestamp: '2024-01-20T08:30:00Z', details: '50% watched' },
        { type: 'QUIZ_PASSED', chapterId: 'ch-2', chapterTitle: 'Persamaan Linear Dua Variabel', timestamp: '2024-01-19T10:15:00Z', details: 'Score: 90' },
        { type: 'QUIZ_FAILED', chapterId: 'ch-6', chapterTitle: 'Bangun Ruang', timestamp: '2024-01-18T14:00:00Z', details: 'Score: 45 (Attempt 3)' },
        { type: 'XP_EARNED', chapterId: 'ch-11', chapterTitle: 'Hukum Newton II', timestamp: '2024-01-17T09:30:00Z', details: '+100 XP' },
      ],
      badges: [
        { id: 'b1', name: 'Badge Pemula', earnedAt: '2024-01-10T10:00:00Z' },
      ],
      overrideHistory: [],
    },
    'student-004': {
      userId: 'student-004',
      name: 'Putri Anggraini',
      email: 'putri@sekelas.id',
      kelas: '10B',
      joinedAt: '2024-01-03T08:00:00Z',
      lastActive: '2024-01-20T10:00:00Z',
      totalXP: 2850,
      completedChapters: 18,
      totalChapters: 24,
      progressPercentage: 75,
      averageScore: 91,
      totalQuizAttempts: 19,
      totalVideoWatchTime: 420,
      streakDays: 12,
      materiProgress: [
        {
          materiId: 'materi-1',
          materiName: 'Matematika Dasar',
          completionPercentage: 100,
          averageScore: 93,
          chaptersCompleted: 9,
          totalChapters: 9,
        },
        {
          materiId: 'materi-2',
          materiName: 'Fisika Mekanika',
          completionPercentage: 80,
          averageScore: 88,
          chaptersCompleted: 4,
          totalChapters: 5,
        },
        {
          materiId: 'materi-3',
          materiName: 'Biologi Sel',
          completionPercentage: 50,
          averageScore: 86,
          chaptersCompleted: 5,
          totalChapters: 10,
        },
      ],
      recentActivity: [
        { type: 'QUIZ_PASSED', chapterId: 'ch-14', chapterTitle: 'Gerak Jatuh Bebas', timestamp: '2024-01-20T10:00:00Z', details: 'Score: 95' },
        { type: 'VIDEO_WATCHED', chapterId: 'ch-15', chapterTitle: 'Membran Sel', timestamp: '2024-01-20T09:00:00Z', details: '100% watched' },
      ],
      badges: [
        { id: 'b1', name: 'Badge Pemula', earnedAt: '2024-01-06T10:00:00Z' },
        { id: 'b2', name: 'Badge Penjelajah', earnedAt: '2024-01-15T14:00:00Z' },
      ],
      overrideHistory: [],
    },
  };

  const student = studentDetails[userId];

  if (!student) {
    // Return a generic student for any unknown userId
    return NextResponse.json({
      userId,
      name: 'Siswa Demo',
      email: `${userId}@sekelas.id`,
      kelas: '10A',
      joinedAt: '2024-01-05T08:00:00Z',
      lastActive: '2024-01-19T08:30:00Z',
      totalXP: 800,
      completedChapters: 5,
      totalChapters: 24,
      progressPercentage: 21,
      averageScore: 75,
      totalQuizAttempts: 6,
      totalVideoWatchTime: 120,
      streakDays: 2,
      materiProgress: [
        { materiId: 'materi-1', materiName: 'Matematika Dasar', completionPercentage: 33, averageScore: 75, chaptersCompleted: 3, totalChapters: 9 },
        { materiId: 'materi-2', materiName: 'Fisika Mekanika', completionPercentage: 20, averageScore: 72, chaptersCompleted: 1, totalChapters: 5 },
        { materiId: 'materi-3', materiName: 'Biologi Sel', completionPercentage: 10, averageScore: 78, chaptersCompleted: 1, totalChapters: 10 },
      ],
      recentActivity: [
        { type: 'VIDEO_WATCHED', chapterId: 'ch-5', chapterTitle: 'Bangun Datar', timestamp: '2024-01-19T08:30:00Z', details: '100% watched' },
      ],
      badges: [],
      overrideHistory: [],
    });
  }

  return NextResponse.json(student);
}
