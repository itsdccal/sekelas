import { describe, it, expect } from 'vitest';
import {
  validateLogin,
  validateMateri,
  validateQuestion,
  validateOverrideReason,
  validatePatternCode,
  validateVideoFile,
} from './validation';

describe('validateLogin', () => {
  it('passes with valid email and password', () => {
    const result = validateLogin('user@example.com', 'password123');
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('fails with empty email', () => {
    const result = validateLogin('', 'password123');
    expect(result.valid).toBe(false);
    expect(result.errors.email).toBeDefined();
  });

  it('fails with email over 100 chars', () => {
    const result = validateLogin('a'.repeat(101), 'password123');
    expect(result.valid).toBe(false);
    expect(result.errors.email).toBeDefined();
  });

  it('fails with empty password', () => {
    const result = validateLogin('user@example.com', '');
    expect(result.valid).toBe(false);
    expect(result.errors.password).toBeDefined();
  });

  it('fails with password shorter than 8 chars', () => {
    const result = validateLogin('user@example.com', 'short');
    expect(result.valid).toBe(false);
    expect(result.errors.password).toBeDefined();
  });

  it('fails with password over 64 chars', () => {
    const result = validateLogin('user@example.com', 'a'.repeat(65));
    expect(result.valid).toBe(false);
    expect(result.errors.password).toBeDefined();
  });
});

describe('validateMateri', () => {
  it('passes with valid name and no description', () => {
    const result = validateMateri('Matematika');
    expect(result.valid).toBe(true);
  });

  it('passes with valid name and description', () => {
    const result = validateMateri('Matematika', 'Pelajaran hitung');
    expect(result.valid).toBe(true);
  });

  it('fails with empty name', () => {
    const result = validateMateri('');
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBeDefined();
  });

  it('fails with name over 100 chars', () => {
    const result = validateMateri('a'.repeat(101));
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBeDefined();
  });

  it('fails with description over 500 chars', () => {
    const result = validateMateri('Math', 'a'.repeat(501));
    expect(result.valid).toBe(false);
    expect(result.errors.description).toBeDefined();
  });

  it('passes with empty description string', () => {
    const result = validateMateri('Math', '');
    expect(result.valid).toBe(true);
  });
});

describe('validateQuestion', () => {
  const validOptions = ['A', 'B', 'C', 'D'];

  it('passes with valid text, 4 options, and correctOption', () => {
    const result = validateQuestion('What is 1+1?', validOptions, 'opt-1');
    expect(result.valid).toBe(true);
  });

  it('fails with empty text', () => {
    const result = validateQuestion('', validOptions, 'opt-1');
    expect(result.valid).toBe(false);
    expect(result.errors.text).toBeDefined();
  });

  it('fails with text over 1000 chars', () => {
    const result = validateQuestion('a'.repeat(1001), validOptions, 'opt-1');
    expect(result.valid).toBe(false);
    expect(result.errors.text).toBeDefined();
  });

  it('fails with fewer than 4 options', () => {
    const result = validateQuestion('Q?', ['A', 'B', 'C'], 'opt-1');
    expect(result.valid).toBe(false);
    expect(result.errors.options).toBeDefined();
  });

  it('fails with more than 6 options', () => {
    const result = validateQuestion('Q?', ['A', 'B', 'C', 'D', 'E', 'F', 'G'], 'opt-1');
    expect(result.valid).toBe(false);
    expect(result.errors.options).toBeDefined();
  });

  it('fails with an empty option', () => {
    const result = validateQuestion('Q?', ['A', '', 'C', 'D'], 'opt-1');
    expect(result.valid).toBe(false);
    expect(result.errors.options).toBeDefined();
  });

  it('fails with option over 500 chars', () => {
    const result = validateQuestion('Q?', ['A', 'B', 'C', 'a'.repeat(501)], 'opt-1');
    expect(result.valid).toBe(false);
    expect(result.errors.options).toBeDefined();
  });

  it('fails with null correctOption', () => {
    const result = validateQuestion('Q?', validOptions, null);
    expect(result.valid).toBe(false);
    expect(result.errors.correctOption).toBeDefined();
  });

  it('fails with undefined correctOption', () => {
    const result = validateQuestion('Q?', validOptions, undefined);
    expect(result.valid).toBe(false);
    expect(result.errors.correctOption).toBeDefined();
  });

  it('passes with 5 valid options', () => {
    const result = validateQuestion('Q?', ['A', 'B', 'C', 'D', 'E'], 'opt-1');
    expect(result.valid).toBe(true);
  });

  it('passes with 6 valid options', () => {
    const result = validateQuestion('Q?', ['A', 'B', 'C', 'D', 'E', 'F'], 'opt-1');
    expect(result.valid).toBe(true);
  });
});

describe('validateOverrideReason', () => {
  it('passes with reason between 10-500 chars', () => {
    const result = validateOverrideReason('Siswa sudah menyelesaikan ujian offline');
    expect(result.valid).toBe(true);
  });

  it('fails with empty reason', () => {
    const result = validateOverrideReason('');
    expect(result.valid).toBe(false);
    expect(result.errors.reason).toBeDefined();
  });

  it('fails with reason under 10 chars', () => {
    const result = validateOverrideReason('pendek');
    expect(result.valid).toBe(false);
    expect(result.errors.reason).toBeDefined();
  });

  it('fails with reason over 500 chars', () => {
    const result = validateOverrideReason('a'.repeat(501));
    expect(result.valid).toBe(false);
    expect(result.errors.reason).toBeDefined();
  });

  it('passes with exactly 10 chars', () => {
    const result = validateOverrideReason('a'.repeat(10));
    expect(result.valid).toBe(true);
  });

  it('passes with exactly 500 chars', () => {
    const result = validateOverrideReason('a'.repeat(500));
    expect(result.valid).toBe(true);
  });
});

describe('validatePatternCode', () => {
  it('passes with valid unique code', () => {
    const result = validatePatternCode('PAT-001', ['PAT-002', 'PAT-003']);
    expect(result.valid).toBe(true);
  });

  it('fails with empty code', () => {
    const result = validatePatternCode('', []);
    expect(result.valid).toBe(false);
    expect(result.errors.code).toBeDefined();
  });

  it('fails with code over 50 chars', () => {
    const result = validatePatternCode('a'.repeat(51), []);
    expect(result.valid).toBe(false);
    expect(result.errors.code).toBeDefined();
  });

  it('fails with duplicate code', () => {
    const result = validatePatternCode('PAT-001', ['PAT-001', 'PAT-002']);
    expect(result.valid).toBe(false);
    expect(result.errors.code).toBeDefined();
  });

  it('passes with code at exactly 50 chars', () => {
    const result = validatePatternCode('a'.repeat(50), []);
    expect(result.valid).toBe(true);
  });
});

describe('validateVideoFile', () => {
  it('passes with MP4 under 500MB', () => {
    const result = validateVideoFile('video/mp4', 100 * 1024 * 1024);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('passes with WebM under 500MB', () => {
    const result = validateVideoFile('video/webm', 100 * 1024 * 1024);
    expect(result.valid).toBe(true);
  });

  it('fails with invalid MIME type', () => {
    const result = validateVideoFile('video/avi', 100 * 1024 * 1024);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Format');
  });

  it('fails with size over 500MB', () => {
    const result = validateVideoFile('video/mp4', 501 * 1024 * 1024);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('500MB');
  });

  it('passes with exactly 500MB', () => {
    const result = validateVideoFile('video/mp4', 500 * 1024 * 1024);
    expect(result.valid).toBe(true);
  });

  it('reports format error over size error when both invalid', () => {
    const result = validateVideoFile('video/avi', 501 * 1024 * 1024);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Format');
  });
});
