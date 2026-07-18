'use client';

import { useEffect } from 'react';
import { useGamificationStore } from '@/stores';

/**
 * XPNotification — shows "+{amount} XP" animation that auto-dismisses after 3 seconds.
 * Rendered in fixed position (top-right corner).
 * Only shows when activeBadgePopup is null (Req 9.5).
 */
export function XPNotification() {
  const pendingXPNotifications = useGamificationStore(
    (s) => s.pendingXPNotifications
  );
  const activeBadgePopup = useGamificationStore((s) => s.activeBadgePopup);
  const dismissXPNotification = useGamificationStore(
    (s) => s.dismissXPNotification
  );

  // Get the first pending notification to display (only when no badge popup is active)
  const currentNotification =
    activeBadgePopup === null ? pendingXPNotifications[0] ?? null : null;

  useEffect(() => {
    if (!currentNotification) return;

    const timer = setTimeout(() => {
      dismissXPNotification(currentNotification.id);
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentNotification, dismissXPNotification]);

  if (!currentNotification) return null;

  return (
    <div
      className="fixed right-4 top-4 z-50 animate-xp-slide-in"
      role="status"
      aria-live="polite"
      aria-label={`Mendapat ${currentNotification.amount} XP`}
    >
      <div className="rounded-lg bg-primary-600 px-4 py-3 text-white shadow-lg">
        <span className="text-lg font-bold">
          +{currentNotification.amount} XP
        </span>
      </div>
    </div>
  );
}
