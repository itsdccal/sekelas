import { NextResponse } from 'next/server';

/**
 * Mock admin override audit log endpoint for development.
 * Returns recent override actions with details.
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
      chapterTitle: 'Bangun Ruang',
      action: 'UNLOCK_NEXT',
      reason: 'Siswa sudah menunjukkan pemahaman melalui tugas tambahan',
      createdAt: '2024-01-20T09:00:00Z',
    },
    {
      id: 'audit-002',
      adminId: 'admin-001',
      adminName: 'Admin Sekelas',
      studentId: 'student-003',
      studentName: 'Ahmad Rizki',
      chapterId: 'ch-4',
      chapterTitle: 'Pertidaksamaan Linear',
      action: 'RESET_QUIZ',
      reason: 'Terjadi error teknis saat pengerjaan kuis',
      createdAt: '2024-01-19T14:30:00Z',
    },
    {
      id: 'audit-003',
      adminId: 'admin-001',
      adminName: 'Admin Sekelas',
      studentId: 'student-008',
      studentName: 'Lina Maharani',
      chapterId: 'ch-3',
      chapterTitle: 'Sistem Persamaan Linear',
      action: 'FORCE_COMPLETE',
      reason: 'Siswa pindahan, materi sudah dikuasai di sekolah sebelumnya',
      createdAt: '2024-01-18T11:00:00Z',
    },
    {
      id: 'audit-004',
      adminId: 'admin-001',
      adminName: 'Admin Sekelas',
      studentId: 'student-014',
      studentName: 'Melati Kusuma',
      chapterId: 'ch-2',
      chapterTitle: 'Persamaan Linear Dua Variabel',
      action: 'UNLOCK_NEXT',
      reason: 'Override karena masalah koneksi internet saat kuis',
      createdAt: '2024-01-17T16:00:00Z',
    },
    {
      id: 'audit-005',
      adminId: 'admin-001',
      adminName: 'Admin Sekelas',
      studentId: 'student-019',
      studentName: 'Bayu Firmansyah',
      chapterId: 'ch-1',
      chapterTitle: 'Persamaan Linear Satu Variabel',
      action: 'RESET_PROGRESS',
      reason: 'Siswa request ulang dari awal karena lama tidak aktif',
      createdAt: '2024-01-16T10:00:00Z',
    },
    {
      id: 'audit-006',
      adminId: 'admin-001',
      adminName: 'Admin Sekelas',
      studentId: 'student-006',
      studentName: 'Rina Wulandari',
      chapterId: 'ch-10',
      chapterTitle: 'Hukum Newton I',
      action: 'FORCE_COMPLETE',
      reason: 'Siswa sudah lulus ujian remedial offline',
      createdAt: '2024-01-15T09:30:00Z',
    },
    {
      id: 'audit-007',
      adminId: 'admin-001',
      adminName: 'Admin Sekelas',
      studentId: 'student-012',
      studentName: 'Dewi Safitri',
      chapterId: 'ch-7',
      chapterTitle: 'Transformasi Geometri',
      action: 'RESET_QUIZ',
      reason: 'Kuis terpotong karena maintenance server',
      createdAt: '2024-01-14T13:00:00Z',
    },
  ];

  return NextResponse.json({ auditLog });
}
