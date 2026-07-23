/**
 * Route-level loading UI for the Student workspace.
 * Displayed automatically by Next.js App Router during page transitions.
 * Matches the final layout structure (header + sidebar are in layout, so this
 * only provides the main content area skeleton).
 *
 * Requirements: 17.3, 17.5
 */
export default function StudentLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Memuat halaman">
      {/* Page title skeleton */}
      <div className="h-7 w-48 animate-pulse rounded bg-muted" />

      {/* Content cards skeleton grid - matches dashboard/courses layout */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-border bg-white p-5"
          >
            <div className="mb-3 h-5 w-3/4 rounded bg-muted" />
            <div className="mb-2 h-4 w-full rounded bg-muted" />
            <div className="h-4 w-1/3 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
