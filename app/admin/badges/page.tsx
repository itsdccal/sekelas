"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { CrudTable, type ColumnDef } from "@/components/admin/CrudTable";
import { MilestoneFormDialog, type MilestoneFormData } from "@/components/admin/MilestoneFormDialog";
import { adminApi } from "@/lib/api";
import type { AdminMilestone } from "@/lib/types";

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

// --- Helper: format XP ---
function formatXP(xp: number): string {
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(xp % 1000 === 0 ? 0 : 1)}K XP`;
  }
  return `${xp} XP`;
}

// --- Column Definitions ---
const columns: ColumnDef<AdminMilestone>[] = [
  {
    key: "imageUrl",
    header: "Badge",
    render: (item) => (
      <img
        src={item.imageUrl}
        alt={item.name}
        className="h-8 w-8 rounded-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/badges/default.png";
        }}
      />
    ),
  },
  {
    key: "name",
    header: "Nama Milestone",
    render: (item) => (
      <span className="font-medium">{item.name}</span>
    ),
  },
  {
    key: "xpThreshold",
    header: "XP Threshold",
    render: (item) => (
      <span className="font-mono text-sm font-semibold text-primary-700">
        {formatXP(item.xpThreshold)}
      </span>
    ),
  },
  {
    key: "description",
    header: "Deskripsi",
    render: (item) => (
      <span className="text-muted-foreground line-clamp-1">{item.description}</span>
    ),
  },
  {
    key: "isActive",
    header: "Status",
    render: (item) => (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
          item.isActive
            ? "bg-green-50 text-green-700"
            : "bg-gray-100 text-gray-600"
        }`}
      >
        {item.isActive ? "Aktif" : "Nonaktif"}
      </span>
    ),
  },
];

// --- Main Page Component ---
export default function AdminBadgesPage() {
  const [milestones, setMilestones] = useState<AdminMilestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingMilestone, setEditingMilestone] = useState<AdminMilestone | null>(null);

  // Fetch milestones
  useEffect(() => {
    async function fetchMilestones() {
      setIsLoading(true);
      try {
        const data = await adminApi.getMilestones();
        setMilestones(data.sort((a, b) => a.xpThreshold - b.xpThreshold));
      } catch {
        // Error handled by API layer
      } finally {
        setIsLoading(false);
      }
    }
    fetchMilestones();
  }, []);

  // Filter milestones by search
  const filteredMilestones = React.useMemo(() => {
    if (!searchQuery.trim()) return milestones;
    const query = searchQuery.toLowerCase();
    return milestones.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.description.toLowerCase().includes(query)
    );
  }, [milestones, searchQuery]);

  // CRUD Handlers
  const handleAdd = useCallback(() => {
    setEditingMilestone(null);
    setDialogMode("create");
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((milestone: AdminMilestone) => {
    setEditingMilestone(milestone);
    setDialogMode("edit");
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback(async (milestone: AdminMilestone) => {
    try {
      await adminApi.deleteMilestone(milestone.id);
      setMilestones((prev) => prev.filter((m) => m.id !== milestone.id));
      setNotification("Milestone berhasil dihapus");
    } catch {
      // Error handled by API layer
    }
  }, []);

  const handleFormSubmit = useCallback(
    async (data: MilestoneFormData) => {
      if (dialogMode === "create") {
        const newMilestone = await adminApi.createMilestone(data);
        setMilestones((prev) =>
          [...prev, newMilestone].sort((a, b) => a.xpThreshold - b.xpThreshold)
        );
        setNotification("Milestone berhasil ditambahkan");
      } else if (editingMilestone) {
        const updated = await adminApi.updateMilestone(editingMilestone.id, data);
        setMilestones((prev) =>
          prev
            .map((m) => (m.id === updated.id ? updated : m))
            .sort((a, b) => a.xpThreshold - b.xpThreshold)
        );
        setNotification("Milestone berhasil diubah");
      }
    },
    [dialogMode, editingMilestone]
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Kelola Badge & Milestone</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Atur milestone XP beserta badge yang diterima siswa saat mencapai threshold.
        </p>
      </div>

      {/* Info Card */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <strong>Cara kerja:</strong> Setiap milestone memiliki XP threshold. Ketika total XP 
          siswa mencapai threshold suatu milestone, mereka otomatis mendapatkan badge terkait.
          Milestone ditampilkan berurutan dari threshold terendah ke tertinggi.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-white p-4">
          <p className="text-sm text-muted-foreground">Total Milestone</p>
          <p className="text-2xl font-bold text-foreground">{milestones.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-white p-4">
          <p className="text-sm text-muted-foreground">Aktif</p>
          <p className="text-2xl font-bold text-green-600">
            {milestones.filter((m) => m.isActive).length}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-white p-4">
          <p className="text-sm text-muted-foreground">XP Tertinggi</p>
          <p className="text-2xl font-bold text-primary-700">
            {milestones.length > 0
              ? formatXP(Math.max(...milestones.map((m) => m.xpThreshold)))
              : "—"}
          </p>
        </div>
      </div>

      {/* CRUD Table */}
      <CrudTable<AdminMilestone>
        data={filteredMilestones}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
        addLabel="Tambah Milestone"
        getItemName={(m) => m.name}
        getRowKey={(m) => m.id}
        searchConfig={{
          placeholder: "Cari milestone...",
          value: searchQuery,
          onChange: setSearchQuery,
        }}
      />

      {/* Form Dialog */}
      <MilestoneFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleFormSubmit}
        initialData={editingMilestone}
        mode={dialogMode}
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
