import { NextResponse } from 'next/server';

/**
 * Mock student progress endpoint for development.
 * Returns detailed progress across all materi/bab/chapters.
 */
export async function GET() {
  return NextResponse.json({
    userId: 'student-001',
    completedChapters: 7,
    totalChapters: 24,
    totalXP: 1250,
    currentStreak: 5,
    materiProgress: [
      {
        materiId: 'materi-1',
        materiName: 'Matematika Dasar',
        completionPercentage: 60,
        babs: [
          {
            babId: 'bab-1',
            babName: 'Aljabar Linear',
            completionPercentage: 80,
            chapters: [
              { chapterId: 'ch-1', title: 'Persamaan Linear Satu Variabel', status: 'COMPLETED', watchedPercentage: 100, lastScore: 85, quizAttempts: 1, videoWatchAttempts: 1, xpEarned: 150 },
              { chapterId: 'ch-2', title: 'Persamaan Linear Dua Variabel', status: 'COMPLETED', watchedPercentage: 100, lastScore: 90, quizAttempts: 1, videoWatchAttempts: 1, xpEarned: 150 },
              { chapterId: 'ch-3', title: 'Sistem Persamaan Linear', status: 'UNLOCKED', watchedPercentage: 50, lastScore: null, quizAttempts: 0, videoWatchAttempts: 1, xpEarned: 0 },
              { chapterId: 'ch-4', title: 'Pertidaksamaan Linear', status: 'LOCKED', watchedPercentage: 0, lastScore: null, quizAttempts: 0, videoWatchAttempts: 0, xpEarned: 0 },
            ],
          },
          {
            babId: 'bab-2',
            babName: 'Geometri Dasar',
            completionPercentage: 40,
            chapters: [
              { chapterId: 'ch-5', title: 'Bangun Datar', status: 'COMPLETED', watchedPercentage: 100, lastScore: 75, quizAttempts: 2, videoWatchAttempts: 1, xpEarned: 100 },
              { chapterId: 'ch-6', title: 'Bangun Ruang', status: 'REMEDIATION_REQUIRED', watchedPercentage: 100, lastScore: 45, quizAttempts: 2, videoWatchAttempts: 2, xpEarned: 0 },
              { chapterId: 'ch-7', title: 'Transformasi Geometri', status: 'LOCKED', watchedPercentage: 0, lastScore: null, quizAttempts: 0, videoWatchAttempts: 0, xpEarned: 0 },
            ],
          },
          {
            babId: 'bab-3',
            babName: 'Aritmatika',
            completionPercentage: 100,
            chapters: [
              { chapterId: 'ch-8', title: 'Bilangan Bulat', status: 'COMPLETED', watchedPercentage: 100, lastScore: 95, quizAttempts: 1, videoWatchAttempts: 1, xpEarned: 200 },
              { chapterId: 'ch-9', title: 'Pecahan dan Desimal', status: 'COMPLETED', watchedPercentage: 100, lastScore: 80, quizAttempts: 1, videoWatchAttempts: 1, xpEarned: 150 },
            ],
          },
        ],
      },
      {
        materiId: 'materi-2',
        materiName: 'Fisika Mekanika',
        completionPercentage: 25,
        babs: [
          {
            babId: 'bab-4',
            babName: 'Hukum Newton',
            completionPercentage: 50,
            chapters: [
              { chapterId: 'ch-10', title: 'Hukum Newton I', status: 'COMPLETED', watchedPercentage: 100, lastScore: 88, quizAttempts: 1, videoWatchAttempts: 1, xpEarned: 150 },
              { chapterId: 'ch-11', title: 'Hukum Newton II', status: 'COMPLETED', watchedPercentage: 100, lastScore: 72, quizAttempts: 2, videoWatchAttempts: 1, xpEarned: 100 },
              { chapterId: 'ch-12', title: 'Hukum Newton III', status: 'UNLOCKED', watchedPercentage: 20, lastScore: null, quizAttempts: 0, videoWatchAttempts: 1, xpEarned: 0 },
            ],
          },
          {
            babId: 'bab-5',
            babName: 'Gerak Lurus',
            completionPercentage: 0,
            chapters: [
              { chapterId: 'ch-13', title: 'GLB dan GLBB', status: 'LOCKED', watchedPercentage: 0, lastScore: null, quizAttempts: 0, videoWatchAttempts: 0, xpEarned: 0 },
              { chapterId: 'ch-14', title: 'Gerak Jatuh Bebas', status: 'LOCKED', watchedPercentage: 0, lastScore: null, quizAttempts: 0, videoWatchAttempts: 0, xpEarned: 0 },
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
            completionPercentage: 0,
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
