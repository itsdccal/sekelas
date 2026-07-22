"use client";

import * as React from "react";
import { useState, useEffect, useCallback, useMemo, startTransition } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CrudTable, type ColumnDef } from "@/components/admin/CrudTable";
import { MateriFormDialog, type MateriFormData } from "@/components/admin/MateriFormDialog";
import { BabFormDialog, type BabFormData } from "@/components/admin/BabFormDialog";
import { ChapterFormDialog, type ChapterFormData } from "@/components/admin/ChapterFormDialog";
import { CascadeDeleteDialog } from "@/components/admin/CascadeDeleteDialog";
import { curriculumApi, adminApi } from "@/lib/api";
import { useUIStore } from "@/stores";
import type { Subject, Section, Chapter } from "@/lib/types";

// --- View state for drill-down navigation ---
type ViewLevel = "subject" | "section" | "chapter";

interface NavigationState {
  level: ViewLevel;
  selectedSubject: Subject | null;
  selectedSection: Section | null;
}

// --- Notification Component ---
function SuccessNotification({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className="fixed top-5 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 shadow-sm"
      role="status"
      aria-live="polite"
    >
      <span className="text-sm text-green-800">{message}</span>
    </div>
  );
}

// --- Main Page Component ---
export default function AdminCurriculumPage() {
  const selectedSemesterId = useUIStore((s) => s.selectedSemesterId);

  // Navigation state
  const [nav, setNav] = useState<NavigationState>({
    level: "subject",
    selectedSubject: null,
    selectedSection: null,
  });

  // Data
  const [subjectList, setSubjectList] = useState<Subject[]>([]);
  const [sectionList, setSectionList] = useState<Section[]>([]);
  const [chapterList, setChapterList] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form dialogs
  const [subjectDialogOpen, setSubjectDialogOpen] = useState(false);
  const [subjectDialogMode, setSubjectDialogMode] = useState<"create" | "edit">("create");
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [sectionDialogMode, setSectionDialogMode] = useState<"create" | "edit">("create");
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  const [chapterDialogOpen, setChapterDialogOpen] = useState(false);
  const [chapterDialogMode, setChapterDialogMode] = useState<"create" | "edit">("create");
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);

  // Cascade delete dialog
  const [cascadeDeleteOpen, setCascadeDeleteOpen] = useState(false);
  const [cascadeDeleteTarget, setCascadeDeleteTarget] = useState<Subject | null>(null);

  // Success notification
  const [notification, setNotification] = useState<string | null>(null);

  // --- Data Fetching ---

  const fetchSubjectList = useCallback(async () => {
    if (!selectedSemesterId) return;
    setIsLoading(true);
    try {
      const data = await curriculumApi.getSubjectList(selectedSemesterId);
      setSubjectList(data.sort((a, b) => a.orderIndex - b.orderIndex));
    } catch {
      // Error handled by API retry mechanism
    } finally {
      setIsLoading(false);
    }
  }, [selectedSemesterId]);

  const fetchSectionList = useCallback(async () => {
    if (!nav.selectedSubject) return;
    setIsLoading(true);
    try {
      const data = await curriculumApi.getSectionList(nav.selectedSubject.id);
      setSectionList(data.sort((a, b) => a.orderIndex - b.orderIndex));
    } catch {
      // Error handled by API retry mechanism
    } finally {
      setIsLoading(false);
    }
  }, [nav.selectedSubject]);

  const fetchChapterList = useCallback(async () => {
    if (!nav.selectedSection) return;
    setIsLoading(true);
    try {
      const data = await curriculumApi.getChapterList(nav.selectedSection.id);
      setChapterList(data.sort((a, b) => a.orderIndex - b.orderIndex));
    } catch {
      // Error handled by API retry mechanism
    } finally {
      setIsLoading(false);
    }
  }, [nav.selectedSection]);

  // Fetch on mount and when semester changes
  useEffect(() => {
    if (nav.level === "subject") {
      startTransition(() => { fetchSubjectList(); });
    }
  }, [nav.level, fetchSubjectList]);

  useEffect(() => {
    if (nav.level === "section") {
      startTransition(() => { fetchSectionList(); });
    }
  }, [nav.level, fetchSectionList]);

  useEffect(() => {
    if (nav.level === "chapter") {
      startTransition(() => { fetchChapterList(); });
    }
  }, [nav.level, fetchChapterList]);

  // --- Navigation ---

  const navigateToSection = useCallback((subject: Subject) => {
    setSearchQuery("");
    setNav({ level: "section", selectedSubject: subject, selectedSection: null });
  }, []);

  const navigateToChapter = useCallback(
    (section: Section) => {
      setSearchQuery("");
      setNav((prev) => ({ ...prev, level: "chapter", selectedSection: section }));
    },
    []
  );

  const navigateBack = useCallback(() => {
    setSearchQuery("");
    if (nav.level === "chapter") {
      setNav((prev) => ({ ...prev, level: "section", selectedSection: null }));
    } else if (nav.level === "section") {
      setNav({ level: "subject", selectedSubject: null, selectedSection: null });
    }
  }, [nav.level]);

  // --- Subject CRUD Handlers ---

  const handleSubjectAdd = useCallback(() => {
    setEditingSubject(null);
    setSubjectDialogMode("create");
    setSubjectDialogOpen(true);
  }, []);

  const handleSubjectEdit = useCallback((item: Subject) => {
    setEditingSubject(item);
    setSubjectDialogMode("edit");
    setSubjectDialogOpen(true);
  }, []);

  const performSubjectDelete = useCallback(
    async (item: Subject) => {
      try {
        await adminApi.deleteSubject(item.id);
        setSubjectList((prev) => prev.filter((m) => m.id !== item.id));
        setNotification("Materi berhasil dihapus");
      } catch {
        // Error handled silently — API layer shows error
      }
    },
    []
  );

  const handleSubjectDelete = useCallback((item: Subject) => {
    if (item.sectionCount > 0) {
      setCascadeDeleteTarget(item);
      setCascadeDeleteOpen(true);
    } else {
      performSubjectDelete(item);
    }
  }, [performSubjectDelete]);

  const handleSubjectFormSubmit = useCallback(
    async (data: MateriFormData) => {
      if (!selectedSemesterId) throw new Error("Semester belum dipilih");

      if (subjectDialogMode === "create") {
        const newSubject = await adminApi.createSubject({
          name: data.name,
          description: data.description || undefined,
          semesterId: selectedSemesterId,
        });
        setSubjectList((prev) =>
          [...prev, newSubject].sort((a, b) => a.orderIndex - b.orderIndex)
        );
        setNotification("Materi berhasil ditambahkan");
      } else if (editingSubject) {
        const updated = await adminApi.updateSubject(editingSubject.id, {
          name: data.name,
          description: data.description || undefined,
        });
        setSubjectList((prev) =>
          prev.map((m) => (m.id === updated.id ? updated : m))
        );
        setNotification("Materi berhasil diubah");
      }
    },
    [subjectDialogMode, editingSubject, selectedSemesterId]
  );

  // --- Section CRUD Handlers ---

  const handleSectionAdd = useCallback(() => {
    setEditingSection(null);
    setSectionDialogMode("create");
    setSectionDialogOpen(true);
  }, []);

  const handleSectionEdit = useCallback((item: Section) => {
    setEditingSection(item);
    setSectionDialogMode("edit");
    setSectionDialogOpen(true);
  }, []);

  const handleSectionDelete = useCallback(
    async (item: Section) => {
      try {
        await adminApi.deleteSection(item.id);
        setSectionList((prev) => prev.filter((b) => b.id !== item.id));
        setNotification("Bab berhasil dihapus");
      } catch {
        // Error handled by API layer
      }
    },
    []
  );

  const handleSectionFormSubmit = useCallback(
    async (data: BabFormData) => {
      if (!nav.selectedSubject) throw new Error("Materi belum dipilih");

      if (sectionDialogMode === "create") {
        const newSection = await adminApi.createSection({
          subjectId: nav.selectedSubject.id,
          name: data.name,
          orderIndex: data.orderIndex,
        });
        setSectionList((prev) =>
          [...prev, newSection].sort((a, b) => a.orderIndex - b.orderIndex)
        );
        setNotification("Bab berhasil ditambahkan");
      } else if (editingSection) {
        const updated = await adminApi.updateSection(editingSection.id, {
          name: data.name,
          orderIndex: data.orderIndex,
        });
        setSectionList((prev) =>
          prev
            .map((b) => (b.id === updated.id ? updated : b))
            .sort((a, b) => a.orderIndex - b.orderIndex)
        );
        setNotification("Bab berhasil diubah");
      }
    },
    [sectionDialogMode, editingSection, nav.selectedSubject]
  );

  // --- Chapter CRUD Handlers ---

  const handleChapterAdd = useCallback(() => {
    setEditingChapter(null);
    setChapterDialogMode("create");
    setChapterDialogOpen(true);
  }, []);

  const handleChapterEdit = useCallback((item: Chapter) => {
    setEditingChapter(item);
    setChapterDialogMode("edit");
    setChapterDialogOpen(true);
  }, []);

  const handleChapterDelete = useCallback(
    async (item: Chapter) => {
      try {
        await adminApi.deleteChapter(item.id);
        setChapterList((prev) => prev.filter((c) => c.id !== item.id));
        setNotification("Chapter berhasil dihapus");
      } catch {
        // Error handled by API layer
      }
    },
    []
  );

  const handleChapterFormSubmit = useCallback(
    async (data: ChapterFormData) => {
      if (!nav.selectedSection) throw new Error("Bab belum dipilih");

      if (chapterDialogMode === "create") {
        const newChapter = await adminApi.createChapter({
          sectionId: nav.selectedSection.id,
          name: data.name,
          orderIndex: data.orderIndex,
          videoUrl: data.videoUrl,
          passingGrade: data.passingGrade,
        });
        setChapterList((prev) =>
          [...prev, newChapter].sort((a, b) => a.orderIndex - b.orderIndex)
        );
        setNotification("Chapter berhasil ditambahkan");
      } else if (editingChapter) {
        const updated = await adminApi.updateChapter(editingChapter.id, {
          name: data.name,
          orderIndex: data.orderIndex,
          videoUrl: data.videoUrl,
          passingGrade: data.passingGrade,
        });
        setChapterList((prev) =>
          prev
            .map((c) => (c.id === updated.id ? updated : c))
            .sort((a, b) => a.orderIndex - b.orderIndex)
        );
        setNotification("Chapter berhasil diubah");
      }
    },
    [chapterDialogMode, editingChapter, nav.selectedSection]
  );

  // --- Column Definitions ---

  const subjectColumns: ColumnDef<Subject>[] = useMemo(
    () => [
      { key: "name", header: "Nama Materi" },
      {
        key: "sectionCount",
        header: "Jumlah Bab",
        render: (item) => <span>{item.sectionCount}</span>,
      },
      {
        key: "isPublished",
        header: "Status",
        render: (item) => (
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
              item.isPublished
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {item.isPublished ? "Dipublikasi" : "Draft"}
          </span>
        ),
      },
    ],
    []
  );

  const sectionColumns: ColumnDef<Section>[] = useMemo(
    () => [
      { key: "name", header: "Nama Bab" },
      {
        key: "orderIndex",
        header: "Urutan",
        render: (item) => <span>{item.orderIndex}</span>,
      },
      {
        key: "chapterCount",
        header: "Jumlah Chapter",
        render: (item) => <span>{item.chapterCount}</span>,
      },
    ],
    []
  );

  const chapterColumns: ColumnDef<Chapter>[] = useMemo(
    () => [
      { key: "name", header: "Nama Chapter" },
      {
        key: "orderIndex",
        header: "Urutan",
        render: (item) => <span>{item.orderIndex}</span>,
      },
      {
        key: "videoUrl",
        header: "Video",
        render: (item) => (
          <span className={item.videoUrl ? "text-green-700" : "text-muted-foreground"}>
            {item.videoUrl ? "✓ Ada" : "— Belum"}
          </span>
        ),
      },
      {
        key: "passingGrade",
        header: "Passing Grade",
        render: (item) => <span>{item.passingGrade}%</span>,
      },
    ],
    []
  );

  // --- Breadcrumb / Title ---

  const getPageTitle = (): string => {
    switch (nav.level) {
      case "subject":
        return "Manajemen Kurikulum";
      case "section":
        return `Bab — ${nav.selectedSubject?.name ?? ""}`;
      case "chapter":
        return `Chapter — ${nav.selectedSection?.name ?? ""}`;
    }
  };

  // --- No Semester Selected ---
  if (!selectedSemesterId) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-foreground">
          Manajemen Kurikulum
        </h1>
        <p className="text-muted-foreground">
          Pilih semester terlebih dahulu pada header untuk melihat data kurikulum.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with back navigation */}
      <div className="flex items-center gap-2 sm:gap-3">
        {nav.level !== "subject" && (
          <Button
            variant="ghost"
            size="icon"
            onClick={navigateBack}
            aria-label="Kembali"
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <h1 className="text-lg sm:text-2xl font-semibold text-foreground truncate">
          {getPageTitle()}
        </h1>
      </div>

      {/* Subject Level */}
      {nav.level === "subject" && (
        <CrudTable<Subject>
          data={subjectList.filter(m => !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase()))}
          columns={subjectColumns}
          onAdd={handleSubjectAdd}
          onEdit={handleSubjectEdit}
          onDelete={handleSubjectDelete}
          isLoading={isLoading}
          addLabel="Tambah Materi"
          getItemName={(item) => item.name}
          getRowKey={(item) => item.id}
          onRowClick={navigateToSection}
          searchConfig={{
            placeholder: "Cari materi...",
            value: searchQuery,
            onChange: setSearchQuery,
          }}
        />
      )}

      {/* Section Level */}
      {nav.level === "section" && (
        <CrudTable<Section>
          data={sectionList.filter(b => !searchQuery || b.name.toLowerCase().includes(searchQuery.toLowerCase()))}
          columns={sectionColumns}
          onAdd={handleSectionAdd}
          onEdit={handleSectionEdit}
          onDelete={handleSectionDelete}
          isLoading={isLoading}
          addLabel="Tambah Bab"
          getItemName={(item) => item.name}
          getRowKey={(item) => item.id}
          onRowClick={navigateToChapter}
          searchConfig={{
            placeholder: "Cari bab...",
            value: searchQuery,
            onChange: setSearchQuery,
          }}
        />
      )}

      {/* Chapter Level */}
      {nav.level === "chapter" && (
        <CrudTable<Chapter>
          data={chapterList.filter(c => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()))}
          columns={chapterColumns}
          onAdd={handleChapterAdd}
          onEdit={handleChapterEdit}
          onDelete={handleChapterDelete}
          isLoading={isLoading}
          addLabel="Tambah Chapter"
          getItemName={(item) => item.name}
          getRowKey={(item) => item.id}
          searchConfig={{
            placeholder: "Cari chapter...",
            value: searchQuery,
            onChange: setSearchQuery,
          }}
        />
      )}

      {/* --- Dialogs --- */}

      <MateriFormDialog
        open={subjectDialogOpen}
        onOpenChange={setSubjectDialogOpen}
        onSubmit={handleSubjectFormSubmit}
        initialData={editingSubject}
        mode={subjectDialogMode}
      />

      <BabFormDialog
        open={sectionDialogOpen}
        onOpenChange={setSectionDialogOpen}
        onSubmit={handleSectionFormSubmit}
        initialData={editingSection}
        mode={sectionDialogMode}
      />

      <ChapterFormDialog
        open={chapterDialogOpen}
        onOpenChange={setChapterDialogOpen}
        onSubmit={handleChapterFormSubmit}
        initialData={editingChapter}
        mode={chapterDialogMode}
      />

      {/* Cascade Delete Dialog for Subject with Sections */}
      <CascadeDeleteDialog
        open={cascadeDeleteOpen}
        onOpenChange={setCascadeDeleteOpen}
        itemName={cascadeDeleteTarget?.name ?? ""}
        cascadeWarning="Seluruh Bab dan Chapter di dalamnya juga akan terhapus."
        onConfirm={() => {
          if (cascadeDeleteTarget) {
            performSubjectDelete(cascadeDeleteTarget);
            setCascadeDeleteTarget(null);
          }
        }}
      />

      {/* Success Notification */}
      {notification && (
        <SuccessNotification
          message={notification}
          onDismiss={() => setNotification(null)}
        />
      )}
    </div>
  );
}
