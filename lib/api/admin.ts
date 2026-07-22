import apiClient from './client';
import { withRetry } from './retry';
import type {
  Materi,
  Bab,
  Chapter,
  AuditLogEntry,
  OverrideRequest,
  StudentMonitoringRow,
  VideoUploadResponse,
  QuestionPattern,
  Question,
  AdminMilestone,
  CreateMilestoneRequest,
  UpdateMilestoneRequest,
  ManagedUser,
  CreateUserRequest,
  UpdateUserRequest,
} from '@/lib/types';
import type { StudentProgress } from '@/lib/types';

// --- Curriculum CRUD ---

export async function createMateri(data: { name: string; description?: string; semesterId: string }): Promise<Materi> {
  const response = await apiClient.post<Materi>('/api/v1/admin/curriculum/materi', data);
  return response.data;
}

export async function updateMateri(materiId: string, data: { name?: string; description?: string }): Promise<Materi> {
  const response = await apiClient.put<Materi>(`/api/v1/admin/curriculum/materi/${materiId}`, data);
  return response.data;
}

export async function deleteMateri(materiId: string): Promise<void> {
  await apiClient.delete(`/api/v1/admin/curriculum/materi/${materiId}`);
}

export async function createBab(data: { materiId: string; name: string; orderIndex: number }): Promise<Bab> {
  const response = await apiClient.post<Bab>('/api/v1/admin/curriculum/bab', data);
  return response.data;
}

export async function updateBab(babId: string, data: { name?: string; orderIndex?: number }): Promise<Bab> {
  const response = await apiClient.put<Bab>(`/api/v1/admin/curriculum/bab/${babId}`, data);
  return response.data;
}

export async function deleteBab(babId: string): Promise<void> {
  await apiClient.delete(`/api/v1/admin/curriculum/bab/${babId}`);
}

export async function createChapter(data: {
  babId: string;
  name: string;
  orderIndex: number;
  videoUrl: string;
  passingGrade: number;
}): Promise<Chapter> {
  const response = await apiClient.post<Chapter>('/api/v1/admin/curriculum/chapter', data);
  return response.data;
}

export async function updateChapter(chapterId: string, data: Partial<Omit<Chapter, 'id' | 'babId'>>): Promise<Chapter> {
  const response = await apiClient.put<Chapter>(`/api/v1/admin/curriculum/chapter/${chapterId}`, data);
  return response.data;
}

export async function deleteChapter(chapterId: string): Promise<void> {
  await apiClient.delete(`/api/v1/admin/curriculum/chapter/${chapterId}`);
}

// --- Quiz Builder ---

export async function getPatterns(chapterId: string): Promise<QuestionPattern[]> {
  return withRetry(async () => {
    const response = await apiClient.get<QuestionPattern[]>(
      `/api/v1/admin/quiz/chapter/${chapterId}/patterns`
    );
    return response.data;
  });
}

export async function createPattern(data: {
  chapterId: string;
  patternCode: string;
  description: string;
}): Promise<QuestionPattern> {
  const response = await apiClient.post<QuestionPattern>('/api/v1/admin/quiz/patterns', data);
  return response.data;
}

export async function deletePattern(patternId: string): Promise<void> {
  await apiClient.delete(`/api/v1/admin/quiz/patterns/${patternId}`);
}

export async function getQuestions(patternId: string): Promise<Question[]> {
  return withRetry(async () => {
    const response = await apiClient.get<Question[]>(
      `/api/v1/admin/quiz/patterns/${patternId}/questions`
    );
    return response.data;
  });
}

export async function createQuestion(data: {
  patternId: string;
  text: string;
  questionType?: string;
  imageUrl?: string;
  options: { text: string; order: number }[];
  correctOptionIndex: number | null;
  xpPerQuestion?: number;
}): Promise<Question> {
  const response = await apiClient.post<Question>('/api/v1/admin/quiz/questions', data);
  return response.data;
}

