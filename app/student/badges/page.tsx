'use client';

import { useEffect } from 'react';
import { useGamificationStore } from '@/stores';
import { formatXP } from '@/lib/utils';

/**
 * Badges page — displays badge collection (earned = full color, unearned = grayscale)
 * with a progress bar showing currentXP / nextMilestoneThreshold.
 */
export default function BadgesPage() {
  const badges = useGamificationStore((s) => s.badges);
  const totalXP = useGamificationStore((s) => s.totalXP);
  const nextMilestone = useGamificationStore((s) => s.nextMilestone);
  const fetchGamificationData = useGamificationStore(
    (s) => s.fetchGamificationData
  );

  useEffect(() => {
    fetchGamificationData();
  }, [fetchGamificationData]);

  const progressPercentage =
    nextMilestone && nextMilestone.xpThreshold > 0
      ? Math.min(
          Math.round((totalXP / nextMilestone.xpThreshold) * 100),
          100
        )
      : 100;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Koleksi Badge</h1>
        <p className="text-sm text-gray-600">
          Kumpulkan badge dengan menyelesaikan materi dan kuis
        </p>
      </div>

      {/* XP Progress section */}
      <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Progres ke Milestone Berikutnya
          </span>
          <span className="text-sm font-semibold text-primary-700">
            {formatXP(totalXP)}
            {nextMilestone
              ? ` / ${formatXP(nextMilestone.xpThreshold).replace(' XP', '')} XP`
              : ''}
          </span>
        </div>

        {/* Progress bar */}
        <div
          className="h-3 w-full overflow-hidden rounded-full bg-gray-200"
          role="progressbar"
          aria-valuenow={totalXP}
          aria-valuemin={0}
          aria-valuemax={nextMilestone?.xpThreshold ?? totalXP}
          aria-label="Progres XP ke milestone berikutnya"
        >
          <div
            className="h-full rounded-full bg-primary-600 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {nextMilestone && (
          <p className="mt-2 text-xs text-gray-500">
            Milestone berikutnya: <span className="font-medium">{nextMilestone.name}</span>
          </p>
        )}
      </div>

      {/* Badge collection grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`flex flex-col items-center rounded-lg border border-border bg-white p-4 shadow-sm transition-transform hover:scale-105 ${
              badge.isEarned ? '' : 'grayscale'
            }`}
          >
            {/* Badge image */}
            <div className="mb-3 flex h-16 w-16 items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={badge.imageUrl}
                alt={badge.name}
                className="h-full w-full object-contain"
              />
            </div>

            {/* Badge name */}
            <p
              className={`text-center text-sm font-semibold ${
                badge.isEarned ? 'text-gray-900' : 'text-gray-500'
              }`}
            >
              {badge.name}
            </p>

            {/* Badge description */}
            <p className="mt-1 text-center text-xs text-gray-500">
              {badge.description}
            </p>

            {/* Earned indicator */}
            {badge.isEarned && (
              <span className="mt-2 inline-block rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                Diperoleh
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Empty state */}
      {badges.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-12">
          <p className="text-gray-500">Belum ada badge tersedia</p>
        </div>
      )}
    </div>
  );
}
