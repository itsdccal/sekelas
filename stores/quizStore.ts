import { create } from 'zustand';
import { quizApi } from '@/lib/api';
import type { Question, QuizResult } from '@/lib/types';

interface QuizStoreState {
  questions: Question[];
  answers: Record<string, string>; // questionId -> selectedOptionId
  result: QuizResult | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  loadQuestions: (chapterId: string) => Promise<void>;
  setAnswer: (questionId: string, optionId: string) => void;
  submitQuiz: (chapterId: string) => Promise<QuizResult>;
  reset: () => void;
}

const initialState = {
  questions: [] as Question[],
  answers: {} as Record<string, string>,
  result: null as QuizResult | null,
  isLoading: false,
  isSubmitting: false,
  error: null as string | null,
};

export const useQuizStore = create<QuizStoreState>((set, get) => ({
  ...initialState,

  loadQuestions: async (chapterId: string) => {
    set({ isLoading: true, error: null });
    try {
      const questions = await quizApi.getQuestions(chapterId);
      set({
        questions,
        isLoading: false,
        error: null,
      });
    } catch {
      // Preserve existing answers on load error (Req 6.7)
      set({
        isLoading: false,
        error: 'Gagal memuat soal kuis. Silakan coba lagi.',
      });
    }
  },

  setAnswer: (questionId: string, optionId: string) => {
    const { answers } = get();
    set({
      answers: { ...answers, [questionId]: optionId },
    });
  },

  submitQuiz: async (chapterId: string) => {
    const { answers } = get();

    set({ isSubmitting: true, error: null });
    try {
      const submission = {
        chapterId,
        answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({
          questionId,
          selectedOptionId,
        })),
      };

      const result = await quizApi.submitQuiz(submission);
      set({
        result,
        isSubmitting: false,
        error: null,
      });
      return result;
    } catch {
      // Preserve answers on submit error (Req 6.7)
      set({
        isSubmitting: false,
        error: 'Gagal mengirim jawaban. Silakan coba lagi.',
      });
      throw new Error('Gagal mengirim jawaban. Silakan coba lagi.');
    }
  },

  reset: () => {
    set({ ...initialState });
  },
}));
