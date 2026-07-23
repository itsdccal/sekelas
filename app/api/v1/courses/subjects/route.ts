import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock materi list endpoint for development.
 * Supports ?semesterId filter.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const semesterId = searchParams.get('semesterId');

  const allMateri = [
    {
      id: 'materi-1',
      name: 'UTBK-SNBT 2025',
      description: 'Tes Skolastik: Penalaran Umum, Penalaran Matematika, Literasi Bahasa Indonesia & Inggris.',
      orderIndex: 1,
      babCount: 4,
      isPublished: true,
      semesterId: 'sem-1',
    },
    {
      id: 'materi-2',
      name: 'Tryout Nasional Seri 1',
      description: 'Simulasi UTBK lengkap dengan pembahasan.',
      orderIndex: 2,
      babCount: 4,
      isPublished: true,
      semesterId: 'sem-1',
    },
    {
      id: 'materi-3',
      name: 'Biologi Sel',
      description: 'Struktur sel, organel, dan proses metabolisme sel.',
      orderIndex: 3,
      babCount: 2,
      isPublished: true,
      semesterId: 'sem-1',
    },
    {
      id: 'materi-4',
      name: 'Bahasa Inggris',
      description: 'Grammar, vocabulary, dan reading comprehension.',
      orderIndex: 4,
      babCount: 4,
      isPublished: false,
      semesterId: 'sem-2',
    },
  ];

  const filtered = semesterId
    ? allMateri.filter((m) => m.semesterId === semesterId)
    : allMateri;

  return NextResponse.json(filtered);
}
