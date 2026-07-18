import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QuizComponent } from './QuizComponent';

// Mock the quiz store
const mockLoadQuestions = vi.fn();
const mockSetAnswer = vi.fn();
const mockSubmitQuiz = vi.fn();
const mockReset = vi.fn();

let mockStoreState = {
  questions: [] as Array<{ id: string; patternId: string; text: string; options: Array<{ id: string; text: string; order: number }> }>,
  answers: {} as Record<string, string>,
  isLoading: false,
  isSubmitting: false,
  error: null as string | null,
  loadQuestions: mockLoadQuestions,
  setAnswer: mockSetAnswer,
  submitQuiz: mockSubmitQuiz,
  reset: mockReset,
};

vi.mock('@/stores', () => ({
  useQuizStore: () => mockStoreState,
}));

const sampleQuestions = [
  {
    id: 'q1',
    patternId: 'p1',
    text: 'Apa ibu kota Indonesia?',
    options: [
      { id: 'o1', text: 'Jakarta', order: 1 },
      { id: 'o2', text: 'Bandung', order: 2 },
      { id: 'o3', text: 'Surabaya', order: 3 },
      { id: 'o4', text: 'Medan', order: 4 },
    ],
  },
  {
    id: 'q2',
    patternId: 'p1',
    text: 'Berapa 2 + 2?',
    options: [
      { id: 'o5', text: '3', order: 1 },
      { id: 'o6', text: '4', order: 2 },
      { id: 'o7', text: '5', order: 3 },
      { id: 'o8', text: '6', order: 4 },
    ],
  },
  {
    id: 'q3',
    patternId: 'p1',
    text: 'Warna langit?',
    options: [
      { id: 'o9', text: 'Merah', order: 1 },
      { id: 'o10', text: 'Biru', order: 2 },
      { id: 'o11', text: 'Hijau', order: 3 },
      { id: 'o12', text: 'Kuning', order: 4 },
    ],
  },
];

