export type OverrideAction = 'FORCE_COMPLETE';

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
