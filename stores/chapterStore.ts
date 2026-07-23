import { create } from 'zustand';
import { coursesApi, videoApi } from '@/lib/api';
import type { ChapterProgress, ChapterStatus } from '@/lib/types';

interface ChapterState {
  progressMap: Record<string, ChapterProgress>; // chapterId -> progress
  activeChapterId: string | null;
  isLoading: boolean;

  fetchProgress: (sectionId: string) => Promise<void>;
  updateStatus: (chapterId: string, status: ChapterStatus) => void;
  updateWatchedPercentage: (chapterId: string, pct: number) => void;
  setActiveChapter: (chapterId: string) => void;
}

export const useChapterStore = create<ChapterState>((set, get) => ({
  progressMap: {},
  activeChapterId: null,
  isLoading: false,

  fetchProgress: async (sectionId: string) => {
    set({ isLoading: true });
    try {
      const chapters = await coursesApi.getChapterList(sectionId);

      // Fetch progress for each chapter and build progressMap
      const progressEntries = await Promise.all(
        chapters.map(async (chapter) => {
          try {
            const progress = await videoApi.getVideoInfo(chapter.id);
            return [chapter.id, progress] as const;
          } catch {
            // If progress fetch fails for a chapter, use default state
            const defaultProgress: ChapterProgress = {
              chapterId: chapter.id,
              status: 'LOCKED',
              watchedPercentage: 0,
              lastScore: null,
              quizAttempts: 0,
              scoreHistory: [],
              videoWatchAttempts: 0,
            };
            return [chapter.id, defaultProgress] as const;
          }
        })
      );

      const newProgressMap: Record<string, ChapterProgress> = { ...get().progressMap };
      for (const [chapterId, progress] of progressEntries) {
        newProgressMap[chapterId] = progress;
      }

      set({ progressMap: newProgressMap, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  updateStatus: (chapterId: string, status: ChapterStatus) => {
    const { progressMap } = get();
    const existing = progressMap[chapterId];
    if (!existing) return;

    set({
      progressMap: {
        ...progressMap,
        [chapterId]: { ...existing, status },
      },
    });
  },

  updateWatchedPercentage: (chapterId: string, pct: number) => {
    const { progressMap } = get();
    const existing = progressMap[chapterId];
    if (!existing) return;

    set({
      progressMap: {
        ...progressMap,
        [chapterId]: { ...existing, watchedPercentage: pct },
      },
    });
  },

  setActiveChapter: (chapterId: string) => {
    set({ activeChapterId: chapterId });
  },
}));
