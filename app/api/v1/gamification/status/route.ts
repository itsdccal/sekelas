import { NextResponse } from 'next/server';

/**
 * Mock gamification status endpoint for development.
 */
export async function GET() {
  return NextResponse.json({
    totalXP: 1250,
    currentMilestone: { id: 'm1', name: 'Pemula', xpThreshold: 1000, badgeId: 'b1' },
    nextMilestone: { id: 'm2', name: 'Penjelajah', xpThreshold: 2500, badgeId: 'b2' },
    badges: [
      {
        id: 'b1',
        name: 'Badge Pemula',
        description: 'Selesaikan 5 chapter pertama',
        imageUrl: '/badges/pemula.png',
        isEarned: true,
        earnedAt: '2024-01-15T10:00:00Z',
      },
      {
        id: 'b2',
        name: 'Badge Penjelajah',
        description: 'Kumpulkan 2500 XP',
        imageUrl: '/badges/penjelajah.png',
        isEarned: false,
      },
      {
        id: 'b3',
        name: 'Badge Master',
        description: 'Selesaikan semua materi',
        imageUrl: '/badges/master.png',
        isEarned: false,
      },
    ],
    recentXPEvents: [],
  });
}
