'use client';

import { XPNotification } from './XPNotification';
import { BadgePopup } from './BadgePopup';

/**
 * GamificationOverlay — wrapper component that renders XPNotification + BadgePopup globally.
 * Placed in StudentLayout so notifications/popups are visible on all student pages.
 */
export function GamificationOverlay() {
  return (
    <>
      <XPNotification />
      <BadgePopup />
    </>
  );
}
