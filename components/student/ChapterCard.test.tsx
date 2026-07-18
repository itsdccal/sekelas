import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ChapterCard } from './ChapterCard';
import type { Chapter } from '@/lib/types/curriculum';
import type { ChapterStatus } from '@/lib/types/progress';

const baseChapter: Chapter = {
  id: 'ch-1',
  babId: 'bab-1',
  name: 'Pengenalan Aljabar',
  orderIndex: 1,
  videoUrl: 'https://example.com/video.mp4',
  passingGrade: 75,
};

describe('ChapterCard', () => {
  describe('LOCKED status', () => {
    it('renders with grayscale, lock icon, and aria-disabled', () => {
      const onClick = vi.fn();
      render(<ChapterCard chapter={baseChapter} status="LOCKED" onClick={onClick} />);

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('aria-disabled', 'true');
      expect(card).toHaveClass('grayscale', 'pointer-events-none', 'opacity-50');
      expect(screen.getByLabelText('Chapter terkunci')).toBeInTheDocument();
    });

    it('does not call onClick when clicked', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      // pointer-events-none prevents clicks at CSS level; we verify clickable is false
      render(<ChapterCard chapter={baseChapter} status="LOCKED" onClick={onClick} />);

      const card = screen.getByRole('button');
      // Force click attempt (bypassing pointer-events-none in tests)
      await user.click(card);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('UNLOCKED status', () => {
    it('renders full color, clickable, no status icon', () => {
      const onClick = vi.fn();
      render(<ChapterCard chapter={baseChapter} status="UNLOCKED" onClick={onClick} />);

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('aria-disabled', 'false');
      expect(card).not.toHaveClass('grayscale');
      expect(screen.queryByLabelText('Chapter terkunci')).not.toBeInTheDocument();
    });

    it('calls onClick with chapterId when clicked', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<ChapterCard chapter={baseChapter} status="UNLOCKED" onClick={onClick} />);

      await user.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledWith('ch-1');
    });

    it('calls onClick on Enter key press', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<ChapterCard chapter={baseChapter} status="UNLOCKED" onClick={onClick} />);

      const card = screen.getByRole('button');
      card.focus();
      await user.keyboard('{Enter}');
      expect(onClick).toHaveBeenCalledWith('ch-1');
    });
  });

  describe('COMPLETED status', () => {
    it('renders green checkmark icon with green border', () => {
      const onClick = vi.fn();
      render(<ChapterCard chapter={baseChapter} status="COMPLETED" onClick={onClick} />);

      const card = screen.getByRole('button');
      expect(card).toHaveClass('border-green-500');
      expect(screen.getByLabelText('Chapter selesai')).toBeInTheDocument();
    });

    it('is clickable', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<ChapterCard chapter={baseChapter} status="COMPLETED" onClick={onClick} />);

      await user.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledWith('ch-1');
    });
  });

  describe('REMEDIATION_REQUIRED status', () => {
    it('renders red warning icon, red border, and remediation text', () => {
      const onClick = vi.fn();
      render(<ChapterCard chapter={baseChapter} status="REMEDIATION_REQUIRED" onClick={onClick} />);

      const card = screen.getByRole('button');
      expect(card).toHaveClass('border-red-500');
      expect(screen.getByLabelText('Perlu tonton ulang video')).toBeInTheDocument();
      expect(screen.getByText('Tonton ulang video sebelum kuis ulang')).toBeInTheDocument();
    });

    it('is clickable', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<ChapterCard chapter={baseChapter} status="REMEDIATION_REQUIRED" onClick={onClick} />);

      await user.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledWith('ch-1');
    });
  });

  describe('READY_FOR_RETAKE status', () => {
    it('renders retake button with yellow border', () => {
      const onClick = vi.fn();
      render(<ChapterCard chapter={baseChapter} status="READY_FOR_RETAKE" onClick={onClick} />);

      // The outer card div has role="button"
      const buttons = screen.getAllByRole('button');
      const card = buttons.find(el => el.tagName !== 'BUTTON')!;
      expect(card).toHaveClass('border-yellow-500');

      // The inner retake <button> element
      const retakeBtn = buttons.find(el => el.tagName === 'BUTTON')!;
      expect(retakeBtn).toHaveTextContent('Kerjakan Kuis Kembali');
    });

    it('calls onClick when retake button is clicked', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<ChapterCard chapter={baseChapter} status="READY_FOR_RETAKE" onClick={onClick} />);

      const buttons = screen.getAllByRole('button');
      const retakeBtn = buttons.find(el => el.tagName === 'BUTTON')!;
      await user.click(retakeBtn);
      expect(onClick).toHaveBeenCalledWith('ch-1');
    });

    it('does not call onClick when clicking the card itself (only retake button triggers)', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<ChapterCard chapter={baseChapter} status="READY_FOR_RETAKE" onClick={onClick} />);

      // Click the card container area (not the button)
      const chapterName = screen.getByText('Pengenalan Aljabar');
      await user.click(chapterName);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('displays chapter name', () => {
    it('shows the chapter name for all statuses', () => {
      const statuses: ChapterStatus[] = ['LOCKED', 'UNLOCKED', 'COMPLETED', 'REMEDIATION_REQUIRED', 'READY_FOR_RETAKE'];
      const onClick = vi.fn();

      for (const status of statuses) {
        const { unmount } = render(<ChapterCard chapter={baseChapter} status={status} onClick={onClick} />);
        expect(screen.getByText('Pengenalan Aljabar')).toBeInTheDocument();
        unmount();
      }
    });
  });
});
