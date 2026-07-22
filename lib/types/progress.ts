export type ChapterStatus =
  | 'LOCKED'
  | 'UNLOCKED'
  | 'COMPLETED'
  | 'REMEDIATION_REQUIRED'
  | 'READY_FOR_RETAKE';

export type SectionStatus =
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
  scoreHistory: number[]; // Array of scores from attempt 1 to last attempt
  videoWatchAttempts: number;
}

export interface StudentProgress {
  userId: string;
  completedChapters: number;
  totalChapters: number;
  totalXP: number;
  subjectProgress: SubjectProgress[];
}

export interface SubjectProgress {
  subjectId: string;
  subjectName: string;
  completionPercentage: number; // 0 - 100 integer
  preTestCompleted: boolean;
  postTestCompleted: boolean;
  sections: SectionProgress[];
}

export interface SectionProgress {
  sectionId: string;
  sectionName: string;
  status: SectionStatus;
  chapters: ChapterProgress[];
}
