'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Timer hook for quiz/test countdown.
 * @param durationMinutes - total duration in minutes
 * @param onTimeUp - callback when time runs out
 * @param enabled - whether timer is active
 */
export function useTimer(durationMinutes: number, onTimeUp: () => void, enabled: boolean = true) {
  const [remainingSeconds, setRemainingSeconds] = useState(durationMinutes * 60);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  useEffect(() => {
    if (!enabled) return;
    setRemainingSeconds(durationMinutes * 60);
  }, [durationMinutes, enabled]);

  useEffect(() => {
    if (!enabled || remainingSeconds <= 0) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUpRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [enabled, remainingSeconds]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isWarning = remainingSeconds <= 60; // last 1 minute
  const isExpired = remainingSeconds <= 0;

  return { remainingSeconds, minutes, seconds, formatted, isWarning, isExpired };
}
