export { default as apiClient, ForbiddenError } from './client';
export { withRetry, classifyError, isRetryable, getErrorMessage } from './retry';
export type { RetryConfig, ApiErrorType } from './retry';

export * as authApi from './auth';
export * as coursesApi from './courses';
export * as videoApi from './video';
export * as quizApi from './quiz';
export * as pretestApi from './pretest';
export * as posttestApi from './posttest';
export * as adminApi from './admin';
export * as gamificationApi from './gamification';
