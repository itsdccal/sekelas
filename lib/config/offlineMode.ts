/**
 * Offline Mode configuration.
 * When active, the LMS operates in "offline teaching" mode:
 * - Video is optional (can skip directly to quiz)
 * - Quiz scored from first attempt only (subsequent = practice)
 * - Simplified chapter flow (no remediation loop)
 * - Class (kelas) field is optional for students
 *
 * Controlled via environment variable at build/deploy time.
 */
export const isOfflineMode: boolean =
  process.env.NEXT_PUBLIC_OFFLINE_MODE === 'true';
