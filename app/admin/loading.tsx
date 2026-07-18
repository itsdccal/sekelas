/**
 * Route-level loading UI for the Admin workspace.
 * Displayed automatically by Next.js App Router during page transitions.
 * Matches the final layout structure with table-like skeleton for admin panels.
 *
 * Requirements: 17.3, 17.5
 */
export default function AdminLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Memuat halaman">
      {/* Page title skeleton */}
      <div className="h-7 w-56 animate-pulse rounded bg-muted" />

      {/* Action bar skeleton (search + add button) */}
      <div className="flex items-center justify-between gap-4">
        <div className="h-10 w-64 animate-pulse rounded-md bg-muted" />
        <div className="h-10 w-32 animate-pulse rounded-md bg-muted" />
      </div>

      {/* Table skeleton - matches admin CRUD table layout */}
      <div className="rounded-lg border border-border bg-white">
        {/* Table header */}
        <div className="flex gap-4 border-b border-border px-4 py-3">
          <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/6 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/6 animate-pulse rounded bg-muted" />
        </div>

        {/* Table rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-border px-4 py-4 last:border-b-0"
          >
            <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/6 animate-pulse rounded bg-muted" />
            <div className="flex gap-2 w-1/6">
              <div className="h-8 w-16 animate-pulse rounded bg-muted" />
              <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
