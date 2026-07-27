'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  FileText,
  ListChecks,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import type {
  StudentSubmissionsResponse,
  StudentSubmission,
  StudentAnswerItem,
} from '@/lib/types';

// ─── Helpers ───────────────────────────────────────────────────────────────

const QUIZ_TYPE_LABEL: Record<string, string> = {
  PRE_TEST: 'Pre Test',
  POST_TEST: 'Post Test',
  CHAPTER_QUIZ: 'Kuis Chapter',
};

type FilterType = 'ALL' | 'PRE_TEST' | 'POST_TEST' | 'CHAPTER_QUIZ' | 'PENDING';

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'ALL', label: 'Semua' },
  { value: 'PENDING', label: 'Belum Dinilai' },
  { value: 'PRE_TEST', label: 'Pre Test' },
  { value: 'POST_TEST', label: 'Post Test' },
  { value: 'CHAPTER_QUIZ', label: 'Kuis Chapter' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getSubmissionStats(answers: StudentAnswerItem[]) {
  const total = answers.length;
  const mcAnswers = answers.filter((a) => a.questionType === 'MULTIPLE_CHOICE');
  const correct = mcAnswers.filter((a) => a.isCorrect).length;
  const wrong = mcAnswers.filter((a) => a.isCorrect === false).length;
  const essayTotal = answers.filter((a) => a.questionType === 'SHORT_ANSWER').length;
  const essayGraded = answers.filter(
    (a) => a.questionType === 'SHORT_ANSWER' && a.adminScore !== null && a.adminScore !== undefined
  ).length;
  return { total, correct, wrong, mcTotal: mcAnswers.length, essayTotal, essayGraded };
}

// ─── Grade Dialog ───────────────────────────────────────────────────────────

interface GradeDialogProps {
  userId: string;
  submissionId: string;
  question: StudentAnswerItem;
  onSaved: (questionId: string, score: number, note: string) => void;
  onClose: () => void;
}

function GradeDialog({ userId, submissionId, question, onSaved, onClose }: GradeDialogProps) {
  const [score, setScore] = useState<string>(
    question.adminScore !== null && question.adminScore !== undefined
      ? String(question.adminScore)
      : ''
  );
  const [note, setNote] = useState(question.adminNote ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    const numScore = Number(score);
    if (score === '' || isNaN(numScore) || numScore < 0 || numScore > 100) {
      setError('Masukkan nilai antara 0–100.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await adminApi.gradeStudentAnswer(userId, {
        submissionId,
        questionId: question.questionId,
        score: numScore,
        note: note.trim() || undefined,
      });
      onSaved(question.questionId, numScore, note.trim());
    } catch {
      setError('Gagal menyimpan nilai. Coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="grade-dialog-title"
    >
      <div className="w-full max-w-lg rounded-xl border border-border bg-white shadow-xl">
        <div className="border-b border-border px-6 py-4">
          <h2 id="grade-dialog-title" className="text-base font-semibold text-foreground">
            Nilai Jawaban Isian
          </h2>
        </div>

        <div className="space-y-4 px-6 py-4">
          {/* Soal */}
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Pertanyaan
            </p>
            <p className="text-sm text-foreground">{question.questionText}</p>
          </div>

          {/* Jawaban siswa */}
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Jawaban Siswa
            </p>
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {question.textAnswer || <span className="italic text-muted-foreground">Tidak ada jawaban</span>}
              </p>
            </div>
          </div>

          {/* Input nilai */}
          <div>
            <label htmlFor="grade-score" className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Nilai (0–100) <span className="text-destructive">*</span>
            </label>
            <input
              id="grade-score"
              type="number"
              min={0}
              max={100}
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Contoh: 80"
            />
          </div>

          {/* Catatan */}
          <div>
            <label htmlFor="grade-note" className="mb-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Catatan (opsional)
            </label>
            <textarea
              id="grade-note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="Contoh: Jawaban sudah benar tapi perlu penjelasan lebih detail."
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">{error}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan Nilai'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Answer Item ────────────────────────────────────────────────────────────

interface AnswerItemProps {
  item: StudentAnswerItem;
  index: number;
  onGrade: (item: StudentAnswerItem) => void;
}

function AnswerItem({ item, index, onGrade }: AnswerItemProps) {
  const isMultipleChoice = item.questionType === 'MULTIPLE_CHOICE';
  const isPending = item.questionType === 'SHORT_ANSWER' && item.adminScore === null;

  return (
    <div className="rounded-lg border border-border bg-white p-4 space-y-3">
      {/* Header soal */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
            {index + 1}
          </span>
          <div className="space-y-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{item.questionText}</p>
            {/* Image soal */}
            {item.imageUrl && (
              <div className="mt-2 mb-1">
                <img
                  src={item.imageUrl}
                  alt={`Gambar soal ${index + 1}`}
                  className="max-w-full max-h-48 rounded-md border border-border object-contain"
                />
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                isMultipleChoice
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-amber-50 text-amber-700'
              }`}>
                {isMultipleChoice ? <ListChecks className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                {isMultipleChoice ? 'Pilihan Ganda' : 'Isian'}
              </span>
              <span className="text-xs text-muted-foreground">Bobot: {item.weight}</span>
              {item.xpPerQuestion !== undefined && item.xpPerQuestion > 0 && (
                <span className="text-xs text-muted-foreground">+{item.xpPerQuestion} XP</span>
              )}
            </div>
          </div>
        </div>

        {/* Status / aksi */}
        {isMultipleChoice ? (
          item.isCorrect ? (
            <span className="flex items-center gap-1 text-xs font-medium text-green-600 shrink-0">
              <CheckCircle className="h-4 w-4" /> Benar
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-medium text-red-500 shrink-0">
              <XCircle className="h-4 w-4" /> Salah
            </span>
          )
        ) : isPending ? (
          <Button
            size="sm"
            variant="outline"
            className="h-7 shrink-0 border-amber-300 text-amber-700 hover:bg-amber-50 text-xs"
            onClick={() => onGrade(item)}
          >
            Nilai Sekarang
          </Button>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 shrink-0 text-xs text-muted-foreground"
            onClick={() => onGrade(item)}
          >
            Edit Nilai
          </Button>
        )}
      </div>

      {/* Pilihan ganda: tampilkan opsi */}
      {isMultipleChoice && item.options && (
        <div className="ml-7 space-y-1.5">
          {item.options.map((opt) => {
            const isSelected = opt.id === item.selectedOptionId;
            const isCorrect = opt.id === item.correctOptionId;
            return (
              <div
                key={opt.id}
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm ${
                  isCorrect
                    ? 'bg-green-50 border border-green-200'
                    : isSelected && !isCorrect
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-muted/30 border border-transparent'
                }`}
              >
                {isCorrect ? (
                  <CheckCircle className="h-3.5 w-3.5 shrink-0 text-green-600" />
                ) : isSelected && !isCorrect ? (
                  <XCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                ) : (
                  <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-border" />
                )}
                <span className={isSelected ? 'font-medium' : ''}>{opt.text}</span>
                {isSelected && <span className="ml-auto text-xs text-muted-foreground">Dipilih</span>}
                {isCorrect && !isSelected && <span className="ml-auto text-xs text-green-600">Kunci</span>}
              </div>
            );
          })}
        </div>
      )}

      {/* Isian: tampilkan jawaban teks */}
      {!isMultipleChoice && (
        <div className="ml-7 space-y-2">
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">Jawaban Siswa</p>
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {item.textAnswer || <span className="italic text-muted-foreground">Tidak ada jawaban</span>}
            </p>
          </div>
          {item.adminScore !== null && item.adminScore !== undefined ? (
            <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
              <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-green-700">
                  Nilai: <span className="font-bold">{item.adminScore}/100</span>
                </p>
                {item.adminNote && (
                  <p className="text-xs text-green-600 mt-0.5">{item.adminNote}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
              <Clock className="h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-xs text-amber-700 font-medium">Belum dinilai</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Submission Card ────────────────────────────────────────────────────────

interface SubmissionCardProps {
  submission: StudentSubmission;
  userId: string;
  onGrade: (submission: StudentSubmission, item: StudentAnswerItem) => void;
}

function SubmissionCard({ submission, userId, onGrade }: SubmissionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const pendingCount = submission.answers.filter(
    (a) => a.questionType === 'SHORT_ANSWER' && a.adminScore === null
  ).length;
  const stats = getSubmissionStats(submission.answers);

  const label = QUIZ_TYPE_LABEL[submission.quizType] ?? submission.quizType;

  let context = submission.subjectName ?? '';
  if (submission.sectionName) context += ` · ${submission.sectionName}`;
  if (submission.chapterName) context += ` · ${submission.chapterName}`;

  return (
    <div className="rounded-lg border border-border bg-white overflow-hidden">
      <button
        type="button"
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-accent/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
              submission.quizType === 'PRE_TEST'
                ? 'bg-purple-100 text-purple-700'
                : submission.quizType === 'POST_TEST'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {label}
            </span>
            {pendingCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                <AlertCircle className="h-3 w-3" />
                {pendingCount} belum dinilai
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground truncate">{context}</p>
          {/* Stats row */}
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>{stats.total} soal</span>
            {stats.mcTotal > 0 && (
              <span className="text-green-600">{stats.correct}/{stats.mcTotal} benar</span>
            )}
            {stats.essayTotal > 0 && (
              <span className="text-amber-600">{stats.essayGraded}/{stats.essayTotal} isian dinilai</span>
            )}
          </div>
        </div>

        <div className="text-right shrink-0">
          {submission.score !== null ? (
            <p className="text-sm font-semibold text-foreground">{submission.score}%</p>
          ) : (
            <p className="text-sm font-medium text-amber-600">Pending</p>
          )}
          <p className="text-xs text-muted-foreground">{formatDate(submission.submittedAt)}</p>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border px-4 py-3 space-y-3">
          {submission.answers.map((item, idx) => (
            <AnswerItem
              key={item.questionId}
              item={item}
              index={idx}
              onGrade={(a) => onGrade(submission, a)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export interface StudentAnswersViewProps {
  userId: string;
}

export default function StudentAnswersView({ userId }: StudentAnswersViewProps) {
  const [data, setData] = useState<StudentSubmissionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('ALL');

  // Grade dialog state
  const [gradeTarget, setGradeTarget] = useState<{
    submission: StudentSubmission;
    item: StudentAnswerItem;
  } | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminApi.getStudentSubmissions(userId);
      setData(res);
    } catch {
      setError('Gagal memuat jawaban siswa. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter submissions
  const filteredSubmissions = data?.submissions
    .filter((sub) => {
      if (filter === 'ALL') return true;
      if (filter === 'PENDING') return sub.status === 'PENDING';
      return sub.quizType === filter;
    })
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    ?? [];

  // Update local state after grading
  const handleGradeSaved = useCallback(
    (questionId: string, score: number, note: string) => {
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          pendingGradeCount: Math.max(0, prev.pendingGradeCount - 1),
          submissions: prev.submissions.map((sub) => {
            if (sub.submissionId !== gradeTarget?.submission.submissionId) return sub;
            const updatedAnswers = sub.answers.map((a) =>
              a.questionId === questionId
                ? { ...a, adminScore: score, adminNote: note || null }
                : a
            );
            // Recalculate status
            const stillPending = updatedAnswers.some(
              (a) => a.questionType === 'SHORT_ANSWER' && a.adminScore === null
            );
            return {
              ...sub,
              answers: updatedAnswers,
              status: stillPending ? ('PENDING' as const) : ('GRADED' as const),
            };
          }),
        };
      });
      setGradeTarget(null);
    },
    [gradeTarget]
  );

  if (isLoading) {
    return (
      <div className="space-y-3" aria-busy="true">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-border bg-white p-6 text-center" role="alert">
        <p className="mb-4 text-sm text-destructive">{error}</p>
        <Button onClick={fetchData} size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Coba Lagi
        </Button>
      </div>
    );
  }

  if (!data || data.submissions.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-white p-12 text-center">
        <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          Belum ada jawaban yang dikumpulkan oleh siswa ini.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      {data.pendingGradeCount > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-sm font-medium text-amber-700">
            {data.pendingGradeCount} soal isian belum dinilai
          </p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1.5">
        {FILTER_OPTIONS.map((opt) => {
          const count =
            opt.value === 'ALL'
              ? data.submissions.length
              : opt.value === 'PENDING'
              ? data.submissions.filter((s) => s.status === 'PENDING').length
              : data.submissions.filter((s) => s.quizType === opt.value).length;
          if (count === 0 && opt.value !== 'ALL') return null;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFilter(opt.value)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filter === opt.value
                  ? 'bg-primary-100 text-primary-700 ring-1 ring-primary-300'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
            >
              {opt.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                filter === opt.value ? 'bg-primary-200 text-primary-800' : 'bg-muted text-muted-foreground'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Submission list */}
      {filteredSubmissions.length === 0 ? (
        <div className="rounded-lg border border-border bg-white p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Tidak ada submission yang cocok dengan filter.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSubmissions.map((sub) => (
            <SubmissionCard
              key={sub.submissionId}
              submission={sub}
              userId={userId}
              onGrade={(submission, item) => setGradeTarget({ submission, item })}
            />
          ))}
        </div>
      )}

      {/* Grade dialog */}
      {gradeTarget && (
        <GradeDialog
          userId={userId}
          submissionId={gradeTarget.submission.submissionId}
          question={gradeTarget.item}
          onSaved={handleGradeSaved}
          onClose={() => setGradeTarget(null)}
        />
      )}
    </div>
  );
}
