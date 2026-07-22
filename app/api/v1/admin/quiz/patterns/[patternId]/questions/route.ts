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
    // Pre Test - Aljabar Dasar
    'pattern-pre-1': [
      {
        id: 'pre-q-1',
        patternId: 'pattern-pre-1',
        questionText: 'Hasil dari 2x + 3 = 11 adalah x = ...',
        options: [
          { id: 'pre-opt-1a', text: '3', orderIndex: 0 },
          { id: 'pre-opt-1b', text: '4', orderIndex: 1 },
          { id: 'pre-opt-1c', text: '5', orderIndex: 2 },
          { id: 'pre-opt-1d', text: '6', orderIndex: 3 },
        ],
        correctOptionId: 'pre-opt-1b',
        explanation: '2x + 3 = 11 → 2x = 8 → x = 4',
        orderIndex: 0,
        createdAt: '2024-01-05T08:00:00Z',
      },
      {
        id: 'pre-q-2',
        patternId: 'pattern-pre-1',
        questionText: 'Jika a = 3 dan b = 5, maka nilai 2a + b = ...',
        options: [
          { id: 'pre-opt-2a', text: '8', orderIndex: 0 },
          { id: 'pre-opt-2b', text: '11', orderIndex: 1 },
          { id: 'pre-opt-2c', text: '13', orderIndex: 2 },
          { id: 'pre-opt-2d', text: '16', orderIndex: 3 },
        ],
        correctOptionId: 'pre-opt-2b',
        explanation: '2(3) + 5 = 6 + 5 = 11',
        orderIndex: 1,
        createdAt: '2024-01-05T08:30:00Z',
      },
      {
        id: 'pre-q-3',
        patternId: 'pattern-pre-1',
        questionText: 'Bentuk sederhana dari 3x + 2x - x adalah...',
        options: [
          { id: 'pre-opt-3a', text: '3x', orderIndex: 0 },
          { id: 'pre-opt-3b', text: '4x', orderIndex: 1 },
          { id: 'pre-opt-3c', text: '5x', orderIndex: 2 },
          { id: 'pre-opt-3d', text: '6x', orderIndex: 3 },
        ],
        correctOptionId: 'pre-opt-3b',
        explanation: '3x + 2x - x = (3 + 2 - 1)x = 4x',
        orderIndex: 2,
        createdAt: '2024-01-05T09:00:00Z',
      },
      {
        id: 'pre-q-4',
        patternId: 'pattern-pre-1',
        questionText: 'Nilai x dari persamaan 4(x - 2) = 12 adalah...',
        options: [
          { id: 'pre-opt-4a', text: '3', orderIndex: 0 },
          { id: 'pre-opt-4b', text: '4', orderIndex: 1 },
          { id: 'pre-opt-4c', text: '5', orderIndex: 2 },
          { id: 'pre-opt-4d', text: '6', orderIndex: 3 },
        ],
        correctOptionId: 'pre-opt-4c',
        explanation: '4(x - 2) = 12 → x - 2 = 3 → x = 5',
        orderIndex: 3,
        createdAt: '2024-01-05T09:30:00Z',
      },
    ],
    // Pre Test - Geometri Dasar
    'pattern-pre-2': [
      {
        id: 'pre-q-5',
        patternId: 'pattern-pre-2',
        questionText: 'Luas persegi panjang dengan panjang 8 cm dan lebar 5 cm adalah...',
        options: [
          { id: 'pre-opt-5a', text: '13 cm²', orderIndex: 0 },
          { id: 'pre-opt-5b', text: '26 cm²', orderIndex: 1 },
          { id: 'pre-opt-5c', text: '40 cm²', orderIndex: 2 },
          { id: 'pre-opt-5d', text: '80 cm²', orderIndex: 3 },
        ],
        correctOptionId: 'pre-opt-5c',
        explanation: 'Luas = p × l = 8 × 5 = 40 cm²',
        orderIndex: 0,
        createdAt: '2024-01-05T10:00:00Z',
      },
      {
        id: 'pre-q-6',
        patternId: 'pattern-pre-2',
        questionText: 'Keliling lingkaran dengan jari-jari 7 cm adalah... (π = 22/7)',
        options: [
          { id: 'pre-opt-6a', text: '22 cm', orderIndex: 0 },
          { id: 'pre-opt-6b', text: '44 cm', orderIndex: 1 },
          { id: 'pre-opt-6c', text: '154 cm', orderIndex: 2 },
          { id: 'pre-opt-6d', text: '308 cm', orderIndex: 3 },
        ],
        correctOptionId: 'pre-opt-6b',
        explanation: 'K = 2πr = 2 × 22/7 × 7 = 44 cm',
        orderIndex: 1,
        createdAt: '2024-01-05T10:30:00Z',
      },
      {
        id: 'pre-q-7',
        patternId: 'pattern-pre-2',
        questionText: 'Jumlah sudut dalam segitiga adalah...',
        options: [
          { id: 'pre-opt-7a', text: '90°', orderIndex: 0 },
          { id: 'pre-opt-7b', text: '180°', orderIndex: 1 },
          { id: 'pre-opt-7c', text: '270°', orderIndex: 2 },
          { id: 'pre-opt-7d', text: '360°', orderIndex: 3 },
        ],
        correctOptionId: 'pre-opt-7b',
        explanation: 'Jumlah sudut dalam segitiga selalu = 180°',
        orderIndex: 2,
        createdAt: '2024-01-05T11:00:00Z',
      },
    ],
    // Pre Test - Kinematika (Fisika)
    'pattern-pre-3': [
      {
        id: 'pre-q-8',
        patternId: 'pattern-pre-3',
        questionText: 'Sebuah mobil bergerak dengan kecepatan tetap 60 km/jam selama 2 jam. Jarak yang ditempuh adalah...',
        options: [
          { id: 'pre-opt-8a', text: '30 km', orderIndex: 0 },
          { id: 'pre-opt-8b', text: '60 km', orderIndex: 1 },
          { id: 'pre-opt-8c', text: '120 km', orderIndex: 2 },
          { id: 'pre-opt-8d', text: '180 km', orderIndex: 3 },
        ],
        correctOptionId: 'pre-opt-8c',
        explanation: 's = v × t = 60 × 2 = 120 km',
        orderIndex: 0,
        createdAt: '2024-01-06T08:00:00Z',
      },
      {
        id: 'pre-q-9',
        patternId: 'pattern-pre-3',
        questionText: 'Percepatan didefinisikan sebagai...',
        options: [
          { id: 'pre-opt-9a', text: 'Perubahan jarak per satuan waktu', orderIndex: 0 },
          { id: 'pre-opt-9b', text: 'Perubahan kecepatan per satuan waktu', orderIndex: 1 },
          { id: 'pre-opt-9c', text: 'Perubahan gaya per satuan waktu', orderIndex: 2 },
          { id: 'pre-opt-9d', text: 'Perubahan massa per satuan waktu', orderIndex: 3 },
        ],
        correctOptionId: 'pre-opt-9b',
        explanation: 'Percepatan (a) = Δv / Δt, yaitu perubahan kecepatan per satuan waktu.',
        orderIndex: 1,
        createdAt: '2024-01-06T08:30:00Z',
      },
      {
        id: 'pre-q-10',
        patternId: 'pattern-pre-3',
        questionText: 'Benda jatuh bebas dari ketinggian 20 m. Kecepatan saat menyentuh tanah adalah... (g = 10 m/s²)',
        options: [
          { id: 'pre-opt-10a', text: '10 m/s', orderIndex: 0 },
          { id: 'pre-opt-10b', text: '20 m/s', orderIndex: 1 },
          { id: 'pre-opt-10c', text: '30 m/s', orderIndex: 2 },
          { id: 'pre-opt-10d', text: '40 m/s', orderIndex: 3 },
        ],
        correctOptionId: 'pre-opt-10b',
        explanation: 'v = √(2gh) = √(2 × 10 × 20) = √400 = 20 m/s',
        orderIndex: 2,
        createdAt: '2024-01-06T09:00:00Z',
      },
    ],
    // Pre Test - Dinamika (Fisika)
    'pattern-pre-4': [
      {
        id: 'pre-q-11',
        patternId: 'pattern-pre-4',
        questionText: 'Sebuah benda bermassa 5 kg diberi gaya 20 N. Percepatan benda tersebut adalah...',
        options: [
          { id: 'pre-opt-11a', text: '2 m/s²', orderIndex: 0 },
          { id: 'pre-opt-11b', text: '4 m/s²', orderIndex: 1 },
          { id: 'pre-opt-11c', text: '10 m/s²', orderIndex: 2 },
          { id: 'pre-opt-11d', text: '100 m/s²', orderIndex: 3 },
        ],
        correctOptionId: 'pre-opt-11b',
        explanation: 'F = ma → a = F/m = 20/5 = 4 m/s²',
        orderIndex: 0,
        createdAt: '2024-01-06T09:30:00Z',
      },
      {
        id: 'pre-q-12',
        patternId: 'pattern-pre-4',
        questionText: 'Hukum Newton III menyatakan bahwa...',
        options: [
          { id: 'pre-opt-12a', text: 'Benda diam tetap diam', orderIndex: 0 },
          { id: 'pre-opt-12b', text: 'F = m × a', orderIndex: 1 },
          { id: 'pre-opt-12c', text: 'Aksi = Reaksi', orderIndex: 2 },
          { id: 'pre-opt-12d', text: 'Energi kekal', orderIndex: 3 },
        ],
        correctOptionId: 'pre-opt-12c',
        explanation: 'Hukum Newton III: Setiap aksi memiliki reaksi yang sama besar dan berlawanan arah.',
        orderIndex: 1,
        createdAt: '2024-01-06T10:00:00Z',
      },
      {
        id: 'pre-q-13',
        patternId: 'pattern-pre-4',
        questionText: 'Berat sebuah benda bermassa 10 kg di permukaan bumi (g = 10 m/s²) adalah...',
        options: [
          { id: 'pre-opt-13a', text: '10 N', orderIndex: 0 },
          { id: 'pre-opt-13b', text: '50 N', orderIndex: 1 },
          { id: 'pre-opt-13c', text: '100 N', orderIndex: 2 },
          { id: 'pre-opt-13d', text: '1000 N', orderIndex: 3 },
        ],
        correctOptionId: 'pre-opt-13c',
        explanation: 'W = m × g = 10 × 10 = 100 N',
        orderIndex: 2,
        createdAt: '2024-01-06T10:30:00Z',
      },
    ],
  };

  const rawQuestions = questionsByPattern[patternId] || [];

  // Map ke format Question type frontend dan return array langsung
  const questions = rawQuestions.map(q => ({
    id: q.id,
    patternId: q.patternId,
    text: q.questionText,
    options: q.options.map(opt => ({
      id: opt.id,
      text: opt.text,
      order: opt.orderIndex,
    })),
    correctOptionId: q.correctOptionId,
  }));

  return NextResponse.json(questions);
}
