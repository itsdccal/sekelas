import { NextRequest, NextResponse } from 'next/server';

const SAMPLE_VIDEO_URL = '/sample-video.mp4';

/**
 * Mock chapter video info/progress endpoint for development.
 * Returns chapter progress with different statuses based on chapterId.
 * For UNLOCKED and COMPLETED chapters, videoUrl points to a real playable video.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  const { chapterId } = await params;

  /** Resolve videoUrl based on chapter status */
  function getVideoUrl(status: string): string {
    if (status === 'UNLOCKED' || status === 'COMPLETED') {
      return SAMPLE_VIDEO_URL;
    }
    return `/api/v1/video/chapter/${chapterId}/stream`;
  }

  const chapterProgress: Record<string, {
    chapterId: string;
    title: string;
    status: string;
    watchedPercentage: number;
    videoUrl: string;
    videoDurationMinutes: number;
    lastScore: number | null;
    quizAttempts: number;
    scoreHistory: number[];
    passingGrade: number;
    maxAttempts: number;
    nextChapterId: string | null;
  }> = {
    'ch-1': {
      chapterId: 'ch-1',
      title: 'Persamaan Linear Satu Variabel',
      status: 'COMPLETED',
      watchedPercentage: 100,
      videoUrl: SAMPLE_VIDEO_URL,
      videoDurationMinutes: 12,
      lastScore: 85,
      quizAttempts: 1,
      scoreHistory: [85],
      passingGrade: 70,
      maxAttempts: 3,
      nextChapterId: 'ch-2',
    },
    'ch-2': {
      chapterId: 'ch-2',
      title: 'Persamaan Linear Dua Variabel',
      status: 'COMPLETED',
      watchedPercentage: 100,
      videoUrl: SAMPLE_VIDEO_URL,
      videoDurationMinutes: 15,
      lastScore: 90,
      quizAttempts: 1,
      scoreHistory: [90],
      passingGrade: 70,
      maxAttempts: 3,
      nextChapterId: 'ch-3',
    },
    'ch-3': {
      chapterId: 'ch-3',
      title: 'Sistem Persamaan Linear',
      status: 'UNLOCKED',
      watchedPercentage: 50,
      videoUrl: SAMPLE_VIDEO_URL,
      videoDurationMinutes: 18,
      lastScore: null,
      quizAttempts: 0,
      scoreHistory: [],
      passingGrade: 70,
      maxAttempts: 3,
      nextChapterId: 'ch-4',
    },
    'ch-4': {
      chapterId: 'ch-4',
      title: 'Pertidaksamaan Linear',
      status: 'LOCKED',
      watchedPercentage: 0,
      videoUrl: '/api/v1/video/chapter/ch-4/stream',
      videoDurationMinutes: 14,
      lastScore: null,
      quizAttempts: 0,
      scoreHistory: [],
      passingGrade: 70,
      maxAttempts: 3,
      nextChapterId: 'ch-5',
    },
    'ch-5': {
      chapterId: 'ch-5',
      title: 'Bangun Datar',
      status: 'COMPLETED',
      watchedPercentage: 100,
      videoUrl: SAMPLE_VIDEO_URL,
      videoDurationMinutes: 20,
      lastScore: 75,
      quizAttempts: 2,
      scoreHistory: [55, 75],
      passingGrade: 70,
      maxAttempts: 3,
      nextChapterId: 'ch-6',
    },
    'ch-6': {
      chapterId: 'ch-6',
      title: 'Bangun Ruang',
      status: 'COMPLETED',
      watchedPercentage: 100,
      videoUrl: SAMPLE_VIDEO_URL,
      videoDurationMinutes: 22,
      lastScore: 80,
      quizAttempts: 2,
      scoreHistory: [60, 80],
      passingGrade: 70,
      maxAttempts: 3,
      nextChapterId: 'ch-7',
    },
    'ch-7': {
      chapterId: 'ch-7',
      title: 'Transformasi Geometri',
      status: 'COMPLETED',
      watchedPercentage: 100,
      videoUrl: SAMPLE_VIDEO_URL,
      videoDurationMinutes: 16,
      lastScore: 85,
      quizAttempts: 1,
      scoreHistory: [85],
      passingGrade: 75,
      maxAttempts: 3,
      nextChapterId: 'ch-8',
    },
    'ch-8': {
      chapterId: 'ch-8',
      title: 'Bilangan Bulat',
      status: 'COMPLETED',
      watchedPercentage: 100,
      videoUrl: SAMPLE_VIDEO_URL,
      videoDurationMinutes: 12,
      lastScore: 95,
      quizAttempts: 1,
      scoreHistory: [95],
      passingGrade: 70,
      maxAttempts: 3,
      nextChapterId: 'ch-9',
    },
    'ch-9': {
      chapterId: 'ch-9',
      title: 'Pecahan dan Desimal',
      status: 'COMPLETED',
      watchedPercentage: 100,
      videoUrl: SAMPLE_VIDEO_URL,
      videoDurationMinutes: 14,
      lastScore: 80,
      quizAttempts: 1,
      scoreHistory: [80],
      passingGrade: 70,
      maxAttempts: 3,
      nextChapterId: 'ch-10',
    },
    'ch-10': {
      chapterId: 'ch-10',
      title: 'Hukum Newton I',
      status: 'COMPLETED',
      watchedPercentage: 100,
      videoUrl: SAMPLE_VIDEO_URL,
      videoDurationMinutes: 18,
      lastScore: 88,
      quizAttempts: 1,
      scoreHistory: [88],
      passingGrade: 70,
      maxAttempts: 3,
      nextChapterId: 'ch-11',
    },
    'ch-11': {
      chapterId: 'ch-11',
      title: 'Hukum Newton II',
      status: 'COMPLETED',
      watchedPercentage: 100,
      videoUrl: SAMPLE_VIDEO_URL,
      videoDurationMinutes: 20,
      lastScore: 72,
      quizAttempts: 2,
      scoreHistory: [50, 72],
      passingGrade: 70,
      maxAttempts: 3,
      nextChapterId: 'ch-12',
    },
    'ch-12': {
      chapterId: 'ch-12',
      title: 'Hukum Newton III',
      status: 'COMPLETED',
      watchedPercentage: 100,
      videoUrl: SAMPLE_VIDEO_URL,
      videoDurationMinutes: 15,
      lastScore: 90,
      quizAttempts: 1,
      scoreHistory: [90],
      passingGrade: 70,
      maxAttempts: 3,
      nextChapterId: null,
    },
  };

  const progress = chapterProgress[chapterId];

  if (!progress) {
    // Return a default LOCKED state for unknown chapters
    const status = 'LOCKED';
    return NextResponse.json({
      chapterId,
      title: `Chapter ${chapterId}`,
      status,
      watchedPercentage: 0,
      videoUrl: getVideoUrl(status),
      videoDurationMinutes: 15,
      lastScore: null,
      quizAttempts: 0,
      scoreHistory: [],
      passingGrade: 70,
      maxAttempts: 3,
      nextChapterId: null,
    });
  }

  return NextResponse.json(progress);
}
