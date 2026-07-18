'use client';

import { useGamificationStore } from '@/stores';
import { useShallow } from 'zustand/shallow';
import type { Badge, XPEvent } from '@/lib/types';

export interface UseGamificationReturn {
  totalXP: number;
  badges: Badge[];
  pendingNotifications: XPEvent[];
  dismissNotification: (id: string) => void;
  dismissBadgePopup: () => void;
  activeBadgePopup: Badge | null;
}

/**
 * Custom hook wrapping gamificationStore for component consumption.
 * Provides XP, badges, and notification management.
 *
 * Validates: Requirements 16.1
 */
export function useGamification(): UseGamificationReturn {
  const {
    totalXP,
    badges,
    pendingXPNotifications,
    dismissXPNotification,
    dismissBadgePopup,
    activeBadgePopup,
  } = useGamificationStore(
    useShallow((state) => ({
      totalXP: state.totalXP,
      badges: state.badges,
      pendingXPNotifications: state.pendingXPNotifications,
      dismissXPNotification: state.dismissXPNotification,
      dismissBadgePopup: state.dismissBadgePopup,
      activeBadgePopup: state.activeBadgePopup,
    }))
  );

  return {
    totalXP,
    badges,
    pendingNotifications: pendingXPNotifications,
    dismissNotification: dismissXPNotification,
    dismissBadgePopup,
    activeBadgePopup,
  };
}
