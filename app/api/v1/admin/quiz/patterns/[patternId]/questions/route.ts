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
    // Pre Test - TPS Penalaran Umum
    'pattern-pre-1': [
      {
        id: 'pre-q-1',
        patternId: 'pattern-pre-1',
        questionText: 'Semua mahasiswa teknik belajar kalkulus. Sebagian mahasiswa teknik mengikuti lomba robotik. Kesimpulan yang tepat adalah...',
        options: [
          { id: 'pre-opt-1a', text: 'Semua yang belajar kalkulus mengikuti lomba robotik', orderIndex: 0 },
          { id: 'pre-opt-1b', text: 'Sebagian yang belajar kalkulus mengikuti lomba robotik', orderIndex: 1 },
          { id: 'pre-opt-1c', text: 'Semua peserta lomba robotik belajar kalkulus', orderIndex: 2 },
          { id: 'pre-opt-1d', text: 'Tidak ada yang belajar kalkulus dan mengikuti lomba', orderIndex: 3 },
        ],
        correctOptionId: 'pre-opt-1b',
        explanation: 'Silogisme: sebagian mahasiswa teknik ikut lomba, semua mahasiswa teknik belajar kalkulus.',
        orderIndex: 0,
        createdAt: '2024-01-05T08:00:00Z',
      },
      {
        id: 'pre-q-2',
        patternId: 'pattern-pre-1',
        questionText: 'Jika hujan turun, maka jalanan basah. Jalanan tidak basah. Kesimpulan yang valid adalah...',
        options: [
          { id: 'pre-opt-2a', text: 'Hujan turun', orderIndex: 0 },
          { id: 'pre-opt-2b', text: 'Hujan tidak turun', orderIndex: 1 },
          { id: 'pre-opt-2c', text: 'Jalanan kering karena panas', orderIndex: 2 },
          { id: 'pre-opt-2d', text: 'Tidak dapat disimpulkan', orderIndex: 3 },
        ],
        correctOptionId: 'pre-opt-2b',
        explanation: 'Modus Tollens: Jika P→Q dan ~Q, maka ~P.',
        orderIndex: 1,
        createdAt: '2024-01-05T08:30:00Z',
      },
      {
        id: 'pre-q-3',
        patternId: 'pattern-pre-1',
        questionText: 'Deret: 2, 6, 18, 54, ... Angka selanjutnya adalah...',
        options: [
          { id: 'pre-opt-3a', text: '108', orderIndex: 0 },
          { id: 'pre-opt-3b', text: '162', orderIndex: 1 },
          { id: 'pre-opt-3c', text: '148', orderIndex: 2 },
          { id: 'pre-opt-3d', text: '216', orderIndex: 3 },
        ],
        correctOptionId: 'pre-opt-3b',
        explanation: 'Deret geometri rasio 3: 54×3=162.',
        orderIndex: 2,
        createdAt: '2024-01-05T09:00:00Z',
      },
      {
        id: 'pre-q-4',
        patternId: 'pattern-pre-1',
        questionText: 'Lima orang duduk melingkar. A di sebelah kanan B. C berhadapan dengan A. D di sebelah kiri E. Siapa yang duduk di sebelah kanan C?',
        options: [
          { id: 'pre-opt-4a', text: 'A', orderIndex: 0 },
          { id: 'pre-opt-4b', text: 'B', orderIndex: 1 },
          { id: 'pre-opt-4c', text: 'D', orderIndex: 2 },
          { id: 'pre-opt-4d', text: 'E', orderIndex: 3 },
        ],
        correctOptionId: 'pre-opt-4d',
        explanation: 'Susunan melingkar: B-A-E-C-D. Sebelah kanan C adalah E.',
        orderIndex: 3,
        createdAt: '2024-01-05T09:30:00Z',
      },
    ],
    // Pre Test - TPS Penalaran Matematika
    'pattern-pre-2': [
      {
        id: 'pre-q-5',
        patternId: 'pattern-pre-2',
        questionText: 'Jika rata-rata 5 bilangan adalah 12, dan satu bilangan dihapus sehingga rata-rata menjadi 10, maka bilangan yang dihapus adalah...',
        options: [
          { id: 'pre-opt-5a', text: '16', orderIndex: 0 },
          { id: 'pre-opt-5b', text: '18', orderIndex: 1 },
          { id: 'pre-opt-5c', text: '20', orderIndex: 2 },
          { id: 'pre-opt-5d', text: '22', orderIndex: 3 },
        ],
        correctOptionId: 'pre-opt-5c',
        explanation: 'Total 5 bil = 60. Setelah dihapus, rata-rata 4 bil = 10, total = 40. Dihapus = 60-40 = 20.',
        orderIndex: 0,
        createdAt: '2024-01-05T10:00:00Z',
      },
      {
        id: 'pre-q-6',
        patternId: 'pattern-pre-2',
        questionText: 'Toko diskon 20% lalu tambahan 10%. Harga awal Rp500.000, harga akhir adalah...',
        options: [
          { id: 'pre-opt-6a', text: 'Rp350.000', orderIndex: 0 },
          { id: 'pre-opt-6b', text: 'Rp360.000', orderIndex: 1 },
          { id: 'pre-opt-6c', text: 'Rp375.000', orderIndex: 2 },
          { id: 'pre-opt-6d', text: 'Rp400.000', orderIndex: 3 },
        ],
        correctOptionId: 'pre-opt-6b',
        explanation: '500.000 × 0.8 = 400.000. 400.000 × 0.9 = 360.000.',
        orderIndex: 1,
        createdAt: '2024-01-05T10:30:00Z',
      },
      {
        id: 'pre-q-7',
        patternId: 'pattern-pre-2',
        questionText: 'Perbandingan umur ayah dan anak 5:2. Selisih umur 27 tahun. Umur anak sekarang adalah...',
        options: [
          { id: 'pre-opt-7a', text: '15 tahun', orderIndex: 0 },
          { id: 'pre-opt-7b', text: '18 tahun', orderIndex: 1 },
          { id: 'pre-opt-7c', text: '21 tahun', orderIndex: 2 },
          { id: 'pre-opt-7d', text: '24 tahun', orderIndex: 3 },
        ],
        correctOptionId: 'pre-opt-7b',
        explanation: 'Selisih rasio 5-2=3 bagian=27. 1 bagian=9. Anak=2×9=18.',
        orderIndex: 2,
        createdAt: '2024-01-05T11:00:00Z',
      },
    ],
    // Pre Test - TPS Literasi Bahasa Indonesia
    'pattern-pre-5': [
      {
        id: 'pre-q-14',
        patternId: 'pattern-pre-5',
        questionText: '"Perubahan iklim menyebabkan kenaikan suhu global rata-rata 1,1°C sejak era praindustri. Dampaknya terasa pada sektor pertanian." Ide pokok paragraf tersebut adalah...',
        options: [
          { id: 'pre-opt-14a', text: 'Suhu global naik 1,1°C', orderIndex: 0 },
          { id: 'pre-opt-14b', text: 'Perubahan iklim berdampak luas', orderIndex: 1 },
          { id: 'pre-opt-14c', text: 'Negara berkembang paling terdampak', orderIndex: 2 },
          { id: 'pre-opt-14d', text: 'Pertanian terancam pemanasan', orderIndex: 3 },
        ],
        correctOptionId: 'pre-opt-14b',
        explanation: 'Ide pokok mencakup keseluruhan: perubahan iklim dan dampaknya.',
        orderIndex: 0,
        createdAt: '2024-01-05T12:00:00Z',
      },
      {
        id: 'pre-q-15',
        patternId: 'pattern-pre-5',
        questionText: 'Kalimat efektif adalah kalimat yang...',
        options: [
          { id: 'pre-opt-15a', text: 'Menggunakan kata-kata panjang', orderIndex: 0 },
          { id: 'pre-opt-15b', text: 'Mudah dipahami dan tidak ambigu', orderIndex: 1 },
          { id: 'pre-opt-15c', text: 'Memiliki banyak anak kalimat', orderIndex: 2 },
          { id: 'pre-opt-15d', text: 'Selalu menggunakan kalimat pasif', orderIndex: 3 },
        ],
        correctOptionId: 'pre-opt-15b',
        explanation: 'Kalimat efektif: jelas, tidak ambigu, mudah dipahami.',
        orderIndex: 1,
        createdAt: '2024-01-05T12:30:00Z',
      },
      {
        id: 'pre-q-16',
        patternId: 'pattern-pre-5',
        questionText: 'Kata "konklusi" memiliki makna yang sama dengan...',
        options: [
          { id: 'pre-opt-16a', text: 'Pendahuluan', orderIndex: 0 },
          { id: 'pre-opt-16b', text: 'Kesimpulan', orderIndex: 1 },
          { id: 'pre-opt-16c', text: 'Penjelasan', orderIndex: 2 },
          { id: 'pre-opt-16d', text: 'Hipotesis', orderIndex: 3 },
        ],
        correctOptionId: 'pre-opt-16b',
        explanation: 'Konklusi = kesimpulan (dari bahasa Latin "conclusio").',
        orderIndex: 2,
        createdAt: '2024-01-05T13:00:00Z',
      },
    ],
    // Pre Test - TPS Penalaran Umum (Fisika Mekanika)
    'pattern-pre-3': [
      {
        id: 'pre-q-8',
        patternId: 'pattern-pre-3',
        questionText: 'Semua logam adalah konduktor. Tembaga adalah logam. Kesimpulan yang tepat adalah...',
        options: [
          { id: 'pre-opt-8a', text: 'Tembaga adalah isolator', orderIndex: 0 },
          { id: 'pre-opt-8b', text: 'Tembaga adalah konduktor', orderIndex: 1 },
          { id: 'pre-opt-8c', text: 'Semua konduktor adalah tembaga', orderIndex: 2 },
          { id: 'pre-opt-8d', text: 'Tidak dapat disimpulkan', orderIndex: 3 },
        ],
        correctOptionId: 'pre-opt-8b',
        explanation: 'Silogisme: Semua logam = konduktor, tembaga = logam → tembaga = konduktor.',
        orderIndex: 0,
        createdAt: '2024-01-06T08:00:00Z',
      },
      {
        id: 'pre-q-9',
        patternId: 'pattern-pre-3',
        questionText: 'Penjualan naik 20% di Q1, turun 10% di Q2, naik 15% di Q3. Jika awal 1000, akhir Q3 adalah...',
        options: [
          { id: 'pre-opt-9a', text: '1.200', orderIndex: 0 },
          { id: 'pre-opt-9b', text: '1.242', orderIndex: 1 },
          { id: 'pre-opt-9c', text: '1.250', orderIndex: 2 },
          { id: 'pre-opt-9d', text: '1.300', orderIndex: 3 },
        ],
        correctOptionId: 'pre-opt-9b',
        explanation: '1000×1.2=1200, 1200×0.9=1080, 1080×1.15=1242.',
        orderIndex: 1,
        createdAt: '2024-01-06T08:30:00Z',
      },
      {
        id: 'pre-q-10',
        patternId: 'pattern-pre-3',
        questionText: 'Dari 40 orang: 25 suka kopi, 18 suka teh, 8 suka keduanya. Berapa yang tidak suka keduanya?',
        options: [
          { id: 'pre-opt-10a', text: '3', orderIndex: 0 },
          { id: 'pre-opt-10b', text: '5', orderIndex: 1 },
          { id: 'pre-opt-10c', text: '7', orderIndex: 2 },
          { id: 'pre-opt-10d', text: '10', orderIndex: 3 },
        ],
        correctOptionId: 'pre-opt-10b',
        explanation: 'Gabungan = 25+18-8=35. Tidak suka = 40-35=5.',
        orderIndex: 2,
        createdAt: '2024-01-06T09:00:00Z',
      },
    ],
    // Pre Test - TPS Pengetahuan Kuantitatif (Fisika Mekanika)
    'pattern-pre-4': [
      {
        id: 'pre-q-11',
        patternId: 'pattern-pre-4',
        questionText: 'Jika $2^x = 32$, maka nilai $x$ adalah...',
        options: [
          { id: 'pre-opt-11a', text: '4', orderIndex: 0 },
          { id: 'pre-opt-11b', text: '5', orderIndex: 1 },
          { id: 'pre-opt-11c', text: '6', orderIndex: 2 },
          { id: 'pre-opt-11d', text: '8', orderIndex: 3 },
        ],
        correctOptionId: 'pre-opt-11b',
        explanation: '$2^5 = 32$, maka $x = 5$.',
        orderIndex: 0,
        createdAt: '2024-01-06T09:30:00Z',
      },
      {
        id: 'pre-q-12',
        patternId: 'pattern-pre-4',
        questionText: 'Luas permukaan kubus dengan volume 125 cm³ adalah...',
        options: [
          { id: 'pre-opt-12a', text: '100 cm²', orderIndex: 0 },
          { id: 'pre-opt-12b', text: '125 cm²', orderIndex: 1 },
          { id: 'pre-opt-12c', text: '150 cm²', orderIndex: 2 },
          { id: 'pre-opt-12d', text: '200 cm²', orderIndex: 3 },
        ],
        correctOptionId: 'pre-opt-12c',
        explanation: 'Sisi = ∛125 = 5. Luas = 6×25 = 150 cm².',
        orderIndex: 1,
        createdAt: '2024-01-06T10:00:00Z',
      },
      {
        id: 'pre-q-13',
        patternId: 'pattern-pre-4',
        questionText: 'Mobil menempuh 240 km dalam 3 jam. Kecepatan rata-rata dalam m/s adalah...',
        options: [
          { id: 'pre-opt-13a', text: '22,2 m/s', orderIndex: 0 },
          { id: 'pre-opt-13b', text: '20 m/s', orderIndex: 1 },
          { id: 'pre-opt-13c', text: '80 m/s', orderIndex: 2 },
          { id: 'pre-opt-13d', text: '25 m/s', orderIndex: 3 },
        ],
        correctOptionId: 'pre-opt-13a',
        explanation: '240/3 = 80 km/jam. 80×1000/3600 ≈ 22,2 m/s.',
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
