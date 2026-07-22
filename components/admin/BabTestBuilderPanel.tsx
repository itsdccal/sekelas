"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, ChevronRight, Loader2, ClipboardList, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { QuestionForm } from "./QuestionForm";
import { adminApi } from "@/lib/api";
import type { QuestionPattern, Question, QuizType } from "@/lib/types";

// --- Props ---

export interface BabTestBuilderPanelProps {
  babId: string; // materiId for PRE_TEST/POST_TEST, babId for others
  quizType: 'PRE_TEST' | 'POST_TEST';
}

const TYPE_LABELS: Record<string, string> = {
  PRE_TEST: 'Pre Test',
  POST_TEST: 'Post Test',
};

const TYPE_CONFIG: Record<string, { defaultQuestions: number; timerMinutes: number }> = {
  PRE_TEST: { defaultQuestions: 20, timerMinutes: 20 },
  POST_TEST: { defaultQuestions: 20, timerMinutes: 20 },
};

type SelectionMode = 'RANDOM' | 'MANUAL';

interface TopicAllocation {
  patternId: string;
  count: number;
}

// --- Topic Form ---

function generatePatternCode(name: string, existingCodes: string[]): string {
  const base = name.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').slice(0, 40);
  if (!base) return `topik-${Date.now()}`;
  let code = base; let counter = 2;
  while (existingCodes.includes(code)) { code = `${base}-${counter}`; counter++; }
  return code;
}

function TopicFormDialog({ open, onOpenChange, existingCodes, onSubmit }: {
  open: boolean; onOpenChange: (o: boolean) => void; existingCodes: string[];
  onSubmit: (data: { patternCode: string; description: string }) => Promise<void>;
}) {
  const [topicName, setTopicName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setApiError(null);
    const trimmed = topicName.trim();
    const newErrors: Record<string, string> = {};
    if (!trimmed) newErrors.topicName = "Nama topik wajib diisi";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ patternCode: generatePatternCode(trimmed, existingCodes), description: trimmed });
      setTopicName(""); onOpenChange(false);
    } catch (err: unknown) { setApiError(err instanceof Error ? err.message : "Gagal menyimpan"); }
    finally { setIsSubmitting(false); }
  };

  useEffect(() => { if (open) { setTopicName(""); setErrors({}); setApiError(null); } }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Buat Topik Baru</DialogTitle>
          <DialogDescription>Setiap topik berisi variasi soal yang diacak saat tes berlangsung.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {apiError && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">{apiError}</div>}
          <div className="space-y-1.5">
            <label htmlFor="topicName" className="text-sm font-medium">Nama Topik *</label>
            <input id="topicName" type="text" value={topicName} onChange={(e) => setTopicName(e.target.value)} maxLength={100}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
              placeholder="Contoh: Persamaan Linear Satu Variabel" />
            {errors.topicName && <p className="text-xs text-red-600">{errors.topicName}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Batal</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />} Simpan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// --- Question List ---

function QuestionListView({ pattern, quizType, onBack, onRefresh }: {
  pattern: QuestionPattern; quizType: QuizType; onBack: () => void; onRefresh: () => void;
}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);

  const fetchQ = useCallback(async () => {
    setIsLoading(true);
    try { setQuestions(await adminApi.getQuestions(pattern.id)); } catch {}
    finally { setIsLoading(false); }
  }, [pattern.id]);

  useEffect(() => { fetchQ(); }, [fetchQ]);

  const handleCreate = async (data: { text: string; questionType: string; imageUrl: string; options: { text: string; order: number }[]; correctOptionIndex: number | null; xpPerQuestion: number; weight: number }) => {
    await adminApi.createQuestion({ patternId: pattern.id, ...data }); await fetchQ(); onRefresh();
  };
  const handleUpdate = async (data: { text: string; questionType: string; imageUrl: string; options: { text: string; order: number }[]; correctOptionIndex: number | null; xpPerQuestion: number; weight: number }) => {
    if (!editing) return; await adminApi.updateQuestion(editing.id, data); await fetchQ(); setEditing(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 pb-4 border-b">
        <Button variant="outline" size="sm" onClick={onBack}>← Kembali</Button>
        <div>
          <h3 className="text-base font-semibold">{pattern.description || pattern.patternCode}</h3>
          <span className="text-xs text-muted-foreground">{questions.length} soal</span>
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={() => setIsFormOpen(true)}><Plus className="h-4 w-4" /> Tambah Soal</Button>
      </div>
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}</div>
      ) : questions.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed p-10 text-center"><p className="text-sm text-muted-foreground">Belum ada soal</p></div>
      ) : (
        <div className="space-y-2">
          {questions.map((q, idx) => (
            <div key={q.id} className="rounded-lg border bg-white p-4 flex items-start gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-xs font-bold shrink-0">{idx + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{q.text}</p>
                <p className="text-xs text-muted-foreground mt-1">{q.options.length} opsi{q.xpPerQuestion ? ` • ${q.xpPerQuestion} XP` : ''}</p>
              </div>
              <Button size="sm" onClick={() => { setEditing(q); setIsFormOpen(true); }}>Ubah</Button>
            </div>
          ))}
        </div>
      )}
      <QuestionForm open={isFormOpen} onOpenChange={(o) => { setIsFormOpen(o); if (!o) setEditing(null); }}
        onSubmit={editing ? handleUpdate : handleCreate} initialData={editing ?? undefined} quizType={quizType} />
    </div>
  );
}

