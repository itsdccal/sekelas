import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock chapters list per bab endpoint for development.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  const { sectionId } = await params;

  const chaptersBySection: Record<string, Array<{
    id: string;
    name: string;
    orderIndex: number;
    videoUrl: string;
    passingGrade: number;
    sectionId: string;
  }>> = {
    'bab-1': [
      { id: 'ch-1', name: 'Persamaan Linear Satu Variabel', orderIndex: 1, videoUrl: '/sample-video.mp4', passingGrade: 70, sectionId: 'bab-1' },
      { id: 'ch-2', name: 'Persamaan Linear Dua Variabel', orderIndex: 2, videoUrl: '/sample-video.mp4', passingGrade: 70, sectionId: 'bab-1' },
      { id: 'ch-3', name: 'Sistem Persamaan Linear', orderIndex: 3, videoUrl: '/sample-video.mp4', passingGrade: 70, sectionId: 'bab-1' },
      { id: 'ch-4', name: 'Pertidaksamaan Linear', orderIndex: 4, videoUrl: '/sample-video.mp4', passingGrade: 70, sectionId: 'bab-1' },
    ],
    'bab-2': [
      { id: 'ch-5', name: 'Bangun Datar', orderIndex: 1, videoUrl: '/sample-video.mp4', passingGrade: 70, sectionId: 'bab-2' },
      { id: 'ch-6', name: 'Bangun Ruang', orderIndex: 2, videoUrl: '/sample-video.mp4', passingGrade: 70, sectionId: 'bab-2' },
      { id: 'ch-7', name: 'Transformasi Geometri', orderIndex: 3, videoUrl: '/sample-video.mp4', passingGrade: 75, sectionId: 'bab-2' },
    ],
    'bab-3': [
      { id: 'ch-8', name: 'Bilangan Bulat', orderIndex: 1, videoUrl: '/sample-video.mp4', passingGrade: 70, sectionId: 'bab-3' },
      { id: 'ch-9', name: 'Pecahan dan Desimal', orderIndex: 2, videoUrl: '/sample-video.mp4', passingGrade: 70, sectionId: 'bab-3' },
    ],
    'bab-4': [
      { id: 'ch-10', name: 'Hukum Newton I', orderIndex: 1, videoUrl: '/sample-video.mp4', passingGrade: 70, sectionId: 'bab-4' },
      { id: 'ch-11', name: 'Hukum Newton II', orderIndex: 2, videoUrl: '/sample-video.mp4', passingGrade: 70, sectionId: 'bab-4' },
      { id: 'ch-12', name: 'Hukum Newton III', orderIndex: 3, videoUrl: '/sample-video.mp4', passingGrade: 70, sectionId: 'bab-4' },
    ],
    'bab-5': [
      { id: 'ch-13', name: 'GLB dan GLBB', orderIndex: 1, videoUrl: '/sample-video.mp4', passingGrade: 75, sectionId: 'bab-5' },
      { id: 'ch-14', name: 'Gerak Jatuh Bebas', orderIndex: 2, videoUrl: '/sample-video.mp4', passingGrade: 75, sectionId: 'bab-5' },
    ],
    'bab-6': [
      { id: 'ch-15', name: 'Membran Sel', orderIndex: 1, videoUrl: '/sample-video.mp4', passingGrade: 70, sectionId: 'bab-6' },
      { id: 'ch-16', name: 'Organel Sel', orderIndex: 2, videoUrl: '/sample-video.mp4', passingGrade: 70, sectionId: 'bab-6' },
    ],
    'bab-7': [
      { id: 'ch-17', name: 'Respirasi Sel', orderIndex: 1, videoUrl: '/sample-video.mp4', passingGrade: 70, sectionId: 'bab-7' },
      { id: 'ch-18', name: 'Fotosintesis', orderIndex: 2, videoUrl: '/sample-video.mp4', passingGrade: 70, sectionId: 'bab-7' },
      { id: 'ch-19', name: 'Fermentasi', orderIndex: 3, videoUrl: '/sample-video.mp4', passingGrade: 70, sectionId: 'bab-7' },
    ],
  };

  const chapters = chaptersBySection[sectionId];

  if (!chapters) {
    return NextResponse.json(
      { message: `Bab ${sectionId} tidak ditemukan` },
      { status: 404 }
    );
  }

  return NextResponse.json(chapters);
}
