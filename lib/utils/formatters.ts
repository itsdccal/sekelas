/**
 * Calculate completion percentage as an integer 0-100.
 * Returns 0 if total is 0 to avoid division by zero.
 */
export function formatCompletionPercentage(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * Format XP value with period as thousand separator and " XP" suffix.
 * Examples: 1250 → "1.250 XP", 50 → "50 XP", 0 → "0 XP"
 */
export function formatXP(xp: number): string {
  const formatted = xp.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatted} XP`;
}

/**
 * Format progress summary string in Indonesian.
 * Returns exactly: "${completed} dari ${total} Chapter selesai"
 */
export function formatProgressSummary(completed: number, total: number): string {
  return `${completed} dari ${total} Chapter selesai`;
}

/**
 * Format video progress as integer percentage string.
 * Returns Math.round(percentage) + "%" — e.g. 45.7 → "46%"
 */
export function formatVideoProgress(percentage: number): string {
  return `${Math.round(percentage)}%`;
}
