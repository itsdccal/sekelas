"use client";

import * as React from "react";
import { useState, useMemo, useCallback } from "react";
import { Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils/cn";

// --- Type Definitions ---

export interface ColumnDef<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

export interface PaginationConfig {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export interface SearchConfig {
  placeholder?: string;
  value: string;
  onChange: (query: string) => void;
}

export interface CrudTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onAdd: () => void;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  isLoading: boolean;
  pagination?: PaginationConfig;
  searchConfig?: SearchConfig;
  /** Label for the add button. Defaults to "Tambah" */
  addLabel?: string;
  /** Custom function to get a display name for delete confirmation */
  getItemName?: (item: T) => string;
  /** Key extractor for table rows */
  getRowKey: (item: T) => string;
  /** Callback when an operation succeeds (for toast/notification) */
  onSuccess?: (message: string) => void;
}

// --- Skeleton Loader ---

function TableSkeleton({ columns, rows = 5 }: { columns: number; rows?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Memuat data...">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-4 animate-pulse">
          {Array.from({ length: columns + 1 }).map((_, colIdx) => (
            <div
              key={colIdx}
              className="h-10 flex-1 rounded-md bg-muted"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// --- Delete Confirmation Dialog ---

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  onConfirm: () => void;
}

function DeleteConfirmDialog({ open, onOpenChange, itemName, onConfirm }: DeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent role="alertdialog">
        <DialogHeader>
          <DialogTitle>Konfirmasi Hapus</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus <strong>{itemName}</strong>? Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Main CrudTable Component ---

export function CrudTable<T>({
  data,
  columns,
  onAdd,
  onEdit,
  onDelete,
  isLoading,
  pagination,
  searchConfig,
  addLabel = "Tambah",
  getItemName,
  getRowKey,
}: CrudTableProps<T>) {
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteClick = useCallback((item: T) => {
    setDeleteTarget(item);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (deleteTarget) {
      onDelete(deleteTarget);
      setDeleteTarget(null);
    }
  }, [deleteTarget, onDelete]);

  const deleteItemName = useMemo(() => {
    if (!deleteTarget) return "";
    if (getItemName) return getItemName(deleteTarget);
    return "item ini";
  }, [deleteTarget, getItemName]);

  return (
    <div className="space-y-4">
      {/* Toolbar: Search + Add Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        {searchConfig && (
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              type="search"
              placeholder={searchConfig.placeholder ?? "Cari..."}
              value={searchConfig.value}
              onChange={(e) => searchConfig.onChange(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
              aria-label={searchConfig.placeholder ?? "Cari"}
            />
          </div>
        )}

        {/* Add Button */}
        <Button onClick={onAdd} className="shrink-0">
          <Plus className="h-4 w-4" aria-hidden="true" />
          {addLabel}
        </Button>
      </div>

      {/* Table Content */}
      {isLoading ? (
        <TableSkeleton columns={columns.length} />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm" role="table">
            <thead className="bg-muted">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left font-medium text-foreground"
                    scope="col"
                  >
                    {col.header}
                  </th>
                ))}
                <th
                  className="px-4 py-3 text-right font-medium text-foreground"
                  scope="col"
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Belum ada data.
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr
                    key={getRowKey(item)}
                    className="hover:bg-accent/50 transition-colors"
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3">
                        {col.render
                          ? col.render(item)
                          : String((item as Record<string, unknown>)[col.key] ?? "")}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => onEdit(item)}
                          aria-label={`Ubah ${getItemName ? getItemName(item) : "item"}`}
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                          Ubah
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(item)}
                          aria-label={`Hapus ${getItemName ? getItemName(item) : "item"}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Hapus
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-2" role="navigation" aria-label="Navigasi halaman">
          <Button
            variant="outline"
            size="sm"
            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1}
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Sebelumnya
          </Button>

          <span className="text-sm text-muted-foreground" aria-live="polite">
            Halaman {pagination.currentPage} dari {pagination.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= pagination.totalPages}
            aria-label="Halaman berikutnya"
          >
            Berikutnya
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        itemName={deleteItemName}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
