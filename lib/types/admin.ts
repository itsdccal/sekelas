export type OverrideAction = 'FORCE_COMPLETE';

// --- Student Answer Review ---

export type AnswerReviewStatus = 'PENDING' | 'GRADED';
export type QuizTypeLabel = 'PRE_TEST' | 'POST_TEST' | 'CHAPTER_QUIZ';

export interface StudentAnswerItem {
  questionId: string;
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'SHORT_ANSWER';
  imageUrl?: string;
  // For multiple choice
  options?: { id: string; text: string }[];
  selectedOptionId?: string;
  correctOptionId?: string;
  isCorrect?: boolean;
  // For short answer / essay
  textAnswer?: string;
  adminScore?: number | null; // 0-100, null = belum dinilai
  adminNote?: string | null;
  // Meta
  weight: number; // bobot soal
  xpPerQuestion?: number;
}

export interface StudentSubmission {
  submissionId: string;
  quizType: QuizTypeLabel;
  subjectId?: string;
  subjectName?: string;
  sectionId?: string;
  sectionName?: string;
  chapterId?: string;
  chapterName?: string;
  submittedAt: string; // ISO
  score: number | null; // null if has ungraded SHORT_ANSWER
  status: AnswerReviewStatus; // PENDING = ada soal isian belum dinilai
  answers: StudentAnswerItem[];
}

export interface StudentSubmissionsResponse {
  userId: string;
  pendingGradeCount: number; // berapa submission yg masih PENDING
  submissions: StudentSubmission[];
}

export interface GradeAnswerRequest {
  submissionId: string;
  questionId: string;
  score: number; // 0-100
  note?: string;
}

export const OVERRIDE_ACTION_LABELS: Record<OverrideAction, string> = {
  FORCE_COMPLETE: 'Luluskan Chapter',
};

export interface AuditLogEntry {
  id: string;
  adminId: string;
  adminName: string;
  studentId: string;
  studentName: string;
  chapterId: string;
  chapterName: string;
  action: OverrideAction;
  reason: string;
  score?: number | null; // Skor yang diberikan (jika FORCE_COMPLETE)
  createdAt: string; // ISO datetime
}

export interface OverrideRequest {
  userId: string;
  chapterId: string;
  action: OverrideAction;
  reason: string; // min 10, max 500 chars
  score?: number; // 0-100, wajib jika action = FORCE_COMPLETE
}

export interface StudentMonitoringRow {
  userId: string;
  name: string;
  kelas: string;
  totalProgress: number; // 0-100 integer
  totalXP: number;
  averageScore: number | null; // Rata-rata nilai quiz (null jika belum ada)
}

export interface VideoUploadResponse {
  videoUrl: string;
  thumbnailUrl: string;
}
