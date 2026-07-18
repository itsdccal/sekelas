import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GlobalError from './error';

describe('GlobalError (app/error.tsx)', () => {
  const mockReset = vi.fn();
  const mockError = new Error('Test error');
  let originalReload: () => void;

  beforeEach(() => {
    vi.clearAllMocks();
    originalReload = window.location.reload;
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload: vi.fn() },
      writable: true,
    });
  });

  it('displays error message', () => {
    render(<GlobalError error={mockError} reset={mockReset} />);
    expect(screen.getByText('Terjadi Kesalahan')).toBeInTheDocument();
    expect(
      screen.getByText(/terjadi kesalahan yang tidak terduga/i)
    ).toBeInTheDocument();
  });

  it('has role="alert" for accessibility', () => {
    render(<GlobalError error={mockError} reset={mockReset} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('calls reset when "Coba Lagi" is clicked', () => {
    render(<GlobalError error={mockError} reset={mockReset} />);
    fireEvent.click(screen.getByRole('button', { name: /coba lagi/i }));
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('reloads the page when "Muat Ulang Halaman" is clicked', () => {
    render(<GlobalError error={mockError} reset={mockReset} />);
    fireEvent.click(screen.getByRole('button', { name: /muat ulang halaman/i }));
    expect(window.location.reload).toHaveBeenCalledTimes(1);
  });
});
