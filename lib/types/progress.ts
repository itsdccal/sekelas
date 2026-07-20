export type ChapterStatus =
  | 'LOCKED'
  | 'UNLOCKED'
  | 'COMPLETED'
  | 'REMEDIATION_REQUIRED'
  | 'READY_FOR_RETAKE';

export type BabStatus =
  | 'LOCKED'
  | 'UNLOCKED'
  | 'IN_PROGRESS'
  | 'COMPLETED'; // completed = Post Test lulus

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
  preTestCompleted: boolean;
  postTestCompleted: boolean;
  babs: BabProgress[];
}

export interface BabProgress {
  babId: string;
  babName: string;
  status: BabStatus;
  chapters: ChapterProgress[];
}
