import { describe, it, expect } from 'vitest';
import {
  canTransition,
  getChapterVisualConfig,
  isOverrideAllowed,
  VALID_TRANSITIONS,
} from './chapterStatus';
import type { ChapterStatus } from '@/lib/types';

const ALL_STATUSES: ChapterStatus[] = [
  'LOCKED',
  'UNLOCKED',
  'COMPLETED',
  'REMEDIATION_REQUIRED',
  'READY_FOR_RETAKE',
];

describe('canTransition', () => {
  it('allows LOCKED → UNLOCKED', () => {
    expect(canTransition('LOCKED', 'UNLOCKED')).toBe(true);
  });

  it('allows LOCKED → COMPLETED (admin override)', () => {
    expect(canTransition('LOCKED', 'COMPLETED')).toBe(true);
  });

  it('allows UNLOCKED → COMPLETED', () => {
    expect(canTransition('UNLOCKED', 'COMPLETED')).toBe(true);
  });

  it('allows UNLOCKED → REMEDIATION_REQUIRED', () => {
    expect(canTransition('UNLOCKED', 'REMEDIATION_REQUIRED')).toBe(true);
  });

  it('does not allow COMPLETED → any state', () => {
    for (const status of ALL_STATUSES) {
      expect(canTransition('COMPLETED', status)).toBe(false);
    }
  });

  it('allows REMEDIATION_REQUIRED → READY_FOR_RETAKE', () => {
    expect(canTransition('REMEDIATION_REQUIRED', 'READY_FOR_RETAKE')).toBe(true);
  });

  it('allows READY_FOR_RETAKE → COMPLETED', () => {
    expect(canTransition('READY_FOR_RETAKE', 'COMPLETED')).toBe(true);
  });

  it('allows READY_FOR_RETAKE → REMEDIATION_REQUIRED', () => {
    expect(canTransition('READY_FOR_RETAKE', 'REMEDIATION_REQUIRED')).toBe(true);
  });

  it('does not allow invalid transitions', () => {
    expect(canTransition('LOCKED', 'REMEDIATION_REQUIRED')).toBe(false);
    expect(canTransition('LOCKED', 'READY_FOR_RETAKE')).toBe(false);
    expect(canTransition('UNLOCKED', 'LOCKED')).toBe(false);
    expect(canTransition('UNLOCKED', 'READY_FOR_RETAKE')).toBe(false);
  });
});

describe('getChapterVisualConfig', () => {
  it('returns LOCKED config with grayscale and lock icon', () => {
    const config = getChapterVisualConfig('LOCKED');
    expect(config.grayscale).toBe(true);
    expect(config.icon).toBe('lock');
    expect(config.clickable).toBe(false);
    expect(config.className).toContain('grayscale');
    expect(config.className).toContain('pointer-events-none');
  });

  it('returns UNLOCKED config with no icon and clickable', () => {
    const config = getChapterVisualConfig('UNLOCKED');
    expect(config.grayscale).toBe(false);
    expect(config.icon).toBeNull();
    expect(config.clickable).toBe(true);
    expect(config.className).toBe('');
  });

  it('returns COMPLETED config with check-circle icon and green border', () => {
    const config = getChapterVisualConfig('COMPLETED');
    expect(config.grayscale).toBe(false);
    expect(config.icon).toBe('check-circle');
    expect(config.clickable).toBe(true);
    expect(config.className).toContain('border-green-500');
  });

  it('returns REMEDIATION_REQUIRED config with alert-triangle and red border', () => {
    const config = getChapterVisualConfig('REMEDIATION_REQUIRED');
    expect(config.grayscale).toBe(false);
    expect(config.icon).toBe('alert-triangle');
    expect(config.clickable).toBe(true);
    expect(config.className).toContain('border-red-500');
  });

  it('returns READY_FOR_RETAKE config with refresh icon and yellow border', () => {
    const config = getChapterVisualConfig('READY_FOR_RETAKE');
    expect(config.grayscale).toBe(false);
    expect(config.icon).toBe('refresh');
    expect(config.clickable).toBe(true);
    expect(config.className).toContain('border-yellow-500');
  });
});

describe('isOverrideAllowed', () => {
  it('returns true for non-COMPLETED statuses', () => {
    expect(isOverrideAllowed('LOCKED')).toBe(true);
    expect(isOverrideAllowed('UNLOCKED')).toBe(true);
    expect(isOverrideAllowed('REMEDIATION_REQUIRED')).toBe(true);
    expect(isOverrideAllowed('READY_FOR_RETAKE')).toBe(true);
  });

  it('returns false for COMPLETED status', () => {
    expect(isOverrideAllowed('COMPLETED')).toBe(false);
  });
});
