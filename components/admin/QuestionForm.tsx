"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Loader2, Image as ImageIcon, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { validateQuestion } from "@/lib/utils/validation";
import katex from "katex";
import "katex/dist/katex.min.css";
import type { Question, QuizType, QuestionType } from "@/lib/types";

// --- Props ---

export interface QuestionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    text: string;
    questionType: QuestionType;
    imageUrl: string;
    options: { text: string; order: number }[];
    correctOptionIndex: number | null;
    xpPerQuestion: number;
    weight: number;
  }) => Promise<void>;
  initialData?: Question;
  quizType?: QuizType;
}

const MIN_OPTIONS = 4;
const MAX_OPTIONS = 6;

const QUESTION_TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: 'MULTIPLE_CHOICE', label: 'Pilihan Ganda' },
  { value: 'SHORT_ANSWER', label: 'Isian' },
];

// --- LaTeX Preview ---

function renderLatex(text: string): string {
  let result = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    try { return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false }); }
    catch { return `<code>${math}</code>`; }
  });
  result = result.replace(/\$(.*?)\$/g, (_, math) => {
    try { return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false }); }
    catch { return `<code>${math}</code>`; }
  });
  return result;
}

function LatexPreview({ text }: { text: string }) {
  const html = useMemo(() => renderLatex(text), [text]);
  if (!text.includes('$')) return null;
  return (
    <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
      <p className="text-[10px] font-medium text-blue-600 mb-1">Preview LaTeX:</p>
      <div className="text-sm" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

// --- QuestionForm ---

export function QuestionForm({ open, onOpenChange, onSubmit, initialData, quizType = 'CHAPTER_QUIZ' }: QuestionFormProps) {
  const [questionType, setQuestionType] = useState<QuestionType>('MULTIPLE_CHOICE');
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number | null>(null);
  const [xpPerQuestion, setXpPerQuestion] = useState(0);
  const [weight, setWeight] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const showCorrectOption = questionType === 'MULTIPLE_CHOICE';
  const showOptions = questionType === 'MULTIPLE_CHOICE';
  const showXpField = quizType !== 'PRE_TEST';

  useEffect(() => {
    if (open) {
      if (initialData) {
        setQuestionType(initialData.questionType || 'MULTIPLE_CHOICE');
        setText(initialData.text);
        setImageUrl(initialData.imageUrl || '');
        const sorted = [...initialData.options].sort((a, b) => a.order - b.order);
        setOptions(sorted.length > 0 ? sorted.map(o => o.text) : ["", "", "", ""]);
        if (initialData.correctOptionId) {
          const idx = sorted.findIndex(o => o.id === initialData.correctOptionId);
          setCorrectOptionIndex(idx >= 0 ? idx : null);
        } else { setCorrectOptionIndex(null); }
        setXpPerQuestion(initialData.xpPerQuestion ?? 0);
        setWeight(initialData.weight ?? 1);
      } else {
        setQuestionType('MULTIPLE_CHOICE');
        setText(""); setImageUrl(""); setOptions(["", "", "", ""]);
        setCorrectOptionIndex(null); setXpPerQuestion(0); setWeight(1);
      }
      setShowPreview(false); setErrors({}); setApiError(null);
    }
  }, [open, initialData]);

  const handleOptionChange = (index: number, value: string) => {
    setOptions(prev => { const n = [...prev]; n[index] = value; return n; });
  };
  const handleAddOption = () => { if (options.length < MAX_OPTIONS) setOptions(p => [...p, ""]); };
  const handleRemoveOption = (index: number) => {
    if (options.length <= MIN_OPTIONS) return;
    setOptions(p => p.filter((_, i) => i !== index));
    if (correctOptionIndex !== null) {
      if (correctOptionIndex === index) setCorrectOptionIndex(null);
      else if (correctOptionIndex > index) setCorrectOptionIndex(correctOptionIndex - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setApiError(null);

    const newErrors: Record<string, string> = {};
    if (!text.trim()) newErrors.text = "Teks soal wajib diisi";

    if (showOptions) {
      const correctVal = correctOptionIndex !== null ? String(correctOptionIndex) : null;
      const validation = validateQuestion(text, options, correctVal);
      Object.assign(newErrors, validation.errors);
    }

    if (showXpField && (xpPerQuestion < 0 || xpPerQuestion > 1000)) {
      newErrors.xpPerQuestion = 'XP harus antara 0–1000';
    }

    if (weight < 1 || weight > 100 || !Number.isInteger(weight)) {
      newErrors.weight = 'Bobot harus bilangan bulat antara 1–100';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        text,
        questionType,
        imageUrl: imageUrl.trim(),
        options: showOptions ? options.map((t, i) => ({ text: t, order: i + 1 })) : [],
        correctOptionIndex: showCorrectOption ? correctOptionIndex : null,
        xpPerQuestion: showXpField ? xpPerQuestion : 0,
        weight,
      });
      onOpenChange(false);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Gagal menyimpan soal");
    } finally { setIsSubmitting(false); }
  };

  const isEditMode = !!initialData;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Soal" : "Tambah Soal"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Ubah soal yang sudah ada." : "Buat soal baru. Gunakan $...$ untuk LaTeX inline, $$...$$ untuk block."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {apiError && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">{apiError}</div>}

          {/* Question Type Selector */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tipe Soal</label>
            <div className="flex gap-2">
              {QUESTION_TYPE_OPTIONS.map(opt => (
                <button key={opt.value} type="button" onClick={() => setQuestionType(opt.value)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                    questionType === opt.value
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="questionText" className="text-sm font-medium">Teks Soal *</label>
              <button type="button" onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700">
                <Eye className="h-3 w-3" /> {showPreview ? 'Sembunyikan' : 'Preview'}
              </button>
            </div>
            <textarea id="questionText" value={text} onChange={(e) => setText(e.target.value)}
              maxLength={1000} rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 resize-none"
              placeholder="Tulis soal... Gunakan $x^2$ untuk LaTeX" />
            {errors.text && <p className="text-xs text-red-600">{errors.text}</p>}
            <p className="text-xs text-muted-foreground">{text.length}/1000</p>
            {showPreview && <LatexPreview text={text} />}
          </div>

          {/* Image Upload */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" /> Gambar Soal (opsional)
            </label>
            {imageUrl ? (
              <div className="space-y-2">
                <div className="rounded-md border border-border overflow-hidden max-w-xs">
                  <img src={imageUrl} alt="Gambar soal" className="w-full h-auto max-h-32 object-contain" />
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setImageUrl("")}>
                  <Trash2 className="h-3 w-3" /> Hapus Gambar
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-24 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 cursor-pointer hover:border-primary-300 hover:bg-primary-50/30 transition-colors">
                <ImageIcon className="h-6 w-6 text-gray-400 mb-1" />
                <span className="text-xs text-gray-500">Klik atau drag file gambar</span>
                <span className="text-[10px] text-gray-400">PNG, JPG, WebP (max 5MB)</span>
                <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 5 * 1024 * 1024) { setErrors(prev => ({...prev, image: 'Ukuran file maksimal 5MB'})); return; }
                    // In production: upload to /api/v1/admin/image/upload then set URL
                    // For now: use local object URL as preview
                    const url = URL.createObjectURL(file);
                    setImageUrl(url);
                  }}
                />
              </label>
            )}
            {errors.image && <p className="text-xs text-red-600">{errors.image}</p>}
          </div>

          {/* Options (only for MULTIPLE_CHOICE) */}
          {showOptions && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Opsi Jawaban *</label>
                <span className="text-xs text-muted-foreground">{options.length}/{MAX_OPTIONS}</span>
              </div>
              {errors.options && <p className="text-xs text-red-600">{errors.options}</p>}

              <div className="space-y-2">
                {options.map((optText, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    {showCorrectOption && (
                      <div className="flex items-center pt-2">
                        <input type="radio" name="correctOption" checked={correctOptionIndex === idx}
                          onChange={() => setCorrectOptionIndex(idx)}
                          className="h-4 w-4 accent-primary-600 cursor-pointer" />
                      </div>
                    )}
                    <div className="flex-1">
                      <input type="text" value={optText} onChange={(e) => handleOptionChange(idx, e.target.value)}
                        maxLength={500}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                        placeholder={`Opsi ${String.fromCharCode(65 + idx)}`} />
                    </div>
                    {options.length > MIN_OPTIONS && (
                      <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={() => handleRemoveOption(idx)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-red-600" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {options.length < MAX_OPTIONS && (
                <Button type="button" variant="outline" size="sm" onClick={handleAddOption} className="w-full">
                  <Plus className="h-4 w-4" /> Tambah Opsi
                </Button>
              )}
              {errors.correctOption && <p className="text-xs text-red-600">{errors.correctOption}</p>}
              <p className="text-xs text-muted-foreground">
                {quizType === 'PRE_TEST'
                  ? 'Pilih jawaban benar — untuk menghitung penempatan (siswa tidak melihat hasilnya).'
                  : 'Pilih radio untuk menandai jawaban benar.'}
              </p>
            </div>
          )}

          {/* Short answer info */}
          {questionType === 'SHORT_ANSWER' && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs text-amber-800">
                Soal isian akan dinilai manual oleh pengajar. Siswa mengisi jawaban dalam kotak teks singkat.
              </p>
            </div>
          )}

          {/* XP Reward */}
          {showXpField && (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
              <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-yellow-100">
                <span className="text-xs">⚡</span>
              </span>
              <label htmlFor="xpPerQuestion" className="text-sm font-medium whitespace-nowrap">XP Reward</label>
              <input id="xpPerQuestion" type="number" min={0} max={1000} value={xpPerQuestion}
                onChange={(e) => setXpPerQuestion(Math.max(0, Math.min(1000, parseInt(e.target.value) || 0)))}
                className="h-9 w-20 rounded-md border border-input bg-background px-3 text-sm text-center font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600" />
              <span className="text-xs text-muted-foreground">poin</span>
              {errors.xpPerQuestion && <p className="text-xs text-red-600">{errors.xpPerQuestion}</p>}
            </div>
          )}

          {/* Weight / Bobot Nilai */}
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
            <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-blue-100">
              <span className="text-xs">⚖</span>
            </span>
            <label htmlFor="questionWeight" className="text-sm font-medium whitespace-nowrap">Bobot Nilai</label>
            <input id="questionWeight" type="number" min={1} max={100} value={weight}
              onChange={(e) => setWeight(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              className="h-9 w-20 rounded-md border border-input bg-background px-3 text-sm text-center font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600" />
            <span className="text-xs text-muted-foreground">1–100</span>
            {errors.weight && <p className="text-xs text-red-600">{errors.weight}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Batal</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditMode ? "Simpan" : "Tambah Soal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
