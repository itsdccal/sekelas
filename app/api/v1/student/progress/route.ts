import { NextResponse } from 'next/server';

/**
 * Mock student progress endpoint for development.
 * Returns detailed progress across all materi/bab/chapters
 * including pre-test and post-test scores for raport.
 */
export async function GET() {
  return NextResponse.json({
    userId: 'student-001',
    completedChapters: 7,
    totalChapters: 24,
    totalXP: 1250,
    currentStreak: 5,
    subjectProgress: [
      {
        subjectId: 'materi-1',
        subjectName: 'Matematika Dasar',
        completionPercentage: 60,
        sections: [
          {
            sectionId: 'bab-1',
            sectionName: 'Aljabar Linear',
            status: 'COMPLETED',
            preTestCompleted: true,
            postTestCompleted: true,
            preTestScore: 45,
            postTestScore: 88,
            chapters: [
              { chapterId: 'ch-1', title: 'Persamaan Linear Satu Variabel', status: 'COMPLETED', watchedPercentage: 100, lastScore: 85, quizAttempts: 1, videoWatchAttempts: 1, xpEarned: 150 },
              { chapterId: 'ch-2', title: 'Persamaan Linear Dua Variabel', status: 'COMPLETED', watchedPercentage: 100, lastScore: 90, quizAttempts: 1, videoWatchAttempts: 1, xpEarned: 150 },
              { chapterId: 'ch-3', title: 'Sistem Persamaan Linear', status: 'UNLOCKED', watchedPercentage: 50, lastScore: null, quizAttempts: 0, videoWatchAttempts: 1, xpEarned: 0 },
              { chapterId: 'ch-4', title: 'Pertidaksamaan Linear', status: 'LOCKED', watchedPercentage: 0, lastScore: null, quizAttempts: 0, videoWatchAttempts: 0, xpEarned: 0 },
            ],
          },
          {
            sectionId: 'bab-2',
            sectionName: 'Geometri Dasar',
            status: 'IN_PROGRESS',
            preTestCompleted: true,
            postTestCompleted: false,
            preTestScore: 30,
            postTestScore: null,
            chapters: [
              { chapterId: 'ch-5', title: 'Bangun Datar', status: 'COMPLETED', watchedPercentage: 100, lastScore: 75, quizAttempts: 2, videoWatchAttempts: 1, xpEarned: 100 },
              { chapterId: 'ch-6', title: 'Bangun Ruang', status: 'COMPLETED', watchedPercentage: 100, lastScore: 80, quizAttempts: 2, videoWatchAttempts: 1, xpEarned: 100 },
              { chapterId: 'ch-7', title: 'Transformasi Geometri', status: 'COMPLETED', watchedPercentage: 100, lastScore: 85, quizAttempts: 1, videoWatchAttempts: 1, xpEarned: 150 },
            ],
          },
          {
            sectionId: 'bab-3',
            sectionName: 'Aritmatika',
            status: 'COMPLETED',
            preTestCompleted: true,
            postTestCompleted: true,
            preTestScore: 55,
            postTestScore: 95,
            chapters: [
              { chapterId: 'ch-8', title: 'Bilangan Bulat', status: 'COMPLETED', watchedPercentage: 100, lastScore: 95, quizAttempts: 1, videoWatchAttempts: 1, xpEarned: 200 },
              { chapterId: 'ch-9', title: 'Pecahan dan Desimal', status: 'COMPLETED', watchedPercentage: 100, lastScore: 80, quizAttempts: 1, videoWatchAttempts: 1, xpEarned: 150 },
            ],
          },
        ],
      },
      {
        subjectId: 'materi-2',
        subjectName: 'Fisika Mekanika',
        completionPercentage: 25,
        sections: [
          {
            sectionId: 'bab-4',
            sectionName: 'Hukum Newton',
            status: 'IN_PROGRESS',
            preTestCompleted: true,
            postTestCompleted: false,
            preTestScore: 40,
            postTestScore: null,
            chapters: [
              { chapterId: 'ch-10', title: 'Hukum Newton I', status: 'COMPLETED', watchedPercentage: 100, lastScore: 88, quizAttempts: 1, videoWatchAttempts: 1, xpEarned: 150 },
              { chapterId: 'ch-11', title: 'Hukum Newton II', status: 'COMPLETED', watchedPercentage: 100, lastScore: 72, quizAttempts: 2, videoWatchAttempts: 1, xpEarned: 100 },
              { chapterId: 'ch-12', title: 'Hukum Newton III', status: 'COMPLETED', watchedPercentage: 100, lastScore: 90, quizAttempts: 1, videoWatchAttempts: 1, xpEarned: 150 },
            ],
          },
          {
            sectionId: 'bab-5',
            sectionName: 'Gerak Lurus',
            status: 'LOCKED',
            preTestCompleted: false,
            postTestCompleted: false,
            preTestScore: null,
            postTestScore: null,
            chapters: [
              { chapterId: 'ch-13', title: 'GLB dan GLBB', status: 'LOCKED', watchedPercentage: 0, lastScore: null, quizAttempts: 0, videoWatchAttempts: 0, xpEarned: 0 },
              { chapterId: 'ch-14', title: 'Gerak Jatuh Bebas', status: 'LOCKED', watchedPercentage: 0, lastScore: null, quizAttempts: 0, videoWatchAttempts: 0, xpEarned: 0 },
            ],
          },
        ],
      },
      {
        subjectId: 'materi-3',
        subjectName: 'Biologi Sel',
        completionPercentage: 0,
        sections: [
          {
            sectionId: 'bab-6',
            sectionName: 'Struktur Sel',
            status: 'LOCKED',
            preTestCompleted: false,
            postTestCompleted: false,
            preTestScore: null,
            postTestScore: null,
            chapters: [
              { chapterId: 'ch-15', title: 'Membran Sel', status: 'LOCKED', watchedPercentage: 0, lastScore: null, quizAttempts: 0, videoWatchAttempts: 0, xpEarned: 0 },
              { chapterId: 'ch-16', title: 'Organel Sel', status: 'LOCKED', watchedPercentage: 0, lastScore: null, quizAttempts: 0, videoWatchAttempts: 0, xpEarned: 0 },
            ],
          },
        ],
      },
    ],
  });
}
