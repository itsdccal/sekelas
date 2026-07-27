import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/v1/admin/monitoring/students/[userId]/submissions
 *
 * Returns all quiz/test submissions for a student, including answers.
 * Used by admin to review answers and grade SHORT_ANSWER questions.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  // Mock data: submissions for student-001
  const submissionsMap: Record<string, object> = {
    'student-001': {
      userId: 'student-001',
      pendingGradeCount: 2,
      submissions: [
        {
          submissionId: 'sub-001',
          quizType: 'PRE_TEST',
          subjectId: 'materi-1',
          subjectName: 'Matematika Dasar',
          sectionId: 'bab-1',
          sectionName: 'Aljabar Dasar',
          submittedAt: '2024-01-18T08:10:00Z',
          score: 60,
          status: 'GRADED',
          answers: [
            {
              questionId: 'q-pre-1',
              questionText: 'Berapakah hasil dari 3x + 5 = 20?',
              questionType: 'MULTIPLE_CHOICE',
              options: [
                { id: 'opt-a', text: 'x = 3' },
                { id: 'opt-b', text: 'x = 5' },
                { id: 'opt-c', text: 'x = 7' },
                { id: 'opt-d', text: 'x = 15' },
              ],
              selectedOptionId: 'opt-b',
              correctOptionId: 'opt-b',
              isCorrect: true,
              weight: 1,
            },
            {
              questionId: 'q-pre-2',
              questionText: 'Tentukan nilai y dari persamaan 2y - 4 = 10!',
              questionType: 'MULTIPLE_CHOICE',
              options: [
                { id: 'opt-a', text: 'y = 3' },
                { id: 'opt-b', text: 'y = 7' },
                { id: 'opt-c', text: 'y = 5' },
                { id: 'opt-d', text: 'y = 4' },
              ],
              selectedOptionId: 'opt-a',
              correctOptionId: 'opt-b',
              isCorrect: false,
              weight: 1,
            },
            {
              questionId: 'q-pre-3',
              questionText: 'Jelaskan dengan kata-kata sendiri apa yang dimaksud dengan variabel dalam aljabar!',
              questionType: 'SHORT_ANSWER',
              textAnswer: 'Variabel adalah simbol huruf yang mewakili suatu bilangan yang belum diketahui nilainya.',
              adminScore: 90,
              adminNote: 'Jawaban tepat dan jelas.',
              weight: 2,
            },
            {
              questionId: 'q-pre-4',
              questionText: 'Selesaikan: 5(2x - 3) = 25',
              questionType: 'MULTIPLE_CHOICE',
              options: [
                { id: 'opt-a', text: 'x = 4' },
                { id: 'opt-b', text: 'x = 5' },
                { id: 'opt-c', text: 'x = 3' },
                { id: 'opt-d', text: 'x = 2' },
              ],
              selectedOptionId: 'opt-a',
              correctOptionId: 'opt-a',
              isCorrect: true,
              weight: 1,
            },
            {
              questionId: 'q-pre-5',
              questionText: 'Tentukan himpunan penyelesaian dari: x² - 5x + 6 = 0',
              questionType: 'MULTIPLE_CHOICE',
              options: [
                { id: 'opt-a', text: '{2, 3}' },
                { id: 'opt-b', text: '{1, 6}' },
                { id: 'opt-c', text: '{-2, -3}' },
                { id: 'opt-d', text: '{3, 4}' },
              ],
              selectedOptionId: 'opt-b',
              correctOptionId: 'opt-a',
              isCorrect: false,
              weight: 1,
            },
          ],
        },
        {
          submissionId: 'sub-002',
          quizType: 'CHAPTER_QUIZ',
          subjectId: 'materi-1',
          subjectName: 'Matematika Dasar',
          sectionId: 'bab-1',
          sectionName: 'Aljabar Dasar',
          chapterId: 'ch-1',
          chapterName: 'Pengenalan Variabel',
          submittedAt: '2024-01-19T09:30:00Z',
          score: 85,
          status: 'GRADED',
          answers: [
            {
              questionId: 'q-ch1-1',
              questionText: 'Apa nilai dari x jika 4x = 28?',
              questionType: 'MULTIPLE_CHOICE',
              options: [
                { id: 'opt-a', text: '6' },
                { id: 'opt-b', text: '7' },
                { id: 'opt-c', text: '8' },
                { id: 'opt-d', text: '9' },
              ],
              selectedOptionId: 'opt-b',
              correctOptionId: 'opt-b',
              isCorrect: true,
              weight: 1,
              xpPerQuestion: 50,
            },
            {
              questionId: 'q-ch1-2',
              questionText: 'Sebutkan dan jelaskan langkah-langkah menyelesaikan persamaan linear satu variabel!',
              questionType: 'SHORT_ANSWER',
              textAnswer: 'Langkah pertama pindahkan semua variabel ke kiri dan konstanta ke kanan. Kemudian bagi kedua ruas dengan koefisien variabel.',
              adminScore: 80,
              adminNote: 'Cukup baik, tapi kurang lengkap.',
              weight: 2,
              xpPerQuestion: 100,
            },
            {
              questionId: 'q-ch1-3',
              questionText: 'Berapakah nilai z dari 3z + 9 = 0?',
              questionType: 'MULTIPLE_CHOICE',
              options: [
                { id: 'opt-a', text: 'z = -3' },
                { id: 'opt-b', text: 'z = 3' },
                { id: 'opt-c', text: 'z = -9' },
                { id: 'opt-d', text: 'z = 9' },
              ],
              selectedOptionId: 'opt-a',
              correctOptionId: 'opt-a',
              isCorrect: true,
              weight: 1,
              xpPerQuestion: 50,
            },
          ],
        },
        {
          submissionId: 'sub-003',
          quizType: 'CHAPTER_QUIZ',
          subjectId: 'materi-1',
          subjectName: 'Matematika Dasar',
          sectionId: 'bab-1',
          sectionName: 'Aljabar Dasar',
          chapterId: 'ch-3',
          chapterName: 'Persamaan Kuadrat',
          submittedAt: '2024-01-20T07:45:00Z',
          score: null,
          status: 'PENDING',
          answers: [
            {
              questionId: 'q-ch3-1',
              questionText: 'Tentukan akar-akar dari x² - 7x + 12 = 0!',
              questionType: 'MULTIPLE_CHOICE',
              options: [
                { id: 'opt-a', text: 'x = 3 dan x = 4' },
                { id: 'opt-b', text: 'x = 2 dan x = 6' },
                { id: 'opt-c', text: 'x = 1 dan x = 12' },
                { id: 'opt-d', text: 'x = -3 dan x = -4' },
              ],
              selectedOptionId: 'opt-a',
              correctOptionId: 'opt-a',
              isCorrect: true,
              weight: 1,
              xpPerQuestion: 50,
            },
            {
              questionId: 'q-ch3-2',
              questionText: 'Buktikan dengan cara pemfaktoran bahwa x² - 5x + 6 = 0 memiliki akar x = 2 dan x = 3, kemudian jelaskan langkah pembuktiannya!',
              questionType: 'SHORT_ANSWER',
              textAnswer: 'x² - 5x + 6 = (x-2)(x-3) = 0, sehingga x = 2 atau x = 3. Cara pemfaktoran: cari dua bilangan yang jika dijumlah = -5 dan dikalikan = 6, yaitu -2 dan -3.',
              adminScore: null,
              adminNote: null,
              weight: 3,
              xpPerQuestion: 150,
            },
            {
              questionId: 'q-ch3-3',
              questionText: 'Jelaskan perbedaan metode pemfaktoran dan rumus kuadratik dalam menyelesaikan persamaan kuadrat!',
              questionType: 'SHORT_ANSWER',
              textAnswer: 'Pemfaktoran lebih mudah jika koefisiennya sederhana. Rumus kuadratik dapat digunakan untuk semua persamaan kuadrat termasuk yang tidak dapat difaktorkan.',
              adminScore: null,
              adminNote: null,
              weight: 2,
              xpPerQuestion: 100,
            },
          ],
        },
        {
          submissionId: 'sub-004',
          quizType: 'PRE_TEST',
          subjectId: 'materi-1',
          subjectName: 'Matematika Dasar',
          sectionId: 'bab-2',
          sectionName: 'Geometri',
          submittedAt: '2024-01-19T14:00:00Z',
          score: 40,
          status: 'GRADED',
          answers: [
            {
              questionId: 'q-geo-1',
              questionText: 'Luas segitiga dengan alas 8 cm dan tinggi 6 cm adalah...',
              questionType: 'MULTIPLE_CHOICE',
              options: [
                { id: 'opt-a', text: '24 cm²' },
                { id: 'opt-b', text: '48 cm²' },
                { id: 'opt-c', text: '14 cm²' },
                { id: 'opt-d', text: '28 cm²' },
              ],
              selectedOptionId: 'opt-b',
              correctOptionId: 'opt-a',
              isCorrect: false,
              weight: 1,
            },
            {
              questionId: 'q-geo-2',
              questionText: 'Keliling persegi dengan sisi 5 cm adalah...',
              questionType: 'MULTIPLE_CHOICE',
              options: [
                { id: 'opt-a', text: '10 cm' },
                { id: 'opt-b', text: '20 cm' },
                { id: 'opt-c', text: '25 cm' },
                { id: 'opt-d', text: '15 cm' },
              ],
              selectedOptionId: 'opt-b',
              correctOptionId: 'opt-b',
              isCorrect: true,
              weight: 1,
            },
            {
              questionId: 'q-geo-3',
              questionText: 'Jelaskan perbedaan antara luas dan keliling suatu bangun datar!',
              questionType: 'SHORT_ANSWER',
              textAnswer: 'Luas adalah ukuran permukaan bangun datar dalam satuan persegi. Keliling adalah jumlah panjang semua sisi bangun datar.',
              adminScore: 85,
              adminNote: null,
              weight: 2,
            },
          ],
        },
      ],
    },
  };

  const data = submissionsMap[userId];

  if (!data) {
    // Generic data for unknown students
    return NextResponse.json({
      userId,
      pendingGradeCount: 1,
      submissions: [
        {
          submissionId: `sub-generic-${userId}`,
          quizType: 'PRE_TEST',
          subjectId: 'materi-1',
          subjectName: 'Matematika Dasar',
          sectionId: 'bab-1',
          sectionName: 'Aljabar Dasar',
          submittedAt: new Date().toISOString(),
          score: null,
          status: 'PENDING',
          answers: [
            {
              questionId: 'q-g-1',
              questionText: 'Berapakah nilai x dari 2x + 4 = 12?',
              questionType: 'MULTIPLE_CHOICE',
              options: [
                { id: 'opt-a', text: 'x = 4' },
                { id: 'opt-b', text: 'x = 3' },
                { id: 'opt-c', text: 'x = 6' },
                { id: 'opt-d', text: 'x = 8' },
              ],
              selectedOptionId: 'opt-a',
              correctOptionId: 'opt-a',
              isCorrect: true,
              weight: 1,
            },
            {
              questionId: 'q-g-2',
              questionText: 'Jelaskan dengan kata-katamu sendiri apa itu persamaan linear!',
              questionType: 'SHORT_ANSWER',
              textAnswer: 'Persamaan linear adalah persamaan yang pangkat tertinggi variabelnya adalah 1.',
              adminScore: null,
              adminNote: null,
              weight: 2,
            },
          ],
        },
      ],
    });
  }

  return NextResponse.json(data);
}
