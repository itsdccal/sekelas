import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OverrideForm, AuditLogTable } from './OverrideForm';
import type { AuditLogEntry, ChapterStatus } from '@/lib/types';

// Mock the API module
vi.mock('@/lib/api', () => ({
  adminApi: {
    overrideChapter: vi.fn(),
    getAuditLog: vi.fn(),
  },
}));

describe('OverrideForm', () => {
  const defaultProps = {
    student: { id: 'student-1', name: 'Budi Setiawan' },
    chapter: { id: 'chapter-1', name: 'Bab 1 - Pengenalan' },
    currentStatus: 'UNLOCKED' as ChapterStatus,
    onConfirm: vi.fn().mockResolvedValue(undefined),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays student and chapter information', () => {
    render(<OverrideForm {...defaultProps} />);

    expect(screen.getByText('Budi Setiawan')).toBeInTheDocument();
    expect(screen.getByText('Bab 1 - Pengenalan')).toBeInTheDocument();
    expect(screen.getByText('UNLOCKED')).toBeInTheDocument();
  });

  it('shows validation error for reason less than 10 chars', async () => {
    const user = userEvent.setup();
    render(<OverrideForm {...defaultProps} />);

    const textarea = screen.getByLabelText(/alasan/i);
    await user.type(textarea, 'pendek');

    expect(screen.getByText('Alasan minimal 10 karakter')).toBeInTheDocument();
  });

  it('enables confirm button when form is valid (score + reason)', async () => {
    const user = userEvent.setup();
    render(<OverrideForm {...defaultProps} />);

    const scoreInput = screen.getByPlaceholderText('0–100');
    await user.type(scoreInput, '75');

    const textarea = screen.getByLabelText(/alasan/i);
    await user.type(textarea, 'Alasan penyesuaian yang cukup panjang');

    const confirmBtn = screen.getByRole('button', { name: /konfirmasi penyesuaian/i });
    expect(confirmBtn).not.toBeDisabled();
  });

  it('disables confirm button when reason is invalid', async () => {
    const user = userEvent.setup();
    render(<OverrideForm {...defaultProps} />);

    const scoreInput = screen.getByPlaceholderText('0–100');
    await user.type(scoreInput, '75');

    const textarea = screen.getByLabelText(/alasan/i);
    await user.type(textarea, 'short');

    const confirmBtn = screen.getByRole('button', { name: /konfirmasi penyesuaian/i });
    expect(confirmBtn).toBeDisabled();
  });

  it('disables confirm button when score is missing', async () => {
    const user = userEvent.setup();
    render(<OverrideForm {...defaultProps} />);

    const textarea = screen.getByLabelText(/alasan/i);
    await user.type(textarea, 'Alasan valid untuk penyesuaian');

    const confirmBtn = screen.getByRole('button', { name: /konfirmasi penyesuaian/i });
    expect(confirmBtn).toBeDisabled();
  });

  it('calls onConfirm with action, reason, and score when confirmed', async () => {
    const user = userEvent.setup();
    render(<OverrideForm {...defaultProps} />);

    const scoreInput = screen.getByPlaceholderText('0–100');
    await user.type(scoreInput, '80');

    const textarea = screen.getByLabelText(/alasan/i);
    await user.type(textarea, 'Alasan valid untuk penyesuaian');

    const confirmBtn = screen.getByRole('button', { name: /konfirmasi penyesuaian/i });
    await user.click(confirmBtn);

    expect(defaultProps.onConfirm).toHaveBeenCalledWith({
      action: 'FORCE_COMPLETE',
      reason: 'Alasan valid untuk penyesuaian',
      score: 80,
    });
  });

  it('disables form when currentStatus is COMPLETED', () => {
    render(<OverrideForm {...defaultProps} currentStatus="COMPLETED" />);

    const textarea = screen.getByLabelText(/alasan/i);
    expect(textarea).toBeDisabled();

    expect(screen.getByText(/sudah berstatus COMPLETED/)).toBeInTheDocument();
  });

  it('shows API error message and preserves form data on failure', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn().mockRejectedValue(new Error('Server error'));

    render(<OverrideForm {...defaultProps} onConfirm={onConfirm} />);

    const scoreInput = screen.getByPlaceholderText('0–100');
    await user.type(scoreInput, '75');

    const textarea = screen.getByLabelText(/alasan/i);
    await user.type(textarea, 'Alasan valid untuk penyesuaian');

    const confirmBtn = screen.getByRole('button', { name: /konfirmasi penyesuaian/i });
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });

    // Form data preserved
    expect(textarea).toHaveValue('Alasan valid untuk penyesuaian');
    expect(scoreInput).toHaveValue(75);
  });

  it('shows character counter', async () => {
    const user = userEvent.setup();
    render(<OverrideForm {...defaultProps} />);

    expect(screen.getByText('0/500')).toBeInTheDocument();

    const textarea = screen.getByLabelText(/alasan/i);
    await user.type(textarea, 'Hello World');

    expect(screen.getByText('11/500')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<OverrideForm {...defaultProps} />);

    const cancelBtn = screen.getByRole('button', { name: /batal/i });
    await user.click(cancelBtn);

    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('validates score is between 0-100', async () => {
    const user = userEvent.setup();
    render(<OverrideForm {...defaultProps} />);

    const scoreInput = screen.getByPlaceholderText('0–100');
    await user.type(scoreInput, '150');

    expect(screen.getByText('Skor harus antara 0–100')).toBeInTheDocument();
  });
});

