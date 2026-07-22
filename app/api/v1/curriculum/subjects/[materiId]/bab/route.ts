import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock bab list per materi endpoint for development.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ materiId: string }> }
) {
  const { materiId } = await params;

  const babsByMateri: Record<string, Array<{ id: string; name: string; description: string; orderIndex: number; chapterCount: number; materiId: string }>> = {
    'materi-1': [
      { id: 'bab-1', name: 'Aljabar Linear', description: 'Persamaan dan pertidaksamaan linear', orderIndex: 1, chapterCount: 4, materiId: 'materi-1' },
      { id: 'bab-2', name: 'Geometri Dasar', description: 'Bangun datar, bangun ruang, dan transformasi', orderIndex: 2, chapterCount: 3, materiId: 'materi-1' },
      { id: 'bab-3', name: 'Aritmatika', description: 'Bilangan bulat, pecahan, dan operasi dasar', orderIndex: 3, chapterCount: 2, materiId: 'materi-1' },
    ],
    'materi-2': [
      { id: 'bab-4', name: 'Hukum Newton', description: 'Tiga hukum dasar gerak Newton', orderIndex: 1, chapterCount: 3, materiId: 'materi-2' },
      { id: 'bab-5', name: 'Gerak Lurus', description: 'GLB, GLBB, dan gerak jatuh bebas', orderIndex: 2, chapterCount: 2, materiId: 'materi-2' },
    ],
    'materi-3': [
      { id: 'bab-6', name: 'Struktur Sel', description: 'Membran sel dan organel sel', orderIndex: 1, chapterCount: 2, materiId: 'materi-3' },
      { id: 'bab-7', name: 'Metabolisme Sel', description: 'Respirasi sel dan fotosintesis', orderIndex: 2, chapterCount: 3, materiId: 'materi-3' },
    ],
  };

  const babs = babsByMateri[materiId];

  if (!babs) {
    return NextResponse.json(
      { message: `Materi ${materiId} tidak ditemukan` },
      { status: 404 }
    );
  }

  return NextResponse.json(babs);
}
