import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VideoUploader } from './VideoUploader';

// Mock the admin API
vi.mock('@/lib/api', () => ({
  adminApi: {
    uploadVideo: vi.fn(),
  },
}));

import { adminApi } from '@/lib/api';

const mockUploadVideo = vi.mocked(adminApi.uploadVideo);

function createFile(name: string, size: number, type: string): File {
  const content = new ArrayBuffer(size);
  return new File([content], name, { type });
}

describe('VideoUploader', () => {
  const onUploadComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('renders dropzone with drag-and-drop area when no existing video', () => {
      render(<VideoUploader onUploadComplete={onUploadComplete} />);

      expect(screen.getByText('Seret file video ke sini')).toBeInTheDocument();
      expect(screen.getByText('atau klik untuk memilih file')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Pilih File' })).toBeInTheDocument();
      expect(screen.getByText('Format: MP4, WebM • Maks: 500MB')).toBeInTheDocument();
    });

    it('renders existing video thumbnail and replace button when existingVideoUrl is provided', () => {
      render(
        <VideoUploader
          existingVideoUrl="https://cdn.example.com/video.mp4"
          existingThumbnailUrl="https://cdn.example.com/thumb.jpg"
          onUploadComplete={onUploadComplete}
        />
      );

      expect(screen.getByAltText('Thumbnail video saat ini')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Ganti Video/i })).toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    it('shows error when file format is invalid', async () => {
      render(<VideoUploader onUploadComplete={onUploadComplete} />);

      const input = screen.getByLabelText('Pilih file video');
      const invalidFile = createFile('test.avi', 1024, 'video/avi');

      await act(async () => {
        fireEvent.change(input, { target: { files: [invalidFile] } });
      });

      expect(
        screen.getByText('Format video tidak valid. Hanya MP4 dan WebM yang diizinkan')
      ).toBeInTheDocument();
      expect(mockUploadVideo).not.toHaveBeenCalled();
    });

    it('shows error when file size exceeds 500MB', async () => {
      render(<VideoUploader onUploadComplete={onUploadComplete} />);

      const input = screen.getByLabelText('Pilih file video');
      const largeFile = createFile('test.mp4', 501 * 1024 * 1024, 'video/mp4');

      await act(async () => {
        fireEvent.change(input, { target: { files: [largeFile] } });
      });

      expect(
        screen.getByText('Ukuran video melebihi batas maksimal 500MB')
      ).toBeInTheDocument();
      expect(mockUploadVideo).not.toHaveBeenCalled();
    });

    it('accepts valid MP4 file and starts upload', async () => {
      mockUploadVideo.mockResolvedValue({
        videoUrl: 'https://cdn.example.com/new-video.mp4',
        thumbnailUrl: 'https://cdn.example.com/new-thumb.jpg',
      });

      render(<VideoUploader onUploadComplete={onUploadComplete} />);

      const input = screen.getByLabelText('Pilih file video');
      const validFile = createFile('test.mp4', 10 * 1024 * 1024, 'video/mp4');

      await act(async () => {
        fireEvent.change(input, { target: { files: [validFile] } });
      });

      await waitFor(() => {
        expect(mockUploadVideo).toHaveBeenCalledWith(validFile, expect.any(Function));
      });
    });

    it('accepts valid WebM file and starts upload', async () => {
      mockUploadVideo.mockResolvedValue({
        videoUrl: 'https://cdn.example.com/new-video.webm',
        thumbnailUrl: 'https://cdn.example.com/new-thumb.jpg',
      });

      render(<VideoUploader onUploadComplete={onUploadComplete} />);

      const input = screen.getByLabelText('Pilih file video');
      const validFile = createFile('test.webm', 100 * 1024 * 1024, 'video/webm');

      await act(async () => {
        fireEvent.change(input, { target: { files: [validFile] } });
      });

      await waitFor(() => {
        expect(mockUploadVideo).toHaveBeenCalledWith(validFile, expect.any(Function));
      });
    });
  });

  describe('Upload Progress', () => {
    it('shows progress bar during upload', async () => {
      let progressCallback: ((pct: number) => void) | undefined;
      mockUploadVideo.mockImplementation(async (_file, onProgress) => {
        progressCallback = onProgress;
        // Simulate async behavior
        return new Promise(() => {});
      });

      render(<VideoUploader onUploadComplete={onUploadComplete} />);

      const input = screen.getByLabelText('Pilih file video');
      const validFile = createFile('test.mp4', 10 * 1024 * 1024, 'video/mp4');

      await act(async () => {
        fireEvent.change(input, { target: { files: [validFile] } });
      });

      expect(screen.getByText('Mengunggah...')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      // Simulate progress
      await act(async () => {
        progressCallback?.(50);
      });

      expect(screen.getByText('50%')).toBeInTheDocument();
    });
  });

  describe('Upload Success', () => {
    it('shows thumbnail preview and calls onUploadComplete', async () => {
      const response = {
        videoUrl: 'https://cdn.example.com/uploaded.mp4',
        thumbnailUrl: 'https://cdn.example.com/uploaded-thumb.jpg',
      };
      mockUploadVideo.mockResolvedValue(response);

      render(<VideoUploader onUploadComplete={onUploadComplete} />);

      const input = screen.getByLabelText('Pilih file video');
      const validFile = createFile('test.mp4', 10 * 1024 * 1024, 'video/mp4');

      await act(async () => {
        fireEvent.change(input, { target: { files: [validFile] } });
      });

      await waitFor(() => {
        expect(screen.getByAltText('Thumbnail video')).toBeInTheDocument();
      });

      expect(onUploadComplete).toHaveBeenCalledWith(response);
      expect(screen.getByRole('button', { name: /Ganti Video/i })).toBeInTheDocument();
    });
  });

  describe('Upload Error and Retry', () => {
    it('shows error message and retry button on failure', async () => {
      mockUploadVideo.mockRejectedValue(new Error('Network error'));

      render(<VideoUploader onUploadComplete={onUploadComplete} />);

      const input = screen.getByLabelText('Pilih file video');
      const validFile = createFile('test.mp4', 10 * 1024 * 1024, 'video/mp4');

      await act(async () => {
        fireEvent.change(input, { target: { files: [validFile] } });
      });

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /Coba Lagi/i })).toBeInTheDocument();
    });

    it('retries upload without re-selecting file when retry button clicked', async () => {
      const response = {
        videoUrl: 'https://cdn.example.com/uploaded.mp4',
        thumbnailUrl: 'https://cdn.example.com/uploaded-thumb.jpg',
      };
      mockUploadVideo
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(response);

      render(<VideoUploader onUploadComplete={onUploadComplete} />);

      const input = screen.getByLabelText('Pilih file video');
      const validFile = createFile('test.mp4', 10 * 1024 * 1024, 'video/mp4');

      await act(async () => {
        fireEvent.change(input, { target: { files: [validFile] } });
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Coba Lagi/i })).toBeInTheDocument();
      });

      // Click retry
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Coba Lagi/i }));
      });

      await waitFor(() => {
        expect(mockUploadVideo).toHaveBeenCalledTimes(2);
        expect(onUploadComplete).toHaveBeenCalledWith(response);
      });
    });
  });

  describe('Drag and Drop', () => {
    it('handles file drop correctly', async () => {
      mockUploadVideo.mockResolvedValue({
        videoUrl: 'https://cdn.example.com/uploaded.mp4',
        thumbnailUrl: 'https://cdn.example.com/uploaded-thumb.jpg',
      });

      render(<VideoUploader onUploadComplete={onUploadComplete} />);

      const dropzone = screen.getByRole('button', {
        name: /Area drag-and-drop/i,
      });
      const validFile = createFile('test.mp4', 10 * 1024 * 1024, 'video/mp4');

      await act(async () => {
        fireEvent.drop(dropzone, {
          dataTransfer: { files: [validFile] },
        });
      });

      await waitFor(() => {
        expect(mockUploadVideo).toHaveBeenCalledWith(validFile, expect.any(Function));
      });
    });

    it('shows visual feedback on drag over', () => {
      render(<VideoUploader onUploadComplete={onUploadComplete} />);

      const dropzone = screen.getByRole('button', {
        name: /Area drag-and-drop/i,
      });

      fireEvent.dragOver(dropzone);
      expect(dropzone.className).toContain('border-primary-600');
    });
  });

  describe('Video Replacement', () => {
    it('allows replacing existing video', async () => {
      mockUploadVideo.mockResolvedValue({
        videoUrl: 'https://cdn.example.com/new-video.mp4',
        thumbnailUrl: 'https://cdn.example.com/new-thumb.jpg',
      });

      render(
        <VideoUploader
          existingVideoUrl="https://cdn.example.com/old.mp4"
          existingThumbnailUrl="https://cdn.example.com/old-thumb.jpg"
          onUploadComplete={onUploadComplete}
        />
      );

      // Click "Ganti Video"
      const replaceBtn = screen.getByRole('button', { name: /Ganti Video/i });
      expect(replaceBtn).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper aria labels on the dropzone', () => {
      render(<VideoUploader onUploadComplete={onUploadComplete} />);

      const dropzone = screen.getByRole('button', {
        name: /Area drag-and-drop/i,
      });
      expect(dropzone).toHaveAttribute('tabIndex', '0');
    });

    it('has aria-label on the file input', () => {
      render(<VideoUploader onUploadComplete={onUploadComplete} />);

      expect(screen.getByLabelText('Pilih file video')).toBeInTheDocument();
    });

    it('has proper progressbar role during upload', async () => {
      mockUploadVideo.mockImplementation(() => new Promise(() => {}));

      render(<VideoUploader onUploadComplete={onUploadComplete} />);

      const input = screen.getByLabelText('Pilih file video');
      const validFile = createFile('test.mp4', 10 * 1024 * 1024, 'video/mp4');

      await act(async () => {
        fireEvent.change(input, { target: { files: [validFile] } });
      });

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuemin', '0');
      expect(progressbar).toHaveAttribute('aria-valuemax', '100');
      expect(progressbar).toHaveAttribute('aria-label', 'Progress upload video');
    });

    it('shows errors in alert role', async () => {
      render(<VideoUploader onUploadComplete={onUploadComplete} />);

      const input = screen.getByLabelText('Pilih file video');
      const invalidFile = createFile('test.avi', 1024, 'video/avi');

      await act(async () => {
        fireEvent.change(input, { target: { files: [invalidFile] } });
      });

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });
});
