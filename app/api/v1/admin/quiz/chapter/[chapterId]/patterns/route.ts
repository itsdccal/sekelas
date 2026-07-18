import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock admin quiz patterns per chapter endpoint for development.
 * Returns question patterns assigned to a chapter.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  const { chapterId } = await params;

  const patternsByChapter: Record<string, Array<{
    id: string;
    name: string;
    description: string;
    chapterId: string;
    questionCount: number;
    createdAt: string;
    updatedAt: string;
  }>> = {
    'ch-1': [
      { id: 'pattern-1', name: 'PLSV Dasar', description: 'Soal persamaan linear satu variabel bentuk sederhana', chapterId: 'ch-1', questionCount: 5, createdAt: '2024-01-10T08:00:00Z', updatedAt: '2024-01-15T10:00:00Z' },
      { id: 'pattern-2', name: 'PLSV Cerita', description: 'Soal cerita yang melibatkan persamaan linear', chapterId: 'ch-1', questionCount: 3, createdAt: '2024-01-10T08:00:00Z', updatedAt: '2024-01-12T09:00:00Z' },
    ],
    'ch-2': [
      { id: 'pattern-3', name: 'PLDV Eliminasi', description: 'Soal PLDV diselesaikan dengan metode eliminasi', chapterId: 'ch-2', questionCount: 4, createdAt: '2024-01-11T08:00:00Z', updatedAt: '2024-01-14T10:00:00Z' },
      { id: 'pattern-4', name: 'PLDV Substitusi', description: 'Soal PLDV diselesaikan dengan metode substitusi', chapterId: 'ch-2', questionCount: 4, createdAt: '2024-01-11T08:00:00Z', updatedAt: '2024-01-13T11:00:00Z' },
      { id: 'pattern-5', name: 'PLDV Grafik', description: 'Soal PLDV yang melibatkan representasi grafik', chapterId: 'ch-2', questionCount: 2, createdAt: '2024-01-12T08:00:00Z', updatedAt: '2024-01-12T08:00:00Z' },
    ],
    'ch-10': [
      { id: 'pattern-6', name: 'Newton I Konsep', description: 'Soal konseptual hukum inersia', chapterId: 'ch-10', questionCount: 5, createdAt: '2024-01-13T08:00:00Z', updatedAt: '2024-01-16T10:00:00Z' },
      { id: 'pattern-7', name: 'Newton I Hitungan', description: 'Soal hitungan sederhana hukum Newton I', chapterId: 'ch-10', questionCount: 3, createdAt: '2024-01-13T08:00:00Z', updatedAt: '2024-01-14T09:00:00Z' },
    ],
  };

  const patterns = patternsByChapter[chapterId] || [];

  return NextResponse.json({ patterns });
}
