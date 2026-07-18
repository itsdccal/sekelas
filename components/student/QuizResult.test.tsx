import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QuizResultDisplay } from './QuizResult';
import type { QuizResult } from '@/lib/types';

const passedResult: QuizResult = {
  status: 'PASSED',
  score: 80,
  passingGrade: 70,
  nextStatus: 'COMPLETED',
  message: 'Selamat! Anda berhasil lulus kuis ini.',
};

const failedResult: QuizResult = {
  status: 'FAILED',
  score: 50,
  passingGrade: 70,
  nextStatus: 'REMEDIATION_REQUIRED',
  message: 'Anda perlu menonton ulang video sebelum mengerjakan kuis kembali.',
};

const readyForRetakeResult: QuizResult = {
  status: 'FAILED',
  score: 50,
  passingGrade: 70,
  nextStatus: 'READY_FOR_RETAKE',
  message: 'Anda dapat mengerjakan kuis kembali.',
};

describe('QuizResultDisplay', () => {
  describe('PASSED state', () => {
    it('displays score percentage', () => {
      render(<QuizResultDisplay result={passedResult} onContinue={vi.fn()} />);
      expect(screen.getByText('80%')).toBeInTheDocument();
    });

    it('displays passing grade', () => {
      render(<QuizResultDisplay result={passedResult} onContinue={vi.fn()} />);
      expect(screen.getByText('Nilai minimum: 70%')).toBeInTheDocument();
    });

    it('displays success message', () => {
      render(<QuizResultDisplay result={passedResult} onContinue={vi.fn()} />);
      expect(screen.getByText('Selamat! Anda berhasil lulus kuis ini.')).toBeInTheDocument();
    });

    it('displays "Lanjut ke Chapter Berikutnya" button', () => {
      render(<QuizResultDisplay result={passedResult} onContinue={vi.fn()} />);
      expect(screen.getByRole('button', { name: /lanjut ke chapter berikutnya/i })).toBeInTheDocument();
    });

    it('"Lanjut" button is enabled and calls onContinue', () => {
      const onContinue = vi.fn();
      render(<QuizResultDisplay result={passedResult} onContinue={onContinue} />);
      const button = screen.getByRole('button', { name: /lanjut ke chapter berikutnya/i });
      expect(button).not.toBeDisabled();
      fireEvent.click(button);
      expect(onContinue).toHaveBeenCalledTimes(1);
    });

    it('shows green checkmark icon', () => {
      const { container } = render(<QuizResultDisplay result={passedResult} onContinue={vi.fn()} />);
      // CheckCircle icon renders an SVG with the lucide-react class
      const iconContainer = container.querySelector('.bg-green-100');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('FAILED state', () => {
    it('displays score percentage', () => {
      render(<QuizResultDisplay result={failedResult} onContinue={vi.fn()} />);
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('displays passing grade', () => {
      render(<QuizResultDisplay result={failedResult} onContinue={vi.fn()} />);
      expect(screen.getByText('Nilai minimum: 70%')).toBeInTheDocument();
    });

    it('displays remediation message', () => {
      render(<QuizResultDisplay result={failedResult} onContinue={vi.fn()} />);
      expect(screen.getByText('Anda perlu menonton ulang video sebelum mengerjakan kuis kembali.')).toBeInTheDocument();
    });

    it('displays "Kerjakan Kuis Kembali" button in disabled state', () => {
      render(<QuizResultDisplay result={failedResult} onContinue={vi.fn()} />);
      const button = screen.getByRole('button', { name: /kerjakan kuis kembali/i });
      expect(button).toBeDisabled();
    });

    it('shows warning icon', () => {
      const { container } = render(<QuizResultDisplay result={failedResult} onContinue={vi.fn()} />);
      const iconContainer = container.querySelector('.bg-red-100');
      expect(iconContainer).toBeInTheDocument();
    });

    it('does not call onRetake when button is disabled', () => {
      const onRetake = vi.fn();
      render(<QuizResultDisplay result={failedResult} onContinue={vi.fn()} onRetake={onRetake} />);
      const button = screen.getByRole('button', { name: /kerjakan kuis kembali/i });
      fireEvent.click(button);
      expect(onRetake).not.toHaveBeenCalled();
    });
  });

  describe('READY_FOR_RETAKE state', () => {
    it('enables retake button when nextStatus is READY_FOR_RETAKE', () => {
      render(<QuizResultDisplay result={readyForRetakeResult} onContinue={vi.fn()} onRetake={vi.fn()} />);
      const button = screen.getByRole('button', { name: /kerjakan kuis kembali/i });
      expect(button).not.toBeDisabled();
    });

    it('calls onRetake when retake button is clicked', () => {
      const onRetake = vi.fn();
      render(<QuizResultDisplay result={readyForRetakeResult} onContinue={vi.fn()} onRetake={onRetake} />);
      const button = screen.getByRole('button', { name: /kerjakan kuis kembali/i });
      fireEvent.click(button);
      expect(onRetake).toHaveBeenCalledTimes(1);
    });
  });
});
