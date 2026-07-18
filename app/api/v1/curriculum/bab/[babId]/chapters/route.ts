import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock chapters list per bab endpoint for development.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ babId: string }> }
) {
  const { babId } = await params;

  const chaptersByBab: Record<string, Array<{
    id: string;
    title: string;
    description: string;
    orderIndex: number;
    videoUrl: string;
    videoDurationMinutes: number;
    passingGrade: number;
    babId: string;
  }>> = {
    'bab-1': [
      { id: 'ch-1', title: 'Persamaan Linear Satu Variabel', description: 'Menyelesaikan persamaan ax + b = c', orderIndex: 1, videoUrl: '/api/v1/video/chapter/ch-1/stream', videoDurationMinutes: 12, passingGrade: 70, babId: 'bab-1' },
      { id: 'ch-2', title: 'Persamaan Linear Dua Variabel', description: 'Sistem persamaan dengan dua variabel', orderIndex: 2, videoUrl: '/api/v1/video/chapter/ch-2/stream', videoDurationMinutes: 15, passingGrade: 70, babId: 'bab-1' },
      { id: 'ch-3', title: 'Sistem Persamaan Linear', description: 'Metode eliminasi dan substitusi', orderIndex: 3, videoUrl: '/api/v1/video/chapter/ch-3/stream', videoDurationMinutes: 18, passingGrade: 70, babId: 'bab-1' },
      { id: 'ch-4', title: 'Pertidaksamaan Linear', description: 'Penyelesaian pertidaksamaan satu variabel', orderIndex: 4, videoUrl: '/api/v1/video/chapter/ch-4/stream', videoDurationMinutes: 14, passingGrade: 70, babId: 'bab-1' },
    ],
    'bab-2': [
      { id: 'ch-5', title: 'Bangun Datar', description: 'Luas dan keliling bangun datar', orderIndex: 1, videoUrl: '/api/v1/video/chapter/ch-5/stream', videoDurationMinutes: 20, passingGrade: 70, babId: 'bab-2' },
      { id: 'ch-6', title: 'Bangun Ruang', description: 'Volume dan luas permukaan bangun ruang', orderIndex: 2, videoUrl: '/api/v1/video/chapter/ch-6/stream', videoDurationMinutes: 22, passingGrade: 70, babId: 'bab-2' },
      { id: 'ch-7', title: 'Transformasi Geometri', description: 'Translasi, refleksi, rotasi, dan dilatasi', orderIndex: 3, videoUrl: '/api/v1/video/chapter/ch-7/stream', videoDurationMinutes: 16, passingGrade: 75, babId: 'bab-2' },
    ],
    'bab-3': [
      { id: 'ch-8', title: 'Bilangan Bulat', description: 'Operasi dan sifat bilangan bulat', orderIndex: 1, videoUrl: '/api/v1/video/chapter/ch-8/stream', videoDurationMinutes: 10, passingGrade: 70, babId: 'bab-3' },
      { id: 'ch-9', title: 'Pecahan dan Desimal', description: 'Operasi pecahan dan konversi desimal', orderIndex: 2, videoUrl: '/api/v1/video/chapter/ch-9/stream', videoDurationMinutes: 13, passingGrade: 70, babId: 'bab-3' },
    ],
    'bab-4': [
      { id: 'ch-10', title: 'Hukum Newton I', description: 'Hukum kelembaman (inersia)', orderIndex: 1, videoUrl: '/api/v1/video/chapter/ch-10/stream', videoDurationMinutes: 15, passingGrade: 70, babId: 'bab-4' },
      { id: 'ch-11', title: 'Hukum Newton II', description: 'Hubungan gaya, massa, dan percepatan (F=ma)', orderIndex: 2, videoUrl: '/api/v1/video/chapter/ch-11/stream', videoDurationMinutes: 18, passingGrade: 70, babId: 'bab-4' },
      { id: 'ch-12', title: 'Hukum Newton III', description: 'Aksi dan reaksi', orderIndex: 3, videoUrl: '/api/v1/video/chapter/ch-12/stream', videoDurationMinutes: 14, passingGrade: 70, babId: 'bab-4' },
    ],
    'bab-5': [
      { id: 'ch-13', title: 'GLB dan GLBB', description: 'Gerak lurus beraturan dan berubah beraturan', orderIndex: 1, videoUrl: '/api/v1/video/chapter/ch-13/stream', videoDurationMinutes: 20, passingGrade: 75, babId: 'bab-5' },
      { id: 'ch-14', title: 'Gerak Jatuh Bebas', description: 'Gerak vertikal di bawah pengaruh gravitasi', orderIndex: 2, videoUrl: '/api/v1/video/chapter/ch-14/stream', videoDurationMinutes: 16, passingGrade: 75, babId: 'bab-5' },
    ],
    'bab-6': [
      { id: 'ch-15', title: 'Membran Sel', description: 'Struktur dan fungsi membran sel', orderIndex: 1, videoUrl: '/api/v1/video/chapter/ch-15/stream', videoDurationMinutes: 18, passingGrade: 70, babId: 'bab-6' },
      { id: 'ch-16', title: 'Organel Sel', description: 'Mitokondria, ribosom, dan organel lainnya', orderIndex: 2, videoUrl: '/api/v1/video/chapter/ch-16/stream', videoDurationMinutes: 22, passingGrade: 70, babId: 'bab-6' },
    ],
    'bab-7': [
      { id: 'ch-17', title: 'Respirasi Sel', description: 'Proses glikolisis dan siklus Krebs', orderIndex: 1, videoUrl: '/api/v1/video/chapter/ch-17/stream', videoDurationMinutes: 25, passingGrade: 70, babId: 'bab-7' },
      { id: 'ch-18', title: 'Fotosintesis', description: 'Reaksi terang dan siklus Calvin', orderIndex: 2, videoUrl: '/api/v1/video/chapter/ch-18/stream', videoDurationMinutes: 20, passingGrade: 70, babId: 'bab-7' },
      { id: 'ch-19', title: 'Fermentasi', description: 'Fermentasi alkohol dan asam laktat', orderIndex: 3, videoUrl: '/api/v1/video/chapter/ch-19/stream', videoDurationMinutes: 14, passingGrade: 70, babId: 'bab-7' },
    ],
  };

  const chapters = chaptersByBab[babId];

  if (!chapters) {
    return NextResponse.json(
      { message: `Bab ${babId} tidak ditemukan` },
      { status: 404 }
    );
  }

  return NextResponse.json(chapters);
}
