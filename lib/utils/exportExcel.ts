import * as XLSX from 'xlsx';
import type { StudentProgress, SectionProgress, ChapterProgress, SubjectProgress } from '@/lib/types/progress';

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
 * Sheet 2: Detail Nilai per Mata Pelajaran
 *   - Row 1: Nama Mata Pelajaran (merged)
 *   - Row 2: Pre Test | Nama Bab (merged per bab) | Post Test
 *   - Row 3: (kosong) | Ch1, Ch2, Ch3... per bab | (kosong)
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
 * Sheet 2: Detail scores with correct hierarchy.
 *
 * Layout:
 *   Row 1: | No | Nama | Kelas | ===== Matematika Dasar (merged) ===== | ===== Fisika (merged) ===== |
 *   Row 2: |    |      |       | Pre Test | Aljabar Dasar (merged) | Geometri (merged) | Post Test | Pre Test | ... | Post Test |
 *   Row 3: |    |      |       |          | Ch1 P1 | Ch2 P1 | ...  | Ch1 P1 | ...     |           |          | ... |           |
 *
 * Pre Test & Post Test are at the Subject (Mata Pelajaran) level.
 * Chapters belong to Sections (Bab).
 */
function buildDetailSheet(wb: XLSX.WorkBook, students: StudentExportData[]) {
  const structure = collectSubjectStructure(students);

  // ─── Build 3 header rows ───
  const headerRow1: string[] = ['No', 'Nama', 'Kelas']; // Subject names
  const headerRow2: string[] = ['', '', ''];              // Pre Test, Bab names, Post Test
  const headerRow3: string[] = ['', '', ''];              // Chapter sub-headers

  structure.forEach((subject) => {
    // Calculate total columns for this subject:
    // 1 (Pre Test) + sum of all chapter columns across all sections + 1 (Post Test)
    const sectionCols = subject.sections.reduce((sum, sec) => {
      const chCols = sec.chapters.reduce((s, ch) => s + ch.maxAttempts, 0);
      return sum + chCols;
    }, 0);
    const totalSubjectCols = 1 + sectionCols + 1; // Pre Test + chapters + Post Test

    // Row 1: Subject name merged across all its columns
    headerRow1.push(subject.subjectName);
    for (let i = 1; i < totalSubjectCols; i++) headerRow1.push('');

    // Row 2: Pre Test | [Bab names merged] | Post Test
    headerRow2.push('Pre Test');
    subject.sections.forEach((sec) => {
      const chCols = sec.chapters.reduce((s, ch) => s + ch.maxAttempts, 0);
      headerRow2.push(sec.sectionName);
      for (let i = 1; i < chCols; i++) headerRow2.push('');
    });
    headerRow2.push('Post Test');

    // Row 3: empty for Pre Test | chapter names | empty for Post Test
    headerRow3.push(''); // Pre Test column (no sub-header)
    subject.sections.forEach((sec) => {
      sec.chapters.forEach((ch, chIdx) => {
        for (let attempt = 1; attempt <= ch.maxAttempts; attempt++) {
          if (ch.maxAttempts === 1) {
            headerRow3.push(`Ch${chIdx + 1}`);
          } else {
            headerRow3.push(`Ch${chIdx + 1} P${attempt}`);
          }
        }
      });
    });
    headerRow3.push(''); // Post Test column (no sub-header)
  });

  // Add average column
  headerRow1.push('Rata-rata');
  headerRow2.push('');
  headerRow3.push('Nilai');

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

    structure.forEach((subjectRef) => {
      const subjectData = student.detail!.subjectProgress.find(
        (sp) => sp.subjectId === subjectRef.subjectId
      );

      // Pre Test (subject level)
      const preTestScore = getSubjectPreTestScore(subjectData);
      row.push(preTestScore ?? '-');

      // Sections and their chapters
      subjectRef.sections.forEach((secRef) => {
        const sectionData = subjectData
          ? subjectData.sections.find((s) => s.sectionId === secRef.sectionId)
          : null;

        secRef.chapters.forEach((chRef) => {
          const chapterData = sectionData
            ? sectionData.chapters.find((ch) => ch.chapterId === chRef.chapterId)
            : null;

          for (let attempt = 0; attempt < chRef.maxAttempts; attempt++) {
            if (chapterData && chapterData.scoreHistory && chapterData.scoreHistory[attempt] != null) {
              row.push(chapterData.scoreHistory[attempt]);
            } else {
              row.push('-');
            }
          }
        });
      });

      // Post Test (subject level)
      const postTestScore = getSubjectPostTestScore(subjectData);
      row.push(postTestScore ?? '-');
    });

    // Average score
    row.push(student.avgScore !== null ? Math.round(student.avgScore * 10) / 10 : '-');

    dataRows.push(row);
  });

  const wsData = [headerRow1, headerRow2, headerRow3, ...dataRows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // ─── Merge cells ───
  const merges: XLSX.Range[] = [];

  // Merge "No", "Nama", "Kelas" across all 3 header rows (row 0-2, cols 0-2)
  for (let c = 0; c < 3; c++) {
    merges.push({ s: { r: 0, c }, e: { r: 2, c } });
  }

  // Merge subject names in row 1
  let colStart = 3;
  structure.forEach((subject) => {
    const sectionCols = subject.sections.reduce((sum, sec) => {
      return sum + sec.chapters.reduce((s, ch) => s + ch.maxAttempts, 0);
    }, 0);
    const totalSubjectCols = 1 + sectionCols + 1;
    if (totalSubjectCols > 1) {
      merges.push({ s: { r: 0, c: colStart }, e: { r: 0, c: colStart + totalSubjectCols - 1 } });
    }

    // Merge "Pre Test" cell across rows 1-2 (row index 1-2)
    merges.push({ s: { r: 1, c: colStart }, e: { r: 2, c: colStart } });

    // Merge section names in row 2
    let secColStart = colStart + 1; // after Pre Test
    subject.sections.forEach((sec) => {
      const chCols = sec.chapters.reduce((s, ch) => s + ch.maxAttempts, 0);
      if (chCols > 1) {
        merges.push({ s: { r: 1, c: secColStart }, e: { r: 1, c: secColStart + chCols - 1 } });
      }
      secColStart += chCols;
    });

    // Merge "Post Test" cell across rows 1-2
    const postTestCol = colStart + totalSubjectCols - 1;
    merges.push({ s: { r: 1, c: postTestCol }, e: { r: 2, c: postTestCol } });

    colStart += totalSubjectCols;
  });

  // Merge "Rata-rata" across rows 0-1 (last column)
  const lastCol = headerRow1.length - 1;
  merges.push({ s: { r: 0, c: lastCol }, e: { r: 1, c: lastCol } });

  ws['!merges'] = merges;

  // ─── Column widths ───
  const colWidths: { wch: number }[] = [
    { wch: 5 },  // No
    { wch: 25 }, // Nama
    { wch: 8 },  // Kelas
  ];
  structure.forEach((subject) => {
    colWidths.push({ wch: 10 }); // Pre Test
    subject.sections.forEach((sec) => {
      sec.chapters.forEach((ch) => {
        for (let i = 0; i < ch.maxAttempts; i++) {
          colWidths.push({ wch: 9 });
        }
      });
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
  maxAttempts: number;
}

interface SectionRef {
  sectionId: string;
  sectionName: string;
  chapters: ChapterRef[];
}

interface SubjectStructure {
  subjectId: string;
  subjectName: string;
  sections: SectionRef[];
}

/**
 * Collect subject → section → chapter structure across all students,
 * determining max attempts per chapter.
 * Only includes subjects that have at least 1 chapter with data across all students.
 */
function collectSubjectStructure(students: StudentExportData[]): SubjectStructure[] {
  const subjectMap = new Map<string, {
    subjectName: string;
    sections: Map<string, { sectionName: string; chapters: Map<string, number> }>;
  }>();

  students.forEach((s) => {
    if (!s.detail) return;
    s.detail.subjectProgress.forEach((subject) => {
      if (!subjectMap.has(subject.subjectId)) {
        subjectMap.set(subject.subjectId, {
          subjectName: subject.subjectName,
          sections: new Map(),
        });
      }
      const subjectEntry = subjectMap.get(subject.subjectId)!;

      subject.sections.forEach((section) => {
        if (!subjectEntry.sections.has(section.sectionId)) {
          subjectEntry.sections.set(section.sectionId, {
            sectionName: section.sectionName,
            chapters: new Map(),
          });
        }
        const sectionEntry = subjectEntry.sections.get(section.sectionId)!;

        section.chapters.forEach((ch) => {
          const currentMax = sectionEntry.chapters.get(ch.chapterId) || 0;
          const attempts = ch.scoreHistory ? ch.scoreHistory.length : ch.quizAttempts;
          sectionEntry.chapters.set(ch.chapterId, Math.max(attempts, currentMax, 1));
        });
      });
    });
  });

  return Array.from(subjectMap.entries())
    .map(([subjectId, entry]) => ({
      subjectId,
      subjectName: entry.subjectName,
      sections: Array.from(entry.sections.entries())
        .map(([sectionId, secEntry]) => ({
          sectionId,
          sectionName: secEntry.sectionName,
          chapters: Array.from(secEntry.chapters.entries()).map(([chapterId, maxAttempts]) => ({
            chapterId,
            maxAttempts,
          })),
        }))
        .filter((sec) => sec.chapters.length > 0), // Only sections with chapters
    }))
    .filter((subj) => subj.sections.length > 0); // Only subjects with sections that have chapters
}

/**
 * Get pre test score from subject data.
 * Backend sends preTestScore at subject level.
 * Fallback: check sections for backward compat with older mock data.
 */
function getSubjectPreTestScore(subjectData: SubjectProgress | undefined): number | null {
  if (!subjectData) return null;

  if (subjectData.preTestScore != null) return subjectData.preTestScore;

  // Fallback: first section that has preTestScore (older data shape)
  for (const section of subjectData.sections) {
    const sectionAny = section as SectionProgress & { preTestScore?: number | null };
    if (sectionAny.preTestScore != null) return sectionAny.preTestScore;
  }

  return null;
}

/**
 * Get post test score from subject data.
 * Backend sends postTestScore at subject level.
 */
function getSubjectPostTestScore(subjectData: SubjectProgress | undefined): number | null {
  if (!subjectData) return null;

  if (subjectData.postTestScore != null) return subjectData.postTestScore;

  // Fallback: last section that has postTestScore
  for (let i = subjectData.sections.length - 1; i >= 0; i--) {
    const sectionAny = subjectData.sections[i] as SectionProgress & { postTestScore?: number | null };
    if (sectionAny.postTestScore != null) return sectionAny.postTestScore;
  }

  return null;
}

function calculateAverageScore(detail: StudentProgress): number | null {
  const allScores: number[] = [];

  detail.subjectProgress.forEach((subject) => {
    // Subject-level pre/post test scores
    const preScore = getSubjectPreTestScore(subject);
    const postScore = getSubjectPostTestScore(subject);
    if (preScore != null) allScores.push(preScore);
    if (postScore != null) allScores.push(postScore);

    subject.sections.forEach((section) => {
      section.chapters.forEach((ch: ChapterProgress) => {
        // Use latest score (last in scoreHistory) as the chapter grade
        const score = ch.scoreHistory && ch.scoreHistory.length > 0
          ? ch.scoreHistory[ch.scoreHistory.length - 1]
          : ch.lastScore;
        if (score != null) allScores.push(score);
      });
    });
  });

  if (allScores.length === 0) return null;
  return allScores.reduce((a, b) => a + b, 0) / allScores.length;
}
