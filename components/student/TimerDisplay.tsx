'use client';

import { Clock } from 'lucide-react';

interface TimerDisplayProps {
  formatted: string;
  isWarning: boolean;
}

/**
 * Visual timer display for quiz/test.
 * Shows red when time is running low (< 1 minute).
 */
export function TimerDisplay({ formatted, isWarning }: TimerDisplayProps) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-mono font-medium ${
        isWarning
          ? 'bg-red-100 text-red-700 animate-pulse'
          : 'bg-gray-100 text-gray-700'
      }`}
      aria-live="polite"
      aria-label={`Sisa waktu: ${formatted}`}
    >
      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{formatted}</span>
    </div>
  );
}
