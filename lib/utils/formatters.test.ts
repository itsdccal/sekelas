import { describe, it, expect } from 'vitest';
import {
  formatCompletionPercentage,
  formatXP,
  formatProgressSummary,
  formatVideoProgress,
} from './formatters';

describe('formatCompletionPercentage', () => {
  it('returns 0 when total is 0', () => {
    expect(formatCompletionPercentage(0, 0)).toBe(0);
  });

  it('returns 0 when completed is 0', () => {
    expect(formatCompletionPercentage(0, 10)).toBe(0);
  });

  it('returns 100 when all completed', () => {
    expect(formatCompletionPercentage(10, 10)).toBe(100);
  });

  it('returns rounded integer', () => {
    expect(formatCompletionPercentage(1, 3)).toBe(33);
    expect(formatCompletionPercentage(2, 3)).toBe(67);
  });

  it('returns 50 for half completed', () => {
    expect(formatCompletionPercentage(5, 10)).toBe(50);
  });
});

describe('formatXP', () => {
  it('formats 0 XP', () => {
    expect(formatXP(0)).toBe('0 XP');
  });

  it('formats small values without separator', () => {
    expect(formatXP(50)).toBe('50 XP');
    expect(formatXP(999)).toBe('999 XP');
  });

  it('formats values with thousand separator', () => {
    expect(formatXP(1250)).toBe('1.250 XP');
    expect(formatXP(10000)).toBe('10.000 XP');
    expect(formatXP(1000000)).toBe('1.000.000 XP');
  });
});

describe('formatProgressSummary', () => {
  it('formats progress summary in Indonesian', () => {
    expect(formatProgressSummary(3, 10)).toBe('3 dari 10 Chapter selesai');
  });

  it('formats zero progress', () => {
    expect(formatProgressSummary(0, 5)).toBe('0 dari 5 Chapter selesai');
  });

  it('formats complete progress', () => {
    expect(formatProgressSummary(10, 10)).toBe('10 dari 10 Chapter selesai');
  });
});

describe('formatVideoProgress', () => {
  it('formats integer percentage', () => {
    expect(formatVideoProgress(50)).toBe('50%');
  });

  it('rounds decimal percentages', () => {
    expect(formatVideoProgress(45.7)).toBe('46%');
    expect(formatVideoProgress(45.4)).toBe('45%');
  });

  it('formats 0%', () => {
    expect(formatVideoProgress(0)).toBe('0%');
  });

  it('formats 100%', () => {
    expect(formatVideoProgress(100)).toBe('100%');
  });
});
