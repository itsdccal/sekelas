import { AxiosError } from 'axios';

export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  backoffMultiplier: 2,
};

export type ApiErrorType = 'server' | 'connection' | 'client' | 'auth' | 'unknown';

/**
 * Classifies an error into a category for display/retry logic.
 * - 'server': HTTP 5xx responses
 * - 'connection': Network errors (no response) or timeouts
 * - 'client': HTTP 4xx responses (excluding 401)
 * - 'auth': HTTP 401
 * - 'unknown': Any other error
 */
export function classifyError(error: unknown): ApiErrorType {
  if (!isAxiosError(error)) {
    return 'unknown';
  }

  // No response received — network/connection error or timeout
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return 'connection';
    }
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      return 'connection';
    }
    return 'connection';
  }

  const status = error.response.status;

  if (status === 401) {
    return 'auth';
  }

  if (status >= 500 && status < 600) {
    return 'server';
  }

  if (status >= 400 && status < 500) {
    return 'client';
  }

  return 'unknown';
}

/**
 * Determines whether an error is retryable.
 * Only server errors and connection errors should be retried.
 */
export function isRetryable(error: unknown): boolean {
  const errorType = classifyError(error);
  return errorType === 'server' || errorType === 'connection';
}

/**
 * Returns a user-facing error message based on error type.
 */
export function getErrorMessage(error: unknown): string {
  const errorType = classifyError(error);
  switch (errorType) {
    case 'server':
      return 'Gangguan server. Silakan coba lagi.';
    case 'connection':
      return 'Masalah koneksi. Periksa koneksi internet Anda.';
    case 'auth':
      return 'Sesi Anda telah berakhir. Silakan login kembali.';
    case 'client':
      return 'Permintaan tidak valid.';
    default:
      return 'Terjadi kesalahan. Silakan coba lagi.';
  }
}

function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as AxiosError).isAxiosError === true
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retries an async function with exponential backoff.
 * Only retries on server (5xx) and connection errors.
 * Client errors (4xx) are thrown immediately.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry client errors or auth errors
      if (!isRetryable(error)) {
        throw lastError;
      }

      // Don't delay after the last attempt
      if (attempt < config.maxAttempts) {
        const delayMs = config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt - 1);
        await delay(delayMs);
      }
    }
  }

  throw lastError!;
}
