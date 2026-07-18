import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGamificationStore } from './gamificationStore';
import type { Badge, XPEvent } from '@/lib/types';

vi.mock('@/lib/api', () => ({
  gamificationApi: {
    fetchGamificationStatus: vi.fn(),
  },
}));

import { gamificationApi } from '@/lib/api';

const mockFetch = vi.mocked(gamificationApi.fetchGamificationStatus);

describe('gamificationStore', () => {
  beforeEach(() => {
    // Reset store to initial state between tests
    useGamificationStore.setState({
      totalXP: 0,
      badges: [],
      nextMilestone: null,
      pendingXPNotifications: [],
      activeBadgePopup: null,
    });
    vi.clearAllMocks();
  });

  describe('fetchGamificationData', () => {
    it('fetches and sets gamification data from API', async () => {
      const mockData = {
        totalXP: 1250,
        currentMilestone: { id: 'm1', name: 'Pemula', xpThreshold: 1000, badgeId: 'b1' },
        nextMilestone: { id: 'm2', name: 'Penjelajah', xpThreshold: 2000, badgeId: 'b2' },
        badges: [
          { id: 'b1', name: 'Badge Pemula', description: 'First badge', imageUrl: '/badges/1.png', isEarned: true, earnedAt: '2024-01-01T00:00:00Z' },
        ],
        recentXPEvents: [],
      };
      mockFetch.mockResolvedValue(mockData);

      await useGamificationStore.getState().fetchGamificationData();

      const state = useGamificationStore.getState();
      expect(state.totalXP).toBe(1250);
      expect(state.badges).toHaveLength(1);
      expect(state.badges[0].name).toBe('Badge Pemula');
      expect(state.nextMilestone).toEqual(mockData.nextMilestone);
    });
  });

  describe('addXPEvent', () => {
    it('adds XP amount to totalXP and queues notification', () => {
      useGamificationStore.setState({ totalXP: 100 });

      const event: XPEvent = {
        id: 'xp1',
        amount: 50,
        source: 'VIDEO_COMPLETE',
        timestamp: '2024-01-01T12:00:00Z',
      };

      useGamificationStore.getState().addXPEvent(event);

      const state = useGamificationStore.getState();
      expect(state.totalXP).toBe(150);
      expect(state.pendingXPNotifications).toHaveLength(1);
      expect(state.pendingXPNotifications[0]).toEqual(event);
    });

    it('queues multiple XP events', () => {
      const event1: XPEvent = { id: 'xp1', amount: 50, source: 'VIDEO_COMPLETE', timestamp: '2024-01-01T12:00:00Z' };
      const event2: XPEvent = { id: 'xp2', amount: 100, source: 'QUIZ_PASS', timestamp: '2024-01-01T12:01:00Z' };

      useGamificationStore.getState().addXPEvent(event1);
      useGamificationStore.getState().addXPEvent(event2);

      const state = useGamificationStore.getState();
      expect(state.totalXP).toBe(150);
      expect(state.pendingXPNotifications).toHaveLength(2);
    });
  });

  describe('dismissXPNotification', () => {
    it('removes notification by eventId', () => {
      const events: XPEvent[] = [
        { id: 'xp1', amount: 50, source: 'VIDEO_COMPLETE', timestamp: '2024-01-01T12:00:00Z' },
        { id: 'xp2', amount: 100, source: 'QUIZ_PASS', timestamp: '2024-01-01T12:01:00Z' },
      ];
      useGamificationStore.setState({ pendingXPNotifications: events });

      useGamificationStore.getState().dismissXPNotification('xp1');

      const state = useGamificationStore.getState();
      expect(state.pendingXPNotifications).toHaveLength(1);
      expect(state.pendingXPNotifications[0].id).toBe('xp2');
    });

    it('does nothing if eventId not found', () => {
      const events: XPEvent[] = [
        { id: 'xp1', amount: 50, source: 'VIDEO_COMPLETE', timestamp: '2024-01-01T12:00:00Z' },
      ];
      useGamificationStore.setState({ pendingXPNotifications: events });

      useGamificationStore.getState().dismissXPNotification('nonexistent');

      const state = useGamificationStore.getState();
      expect(state.pendingXPNotifications).toHaveLength(1);
    });
  });

  describe('showBadgePopup', () => {
    it('sets the active badge popup', () => {
      const badge: Badge = {
        id: 'b1',
        name: 'Badge Pemula',
        description: 'First badge',
        imageUrl: '/badges/1.png',
        isEarned: true,
        earnedAt: '2024-01-01T00:00:00Z',
      };

      useGamificationStore.getState().showBadgePopup(badge);

      expect(useGamificationStore.getState().activeBadgePopup).toEqual(badge);
    });
  });

  describe('dismissBadgePopup', () => {
    it('clears the active badge popup', () => {
      const badge: Badge = {
        id: 'b1',
        name: 'Badge Pemula',
        description: 'First badge',
        imageUrl: '/badges/1.png',
        isEarned: true,
      };
      useGamificationStore.setState({ activeBadgePopup: badge });

      useGamificationStore.getState().dismissBadgePopup();

      expect(useGamificationStore.getState().activeBadgePopup).toBeNull();
    });
  });

  describe('Req 9.5: XP notifications queued while badge popup is active', () => {
    it('queues XP events while badge popup is active', () => {
      const badge: Badge = {
        id: 'b1',
        name: 'Badge Pemula',
        description: 'First badge',
        imageUrl: '/badges/1.png',
        isEarned: true,
      };

      // Show badge popup first
      useGamificationStore.getState().showBadgePopup(badge);

      // Add XP event while popup is active
      const event: XPEvent = {
        id: 'xp1',
        amount: 50,
        source: 'VIDEO_COMPLETE',
        timestamp: '2024-01-01T12:00:00Z',
      };
      useGamificationStore.getState().addXPEvent(event);

      const state = useGamificationStore.getState();
      // XP is still added to total
      expect(state.totalXP).toBe(50);
      // But notification is queued (UI component checks activeBadgePopup before showing)
      expect(state.pendingXPNotifications).toHaveLength(1);
      expect(state.activeBadgePopup).not.toBeNull();
    });
  });
});
