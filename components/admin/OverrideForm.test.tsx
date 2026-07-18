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

    const textarea = screen.getByLabelText(/alasan override/i);
    await user.type(textarea, 'pendek');

    expect(screen.getByText('Alasan minimal 10 karakter')).toBeInTheDocument();
  });

  it('enables confirm button when reason is valid (>= 10 chars)', async () => {
    const user = userEvent.setup();
    render(<OverrideForm {...defaultProps} />);

    const textarea = screen.getByLabelText(/alasan override/i);
    await user.type(textarea, 'Alasan override yang cukup panjang');

    const confirmBtn = screen.getByRole('button', { name: /konfirmasi override/i });
    expect(confirmBtn).not.toBeDisabled();
  });

  it('disables confirm button when reason is invalid', async () => {
    const user = userEvent.setup();
    render(<OverrideForm {...defaultProps} />);

    const textarea = screen.getByLabelText(/alasan override/i);
    await user.type(textarea, 'short');

    const confirmBtn = screen.getByRole('button', { name: /konfirmasi override/i });
    expect(confirmBtn).toBeDisabled();
  });

  it('calls onConfirm with reason when confirmed', async () => {
    const user = userEvent.setup();
    render(<OverrideForm {...defaultProps} />);

    const textarea = screen.getByLabelText(/alasan override/i);
    await user.type(textarea, 'Alasan valid untuk override');

    const confirmBtn = screen.getByRole('button', { name: /konfirmasi override/i });
    await user.click(confirmBtn);

    expect(defaultProps.onConfirm).toHaveBeenCalledWith('Alasan valid untuk override');
  });

  it('disables form when currentStatus is COMPLETED', () => {
    render(<OverrideForm {...defaultProps} currentStatus="COMPLETED" />);

    const textarea = screen.getByLabelText(/alasan override/i);
    expect(textarea).toBeDisabled();

    expect(screen.getByText(/sudah berstatus COMPLETED/)).toBeInTheDocument();
  });

  it('shows API error message and preserves form data on failure', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn().mockRejectedValue(new Error('Server error'));

    render(<OverrideForm {...defaultProps} onConfirm={onConfirm} />);

    const textarea = screen.getByLabelText(/alasan override/i);
    await user.type(textarea, 'Alasan valid untuk override');

    const confirmBtn = screen.getByRole('button', { name: /konfirmasi override/i });
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });

    // Form data preserved
    expect(textarea).toHaveValue('Alasan valid untuk override');
  });

  it('shows character counter', async () => {
    const user = userEvent.setup();
    render(<OverrideForm {...defaultProps} />);

    expect(screen.getByText('0/500')).toBeInTheDocument();

    const textarea = screen.getByLabelText(/alasan override/i);
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
});

describe('AuditLogTable', () => {
  const mockEntries: AuditLogEntry[] = [
    {
      id: '1',
      adminId: 'admin-1',
      adminName: 'Admin Satu',
      action: 'OVERRIDE',
      studentName: 'Budi',
      chapterName: 'Chapter A',
      reason: 'Kondisi khusus siswa',
      createdAt: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      adminId: 'admin-1',
      adminName: 'Admin Satu',
      action: 'OVERRIDE',
      studentName: 'Sari',
      chapterName: 'Chapter B',
      reason: 'Rekomendasi guru',
      createdAt: '2024-01-16T14:00:00Z',
    },
    {
      id: '3',
      adminId: 'admin-2',
      adminName: 'Admin Dua',
      action: 'OVERRIDE',
      studentName: 'Andi',
      chapterName: 'Chapter C',
      reason: 'Sakit berkepanjangan',
      createdAt: '2024-01-14T08:00:00Z',
    },
  ];

  it('renders table headers correctly', () => {
    render(<AuditLogTable entries={mockEntries} />);

    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Siswa')).toBeInTheDocument();
    expect(screen.getByText('Chapter')).toBeInTheDocument();
    expect(screen.getByText('Alasan')).toBeInTheDocument();
    expect(screen.getByText('Waktu')).toBeInTheDocument();
  });

  it('renders entries sorted by newest first', () => {
    render(<AuditLogTable entries={mockEntries} />);

    const rows = screen.getAllByRole('row');
    // First data row (index 1 because 0 is header)
    expect(rows[1]).toHaveTextContent('Sari'); // Jan 16 - newest
    expect(rows[2]).toHaveTextContent('Budi'); // Jan 15
    expect(rows[3]).toHaveTextContent('Andi'); // Jan 14 - oldest
  });

  it('shows empty state when no entries', () => {
    render(<AuditLogTable entries={[]} />);

    expect(screen.getByText('Belum ada riwayat override.')).toBeInTheDocument();
  });

  it('shows loading skeleton', () => {
    render(<AuditLogTable isLoading />);

    expect(screen.getByRole('status', { name: /memuat audit log/i })).toBeInTheDocument();
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
});
