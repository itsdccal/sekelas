import { NextResponse } from 'next/server';

/**
 * Mock admin override audit log endpoint for development.
 * Returns recent penyesuaian nilai actions with details.
 */
export async function GET() {
  const auditLog = [
    {
      id: 'audit-001',
      adminId: 'admin-001',
      adminName: 'Admin Sekelas',
      studentId: 'student-005',
      studentName: 'Dimas Pratama',
      chapterId: 'ch-6',
      chapterName: 'Bangun Ruang',
      action: 'FORCE_COMPLETE',
      reason: 'Siswa sudah menunjukkan pemahaman melalui tugas tambahan',
      score: 75,
      createdAt: '2024-01-20T09:00:00Z',
    },
    {
      id: 'audit-002',
      adminId: 'admin-001',
      adminName: 'Admin Sekelas',
      studentId: 'student-003',
      studentName: 'Ahmad Rizki',
      chapterId: 'ch-4',
      chapterName: 'Pertidaksamaan Linear',
      action: 'FORCE_COMPLETE',
      reason: 'Terjadi error teknis saat kuis, siswa sudah menguasai materi berdasarkan penilaian tutor',
      score: 70,
      createdAt: '2024-01-19T14:30:00Z',
    },
    {
      id: 'audit-003',
      adminId: 'admin-001',
      adminName: 'Admin Sekelas',
      studentId: 'student-008',
      studentName: 'Lina Maharani',
      chapterId: 'ch-3',
      chapterName: 'Sistem Persamaan Linear',
      action: 'FORCE_COMPLETE',
      reason: 'Siswa pindahan, materi sudah dikuasai di sekolah sebelumnya',
      score: 80,
      createdAt: '2024-01-18T11:00:00Z',
    },
    {
      id: 'audit-004',
      adminId: 'admin-001',
      adminName: 'Admin Sekelas',
      studentId: 'student-014',
      studentName: 'Melati Kusuma',
      chapterId: 'ch-2',
      chapterName: 'Persamaan Linear Dua Variabel',
      action: 'FORCE_COMPLETE',
      reason: 'Masalah koneksi berulang saat kuis, sudah lulus ujian offline dengan skor baik',
      score: 72,
      createdAt: '2024-01-17T16:00:00Z',
    },
    {
      id: 'audit-005',
      adminId: 'admin-001',
      adminName: 'Admin Sekelas',
      studentId: 'student-006',
      studentName: 'Rina Wulandari',
      chapterId: 'ch-10',
      chapterName: 'Hukum Newton I',
      action: 'FORCE_COMPLETE',
      reason: 'Siswa sudah lulus ujian remedial offline yang diadakan tutor',
      score: 85,
      createdAt: '2024-01-15T09:30:00Z',
    },
  ];

  return NextResponse.json(auditLog);
}
