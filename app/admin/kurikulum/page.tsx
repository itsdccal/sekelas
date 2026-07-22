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
import type { Materi, Bab, Chapter } from "@/lib/types";

// --- View state for drill-down navigation ---
type ViewLevel = "materi" | "bab" | "chapter";

interface NavigationState {
  level: ViewLevel;
  selectedMateri: Materi | null;
  selectedBab: Bab | null;
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
export default function AdminKurikulumPage() {
  const selectedSemesterId = useUIStore((s) => s.selectedSemesterId);

  // Navigation state
  const [nav, setNav] = useState<NavigationState>({
    level: "materi",
    selectedMateri: null,
    selectedBab: null,
  });

  // Data
  const [materiList, setMateriList] = useState<Materi[]>([]);
  const [babList, setBabList] = useState<Bab[]>([]);
  const [chapterList, setChapterList] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form dialogs
  const [materiDialogOpen, setMateriDialogOpen] = useState(false);
  const [materiDialogMode, setMateriDialogMode] = useState<"create" | "edit">("create");
  const [editingMateri, setEditingMateri] = useState<Materi | null>(null);

  const [babDialogOpen, setBabDialogOpen] = useState(false);
  const [babDialogMode, setBabDialogMode] = useState<"create" | "edit">("create");
  const [editingBab, setEditingBab] = useState<Bab | null>(null);

  const [chapterDialogOpen, setChapterDialogOpen] = useState(false);
  const [chapterDialogMode, setChapterDialogMode] = useState<"create" | "edit">("create");
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);

  // Cascade delete dialog
  const [cascadeDeleteOpen, setCascadeDeleteOpen] = useState(false);
  const [cascadeDeleteTarget, setCascadeDeleteTarget] = useState<Materi | null>(null);

  // Success notification
  const [notification, setNotification] = useState<string | null>(null);

  // --- Data Fetching ---

  const fetchMateriList = useCallback(async () => {
    if (!selectedSemesterId) return;
    setIsLoading(true);
    try {
      const data = await curriculumApi.getMateriList(selectedSemesterId);
      setMateriList(data.sort((a, b) => a.orderIndex - b.orderIndex));
    } catch {
      // Error handled by API retry mechanism
    } finally {
      setIsLoading(false);
    }
  }, [selectedSemesterId]);

  const fetchBabList = useCallback(async () => {
    if (!nav.selectedMateri) return;
    setIsLoading(true);
    try {
      const data = await curriculumApi.getBabList(nav.selectedMateri.id);
      setBabList(data.sort((a, b) => a.orderIndex - b.orderIndex));
    } catch {
      // Error handled by API retry mechanism
    } finally {
      setIsLoading(false);
    }
  }, [nav.selectedMateri]);

  const fetchChapterList = useCallback(async () => {
    if (!nav.selectedBab) return;
    setIsLoading(true);
    try {
      const data = await curriculumApi.getChapterList(nav.selectedBab.id);
      setChapterList(data.sort((a, b) => a.orderIndex - b.orderIndex));
    } catch {
      // Error handled by API retry mechanism
    } finally {
      setIsLoading(false);
    }
  }, [nav.selectedBab]);

  // Fetch on mount and when semester changes
  useEffect(() => {
    if (nav.level === "materi") {
      startTransition(() => { fetchMateriList(); });
    }
  }, [nav.level, fetchMateriList]);

  useEffect(() => {
    if (nav.level === "bab") {
      startTransition(() => { fetchBabList(); });
    }
  }, [nav.level, fetchBabList]);

  useEffect(() => {
    if (nav.level === "chapter") {
      startTransition(() => { fetchChapterList(); });
    }
  }, [nav.level, fetchChapterList]);

  // --- Navigation ---

  const navigateToBab = useCallback((materi: Materi) => {
    setSearchQuery("");
    setNav({ level: "bab", selectedMateri: materi, selectedBab: null });
  }, []);

  const navigateToChapter = useCallback(
    (bab: Bab) => {
      setSearchQuery("");
      setNav((prev) => ({ ...prev, level: "chapter", selectedBab: bab }));
    },
    []
  );

  const navigateBack = useCallback(() => {
    setSearchQuery("");
    if (nav.level === "chapter") {
      setNav((prev) => ({ ...prev, level: "bab", selectedBab: null }));
    } else if (nav.level === "bab") {
      setNav({ level: "materi", selectedMateri: null, selectedBab: null });
    }
  }, [nav.level]);

  // --- Materi CRUD Handlers ---

  const handleMateriAdd = useCallback(() => {
    setEditingMateri(null);
    setMateriDialogMode("create");
    setMateriDialogOpen(true);
  }, []);

  const handleMateriEdit = useCallback((item: Materi) => {
    setEditingMateri(item);
    setMateriDialogMode("edit");
    setMateriDialogOpen(true);
  }, []);

  const performMateriDelete = useCallback(
    async (item: Materi) => {
      try {
        await adminApi.deleteMateri(item.id);
        setMateriList((prev) => prev.filter((m) => m.id !== item.id));
        setNotification("Materi berhasil dihapus");
      } catch {
        // Error handled silently — API layer shows error
      }
    },
    []
  );

  const handleMateriDelete = useCallback((item: Materi) => {
    if (item.babCount > 0) {
      setCascadeDeleteTarget(item);
      setCascadeDeleteOpen(true);
    } else {
      // Standard delete — CrudTable handles its own confirm dialog
      performMateriDelete(item);
    }
  }, [performMateriDelete]);

