'use client';

import { ShieldAlert } from 'lucide-react';

/**
 * Inline error message for 403 Forbidden responses.
 * Displayed within the content area, preserving navigation (sidebar/header).
 *
 * Validates: Requirement 16.3
 */
export function ForbiddenMessage({
  message = 'Anda tidak memiliki akses ke resource ini.',
}: {
  message?: string;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3"
      role="alert"
      aria-live="polite"
    >
      <ShieldAlert
        className="h-5 w-5 shrink-0 text-destructive"
        aria-hidden="true"
      />
      <p className="text-sm text-destructive">{message}</p>
    </div>
  );
}
