import { describe, it, expect, vi } from 'vitest';
import { classifyError, isRetryable, getErrorMessage, withRetry } from './retry';
import { AxiosError } from 'axios';

function createAxiosError(status: number | null, code?: string): AxiosError {
  const error = new Error('test error') as AxiosError;
  error.isAxiosError = true;
  error.code = code;
  error.name = 'AxiosError';
  error.toJSON = () => ({});

  if (status !== null) {
    error.response = {
      status,
      statusText: 'Error',
      data: {},
      headers: {},
      config: {} as never,
    };
  } else {
    error.response = undefined;
  }

  if (!status && !code) {
    error.message = 'Network Error';
  }

  return error;
}

describe('classifyError', () => {
  it('classifies 5xx as server error', () => {
    expect(classifyError(createAxiosError(500))).toBe('server');
    expect(classifyError(createAxiosError(502))).toBe('server');
    expect(classifyError(createAxiosError(503))).toBe('server');
    expect(classifyError(createAxiosError(599))).toBe('server');
  });

  it('classifies 401 as auth error', () => {
    expect(classifyError(createAxiosError(401))).toBe('auth');
  });

  it('classifies 4xx (non-401) as client error', () => {
    expect(classifyError(createAxiosError(400))).toBe('client');
    expect(classifyError(createAxiosError(403))).toBe('client');
    expect(classifyError(createAxiosError(404))).toBe('client');
    expect(classifyError(createAxiosError(422))).toBe('client');
  });

  it('classifies timeout as connection error', () => {
    expect(classifyError(createAxiosError(null, 'ECONNABORTED'))).toBe('connection');
    expect(classifyError(createAxiosError(null, 'ETIMEDOUT'))).toBe('connection');
  });

  it('classifies network errors as connection error', () => {
    expect(classifyError(createAxiosError(null, 'ERR_NETWORK'))).toBe('connection');
    expect(classifyError(createAxiosError(null))).toBe('connection'); // Network Error message
  });

  it('classifies non-axios errors as unknown', () => {
    expect(classifyError(new Error('random'))).toBe('unknown');
    expect(classifyError(null)).toBe('unknown');
    expect(classifyError(undefined)).toBe('unknown');
  });
});

describe('isRetryable', () => {
  it('returns true for server errors', () => {
    expect(isRetryable(createAxiosError(500))).toBe(true);
    expect(isRetryable(createAxiosError(503))).toBe(true);
  });

  it('returns true for connection errors', () => {
    expect(isRetryable(createAxiosError(null, 'ERR_NETWORK'))).toBe(true);
    expect(isRetryable(createAxiosError(null, 'ECONNABORTED'))).toBe(true);
  });

  it('returns false for client errors', () => {
    expect(isRetryable(createAxiosError(400))).toBe(false);
    expect(isRetryable(createAxiosError(404))).toBe(false);
  });

  it('returns false for auth errors', () => {
    expect(isRetryable(createAxiosError(401))).toBe(false);
  });
});

describe('getErrorMessage', () => {
  it('returns server message for 5xx', () => {
    expect(getErrorMessage(createAxiosError(500))).toBe('Gangguan server. Silakan coba lagi.');
  });

  it('returns connection message for network errors', () => {
    expect(getErrorMessage(createAxiosError(null, 'ERR_NETWORK'))).toBe(
      'Masalah koneksi. Periksa koneksi internet Anda.'
    );
  });

  it('returns auth message for 401', () => {
    expect(getErrorMessage(createAxiosError(401))).toBe(
      'Sesi Anda telah berakhir. Silakan login kembali.'
    );
  });
});

describe('withRetry', () => {
  it('returns result on first success', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    const result = await withRetry(fn, { maxAttempts: 3, baseDelayMs: 10, backoffMultiplier: 2 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on server error and succeeds', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(createAxiosError(500))
      .mockResolvedValue('recovered');

    const result = await withRetry(fn, { maxAttempts: 3, baseDelayMs: 10, backoffMultiplier: 2 });
    expect(result).toBe('recovered');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('retries on connection error and succeeds', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(createAxiosError(null, 'ERR_NETWORK'))
      .mockResolvedValue('back online');

    const result = await withRetry(fn, { maxAttempts: 3, baseDelayMs: 10, backoffMultiplier: 2 });
    expect(result).toBe('back online');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throws immediately on client error without retry', async () => {
    const fn = vi.fn().mockRejectedValue(createAxiosError(400));

    await expect(
      withRetry(fn, { maxAttempts: 3, baseDelayMs: 10, backoffMultiplier: 2 })
    ).rejects.toThrow();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('throws immediately on auth error without retry', async () => {
    const fn = vi.fn().mockRejectedValue(createAxiosError(401));

    await expect(
      withRetry(fn, { maxAttempts: 3, baseDelayMs: 10, backoffMultiplier: 2 })
    ).rejects.toThrow();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('throws after max attempts exhausted', async () => {
    const fn = vi.fn().mockRejectedValue(createAxiosError(500));

    await expect(
      withRetry(fn, { maxAttempts: 3, baseDelayMs: 10, backoffMultiplier: 2 })
    ).rejects.toThrow();
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('applies exponential backoff between retries', async () => {
    const delays: number[] = [];
    const realSetTimeout = globalThis.setTimeout;

    vi.spyOn(globalThis, 'setTimeout').mockImplementation((fn: () => void, ms?: number) => {
      delays.push(ms ?? 0);
      // Execute immediately instead of waiting
      fn();
      return 0 as unknown as ReturnType<typeof setTimeout>;
    });

    const serverError = createAxiosError(500);
    const fn = vi.fn().mockRejectedValue(serverError);

    await expect(
      withRetry(fn, { maxAttempts: 3, baseDelayMs: 100, backoffMultiplier: 2 })
    ).rejects.toThrow();

    expect(fn).toHaveBeenCalledTimes(3);
    // First delay: 100ms * 2^0 = 100ms
    // Second delay: 100ms * 2^1 = 200ms
    expect(delays).toEqual([100, 200]);

    vi.restoreAllMocks();
  });
});
