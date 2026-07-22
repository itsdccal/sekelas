import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock admin student monitoring endpoint for development.
 * Returns paginated list of students with search, class filter support.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase() || '';
  const kelas = searchParams.get('kelas') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

  const allStudents = [
    { userId: 'student-001', name: 'Budi Santoso', email: 'budi@sekelas.id', kelas: '10A', completedChapters: 7, totalChapters: 24, progressPercentage: 29, totalXP: 1250, averageScore: 72.5, lastActive: '2024-01-20T08:30:00Z', status: 'active' },
    { userId: 'student-002', name: 'Sari Dewi', email: 'sari@sekelas.id', kelas: '10A', completedChapters: 12, totalChapters: 24, progressPercentage: 50, totalXP: 2100, averageScore: 78.3, lastActive: '2024-01-20T09:15:00Z', status: 'active' },
    { userId: 'student-003', name: 'Ahmad Rizki', email: 'ahmad@sekelas.id', kelas: '10A', completedChapters: 3, totalChapters: 24, progressPercentage: 13, totalXP: 450, averageScore: 55.2, lastActive: '2024-01-19T14:00:00Z', status: 'active' },
    { userId: 'student-004', name: 'Putri Anggraini', email: 'putri@sekelas.id', kelas: '10B', completedChapters: 18, totalChapters: 24, progressPercentage: 75, totalXP: 2850, averageScore: 86.4, lastActive: '2024-01-20T10:00:00Z', status: 'active' },
    { userId: 'student-005', name: 'Dimas Pratama', email: 'dimas@sekelas.id', kelas: '10B', completedChapters: 0, totalChapters: 24, progressPercentage: 0, totalXP: 50, averageScore: null, lastActive: '2024-01-15T08:00:00Z', status: 'inactive' },
    { userId: 'student-006', name: 'Rina Wulandari', email: 'rina@sekelas.id', kelas: '10B', completedChapters: 9, totalChapters: 24, progressPercentage: 38, totalXP: 1580, averageScore: 74.8, lastActive: '2024-01-20T07:45:00Z', status: 'active' },
    { userId: 'student-007', name: 'Fajar Hidayat', email: 'fajar@sekelas.id', kelas: '10C', completedChapters: 15, totalChapters: 24, progressPercentage: 63, totalXP: 2400, averageScore: 81.6, lastActive: '2024-01-20T11:00:00Z', status: 'active' },
    { userId: 'student-008', name: 'Lina Maharani', email: 'lina@sekelas.id', kelas: '10C', completedChapters: 6, totalChapters: 24, progressPercentage: 25, totalXP: 980, averageScore: 68.3, lastActive: '2024-01-18T16:30:00Z', status: 'active' },
    { userId: 'student-009', name: 'Rendi Kurniawan', email: 'rendi@sekelas.id', kelas: '10A', completedChapters: 20, totalChapters: 24, progressPercentage: 83, totalXP: 3000, averageScore: 89.1, lastActive: '2024-01-20T12:00:00Z', status: 'active' },
    { userId: 'student-010', name: 'Anisa Fitriani', email: 'anisa@sekelas.id', kelas: '10C', completedChapters: 4, totalChapters: 24, progressPercentage: 17, totalXP: 620, averageScore: 60.5, lastActive: '2024-01-19T09:00:00Z', status: 'active' },
    { userId: 'student-011', name: 'Yoga Prasetyo', email: 'yoga@sekelas.id', kelas: '10B', completedChapters: 11, totalChapters: 24, progressPercentage: 46, totalXP: 1890, averageScore: 76.2, lastActive: '2024-01-20T08:00:00Z', status: 'active' },
    { userId: 'student-012', name: 'Dewi Safitri', email: 'dewi@sekelas.id', kelas: '10A', completedChapters: 8, totalChapters: 24, progressPercentage: 33, totalXP: 1350, averageScore: 71.4, lastActive: '2024-01-19T15:30:00Z', status: 'active' },
    { userId: 'student-013', name: 'Hendra Gunawan', email: 'hendra@sekelas.id', kelas: '10C', completedChapters: 14, totalChapters: 24, progressPercentage: 58, totalXP: 2200, averageScore: 79.8, lastActive: '2024-01-20T09:30:00Z', status: 'active' },
    { userId: 'student-014', name: 'Melati Kusuma', email: 'melati@sekelas.id', kelas: '10B', completedChapters: 2, totalChapters: 24, progressPercentage: 8, totalXP: 280, averageScore: 45.0, lastActive: '2024-01-17T10:00:00Z', status: 'inactive' },
    { userId: 'student-015', name: 'Irfan Maulana', email: 'irfan@sekelas.id', kelas: '10A', completedChapters: 16, totalChapters: 24, progressPercentage: 67, totalXP: 2550, averageScore: 83.7, lastActive: '2024-01-20T10:45:00Z', status: 'active' },
    { userId: 'student-016', name: 'Nadia Permata', email: 'nadia@sekelas.id', kelas: '10C', completedChapters: 5, totalChapters: 24, progressPercentage: 21, totalXP: 830, averageScore: 63.9, lastActive: '2024-01-19T11:00:00Z', status: 'active' },
    { userId: 'student-017', name: 'Andi Wijaya', email: 'andi@sekelas.id', kelas: '10B', completedChapters: 22, totalChapters: 24, progressPercentage: 92, totalXP: 2950, averageScore: 91.2, lastActive: '2024-01-20T13:00:00Z', status: 'active' },
    { userId: 'student-018', name: 'Sri Rahayu', email: 'sri@sekelas.id', kelas: '10A', completedChapters: 10, totalChapters: 24, progressPercentage: 42, totalXP: 1700, averageScore: 75.1, lastActive: '2024-01-20T07:00:00Z', status: 'active' },
    { userId: 'student-019', name: 'Bayu Firmansyah', email: 'bayu@sekelas.id', kelas: '10C', completedChapters: 1, totalChapters: 24, progressPercentage: 4, totalXP: 150, averageScore: null, lastActive: '2024-01-16T08:00:00Z', status: 'inactive' },
    { userId: 'student-020', name: 'Citra Ayu', email: 'citra@sekelas.id', kelas: '10B', completedChapters: 13, totalChapters: 24, progressPercentage: 54, totalXP: 2050, averageScore: 77.6, lastActive: '2024-01-20T14:00:00Z', status: 'active' },
    { userId: 'student-021', name: 'Dwi Nugroho', email: 'dwi@sekelas.id', kelas: '10A', completedChapters: 19, totalChapters: 24, progressPercentage: 79, totalXP: 2780, averageScore: 87.3, lastActive: '2024-01-20T08:15:00Z', status: 'active' },
    { userId: 'student-022', name: 'Eka Putri', email: 'eka@sekelas.id', kelas: '10C', completedChapters: 7, totalChapters: 24, progressPercentage: 29, totalXP: 1100, averageScore: 69.8, lastActive: '2024-01-19T13:00:00Z', status: 'active' },
    { userId: 'student-023', name: 'Gilang Ramadhan', email: 'gilang@sekelas.id', kelas: '10B', completedChapters: 17, totalChapters: 24, progressPercentage: 71, totalXP: 2650, averageScore: 84.5, lastActive: '2024-01-20T09:00:00Z', status: 'active' },
    { userId: 'student-024', name: 'Hani Susanti', email: 'hani@sekelas.id', kelas: '10A', completedChapters: 24, totalChapters: 24, progressPercentage: 100, totalXP: 3000, averageScore: 93.8, lastActive: '2024-01-20T15:00:00Z', status: 'active' },
    { userId: 'student-025', name: 'Ivan Setiawan', email: 'ivan@sekelas.id', kelas: '10C', completedChapters: 11, totalChapters: 24, progressPercentage: 46, totalXP: 1820, averageScore: 75.9, lastActive: '2024-01-20T11:30:00Z', status: 'active' },
  ];

  // Apply filters
  let filtered = allStudents;

  if (search) {
    filtered = filtered.filter(
      (s) => s.name.toLowerCase().includes(search) || s.email.toLowerCase().includes(search)
    );
  }

  if (kelas) {
    filtered = filtered.filter((s) => s.kelas === kelas);
  }

  // Pagination
  const totalItems = filtered.length;
  const startIndex = (page - 1) * pageSize;
  const paginatedStudents = filtered.slice(startIndex, startIndex + pageSize);

  // Map to match frontend's expected StudentMonitoringRow format
  const data = paginatedStudents.map(s => ({
    userId: s.userId,
    name: s.name,
    kelas: s.kelas,
    totalProgress: s.progressPercentage,
    totalXP: s.totalXP,
    averageScore: s.averageScore,
  }));

  return NextResponse.json({
    data,
    total: totalItems,
    page,
    pageSize,
  });
}
