import * as XLSX from 'xlsx';
import type { StudentProgress, SectionProgress, ChapterProgress } from '@/lib/types/progress';

interface StudentExportData {
  userId: string;
  name: string;
  kelas: string;
  totalProgress: number;
  detail?: StudentProgress;
}

/**
 * Export student monitoring data to Excel file.
 * Focus on NILAI (scores) — not XP — because teachers care about grades.
 *
 * Sheet 1: Ringkasan & Ranking
 *   - Ranking, Nama, Kelas, Rata-rata Nilai, Total Progress
 *
 * Sheet 2: Detail Nilai per Chapter
 *   - Per bab: Pre Test, each chapter with attempt-by-attempt scores, Post Test
 */
export function exportStudentDataToExcel(
  students: StudentExportData[],
  filename: string = 'monitoring-siswa'
) {
  const wb = XLSX.utils.book_new();

  // ─── Sheet 1: Ringkasan & Ranking ───
  buildSummarySheet(wb, students);

  // ─── Sheet 2: Detail Nilai (if detail data available) ───
  const studentsWithDetail = students.filter((s) => s.detail);
  if (studentsWithDetail.length > 0) {
    buildDetailSheet(wb, studentsWithDetail);
  }

  // Generate and download file
  const timestamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `${filename}-${timestamp}.xlsx`);
}

/**
 * Sheet 1: Ranking & summary scores.
 * Sorted by average score descending (highest rank first).
 */
