export type ChapterStatus =
  | 'LOCKED'
  | 'UNLOCKED'
  | 'COMPLETED'
  | 'REMEDIATION_REQUIRED'
  | 'READY_FOR_RETAKE';

export interface ChapterProgress {
  chapterId: string;
  status: ChapterStatus;
  watchedPercentage: number; // 0.0 - 100.0
  lastScore: number | null;
  quizAttempts: number;
  videoWatchAttempts: number;
}

export interface StudentProgress {
  userId: string;
  completedChapters: number;
  totalChapters: number;
  totalXP: number;
  materiProgress: MateriProgress[];
}

export interface MateriProgress {
  materiId: string;
  materiName: string;
  completionPercentage: number; // 0 - 100 integer
  babs: BabProgress[];
}

export interface BabProgress {
  babId: string;
  babName: string;
  chapters: ChapterProgress[];
}
