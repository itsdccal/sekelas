import { create } from 'zustand';
import { gamificationApi } from '@/lib/api';
import type { Badge, Milestone, XPEvent } from '@/lib/types';

interface GamificationStoreState {
  totalXP: number;
  badges: Badge[];
  nextMilestone: Milestone | null;
  pendingXPNotifications: XPEvent[];
  activeBadgePopup: Badge | null;

  fetchGamificationData: () => Promise<void>;
  addXPEvent: (event: XPEvent) => void;
  dismissXPNotification: (eventId: string) => void;
  showBadgePopup: (badge: Badge) => void;
  dismissBadgePopup: () => void;
}

export const useGamificationStore = create<GamificationStoreState>((set, get) => ({
  totalXP: 0,
  badges: [],
  nextMilestone: null,
  pendingXPNotifications: [],
  activeBadgePopup: null,

  fetchGamificationData: async () => {
    const data = await gamificationApi.fetchGamificationStatus();
    set({
      totalXP: data.totalXP,
      badges: data.badges,
      nextMilestone: data.nextMilestone,
    });
  },

  addXPEvent: (event: XPEvent) => {
    const state = get();

    // Req 9.5: If badge popup is active, queue XP notifications
    // They will be shown after badge popup is dismissed
    set({
      totalXP: state.totalXP + event.amount,
      pendingXPNotifications: [...state.pendingXPNotifications, event],
    });
  },

  dismissXPNotification: (eventId: string) => {
    set((state) => ({
      pendingXPNotifications: state.pendingXPNotifications.filter(
        (n) => n.id !== eventId
      ),
    }));
  },

  showBadgePopup: (badge: Badge) => {
    set({ activeBadgePopup: badge });
  },

  dismissBadgePopup: () => {
    set({ activeBadgePopup: null });
  },
}));
