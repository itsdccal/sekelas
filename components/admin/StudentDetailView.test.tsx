import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import StudentDetailView from './StudentDetailView';
import type { StudentProgress } from '@/lib/types';

// Mock the admin API
vi.mock('@/lib/api', () => ({
  adminApi: {
    getStudentDetail: vi.fn(),
  },
}));

import { adminApi } from '@/lib/api';

const mockGetStudentDetail = vi.mocked(adminApi.getStudentDetail);

const mockProgress: StudentProgress = {
  userId: 'user-1',
  completedChapters: 3,
  totalChapters: 10,
  totalXP: 750,
  materiProgress: [
    {
      materiId: 'materi-1',
      materiName: 'Matematika Dasar',
      completionPercentage: 50,
      babs: [
        {
          babId: 'bab-1',
          babName: 'Aljabar',
          chapters: [
            {
              chapterId: 'ch-1',
              status: 'COMPLETED',
              watchedPercentage: 100,
              lastScore: 85,
              quizAttempts: 1,
              videoWatchAttempts: 1,
            },
            {
              chapterId: 'ch-2',
              status: 'REMEDIATION_REQUIRED',
              watchedPercentage: 100,
              lastScore: 40,
              quizAttempts: 1,
              videoWatchAttempts: 2,
            },
          ],
        },
        {
          babId: 'bab-2',
          babName: 'Geometri',
          chapters: [
            {
              chapterId: 'ch-3',
              status: 'LOCKED',
              watchedPercentage: 0,
              lastScore: null,
              quizAttempts: 0,
              videoWatchAttempts: 0,
            },
          ],
        },
      ],
    },
    {
      materiId: 'materi-2',
      materiName: 'Bahasa Indonesia',
      completionPercentage: 0,
      babs: [],
    },
  ],
};

describe('StudentDetailView', () => {
  const onBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows skeleton loading state initially', () => {
    mockGetStudentDetail.mockReturnValue(new Promise(() => {})); // never resolves

    render(<StudentDetailView userId="user-1" onBack={onBack} />);

    expect(screen.getByLabelText('Memuat detail siswa')).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', async () => {
    mockGetStudentDetail.mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();

    render(<StudentDetailView userId="user-1" onBack={onBack} />);

    await user.click(screen.getByText('Kembali ke daftar'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('displays error state with retry button on API failure', async () => {
    mockGetStudentDetail.mockRejectedValueOnce(new Error('Network error'));

    render(<StudentDetailView userId="user-1" onBack={onBack} />);

    await waitFor(() => {
      expect(screen.getByText('Gagal memuat detail progres siswa. Silakan coba lagi.')).toBeInTheDocument();
    });

    expect(screen.getByText('Coba Lagi')).toBeInTheDocument();
  });

  it('retries loading on retry button click', async () => {
    mockGetStudentDetail
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce(mockProgress);

    const user = userEvent.setup();
    render(<StudentDetailView userId="user-1" onBack={onBack} />);

    await waitFor(() => {
      expect(screen.getByText('Coba Lagi')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Coba Lagi'));

    await waitFor(() => {
      expect(screen.getByText('Matematika Dasar')).toBeInTheDocument();
    });

    expect(mockGetStudentDetail).toHaveBeenCalledTimes(2);
  });

  it('displays empty state when no progress data', async () => {
    mockGetStudentDetail.mockResolvedValueOnce({
      userId: 'user-1',
      completedChapters: 0,
      totalChapters: 0,
      totalXP: 0,
      materiProgress: [],
    });

    render(<StudentDetailView userId="user-1" onBack={onBack} />);

    await waitFor(() => {
      expect(screen.getByText('Belum ada data progres untuk siswa ini.')).toBeInTheDocument();
    });
  });

  it('displays progress summary and materi list on success', async () => {
    mockGetStudentDetail.mockResolvedValueOnce(mockProgress);

    render(<StudentDetailView userId="user-1" onBack={onBack} />);

    await waitFor(() => {
      expect(screen.getByText('Matematika Dasar')).toBeInTheDocument();
    });

    expect(screen.getByText('3/10 Chapter selesai')).toBeInTheDocument();
    expect(screen.getByText('750 XP')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('Bahasa Indonesia')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('expands materi to show babs on click', async () => {
    mockGetStudentDetail.mockResolvedValueOnce(mockProgress);
    const user = userEvent.setup();

    render(<StudentDetailView userId="user-1" onBack={onBack} />);

    await waitFor(() => {
      expect(screen.getByText('Matematika Dasar')).toBeInTheDocument();
    });

    // Click to expand
    await user.click(screen.getByText('Matematika Dasar'));

    expect(screen.getByText('Aljabar')).toBeInTheDocument();
    expect(screen.getByText('Geometri')).toBeInTheDocument();
  });

  it('expands bab to show chapters with status icons and details', async () => {
    mockGetStudentDetail.mockResolvedValueOnce(mockProgress);
    const user = userEvent.setup();

    render(<StudentDetailView userId="user-1" onBack={onBack} />);

    await waitFor(() => {
      expect(screen.getByText('Matematika Dasar')).toBeInTheDocument();
    });

    // Expand Materi
    await user.click(screen.getByText('Matematika Dasar'));
    // Expand Bab
    await user.click(screen.getByText('Aljabar'));

    // Check status labels
    expect(screen.getByText('Selesai')).toBeInTheDocument();
    expect(screen.getByText('Perlu Remediasi')).toBeInTheDocument();

    // Check quiz scores
    expect(screen.getByText('Skor: 85%')).toBeInTheDocument();
    expect(screen.getByText('Skor: 40%')).toBeInTheDocument();

    // Check remediation attempts (videoWatchAttempts - 1)
    expect(screen.getByText('1 remediasi')).toBeInTheDocument();

    // Check status icons are rendered (via aria-labels)
    expect(screen.getByLabelText('Selesai')).toBeInTheDocument();
    expect(screen.getByLabelText('Perlu remediasi')).toBeInTheDocument();
  });

  it('shows locked chapter with correct status icon', async () => {
    mockGetStudentDetail.mockResolvedValueOnce(mockProgress);
    const user = userEvent.setup();

    render(<StudentDetailView userId="user-1" onBack={onBack} />);

    await waitFor(() => {
      expect(screen.getByText('Matematika Dasar')).toBeInTheDocument();
    });

    // Expand Materi
    await user.click(screen.getByText('Matematika Dasar'));
    // Expand Geometri Bab
    await user.click(screen.getByText('Geometri'));

    expect(screen.getByText('Terkunci')).toBeInTheDocument();
    expect(screen.getByLabelText('Terkunci')).toBeInTheDocument();
    expect(screen.getByText('Belum kuis')).toBeInTheDocument();
  });

  it('shows "Tidak ada Bab" for empty materi', async () => {
    mockGetStudentDetail.mockResolvedValueOnce(mockProgress);
    const user = userEvent.setup();

    render(<StudentDetailView userId="user-1" onBack={onBack} />);

    await waitFor(() => {
      expect(screen.getByText('Bahasa Indonesia')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Bahasa Indonesia'));
    expect(screen.getByText('Tidak ada Bab.')).toBeInTheDocument();
  });

  it('calls API with correct userId', async () => {
    mockGetStudentDetail.mockResolvedValueOnce(mockProgress);

    render(<StudentDetailView userId="user-123" onBack={onBack} />);

    await waitFor(() => {
      expect(mockGetStudentDetail).toHaveBeenCalledWith('user-123');
    });
  });
});
