import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useChapterStore } from './chapterStore';
import type { ChapterProgress } from '@/lib/types';

// Mock the API modules
vi.mock('@/lib/api', () => ({
  curriculumApi: {
    getChapterList: vi.fn(),
  },
  videoApi: {
    getVideoInfo: vi.fn(),
  },
}));

import { curriculumApi, videoApi } from '@/lib/api';

const mockedGetChapterList = vi.mocked(curriculumApi.getChapterList);
const mockedGetVideoInfo = vi.mocked(videoApi.getVideoInfo);

describe('useChapterStore', () => {
  beforeEach(() => {
    // Reset store state between tests
    useChapterStore.setState({
      progressMap: {},
      activeChapterId: null,
      isLoading: false,
    });
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('has empty progressMap, null activeChapterId, and isLoading false', () => {
      const state = useChapterStore.getState();
      expect(state.progressMap).toEqual({});
      expect(state.activeChapterId).toBeNull();
      expect(state.isLoading).toBe(false);
    });
  });

  describe('setActiveChapter', () => {
    it('sets the activeChapterId', () => {
      useChapterStore.getState().setActiveChapter('chapter-1');
      expect(useChapterStore.getState().activeChapterId).toBe('chapter-1');
    });
  });

  describe('updateStatus', () => {
    it('updates the status of an existing chapter in progressMap', () => {
      const progress: ChapterProgress = {
        chapterId: 'ch-1',
        status: 'UNLOCKED',
        watchedPercentage: 50,
        lastScore: null,
        quizAttempts: 0,
        scoreHistory: [],
        videoWatchAttempts: 1,
      };
      useChapterStore.setState({ progressMap: { 'ch-1': progress } });

      useChapterStore.getState().updateStatus('ch-1', 'COMPLETED');

      expect(useChapterStore.getState().progressMap['ch-1'].status).toBe('COMPLETED');
      // Other fields should be unchanged
      expect(useChapterStore.getState().progressMap['ch-1'].watchedPercentage).toBe(50);
    });

    it('does nothing if chapterId does not exist in progressMap', () => {
      useChapterStore.getState().updateStatus('nonexistent', 'COMPLETED');
      expect(useChapterStore.getState().progressMap).toEqual({});
    });
  });

  describe('updateWatchedPercentage', () => {
    it('updates watchedPercentage for an existing chapter', () => {
      const progress: ChapterProgress = {
        chapterId: 'ch-1',
        status: 'UNLOCKED',
        watchedPercentage: 10,
        lastScore: null,
        quizAttempts: 0,
        scoreHistory: [],
        videoWatchAttempts: 1,
      };
      useChapterStore.setState({ progressMap: { 'ch-1': progress } });

      useChapterStore.getState().updateWatchedPercentage('ch-1', 75.5);

      expect(useChapterStore.getState().progressMap['ch-1'].watchedPercentage).toBe(75.5);
      // Status should remain unchanged
      expect(useChapterStore.getState().progressMap['ch-1'].status).toBe('UNLOCKED');
    });

    it('does nothing if chapterId does not exist in progressMap', () => {
      useChapterStore.getState().updateWatchedPercentage('nonexistent', 50);
      expect(useChapterStore.getState().progressMap).toEqual({});
    });
  });

  describe('fetchProgress', () => {
    it('fetches chapters and their progress, populating progressMap', async () => {
      mockedGetChapterList.mockResolvedValue([
        { id: 'ch-1', sectionId: 'bab-1', name: 'Chapter 1', orderIndex: 1, videoUrl: '', passingGrade: 70 },
        { id: 'ch-2', sectionId: 'bab-1', name: 'Chapter 2', orderIndex: 2, videoUrl: '', passingGrade: 70 },
      ]);

      const progress1: ChapterProgress = {
        chapterId: 'ch-1',
        status: 'COMPLETED',
        watchedPercentage: 100,
        lastScore: 85,
        quizAttempts: 1,
        scoreHistory: [85],
        videoWatchAttempts: 1,
      };
      const progress2: ChapterProgress = {
        chapterId: 'ch-2',
        status: 'UNLOCKED',
        watchedPercentage: 30,
        lastScore: null,
        quizAttempts: 0,
        scoreHistory: [],
        videoWatchAttempts: 0,
      };

      mockedGetVideoInfo
        .mockResolvedValueOnce(progress1)
        .mockResolvedValueOnce(progress2);

      await useChapterStore.getState().fetchProgress('bab-1');

      const state = useChapterStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.progressMap['ch-1']).toEqual(progress1);
      expect(state.progressMap['ch-2']).toEqual(progress2);
      expect(mockedGetChapterList).toHaveBeenCalledWith('bab-1');
    });

    it('sets isLoading during fetch', async () => {
      mockedGetChapterList.mockImplementation(() => new Promise(() => {})); // never resolves

      useChapterStore.getState().fetchProgress('bab-1');

      // isLoading should be true while fetching
      expect(useChapterStore.getState().isLoading).toBe(true);
    });

    it('uses default progress when individual chapter progress fetch fails', async () => {
      mockedGetChapterList.mockResolvedValue([
        { id: 'ch-1', sectionId: 'bab-1', name: 'Chapter 1', orderIndex: 1, videoUrl: '', passingGrade: 70 },
      ]);

      mockedGetVideoInfo.mockRejectedValue(new Error('Network error'));

      await useChapterStore.getState().fetchProgress('bab-1');

      const state = useChapterStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.progressMap['ch-1']).toEqual({
        chapterId: 'ch-1',
        status: 'LOCKED',
        watchedPercentage: 0,
        lastScore: null,
        quizAttempts: 0,
        scoreHistory: [],
        videoWatchAttempts: 0,
      });
    });

    it('resets isLoading on top-level error', async () => {
      mockedGetChapterList.mockRejectedValue(new Error('API error'));

      await useChapterStore.getState().fetchProgress('bab-1');

      expect(useChapterStore.getState().isLoading).toBe(false);
      expect(useChapterStore.getState().progressMap).toEqual({});
    });

    it('preserves existing progress for other chapters', async () => {
      const existingProgress: ChapterProgress = {
        chapterId: 'ch-existing',
        status: 'COMPLETED',
        watchedPercentage: 100,
        lastScore: 90,
        quizAttempts: 1,
        scoreHistory: [90],
        videoWatchAttempts: 1,
      };
      useChapterStore.setState({ progressMap: { 'ch-existing': existingProgress } });

      mockedGetChapterList.mockResolvedValue([
        { id: 'ch-new', sectionId: 'bab-2', name: 'New Chapter', orderIndex: 1, videoUrl: '', passingGrade: 70 },
      ]);
      const newProgress: ChapterProgress = {
        chapterId: 'ch-new',
        status: 'UNLOCKED',
        watchedPercentage: 0,
        lastScore: null,
        quizAttempts: 0,
        scoreHistory: [],
        videoWatchAttempts: 0,
      };
      mockedGetVideoInfo.mockResolvedValue(newProgress);

      await useChapterStore.getState().fetchProgress('bab-2');

      const state = useChapterStore.getState();
      expect(state.progressMap['ch-existing']).toEqual(existingProgress);
      expect(state.progressMap['ch-new']).toEqual(newProgress);
    });
  });
});
