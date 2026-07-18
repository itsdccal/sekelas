import type { ChapterStatus } from '@/lib/types';

/**
 * Valid state machine transitions for ChapterStatus from frontend perspective.
 */
export const VALID_TRANSITIONS: Record<ChapterStatus, ChapterStatus[]> = {
  LOCKED: ['UNLOCKED', 'COMPLETED'], // COMPLETED via admin override
  UNLOCKED: ['COMPLETED', 'REMEDIATION_REQUIRED'],
  COMPLETED: [], // Terminal state (from frontend perspective)
  REMEDIATION_REQUIRED: ['READY_FOR_RETAKE'],
  READY_FOR_RETAKE: ['COMPLETED', 'REMEDIATION_REQUIRED'],
};

/**
 * Check if a transition between two statuses is valid.
 */
export function canTransition(from: ChapterStatus, to: ChapterStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export interface ChapterVisualConfig {
  grayscale: boolean;
  icon: string | null;
  clickable: boolean;
  className: string;
}

/**
 * Get visual configuration for a chapter card based on its status.
 */
export function getChapterVisualConfig(status: ChapterStatus): ChapterVisualConfig {
  switch (status) {
    case 'LOCKED':
      return {
        grayscale: true,
        icon: 'lock',
        clickable: false,
        className: 'opacity-50 grayscale pointer-events-none',
      };
    case 'UNLOCKED':
      return {
        grayscale: false,
        icon: null,
        clickable: true,
        className: '',
      };
    case 'COMPLETED':
      return {
        grayscale: false,
        icon: 'check-circle',
        clickable: true,
        className: 'border-green-500',
      };
    case 'REMEDIATION_REQUIRED':
      return {
        grayscale: false,
        icon: 'alert-triangle',
        clickable: true,
        className: 'border-red-500',
      };
    case 'READY_FOR_RETAKE':
      return {
        grayscale: false,
        icon: 'refresh',
        clickable: true,
        className: 'border-yellow-500',
      };
    default: {
      const _exhaustive: never = status;
      throw new Error(`Unknown chapter status: ${_exhaustive}`);
    }
  }
}

/**
 * Check if the Override button should be active for a given status.
 * Override is active for all statuses except COMPLETED.
 */
export function isOverrideAllowed(status: ChapterStatus): boolean {
  return status !== 'COMPLETED';
}
