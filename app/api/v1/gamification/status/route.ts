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
        name: 'Rajin Belajar',
        description: 'Kamu telah menyelesaikan 10 pelajaran.',
        imageUrl: '/badges/studious-517982.png',
        isEarned: true,
        earnedAt: '2024-01-15T10:00:00Z',
      },
      {
        id: 'b2',
        name: 'Cekatan',
        description: 'Kamu menyelesaikan kuis dalam waktu kurang dari 3 menit sebanyak 10 kali.',
        imageUrl: '/badges/quickie-6ac5d7.png',
        isEarned: true,
        earnedAt: '2024-02-20T14:30:00Z',
      },
      {
        id: 'b3',
        name: 'Ambisius',
        description: 'Kamu telah mencapai 15 milestone.',
        imageUrl: '/badges/ambitious-17cb0d.png',
        isEarned: true,
        earnedAt: '2024-03-10T09:00:00Z',
      },
      {
        id: 'b4',
        name: 'Perfeksionis',
        description: 'Kamu mendapat nilai 100% pada kuis sebanyak 20 kali.',
        imageUrl: '/badges/perfectionist-47e1e6.png',
        isEarned: false,
      },
      {
        id: 'b5',
        name: 'Penjelajah',
        description: 'Kumpulkan 2500 XP total.',
        imageUrl: '/badges/ambitious-17cb0d.png',
        isEarned: false,
      },
    ],
    recentXPEvents: [],
  });
}
