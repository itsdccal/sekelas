'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Pencil, Trash2, Plus, Search, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { adminApi } from '@/lib/api';
import type { ClassRoom } from '@/lib/types';

export default function AdminClassesPage() {
  const [classList, setClassList] = useState<ClassRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValue, setFormValue] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<ClassRoom | null>(null);

  // Notification
  const [notification, setNotification] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.getClassRoomList();
      setClassList(data);
    } catch {
      setError('Gagal memuat data kelas.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 4000);
    return () => clearTimeout(timer);
  }, [notification]);

  // Filter
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return classList;
    const q = searchQuery.toLowerCase();
    return classList.filter((k) => k.name.toLowerCase().includes(q));
  }, [classList, searchQuery]);

  // CRUD handlers
  const handleAdd = () => {
    setEditingId(null);
    setFormValue('');
    setFormError(null);
    setDialogOpen(true);
  };

  const handleEdit = (kelas: ClassRoom) => {
    setEditingId(kelas.id);
    setFormValue(kelas.name);
    setFormError(null);
    setDialogOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = formValue.trim();
    if (!name) {
      setFormError('Nama kelas wajib diisi');
      return;
    }
    if (name.length > 50) {
      setFormError('Nama kelas maksimal 50 karakter');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      if (editingId) {
        const updated = await adminApi.updateClassRoom(editingId, { name });
        setClassList((prev) => prev.map((k) => (k.id === updated.id ? updated : k)));
        setNotification(`Kelas "${name}" berhasil diubah`);
      } else {
        const created = await adminApi.createClassRoom({ name });
        setClassList((prev) => [...prev, created]);
        setNotification(`Kelas "${name}" berhasil ditambahkan`);
      }
      setDialogOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Gagal menyimpan kelas');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi.deleteClassRoom(deleteTarget.id);
      setClassList((prev) => prev.filter((k) => k.id !== deleteTarget.id));
      setNotification(`Kelas "${deleteTarget.name}" berhasil dihapus`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus kelas');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-lg sm:text-2xl font-semibold text-foreground">Kelola Kelas</h1>

      {/* Toolbar: Search + Add */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            placeholder="Cari kelas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
            aria-label="Cari kelas"
          />
        </div>
        <Button onClick={handleAdd} className="shrink-0 ml-auto">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Tambah Kelas
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/5 p-4 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchData} className="mt-2">
            Coba Lagi
          </Button>
        </div>
      )}

      {/* Loading */}
      {isLoading && !error && (
        <div className="space-y-3" role="status" aria-label="Memuat data kelas...">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-12 animate-pulse rounded-md bg-muted" />
          ))}
        </div>
      )}

      {/* Kelas Table */}
      {!isLoading && !error && (
        <div className="overflow-x-auto rounded-lg border border-border">
          {filteredList.length === 0 && classList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100">
                <GraduationCap className="h-7 w-7 text-primary-400" />
              </div>
              <p className="mt-4 text-sm font-medium text-foreground">Belum ada kelas</p>
              <p className="mt-1 text-xs text-muted-foreground">Tambahkan kelas pertama untuk mulai mengelola siswa.</p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Tidak ada kelas yang cocok dengan pencarian.
            </div>
          ) : (
            <table className="w-full text-sm" role="table">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-foreground" scope="col">Nama Kelas</th>
                  <th className="px-4 py-3 text-center font-medium text-foreground" scope="col">Jumlah Siswa</th>
                  <th className="px-4 py-3 text-right font-medium text-foreground" scope="col">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredList.map((kelas) => (
                  <tr key={kelas.id} className="hover:bg-accent/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{kelas.name}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{kelas.studentCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="default" size="sm" onClick={() => handleEdit(kelas)} aria-label={`Ubah kelas ${kelas.name}`}>
                          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                          Ubah
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteTarget(kelas)}
                          disabled={kelas.studentCount > 0}
                          aria-label={`Hapus kelas ${kelas.name}`}
                          title={kelas.studentCount > 0 ? 'Tidak dapat dihapus — masih ada siswa' : undefined}
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Hapus
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent aria-describedby="kelas-form-desc">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Ubah Kelas' : 'Tambah Kelas'}</DialogTitle>
            <DialogDescription id="kelas-form-desc">
              {editingId ? 'Ubah nama kelas yang sudah ada.' : 'Masukkan nama kelas baru.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {formError && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
                {formError}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="kelas-name" className="text-sm font-medium text-foreground">
                Nama Kelas <span className="text-red-500">*</span>
              </label>
              <input
                id="kelas-name"
                type="text"
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                placeholder="Contoh: 10A, 11 IPA, XII MIPA 1"
                maxLength={50}
                disabled={isSubmitting}
                autoFocus
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:opacity-50"
                aria-invalid={!!formError}
              />
              <p className="text-xs text-muted-foreground">{formValue.length}/50 karakter</p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent role="alertdialog">
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus kelas <strong>{deleteTarget?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notification */}
      {notification && (
        <div
          className="fixed top-5 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 shadow-sm"
          role="status"
          aria-live="polite"
        >
          <span className="text-sm text-green-800">{notification}</span>
        </div>
      )}
    </div>
  );
}