export async function updateQuestion(questionId: string, data: {
  text?: string;
  questionType?: string;
  imageUrl?: string;
  options?: { text: string; order: number }[];
  correctOptionIndex?: number | null;
  xpPerQuestion?: number;
}): Promise<Question> {
  const response = await apiClient.put<Question>(`/api/v1/admin/quiz/questions/${questionId}`, data);
  return response.data;
}

export async function deleteQuestion(questionId: string): Promise<void> {
  await apiClient.delete(`/api/v1/admin/quiz/questions/${questionId}`);
}

// --- Override ---

export async function overrideChapter(request: OverrideRequest): Promise<void> {
  await apiClient.post('/api/v1/admin/override', request);
}

export async function getAuditLog(): Promise<AuditLogEntry[]> {
  return withRetry(async () => {
    const response = await apiClient.get<AuditLogEntry[]>('/api/v1/admin/override/audit-log');
    return response.data;
  });
}

// --- Monitoring ---

export async function getStudentMonitoring(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  kelas?: string;
}): Promise<{ data: StudentMonitoringRow[]; total: number; page: number; pageSize: number }> {
  return withRetry(async () => {
    const response = await apiClient.get<{
      data: StudentMonitoringRow[];
      total: number;
      page: number;
      pageSize: number;
    }>('/api/v1/admin/monitoring/students', { params });
    return response.data;
  });
}

export async function getStudentDetail(userId: string): Promise<StudentProgress> {
  return withRetry(async () => {
    const response = await apiClient.get<StudentProgress>(
      `/api/v1/admin/monitoring/students/${userId}`
    );
    return response.data;
  });
}

// --- Video Upload ---

export async function uploadVideo(
  file: File,
  onProgress?: (percentage: number) => void
): Promise<VideoUploadResponse> {
  const formData = new FormData();
  formData.append('video', file);

  const response = await apiClient.post<VideoUploadResponse>(
    '/api/v1/admin/video/upload',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 0, // No timeout for uploads
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentage);
        }
      },
    }
  );
  return response.data;
}

// --- Milestone / Badge Management ---

export async function getMilestones(): Promise<AdminMilestone[]> {
  return withRetry(async () => {
    const response = await apiClient.get<AdminMilestone[]>('/api/v1/admin/milestones');
    return response.data;
  });
}

export async function createMilestone(data: CreateMilestoneRequest): Promise<AdminMilestone> {
  const response = await apiClient.post<AdminMilestone>('/api/v1/admin/milestones', data);
  return response.data;
}

export async function updateMilestone(milestoneId: string, data: UpdateMilestoneRequest): Promise<AdminMilestone> {
  const response = await apiClient.put<AdminMilestone>(`/api/v1/admin/milestones/${milestoneId}`, data);
  return response.data;
}

export async function deleteMilestone(milestoneId: string): Promise<void> {
  await apiClient.delete(`/api/v1/admin/milestones/${milestoneId}`);
}


// --- User Management ---

export async function getUsers(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
}): Promise<{ data: ManagedUser[]; total: number; page: number; pageSize: number }> {
  return withRetry(async () => {
    const response = await apiClient.get<{
      data: ManagedUser[];
      total: number;
      page: number;
      pageSize: number;
    }>('/api/v1/admin/users', { params });
    return response.data;
  });
}

export async function createUser(data: CreateUserRequest): Promise<ManagedUser> {
  const response = await apiClient.post<ManagedUser>('/api/v1/admin/users', data);
  return response.data;
}

export async function updateUser(userId: string, data: UpdateUserRequest): Promise<ManagedUser> {
  const response = await apiClient.put<ManagedUser>(`/api/v1/admin/users/${userId}`, data);
  return response.data;
}

export async function deleteUser(userId: string): Promise<void> {
  await apiClient.delete(`/api/v1/admin/users/${userId}`);
}