describe('AuditLogTable', () => {
  const mockEntries: AuditLogEntry[] = [
    {
      id: '1',
      adminId: 'admin-1',
      adminName: 'Admin Satu',
      studentId: 'student-1',
      studentName: 'Budi',
      chapterId: 'ch-1',
      chapterName: 'Chapter A',
      action: 'FORCE_COMPLETE',
      reason: 'Kondisi khusus siswa dalam pembelajaran',
      score: 75,
      createdAt: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      adminId: 'admin-1',
      adminName: 'Admin Satu',
      studentId: 'student-2',
      studentName: 'Sari',
      chapterId: 'ch-2',
      chapterName: 'Chapter B',
      action: 'FORCE_COMPLETE',
      reason: 'Rekomendasi guru karena sudah menguasai materi',
      score: 82,
      createdAt: '2024-01-16T14:00:00Z',
    },
    {
      id: '3',
      adminId: 'admin-2',
      adminName: 'Admin Dua',
      studentId: 'student-3',
      studentName: 'Andi',
      chapterId: 'ch-3',
      chapterName: 'Chapter C',
      action: 'FORCE_COMPLETE',
      reason: 'Sakit berkepanjangan, sudah ujian offline',
      score: 70,
      createdAt: '2024-01-14T08:00:00Z',
    },
  ];

  it('renders table headers correctly', () => {
    render(<AuditLogTable entries={mockEntries} />);

    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Siswa')).toBeInTheDocument();
    expect(screen.getByText('Chapter')).toBeInTheDocument();
    expect(screen.getByText('Skor')).toBeInTheDocument();
    expect(screen.getByText('Alasan')).toBeInTheDocument();
    expect(screen.getByText('Waktu')).toBeInTheDocument();
  });

  it('renders entries sorted by newest first', () => {
    render(<AuditLogTable entries={mockEntries} />);

    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Sari'); // Jan 16 - newest
    expect(rows[2]).toHaveTextContent('Budi'); // Jan 15
    expect(rows[3]).toHaveTextContent('Andi'); // Jan 14 - oldest
  });

  it('shows empty state when no entries', () => {
    render(<AuditLogTable entries={[]} />);

    expect(screen.getByText('Belum ada riwayat penyesuaian.')).toBeInTheDocument();
  });

  it('shows loading skeleton', () => {
    render(<AuditLogTable isLoading />);

    expect(screen.getByRole('status', { name: /memuat riwayat penyesuaian/i })).toBeInTheDocument();
  });

  it('shows error state with retry button', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(<AuditLogTable error="Gagal memuat" onRetry={onRetry} />);

    expect(screen.getByText('Gagal memuat')).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /coba lagi/i });
    await user.click(retryBtn);

    expect(onRetry).toHaveBeenCalled();
  });

  it('displays score values correctly', () => {
    render(<AuditLogTable entries={mockEntries} />);

    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('82%')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
  });
});