// --- Main Panel ---

export function BabTestBuilderPanel({ babId, quizType }: BabTestBuilderPanelProps) {
  const [patterns, setPatterns] = useState<QuestionPattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTopicFormOpen, setIsTopicFormOpen] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<QuestionPattern | null>(null);
  const [passingGrade, setPassingGrade] = useState(70);

  // Enhanced config state
  const [totalQuestionLimit, setTotalQuestionLimit] = useState(TYPE_CONFIG[quizType].defaultQuestions);
  const [timerMinutes, setTimerMinutes] = useState(TYPE_CONFIG[quizType].timerMinutes);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('RANDOM');
  const [topicAllocations, setTopicAllocations] = useState<TopicAllocation[]>([]);
  const [showConfigEdit, setShowConfigEdit] = useState(false);

  const totalQuestions = patterns.reduce((s, p) => s + p.questionCount, 0);
  const allocatedTotal = topicAllocations.reduce((s, a) => s + a.count, 0);

  const fetchPatterns = useCallback(async () => {
    setIsLoading(true); setError(null);
    try { setPatterns(await adminApi.getPatterns(babId)); }
    catch { setError("Gagal memuat topik soal"); }
    finally { setIsLoading(false); }
  }, [babId]);

  useEffect(() => { fetchPatterns(); }, [fetchPatterns]);

  // Sync allocations when patterns change
  useEffect(() => {
    if (patterns.length > 0 && topicAllocations.length === 0) {
      // Initialize with proportional distribution
      const perTopic = Math.floor(totalQuestionLimit / patterns.length);
      const remainder = totalQuestionLimit - (perTopic * patterns.length);
      setTopicAllocations(patterns.map((p, i) => ({
        patternId: p.id,
        count: Math.min(perTopic + (i < remainder ? 1 : 0), p.questionCount),
      })));
    }
  }, [patterns, topicAllocations.length, totalQuestionLimit]);

  const handleAllocationChange = (patternId: string, value: number) => {
    setTopicAllocations(prev => prev.map(a =>
      a.patternId === patternId ? { ...a, count: value } : a
    ));
  };

  const handleCreate = async (data: { patternCode: string; description: string }) => {
    await adminApi.createPattern({ chapterId: babId, patternCode: data.patternCode, description: data.description });
    await fetchPatterns();
  };

  if (selectedPattern) {
    return <QuestionListView pattern={selectedPattern} quizType={quizType} onBack={() => setSelectedPattern(null)} onRefresh={fetchPatterns} />;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h2 className="text-lg font-semibold">Bank Soal {TYPE_LABELS[quizType]}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Kelola topik dan soal untuk {TYPE_LABELS[quizType]}</p>
        </div>
        <Button onClick={() => setIsTopicFormOpen(true)}><Plus className="h-4 w-4" /> Buat Topik Baru</Button>
      </div>

      {/* Config Section */}
      <div className="rounded-lg border bg-muted/30 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Pengaturan Tes</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowConfigEdit(!showConfigEdit)}>
            {showConfigEdit ? 'Tutup' : 'Edit'}
          </Button>
        </div>

        {!showConfigEdit ? (
          /* Summary view */
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-xs text-muted-foreground">Durasi</span>
              <p className="font-medium">{timerMinutes} menit</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Jumlah Soal</span>
              <p className="font-medium">{totalQuestionLimit} soal</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Mode Seleksi</span>
              <p className="font-medium">{selectionMode === 'RANDOM' ? 'Acak' : 'Manual'}</p>
            </div>
            {quizType === 'POST_TEST' && (
              <div>
                <span className="text-xs text-muted-foreground">KKM</span>
                <p className="font-medium">{passingGrade}%</p>
              </div>
            )}
          </div>
        ) : (
          /* Edit view */
          <div className="space-y-4">
            {/* Row 1: Timer + Total Questions + KKM */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="timerMinutes" className="text-xs font-medium text-muted-foreground">Waktu Pengerjaan (menit)</label>
                <input id="timerMinutes" type="number" min={5} max={180} value={timerMinutes}
                  onChange={(e) => setTimerMinutes(Math.max(5, Math.min(180, parseInt(e.target.value) || 20)))}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="totalQuestionLimit" className="text-xs font-medium text-muted-foreground">Jumlah Soal Tampil</label>
                <input id="totalQuestionLimit" type="number" min={1} max={100} value={totalQuestionLimit}
                  onChange={(e) => setTotalQuestionLimit(Math.max(1, Math.min(100, parseInt(e.target.value) || 20)))}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600" />
                <p className="text-[10px] text-muted-foreground">{totalQuestions} soal tersedia di bank</p>
              </div>
              {quizType === 'POST_TEST' && (
                <div className="space-y-1.5">
                  <label htmlFor="passingGrade" className="text-xs font-medium text-muted-foreground">KKM (%)</label>
                  <input id="passingGrade" type="number" min={0} max={100} value={passingGrade}
                    onChange={(e) => setPassingGrade(Math.max(0, Math.min(100, parseInt(e.target.value) || 70)))}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600" />
                </div>
              )}
            </div>

            {/* Row 2: Selection Mode */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Mode Pemilihan Soal</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setSelectionMode('RANDOM')}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    selectionMode === 'RANDOM'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300'
                  }`}>
                  🎲 Acak per Topik
                </button>
                <button type="button" onClick={() => setSelectionMode('MANUAL')}
                  className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    selectionMode === 'MANUAL'
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300'
                  }`}>
                  📋 Semua Soal Tampil
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                {selectionMode === 'RANDOM'
                  ? 'Soal dipilih secara acak dari setiap topik sesuai alokasi di bawah. Tiap siswa bisa dapat soal berbeda.'
                  : 'Semua soal dari bank soal akan ditampilkan ke siswa (tanpa pengacakan jumlah).'}
              </p>
            </div>

            {/* Row 3: Per-topic allocation (only for RANDOM mode) */}
            {selectionMode === 'RANDOM' && patterns.length > 0 && (
              <div className="space-y-2 rounded-md border bg-white p-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">Alokasi Soal per Topik</label>
                  <span className={`text-xs font-semibold ${allocatedTotal === totalQuestionLimit ? 'text-green-600' : allocatedTotal > totalQuestionLimit ? 'text-red-600' : 'text-amber-600'}`}>
                    {allocatedTotal}/{totalQuestionLimit} soal teralokasi
                  </span>
                </div>
                <div className="space-y-2">
                  {patterns.map((p) => {
                    const alloc = topicAllocations.find(a => a.patternId === p.id);
                    const currentCount = alloc?.count ?? 0;
                    return (
                      <div key={p.id} className="flex items-center gap-3">
                        <span className="flex-1 text-sm truncate">{p.description || p.patternCode}</span>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">max {p.questionCount}</span>
                        <input type="number" min={0} max={p.questionCount} value={currentCount}
                          onChange={(e) => handleAllocationChange(p.id, Math.max(0, Math.min(p.questionCount, parseInt(e.target.value) || 0)))}
                          className="h-8 w-16 rounded-md border border-input bg-background px-2 text-sm text-center font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600" />
                      </div>
                    );
                  })}
                </div>
                {allocatedTotal !== totalQuestionLimit && (
                  <p className="text-[10px] text-amber-600">
                    ⚠ Total alokasi ({allocatedTotal}) belum sesuai jumlah soal tampil ({totalQuestionLimit})
                  </p>
                )}
              </div>
            )}

            {quizType === 'PRE_TEST' && (
              <p className="text-xs text-muted-foreground italic">Pre Test tidak memiliki KKM — hasilnya berupa penempatan bab.</p>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <p className="text-xs text-muted-foreground">{patterns.length} topik • {totalQuestions} soal tersedia</p>

      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">{error}</div>}

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}</div>
      ) : patterns.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed p-10 text-center">
          <ClipboardList className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">Belum ada topik soal</p>
        </div>
      ) : (
        <div className="space-y-3">
          {patterns.map((p) => (
            <button key={p.id} onClick={() => setSelectedPattern(p)}
              className="flex w-full items-center justify-between rounded-lg border border-l-4 border-l-primary-500 bg-white p-4 text-left hover:shadow-md transition-shadow">
              <div>
                <span className="text-sm font-medium">{p.description || p.patternCode}</span>
                <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">{p.questionCount} soal</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}

      <TopicFormDialog open={isTopicFormOpen} onOpenChange={setIsTopicFormOpen} existingCodes={patterns.map(p => p.patternCode)} onSubmit={handleCreate} />
    </div>
  );
}
