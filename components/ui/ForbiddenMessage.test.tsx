import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ForbiddenMessage } from './ForbiddenMessage';

describe('ForbiddenMessage', () => {
  it('displays default message', () => {
    render(<ForbiddenMessage />);
    expect(
      screen.getByText('Anda tidak memiliki akses ke resource ini.')
    ).toBeInTheDocument();
  });

  it('displays custom message', () => {
    render(<ForbiddenMessage message="Akses ditolak untuk halaman ini." />);
    expect(
      screen.getByText('Akses ditolak untuk halaman ini.')
    ).toBeInTheDocument();
  });

  it('has role="alert" for screen readers', () => {
    render(<ForbiddenMessage />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('has aria-live="polite" for non-intrusive announcement', () => {
    render(<ForbiddenMessage />);
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
  });
});
