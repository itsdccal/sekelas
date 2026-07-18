'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Root-level error boundary for unhandled errors.
 * Next.js App Router automatically catches runtime errors in this component.
 *
 * Validates: Requirement 16.6 (error display + retry)
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error for observability (could send to error tracking service)
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center"
      role="alert"
      aria-live="assertive"
    >
      <div className="rounded-lg border border-border bg-white p-8 shadow-sm max-w-md w-full">
        <svg
          className="mx-auto h-12 w-12 text-destructive"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>

        <h2 className="mt-4 text-lg font-semibold text-foreground">
          Terjadi Kesalahan
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi atau muat ulang halaman.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button onClick={reset} variant="default" size="sm">
            Coba Lagi
          </Button>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
          >
            Muat Ulang Halaman
          </Button>
        </div>
      </div>
    </div>
  );
}
