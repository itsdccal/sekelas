'use client';

import { useEffect } from 'react';
import { useGamificationStore } from '@/stores';
import { formatXP } from '@/lib/utils';
import { Trophy, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Color palette for achievement cards — inspired by BahasaKu Figma design */
const CARD_COLORS = [
  'bg-[#9BD2FC]', // biru muda
  'bg-[#F1C40F]', // kuning
  'bg-[#16A085]', // hijau teal
  'bg-[#2980B9]', // biru tua
  'bg-[#E74C3C]', // merah
  'bg-[#8E44AD]', // ungu
];

/**
 * Badges page — displays badge collection with achievement-style cards
 * inspired by BahasaKu E-learning Figma design.
 * Cards use colorful backgrounds, circular badge icons, star ratings,
 * and white text for earned badges. Unearned badges are shown muted.
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

  const earnedCount = badges.filter((b) => b.isEarned).length;

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
        <h1 className="text-2xl font-bold text-foreground">Koleksi Badge</h1>
        <p className="text-sm text-muted-foreground">
          Kumpulkan badge dengan menyelesaikan materi dan kuis
        </p>
      </div>

      {/* Dev-only test buttons — remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="rounded-lg border border-dashed border-yellow-400 bg-yellow-50 p-3">
          <p className="mb-2 text-xs font-semibold text-yellow-700">⚡ Dev Testing</p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                useGamificationStore.getState().showBadgePopup({
                  id: 'test-popup',
                  name: 'Penjelajah',
                  description: 'Selamat! Kamu telah mengumpulkan 2500 XP!',
                  imageUrl: '/badges/ambitious-17cb0d.png',
                  isEarned: true,
                  earnedAt: new Date().toISOString(),
                });
              }}
            >
              <Zap className="h-3.5 w-3.5" />
              Test Badge Popup
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                useGamificationStore.getState().addXPEvent({
                  id: `xp-test-${Date.now()}`,
                  amount: 50,
                  source: 'QUIZ_PASS',
                  timestamp: new Date().toISOString(),
                });
              }}
            >
              <Zap className="h-3.5 w-3.5" />
              Test +50 XP Notif
            </Button>
          </div>
        </div>
      )}

      {/* Total Achievement Card — inspired by Figma "Card - Total Achievement" */}
      <div className="relative overflow-hidden rounded-lg border border-border bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          {/* Circular progress indicator */}
          <div className="relative flex h-[72px] w-[72px] shrink-0 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 72 72" aria-hidden="true">
              <circle
                cx="36"
                cy="36"
                r="30"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="6"
              />
              <circle
                cx="36"
                cy="36"
                r="30"
                fill="none"
                stroke="var(--color-primary-600)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 30}`}
                strokeDashoffset={`${2 * Math.PI * 30 * (1 - progressPercentage / 100)}`}
                className="transition-all duration-700"
              />
            </svg>
            <span className="absolute text-lg font-bold text-foreground">
              {progressPercentage}%
            </span>
          </div>

          {/* Text content */}
          <div className="flex-1">
            <p className="text-lg font-semibold text-foreground">
              Total Achievement: {earnedCount}
            </p>
            <p className="text-sm text-muted-foreground">
              {earnedCount > 0
                ? `Hebat! Kamu sudah mendapatkan ${earnedCount} badge. Terus semangat!`
                : 'Selesaikan materi dan kuis untuk mendapatkan badge pertamamu.'}
            </p>
          </div>
        </div>

        {/* XP Progress bar below */}
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Progres XP
            </span>
            <span className="text-xs font-semibold text-primary-700">
              {formatXP(totalXP)}
              {nextMilestone
                ? ` / ${formatXP(nextMilestone.xpThreshold).replace(' XP', '')} XP`
                : ''}
            </span>
          </div>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-gray-200"
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
            <p className="mt-1 text-xs text-muted-foreground">
              Milestone berikutnya: <span className="font-medium">{nextMilestone.name}</span>
            </p>
          )}
        </div>
      </div>

      {/* Achievement Cards — inspired by Figma card style */}
      <div className="space-y-3">
        {badges.map((badge, index) => {
          const colorClass = CARD_COLORS[index % CARD_COLORS.length];
          const isEarned = badge.isEarned;

          return (
            <div
              key={badge.id}
              className={`relative flex items-center gap-4 rounded-lg p-4 transition-all duration-200 ${
                isEarned
                  ? `${colorClass} shadow-md hover:shadow-lg hover:-translate-y-0.5`
                  : 'border border-border bg-gray-100 opacity-60'
              }`}
            >
              {/* Badge icon — orange circle with image */}
              <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full ${
                  isEarned ? 'bg-[#FF8504]' : 'bg-gray-300'
                }`}
              >
                {badge.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={badge.imageUrl}
                    alt=""
                    className={`h-12 w-12 rounded-full object-cover ${
                      isEarned ? '' : 'grayscale'
                    }`}
                  />
                ) : (
                  <Trophy
                    className={`h-8 w-8 ${isEarned ? 'text-white' : 'text-gray-500'}`}
                  />
                )}
              </div>

              {/* Badge text content */}
              <div className="min-w-0 flex-1">
                <h3
                  className={`text-base font-semibold leading-tight ${
                    isEarned ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {badge.name}
                </h3>
                <p
                  className={`mt-1 text-sm leading-snug ${
                    isEarned ? 'text-white/90' : 'text-gray-500'
                  }`}
                >
                  {badge.description}
                </p>
                {isEarned && badge.earnedAt && (
                  <p className="mt-1 text-xs text-white/70">
                    Diperoleh {new Date(badge.earnedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {badges.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-12">
          <Trophy className="mb-3 h-12 w-12 text-gray-300" />
          <p className="text-muted-foreground">Belum ada badge tersedia</p>
        </div>
      )}
    </div>
  );
}
