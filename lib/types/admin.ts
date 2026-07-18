export interface AuditLogEntry {
  id: string;
  adminId: string;
  adminName: string;
  action: 'OVERRIDE';
  studentName: string;
  chapterName: string;
  reason: string;
  createdAt: string; // ISO datetime
}

export interface OverrideRequest {
  userId: string;
  chapterId: string;
  reason: string; // min 10, max 500 chars
}

export interface StudentMonitoringRow {
  userId: string;
  name: string;
  kelas: string;
  totalProgress: number; // 0-100 integer
  totalXP: number;
}

export interface VideoUploadResponse {
  videoUrl: string;
  thumbnailUrl: string;
}