  const handleMateriFormSubmit = useCallback(
    async (data: MateriFormData) => {
      if (!selectedSemesterId) throw new Error("Semester belum dipilih");

      if (materiDialogMode === "create") {
        const newMateri = await adminApi.createMateri({
          name: data.name,
          description: data.description || undefined,
          semesterId: selectedSemesterId,
        });
        setMateriList((prev) =>
          [...prev, newMateri].sort((a, b) => a.orderIndex - b.orderIndex)
        );
        setNotification("Materi berhasil ditambahkan");
      } else if (editingMateri) {
        const updated = await adminApi.updateMateri(editingMateri.id, {
          name: data.name,
          description: data.description || undefined,
        });
        setMateriList((prev) =>
          prev.map((m) => (m.id === updated.id ? updated : m))
        );
        setNotification("Materi berhasil diubah");
      }
    },
    [materiDialogMode, editingMateri, selectedSemesterId]
  );

  // --- Bab CRUD Handlers ---

  const handleBabAdd = useCallback(() => {
    setEditingBab(null);
    setBabDialogMode("create");
    setBabDialogOpen(true);
  }, []);

  const handleBabEdit = useCallback((item: Bab) => {
    setEditingBab(item);
    setBabDialogMode("edit");
    setBabDialogOpen(true);
  }, []);

  const handleBabDelete = useCallback(
    async (item: Bab) => {
      try {
        await adminApi.deleteBab(item.id);
        setBabList((prev) => prev.filter((b) => b.id !== item.id));
        setNotification("Bab berhasil dihapus");
      } catch {
        // Error handled by API layer
      }
    },
    []
  );

  const handleBabFormSubmit = useCallback(
    async (data: BabFormData) => {
      if (!nav.selectedMateri) throw new Error("Materi belum dipilih");

      if (babDialogMode === "create") {
        const newBab = await adminApi.createBab({
          materiId: nav.selectedMateri.id,
          name: data.name,
          orderIndex: data.orderIndex,
        });
        setBabList((prev) =>
          [...prev, newBab].sort((a, b) => a.orderIndex - b.orderIndex)
        );
        setNotification("Bab berhasil ditambahkan");
      } else if (editingBab) {
        const updated = await adminApi.updateBab(editingBab.id, {
          name: data.name,
          orderIndex: data.orderIndex,
        });
        setBabList((prev) =>
          prev
            .map((b) => (b.id === updated.id ? updated : b))
            .sort((a, b) => a.orderIndex - b.orderIndex)
        );
        setNotification("Bab berhasil diubah");
      }
    },
    [babDialogMode, editingBab, nav.selectedMateri]
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
      if (!nav.selectedBab) throw new Error("Bab belum dipilih");

      if (chapterDialogMode === "create") {
        const newChapter = await adminApi.createChapter({
          babId: nav.selectedBab.id,
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
    [chapterDialogMode, editingChapter, nav.selectedBab]
  );

  // --- Column Definitions ---

  const materiColumns: ColumnDef<Materi>[] = useMemo(
    () => [
      { key: "name", header: "Nama Materi" },
      {
        key: "babCount",
        header: "Jumlah Bab",
        render: (item) => <span>{item.babCount}</span>,
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

  const babColumns: ColumnDef<Bab>[] = useMemo(
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
      case "materi":
        return "Manajemen Kurikulum";
      case "bab":
        return `Bab — ${nav.selectedMateri?.name ?? ""}`;
      case "chapter":
        return `Chapter — ${nav.selectedBab?.name ?? ""}`;
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
        {nav.level !== "materi" && (
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

      {/* Materi Level */}
      {nav.level === "materi" && (
        <CrudTable<Materi>
          data={materiList.filter(m => !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase()))}
          columns={materiColumns}
          onAdd={handleMateriAdd}
          onEdit={handleMateriEdit}
          onDelete={handleMateriDelete}
          isLoading={isLoading}
          addLabel="Tambah Materi"
          getItemName={(item) => item.name}
          getRowKey={(item) => item.id}
          onRowClick={navigateToBab}
          searchConfig={{
            placeholder: "Cari materi...",
            value: searchQuery,
            onChange: setSearchQuery,
          }}
        />
      )}

      {/* Bab Level */}
      {nav.level === "bab" && (
        <CrudTable<Bab>
          data={babList.filter(b => !searchQuery || b.name.toLowerCase().includes(searchQuery.toLowerCase()))}
          columns={babColumns}
          onAdd={handleBabAdd}
          onEdit={handleBabEdit}
          onDelete={handleBabDelete}
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
        open={materiDialogOpen}
        onOpenChange={setMateriDialogOpen}
        onSubmit={handleMateriFormSubmit}
        initialData={editingMateri}
        mode={materiDialogMode}
      />

      <BabFormDialog
        open={babDialogOpen}
        onOpenChange={setBabDialogOpen}
        onSubmit={handleBabFormSubmit}
        initialData={editingBab}
        mode={babDialogMode}
      />

      <ChapterFormDialog
        open={chapterDialogOpen}
        onOpenChange={setChapterDialogOpen}
        onSubmit={handleChapterFormSubmit}
        initialData={editingChapter}
        mode={chapterDialogMode}
      />

      {/* Cascade Delete Dialog for Materi with Bab */}
      <CascadeDeleteDialog
        open={cascadeDeleteOpen}
        onOpenChange={setCascadeDeleteOpen}
        itemName={cascadeDeleteTarget?.name ?? ""}
        cascadeWarning="Seluruh Bab dan Chapter di dalamnya juga akan terhapus."
        onConfirm={() => {
          if (cascadeDeleteTarget) {
            performMateriDelete(cascadeDeleteTarget);
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
