import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useQuizStore } from './quizStore';
import type { Question, QuizResult } from '@/lib/types';

// Mock the quiz API module
vi.mock('@/lib/api', () => ({
  quizApi: {
    getQuestions: vi.fn(),
    submitQuiz: vi.fn(),
  },
}));

import { quizApi } from '@/lib/api';

const mockQuestions: Question[] = [
  {
    id: 'q1',
    patternId: 'p1',
    text: 'What is 2 + 2?',
    options: [
      { id: 'o1', text: '3', order: 1 },
      { id: 'o2', text: '4', order: 2 },
      { id: 'o3', text: '5', order: 3 },
      { id: 'o4', text: '6', order: 4 },
    ],
  },
  {
    id: 'q2',
    patternId: 'p1',
    text: 'What is 3 + 3?',
    options: [
      { id: 'o5', text: '5', order: 1 },
      { id: 'o6', text: '6', order: 2 },
      { id: 'o7', text: '7', order: 3 },
      { id: 'o8', text: '8', order: 4 },
    ],
  },
];

const mockResult: QuizResult = {
  status: 'PASSED',
  score: 80,
  passingGrade: 70,
  nextStatus: 'COMPLETED',
  message: 'Selamat! Anda lulus kuis.',
};

describe('quizStore', () => {
  beforeEach(() => {
    useQuizStore.getState().reset();
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have empty questions, answers, and no result', () => {
      const state = useQuizStore.getState();
      expect(state.questions).toEqual([]);
      expect(state.answers).toEqual({});
      expect(state.result).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.isSubmitting).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('loadQuestions', () => {
    it('should load questions successfully', async () => {
      vi.mocked(quizApi.getQuestions).mockResolvedValue(mockQuestions);

      await useQuizStore.getState().loadQuestions('chapter-1');

      const state = useQuizStore.getState();
      expect(state.questions).toEqual(mockQuestions);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(quizApi.getQuestions).toHaveBeenCalledWith('chapter-1');
    });

    it('should set loading state while fetching', async () => {
      let resolvePromise: (value: Question[]) => void;
      const pendingPromise = new Promise<Question[]>((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(quizApi.getQuestions).mockReturnValue(pendingPromise);

      const loadPromise = useQuizStore.getState().loadQuestions('chapter-1');

      expect(useQuizStore.getState().isLoading).toBe(true);

      resolvePromise!(mockQuestions);
      await loadPromise;

      expect(useQuizStore.getState().isLoading).toBe(false);
    });

    it('should set error on failure and preserve answers', async () => {
      // Pre-set some answers
      useQuizStore.getState().setAnswer('q1', 'o2');

      vi.mocked(quizApi.getQuestions).mockRejectedValue(new Error('Network error'));

      await useQuizStore.getState().loadQuestions('chapter-1');

      const state = useQuizStore.getState();
      expect(state.error).toBe('Gagal memuat soal kuis. Silakan coba lagi.');
      expect(state.isLoading).toBe(false);
      // Answers are preserved (Req 6.7)
      expect(state.answers).toEqual({ q1: 'o2' });
    });
  });

  describe('setAnswer', () => {
    it('should set a single answer', () => {
      useQuizStore.getState().setAnswer('q1', 'o2');

      expect(useQuizStore.getState().answers).toEqual({ q1: 'o2' });
    });

    it('should allow changing an existing answer', () => {
      useQuizStore.getState().setAnswer('q1', 'o2');
      useQuizStore.getState().setAnswer('q1', 'o3');

      expect(useQuizStore.getState().answers).toEqual({ q1: 'o3' });
    });

    it('should accumulate answers for different questions', () => {
      useQuizStore.getState().setAnswer('q1', 'o2');
      useQuizStore.getState().setAnswer('q2', 'o6');

      expect(useQuizStore.getState().answers).toEqual({ q1: 'o2', q2: 'o6' });
    });
  });

  describe('submitQuiz', () => {
    it('should submit answers and set result on success', async () => {
      vi.mocked(quizApi.submitQuiz).mockResolvedValue(mockResult);

      useQuizStore.getState().setAnswer('q1', 'o2');
      useQuizStore.getState().setAnswer('q2', 'o6');

      const result = await useQuizStore.getState().submitQuiz('chapter-1');

      expect(result).toEqual(mockResult);
      const state = useQuizStore.getState();
      expect(state.result).toEqual(mockResult);
      expect(state.isSubmitting).toBe(false);
      expect(state.error).toBeNull();
      expect(quizApi.submitQuiz).toHaveBeenCalledWith({
        chapterId: 'chapter-1',
        answers: [
          { questionId: 'q1', selectedOptionId: 'o2' },
          { questionId: 'q2', selectedOptionId: 'o6' },
        ],
      });
    });

    it('should set submitting state during submission', async () => {
      let resolvePromise: (value: QuizResult) => void;
      const pendingPromise = new Promise<QuizResult>((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(quizApi.submitQuiz).mockReturnValue(pendingPromise);

      const submitPromise = useQuizStore.getState().submitQuiz('chapter-1');

      expect(useQuizStore.getState().isSubmitting).toBe(true);

      resolvePromise!(mockResult);
      await submitPromise;

      expect(useQuizStore.getState().isSubmitting).toBe(false);
    });

    it('should preserve answers on submission failure (Req 6.7)', async () => {
      vi.mocked(quizApi.submitQuiz).mockRejectedValue(new Error('Server error'));

      useQuizStore.getState().setAnswer('q1', 'o2');
      useQuizStore.getState().setAnswer('q2', 'o6');

      await expect(useQuizStore.getState().submitQuiz('chapter-1')).rejects.toThrow();

      const state = useQuizStore.getState();
      expect(state.answers).toEqual({ q1: 'o2', q2: 'o6' });
      expect(state.error).toBe('Gagal mengirim jawaban. Silakan coba lagi.');
      expect(state.isSubmitting).toBe(false);
      expect(state.result).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', async () => {
      vi.mocked(quizApi.getQuestions).mockResolvedValue(mockQuestions);
      await useQuizStore.getState().loadQuestions('chapter-1');
      useQuizStore.getState().setAnswer('q1', 'o2');

      useQuizStore.getState().reset();

      const state = useQuizStore.getState();
      expect(state.questions).toEqual([]);
      expect(state.answers).toEqual({});
      expect(state.result).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.isSubmitting).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
