import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthInitializer } from './AuthInitializer';

const mockCheckAuth = vi.fn();

vi.mock('@/stores', () => ({
  useAuthStore: (selector: (state: { checkAuth: typeof mockCheckAuth }) => unknown) =>
    selector({ checkAuth: mockCheckAuth }),
}));

describe('AuthInitializer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls checkAuth on mount to restore state from cookie', () => {
    render(<AuthInitializer />);
    expect(mockCheckAuth).toHaveBeenCalledTimes(1);
  });

  it('renders nothing (null)', () => {
    const { container } = render(<AuthInitializer />);
    expect(container.innerHTML).toBe('');
  });

  it('does not call checkAuth again on re-render', () => {
    const { rerender } = render(<AuthInitializer />);
    rerender(<AuthInitializer />);
    expect(mockCheckAuth).toHaveBeenCalledTimes(1);
  });
});
