import apiClient from './client';
import { withRetry } from './retry';
import type {
  Subject,
  Section,
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
  ClassRoom,
  CreateClassRoomRequest,
  UpdateClassRoomRequest,
} from '@/lib/types';
import type { StudentProgress } from '@/lib/types';

// --- Curriculum CRUD ---

export async function createSubject(data: { name: string; description?: string; semesterId: string }): Promise<Subject> {
  const response = await apiClient.post<Subject>('/api/v1/admin/curriculum/subjects', data);
  return response.data;
}

export async function updateSubject(subjectId: string, data: { name?: string; description?: string }): Promise<Subject> {
  const response = await apiClient.put<Subject>(`/api/v1/admin/curriculum/subjects/${subjectId}`, data);
  return response.data;
}

export async function deleteSubject(subjectId: string): Promise<void> {
  await apiClient.delete(`/api/v1/admin/curriculum/subjects/${subjectId}`);
}

export async function createSection(data: { subjectId: string; name: string; orderIndex: number }): Promise<Section> {
  const response = await apiClient.post<Section>('/api/v1/admin/curriculum/sections', data);
  return response.data;
}

export async function updateSection(sectionId: string, data: { name?: string; orderIndex?: number }): Promise<Section> {
  const response = await apiClient.put<Section>(`/api/v1/admin/curriculum/sections/${sectionId}`, data);
  return response.data;
}

export async function deleteSection(sectionId: string): Promise<void> {
  await apiClient.delete(`/api/v1/admin/curriculum/sections/${sectionId}`);
}

export async function createChapter(data: {
  sectionId: string;
  name: string;
  orderIndex: number;
  videoUrl: string;
  passingGrade: number;
}): Promise<Chapter> {
  const response = await apiClient.post<Chapter>('/api/v1/admin/curriculum/chapter', data);
  return response.data;
}

export async function updateChapter(chapterId: string, data: Partial<Omit<Chapter, 'id' | 'sectionId'>>): Promise<Chapter> {
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
  weight?: number;
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
  weight?: number;
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


// --- ClassRoom Management ---

export async function getClassRoomList(): Promise<ClassRoom[]> {
  return withRetry(async () => {
    const response = await apiClient.get<ClassRoom[]>('/api/v1/admin/classes');
    return response.data;
  });
}

export async function createClassRoom(data: CreateClassRoomRequest): Promise<ClassRoom> {
  const response = await apiClient.post<ClassRoom>('/api/v1/admin/classes', data);
  return response.data;
}

export async function updateClassRoom(classRoomId: string, data: UpdateClassRoomRequest): Promise<ClassRoom> {
  const response = await apiClient.put<ClassRoom>(`/api/v1/admin/classes/${classRoomId}`, data);
  return response.data;
}

export async function deleteClassRoom(classRoomId: string): Promise<void> {
  await apiClient.delete(`/api/v1/admin/classes/${classRoomId}`);
}