describe('QuizComponent', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockStoreState = {
      questions: [],
      answers: {},
      isLoading: false,
      isSubmitting: false,
      error: null,
      loadQuestions: mockLoadQuestions,
      setAnswer: mockSetAnswer,
      submitQuiz: mockSubmitQuiz,
      reset: mockReset,
    };
  });

  it('shows loading state when isLoading is true', () => {
    mockStoreState.isLoading = true;
    render(<QuizComponent chapterId="ch1" onComplete={mockOnComplete} />);
    expect(screen.getByText('Memuat soal kuis...')).toBeInTheDocument();
  });

  it('shows error state with retry button when load fails', () => {
    mockStoreState.error = 'Gagal memuat soal kuis. Silakan coba lagi.';
    mockStoreState.questions = [];
    render(<QuizComponent chapterId="ch1" onComplete={mockOnComplete} />);
    expect(screen.getByText('Gagal memuat soal kuis. Silakan coba lagi.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /coba lagi/i })).toBeInTheDocument();
  });

  it('calls loadQuestions on retry click', () => {
    mockStoreState.error = 'Gagal memuat soal kuis. Silakan coba lagi.';
    mockStoreState.questions = [];
    render(<QuizComponent chapterId="ch1" onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByRole('button', { name: /coba lagi/i }));
    expect(mockLoadQuestions).toHaveBeenCalledWith('ch1');
  });

  it('displays first question with options', () => {
    mockStoreState.questions = sampleQuestions;
    render(<QuizComponent chapterId="ch1" onComplete={mockOnComplete} />);
    expect(screen.getByText('Apa ibu kota Indonesia?')).toBeInTheDocument();
    expect(screen.getByText('Jakarta')).toBeInTheDocument();
    expect(screen.getByText('Bandung')).toBeInTheDocument();
    expect(screen.getByText('Surabaya')).toBeInTheDocument();
    expect(screen.getByText('Medan')).toBeInTheDocument();
  });

  it('displays answer counter "M/N terjawab"', () => {
    mockStoreState.questions = sampleQuestions;
    mockStoreState.answers = { q1: 'o1' };
    render(<QuizComponent chapterId="ch1" onComplete={mockOnComplete} />);
    expect(screen.getByText('1/3 terjawab')).toBeInTheDocument();
  });

  it('displays 0/N terjawab when no answers', () => {
    mockStoreState.questions = sampleQuestions;
    mockStoreState.answers = {};
    render(<QuizComponent chapterId="ch1" onComplete={mockOnComplete} />);
    expect(screen.getByText('0/3 terjawab')).toBeInTheDocument();
  });

  it('calls setAnswer when option is clicked', () => {
    mockStoreState.questions = sampleQuestions;
    render(<QuizComponent chapterId="ch1" onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByLabelText('Jakarta'));
    expect(mockSetAnswer).toHaveBeenCalledWith('q1', 'o1');
  });

  it('navigates to next question when "Berikutnya" is clicked', () => {
    mockStoreState.questions = sampleQuestions;
    render(<QuizComponent chapterId="ch1" onComplete={mockOnComplete} />);
    fireEvent.click(screen.getByRole('button', { name: /berikutnya/i }));
    expect(screen.getByText('Berapa 2 + 2?')).toBeInTheDocument();
  });

  it('navigates to previous question when "Sebelumnya" is clicked', () => {
    mockStoreState.questions = sampleQuestions;
    const { rerender } = render(<QuizComponent chapterId="ch1" onComplete={mockOnComplete} />);
    // Go to next
    fireEvent.click(screen.getByRole('button', { name: /berikutnya/i }));
    expect(screen.getByText('Berapa 2 + 2?')).toBeInTheDocument();
    // Go back
    fireEvent.click(screen.getByRole('button', { name: /sebelumnya/i }));
    expect(screen.getByText('Apa ibu kota Indonesia?')).toBeInTheDocument();
  });

  it('disables "Sebelumnya" on first question', () => {
    mockStoreState.questions = sampleQuestions;
    render(<QuizComponent chapterId="ch1" onComplete={mockOnComplete} />);
    expect(screen.getByRole('button', { name: /sebelumnya/i })).toBeDisabled();
  });

  it('shows submit button on last question', () => {
    mockStoreState.questions = sampleQuestions;
    render(<QuizComponent chapterId="ch1" onComplete={mockOnComplete} />);
    // Navigate to last question
    fireEvent.click(screen.getByRole('button', { name: /berikutnya/i }));
    fireEvent.click(screen.getByRole('button', { name: /berikutnya/i }));
    expect(screen.getByRole('button', { name: /kirim jawaban/i })).toBeInTheDocument();
  });

  it('disables submit button until all questions answered', () => {
    mockStoreState.questions = sampleQuestions;
    mockStoreState.answers = { q1: 'o1', q2: 'o6' }; // 2/3 answered
    render(<QuizComponent chapterId="ch1" onComplete={mockOnComplete} />);
    // Navigate to last question
    fireEvent.click(screen.getByRole('button', { name: /berikutnya/i }));
    fireEvent.click(screen.getByRole('button', { name: /berikutnya/i }));
    expect(screen.getByRole('button', { name: /kirim jawaban/i })).toBeDisabled();
  });

  it('enables submit button when all questions answered', () => {
    mockStoreState.questions = sampleQuestions;
    mockStoreState.answers = { q1: 'o1', q2: 'o6', q3: 'o10' }; // all answered
    render(<QuizComponent chapterId="ch1" onComplete={mockOnComplete} />);
    // Navigate to last question
    fireEvent.click(screen.getByRole('button', { name: /berikutnya/i }));
    fireEvent.click(screen.getByRole('button', { name: /berikutnya/i }));
    expect(screen.getByRole('button', { name: /kirim jawaban/i })).not.toBeDisabled();
  });

  it('calls submitQuiz and onComplete on successful submit', async () => {
    const result = {
      status: 'PASSED' as const,
      score: 80,
      passingGrade: 70,
      nextStatus: 'COMPLETED' as const,
      message: 'Selamat!',
    };
    mockSubmitQuiz.mockResolvedValue(result);
    mockStoreState.questions = sampleQuestions;
    mockStoreState.answers = { q1: 'o1', q2: 'o6', q3: 'o10' };

    render(<QuizComponent chapterId="ch1" onComplete={mockOnComplete} />);
    // Navigate to last question
    fireEvent.click(screen.getByRole('button', { name: /berikutnya/i }));
    fireEvent.click(screen.getByRole('button', { name: /berikutnya/i }));
    fireEvent.click(screen.getByRole('button', { name: /kirim jawaban/i }));

    await waitFor(() => {
      expect(mockSubmitQuiz).toHaveBeenCalledWith('ch1');
      expect(mockOnComplete).toHaveBeenCalledWith(result);
    });
  });

  it('shows inline error when submission fails (answers preserved)', () => {
    mockStoreState.questions = sampleQuestions;
    mockStoreState.answers = { q1: 'o1', q2: 'o6', q3: 'o10' };
    mockStoreState.error = 'Gagal mengirim jawaban. Silakan coba lagi.';

    render(<QuizComponent chapterId="ch1" onComplete={mockOnComplete} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Gagal mengirim jawaban. Silakan coba lagi.');
    // Questions are still displayed (answers preserved)
    expect(screen.getByText('Apa ibu kota Indonesia?')).toBeInTheDocument();
  });

  it('shows submitting state with spinner', () => {
    mockStoreState.questions = sampleQuestions;
    mockStoreState.answers = { q1: 'o1', q2: 'o6', q3: 'o10' };
    mockStoreState.isSubmitting = true;

    render(<QuizComponent chapterId="ch1" onComplete={mockOnComplete} />);
    // Navigate to last question
    fireEvent.click(screen.getByRole('button', { name: /berikutnya/i }));
    fireEvent.click(screen.getByRole('button', { name: /berikutnya/i }));
    expect(screen.getByText('Mengirim...')).toBeInTheDocument();
  });

  it('calls reset and loadQuestions on mount', () => {
    mockStoreState.questions = sampleQuestions;
    render(<QuizComponent chapterId="ch1" onComplete={mockOnComplete} />);
    expect(mockReset).toHaveBeenCalled();
    expect(mockLoadQuestions).toHaveBeenCalledWith('ch1');
  });

  it('highlights selected option', () => {
    mockStoreState.questions = sampleQuestions;
    mockStoreState.answers = { q1: 'o1' };
    render(<QuizComponent chapterId="ch1" onComplete={mockOnComplete} />);
    const radio = screen.getByLabelText('Jakarta') as HTMLInputElement;
    expect(radio.checked).toBe(true);
  });
});
