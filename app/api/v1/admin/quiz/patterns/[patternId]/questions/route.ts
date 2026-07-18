import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock admin quiz questions per pattern endpoint for development.
 * Returns questions belonging to a specific pattern.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patternId: string }> }
) {
  const { patternId } = await params;

  const questionsByPattern: Record<string, Array<{
    id: string;
    patternId: string;
    questionText: string;
    options: Array<{ id: string; text: string; orderIndex: number }>;
    correctOptionId: string;
    explanation: string;
    orderIndex: number;
    createdAt: string;
  }>> = {
    'pattern-1': [
      {
        id: 'adm-q-1',
        patternId: 'pattern-1',
        questionText: 'Tentukan nilai x dari persamaan 3x + 6 = 21',
        options: [
          { id: 'adm-opt-1a', text: '3', orderIndex: 0 },
          { id: 'adm-opt-1b', text: '5', orderIndex: 1 },
          { id: 'adm-opt-1c', text: '7', orderIndex: 2 },
          { id: 'adm-opt-1d', text: '9', orderIndex: 3 },
        ],
        correctOptionId: 'adm-opt-1b',
        explanation: '3x + 6 = 21 → 3x = 15 → x = 5',
        orderIndex: 0,
        createdAt: '2024-01-10T08:00:00Z',
      },
      {
        id: 'adm-q-2',
        patternId: 'pattern-1',
        questionText: 'Jika 5x - 10 = 25, maka x = ...',
        options: [
          { id: 'adm-opt-2a', text: '3', orderIndex: 0 },
          { id: 'adm-opt-2b', text: '5', orderIndex: 1 },
          { id: 'adm-opt-2c', text: '7', orderIndex: 2 },
          { id: 'adm-opt-2d', text: '9', orderIndex: 3 },
        ],
        correctOptionId: 'adm-opt-2c',
        explanation: '5x - 10 = 25 → 5x = 35 → x = 7',
        orderIndex: 1,
        createdAt: '2024-01-10T08:30:00Z',
      },
      {
        id: 'adm-q-3',
        patternId: 'pattern-1',
        questionText: 'Penyelesaian dari 2(x + 3) = 14 adalah...',
        options: [
          { id: 'adm-opt-3a', text: 'x = 2', orderIndex: 0 },
          { id: 'adm-opt-3b', text: 'x = 4', orderIndex: 1 },
          { id: 'adm-opt-3c', text: 'x = 5', orderIndex: 2 },
          { id: 'adm-opt-3d', text: 'x = 7', orderIndex: 3 },
        ],
        correctOptionId: 'adm-opt-3b',
        explanation: '2(x + 3) = 14 → x + 3 = 7 → x = 4',
        orderIndex: 2,
        createdAt: '2024-01-11T09:00:00Z',
      },
      {
        id: 'adm-q-4',
        patternId: 'pattern-1',
        questionText: 'Nilai x yang memenuhi x/4 + 2 = 5 adalah...',
        options: [
          { id: 'adm-opt-4a', text: '8', orderIndex: 0 },
          { id: 'adm-opt-4b', text: '12', orderIndex: 1 },
          { id: 'adm-opt-4c', text: '16', orderIndex: 2 },
          { id: 'adm-opt-4d', text: '20', orderIndex: 3 },
        ],
        correctOptionId: 'adm-opt-4b',
        explanation: 'x/4 + 2 = 5 → x/4 = 3 → x = 12',
        orderIndex: 3,
        createdAt: '2024-01-11T09:30:00Z',
      },
    ],
    'pattern-6': [
      {
        id: 'adm-q-p1',
        patternId: 'pattern-6',
        questionText: 'Sebuah buku diletakkan di atas meja. Menurut Hukum Newton I, buku tersebut...',
        options: [
          { id: 'adm-opt-p1a', text: 'Akan bergerak sendiri', orderIndex: 0 },
          { id: 'adm-opt-p1b', text: 'Tetap diam karena resultan gaya nol', orderIndex: 1 },
          { id: 'adm-opt-p1c', text: 'Memiliki percepatan ke bawah', orderIndex: 2 },
          { id: 'adm-opt-p1d', text: 'Tidak dipengaruhi gaya apapun', orderIndex: 3 },
        ],
        correctOptionId: 'adm-opt-p1b',
        explanation: 'Hukum Newton I: benda diam tetap diam jika resultan gaya = 0. Buku diam karena gaya berat = gaya normal.',
        orderIndex: 0,
        createdAt: '2024-01-13T08:00:00Z',
      },
      {
        id: 'adm-q-p2',
        patternId: 'pattern-6',
        questionText: 'Penumpang bus terlempar ke depan saat bus direm mendadak. Ini merupakan contoh dari...',
        options: [
          { id: 'adm-opt-p2a', text: 'Hukum Newton I (Inersia)', orderIndex: 0 },
          { id: 'adm-opt-p2b', text: 'Hukum Newton II', orderIndex: 1 },
          { id: 'adm-opt-p2c', text: 'Hukum Newton III', orderIndex: 2 },
          { id: 'adm-opt-p2d', text: 'Hukum Gravitasi', orderIndex: 3 },
        ],
        correctOptionId: 'adm-opt-p2a',
        explanation: 'Penumpang cenderung mempertahankan keadaan geraknya (inersia) saat bus tiba-tiba berhenti.',
        orderIndex: 1,
        createdAt: '2024-01-13T08:30:00Z',
      },
      {
        id: 'adm-q-p3',
        patternId: 'pattern-6',
        questionText: 'Sifat kelembaman suatu benda bergantung pada...',
        options: [
          { id: 'adm-opt-p3a', text: 'Kecepatan benda', orderIndex: 0 },
          { id: 'adm-opt-p3b', text: 'Massa benda', orderIndex: 1 },
          { id: 'adm-opt-p3c', text: 'Volume benda', orderIndex: 2 },
          { id: 'adm-opt-p3d', text: 'Bentuk benda', orderIndex: 3 },
        ],
        correctOptionId: 'adm-opt-p3b',
        explanation: 'Kelembaman (inersia) berbanding lurus dengan massa benda. Semakin besar massa, semakin sulit mengubah keadaan geraknya.',
        orderIndex: 2,
        createdAt: '2024-01-13T09:00:00Z',
      },
    ],
  };

  const questions = questionsByPattern[patternId] || [];

  return NextResponse.json({ questions });
}
