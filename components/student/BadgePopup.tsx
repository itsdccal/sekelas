'use client';

import { useGamificationStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

/**
 * BadgePopup — full-screen overlay/modal showing badge achievement.
 * Requires manual close. While active, XP notifications are queued.
 */
export function BadgePopup() {
  const activeBadgePopup = useGamificationStore((s) => s.activeBadgePopup);
  const dismissBadgePopup = useGamificationStore((s) => s.dismissBadgePopup);

  if (!activeBadgePopup) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="badge-popup-title"
    >
      <div className="relative mx-4 w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-2xl">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2"
          onClick={dismissBadgePopup}
          aria-label="Tutup pop-up badge"
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Badge image */}
        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeBadgePopup.imageUrl}
            alt={activeBadgePopup.name}
            className="h-full w-full object-contain"
          />
        </div>

        {/* Badge info */}
        <h2
          id="badge-popup-title"
          className="mb-2 text-xl font-bold text-primary-700"
        >
          🎉 Badge Diperoleh!
        </h2>
        <p className="mb-1 text-lg font-semibold text-gray-900">
          {activeBadgePopup.name}
        </p>
        <p className="text-sm text-gray-600">
          {activeBadgePopup.description}
        </p>

        {/* Dismiss button */}
        <Button
          className="mt-6 w-full"
          onClick={dismissBadgePopup}
        >
          Keren!
        </Button>
      </div>
    </div>
  );
}