function buildSummarySheet(wb: XLSX.WorkBook, students: StudentExportData[]) {
  const ranked = students
    .map((s) => {
      const avg = s.detail ? calculateAverageScore(s.detail) : null;
      return { ...s, averageScore: avg };
    })
    .sort((a, b) => {
      if (a.averageScore === null && b.averageScore === null) return 0;
      if (a.averageScore === null) return 1;
      if (b.averageScore === null) return -1;
      return b.averageScore - a.averageScore;
    });

  const headers = ['Peringkat', 'Nama', 'Kelas', 'Rata-rata Nilai', 'Total Progress (%)'];
  const rows: (string | number)[][] = [];

  ranked.forEach((student, index) => {
    rows.push([
      index + 1,
      student.name,
      student.kelas,
      student.averageScore !== null ? Math.round(student.averageScore * 10) / 10 : '-' as unknown as number,
      student.totalProgress,
    ]);
  });

  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = [
    { wch: 10 },
    { wch: 25 },
    { wch: 8 },
    { wch: 16 },
    { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Ringkasan & Ranking');
}

/**
 * Sheet 2: Detail scores showing every attempt per chapter.
 *
 * Layout per bab:
 *   | Pre Test | Ch1 Percobaan 1 | Ch1 Percobaan 2 | ... | Ch2 Percobaan 1 | ... | Post Test |
 *
 * We dynamically compute max attempts per chapter across all students.
 */
function buildDetailSheet(wb: XLSX.WorkBook, students: StudentExportData[]) {
  // Collect bab structure: for each bab, collect chapters and max attempts per chapter
  const babStructure = collectBabStructure(students);

  // ─── Build header rows ───
  // Row 1: Bab name (merged across its columns)
  // Row 2: Sub-headers (Pre Test, Ch1 P1, Ch1 P2, ..., Post Test)
  const headerRow1: string[] = ['No', 'Nama', 'Kelas'];
  const headerRow2: string[] = ['', '', ''];

  babStructure.forEach((bab) => {
    // Count total columns for this bab: 1 (Pre Test) + sum of maxAttempts per chapter + 1 (Post Test)
    const chapterCols = bab.chapters.reduce((sum, ch) => sum + ch.maxAttempts, 0);
    const totalBabCols = 1 + chapterCols + 1; // Pre Test + chapters + Post Test

    // Row 1: bab name spans all its columns
    headerRow1.push(bab.babName);
    for (let i = 1; i < totalBabCols; i++) headerRow1.push('');

    // Row 2: sub-headers
    headerRow2.push('Pre Test');
    bab.chapters.forEach((ch, chIdx) => {
      for (let attempt = 1; attempt <= ch.maxAttempts; attempt++) {
        if (ch.maxAttempts === 1) {
          headerRow2.push(`Ch${chIdx + 1}`);
        } else {
          headerRow2.push(`Ch${chIdx + 1} P${attempt}`);
        }
      }
    });
    headerRow2.push('Post Test');
  });

  headerRow1.push('Rata-rata');
  headerRow2.push('Nilai');

  // ─── Build data rows (ranked by average) ───
  const rankedStudents = students
    .map((s) => ({
      ...s,
      avgScore: s.detail ? calculateAverageScore(s.detail) : null,
    }))
    .sort((a, b) => {
      if (a.avgScore === null && b.avgScore === null) return 0;
      if (a.avgScore === null) return 1;
      if (b.avgScore === null) return -1;
      return b.avgScore - a.avgScore;
    });

  const dataRows: (string | number)[][] = [];

  rankedStudents.forEach((student, index) => {
    const row: (string | number)[] = [index + 1, student.name, student.kelas];

    babStructure.forEach((babRef) => {
      const babData = findBabInStudent(student.detail!, babRef.babId);

      // Pre Test
      if (babData) {
        row.push(babData.preTestScore ?? '-');
      } else {
        row.push('-');
      }

      // Chapter scores per attempt
      babRef.chapters.forEach((chRef) => {
        const chapterData = babData
          ? babData.chapters.find((ch) => ch.chapterId === chRef.chapterId)
          : null;

        for (let attempt = 0; attempt < chRef.maxAttempts; attempt++) {
          if (chapterData && chapterData.scoreHistory && chapterData.scoreHistory[attempt] != null) {
            row.push(chapterData.scoreHistory[attempt]);
          } else {
            row.push('-');
          }
        }
      });

      // Post Test
      if (babData) {
        row.push(babData.postTestScore ?? '-');
      } else {
        row.push('-');
      }
    });

    // Average score
    row.push(student.avgScore !== null ? Math.round(student.avgScore * 10) / 10 : '-');

    dataRows.push(row);
  });

  const wsData = [headerRow1, headerRow2, ...dataRows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // ─── Merge bab name cells in header row 1 ───
  const merges: XLSX.Range[] = [];
  let colStart = 3; // after No, Nama, Kelas
  babStructure.forEach((bab) => {
    const chapterCols = bab.chapters.reduce((sum, ch) => sum + ch.maxAttempts, 0);
    const totalBabCols = 1 + chapterCols + 1;
    if (totalBabCols > 1) {
      merges.push({ s: { r: 0, c: colStart }, e: { r: 0, c: colStart + totalBabCols - 1 } });
    }
    colStart += totalBabCols;
  });
  ws['!merges'] = merges;

  // ─── Column widths ───
  const colWidths: { wch: number }[] = [
    { wch: 5 },  // No
    { wch: 25 }, // Nama
    { wch: 8 },  // Kelas
  ];
  babStructure.forEach((bab) => {
    colWidths.push({ wch: 10 }); // Pre Test
    bab.chapters.forEach((ch) => {
      for (let i = 0; i < ch.maxAttempts; i++) {
        colWidths.push({ wch: 10 });
      }
    });
    colWidths.push({ wch: 10 }); // Post Test
  });
  colWidths.push({ wch: 12 }); // Rata-rata
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, 'Detail Nilai');
}

// ─── Helper Types & Functions ───

interface ChapterRef {
  chapterId: string;
  maxAttempts: number; // max attempts across all students for this chapter
}

interface BabStructure {
  babId: string;
  babName: string;
  chapters: ChapterRef[];
}

interface BabWithScores extends SectionProgress {
  preTestScore: number | null;
  postTestScore: number | null;
}

/**
 * Collect all sections and chapters across students, determining max attempts per chapter.
 */
function collectBabStructure(students: StudentExportData[]): BabStructure[] {
  const babMap = new Map<string, { babName: string; chapters: Map<string, number> }>();

  students.forEach((s) => {
    if (!s.detail) return;
    s.detail.subjectProgress.forEach((subject) => {
      subject.sections.forEach((section) => {
        if (!babMap.has(section.sectionId)) {
          babMap.set(section.sectionId, { babName: section.sectionName, chapters: new Map() });
        }
        const babEntry = babMap.get(section.sectionId)!;

        section.chapters.forEach((ch) => {
          const currentMax = babEntry.chapters.get(ch.chapterId) || 0;
          const attempts = ch.scoreHistory ? ch.scoreHistory.length : ch.quizAttempts;
          // At minimum 1 column per chapter (even if no attempts yet)
          const effectiveAttempts = Math.max(attempts, currentMax);
          babEntry.chapters.set(ch.chapterId, Math.max(effectiveAttempts, 1));
        });
      });
    });
  });

  return Array.from(babMap.entries()).map(([babId, entry]) => ({
    babId,
    babName: entry.babName,
    chapters: Array.from(entry.chapters.entries()).map(([chapterId, maxAttempts]) => ({
      chapterId,
      maxAttempts,
    })),
  }));
}

function findBabInStudent(detail: StudentProgress, babId: string): BabWithScores | null {
  for (const subject of detail.subjectProgress) {
    for (const section of subject.sections) {
      if (section.sectionId === babId) {
        const sectionAny = section as SectionProgress & { preTestScore?: number | null; postTestScore?: number | null };
        return {
          ...section,
          preTestScore: sectionAny.preTestScore ?? null,
          postTestScore: sectionAny.postTestScore ?? null,
        };
      }
    }
  }
  return null;
}

function calculateAverageScore(detail: StudentProgress): number | null {
  const allScores: number[] = [];

  detail.subjectProgress.forEach((subject) => {
    subject.sections.forEach((section) => {
      const sectionAny = section as SectionProgress & { preTestScore?: number | null; postTestScore?: number | null };
      if (sectionAny.preTestScore != null) allScores.push(sectionAny.preTestScore);
      if (sectionAny.postTestScore != null) allScores.push(sectionAny.postTestScore);

      section.chapters.forEach((ch: ChapterProgress) => {
        if (ch.lastScore != null) allScores.push(ch.lastScore);
      });
    });
  });

  if (allScores.length === 0) return null;
  return allScores.reduce((a, b) => a + b, 0) / allScores.length;
}
