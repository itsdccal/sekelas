import apiClient from './client';
import { withRetry } from './retry';
import type { Subject, Section, Chapter, StudentProgress } from '@/lib/types';

/**
 * Fetch student's own progress summary for a given semester.
 */
export async function getStudentProgress(semesterId: string): Promise<StudentProgress> {
  return withRetry(async () => {
    const response = await apiClient.get<StudentProgress>('/api/v1/student/progress', {
      params: { semesterId },
    });
    return response.data;
  });
}

/**
 * Fetch list of Subjects for the given semester.
 */
export async function getSubjectList(semesterId: string): Promise<Subject[]> {
  return withRetry(async () => {
    const response = await apiClient.get<Subject[]>('/api/v1/courses/subjects', {
      params: { semesterId },
    });
    return response.data;
  });
}

/**
 * Fetch list of Sections within a Subject.
 */
export async function getSectionList(subjectId: string): Promise<Section[]> {
  return withRetry(async () => {
    const response = await apiClient.get<Section[]>(`/api/v1/courses/subjects/${subjectId}/sections`);
    return response.data;
  });
}

/**
 * Fetch list of Chapters within a Section.
 */
export async function getChapterList(sectionId: string): Promise<Chapter[]> {
  return withRetry(async () => {
    const response = await apiClient.get<Chapter[]>(`/api/v1/courses/sections/${sectionId}/chapters`);
    return response.data;
  });
}
