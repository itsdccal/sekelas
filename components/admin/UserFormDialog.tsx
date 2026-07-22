'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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
import type { ManagedUser, UserRole, ClassRoom } from '@/lib/types';

export interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  kelas: string;
}

export interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  initialData?: ManagedUser | null;
  mode: 'create' | 'edit';
}

export function UserFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: UserFormDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [kelas, setKelas] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Kelas dropdown options
  const [kelasList, setKelasList] = useState<ClassRoom[]>([]);
  const [isLoadingKelas, setisLoadingKelas] = useState(false);

  // Fetch Kelas list when dialog opens
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setisLoadingKelas(true);
    adminApi.getClassRoomList()
      .then((data) => { if (!cancelled) setKelasList(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setisLoadingKelas(false); });
    return () => { cancelled = true; };
  }, [open]);

  // Populate form when editing
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setName(initialData.name);
      setEmail(initialData.email);
      setPassword(''); // Never show existing password
      setRole(initialData.role);
      setKelas(initialData.kelas || '');
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setRole('STUDENT');
      setKelas('');
    }
    setError(null);
  }, [mode, initialData, open]);

  // Validation
  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!name || name.trim().length < 2) e.name = 'Nama minimal 2 karakter';
    if (name.length > 100) e.name = 'Nama maksimal 100 karakter';
    if (!email || !email.includes('@')) e.email = 'Email tidak valid';
    if (email.length > 100) e.email = 'Email maksimal 100 karakter';
    if (mode === 'create') {
      if (!password || password.length < 8) e.password = 'Password minimal 8 karakter';
      if (password.length > 64) e.password = 'Password maksimal 64 karakter';
    }
    if (role === 'STUDENT' && !kelas.trim()) e.kelas = 'Kelas wajib diisi untuk siswa';
    return e;
  }, [name, email, password, role, kelas, mode]);

  const isValid = Object.keys(errors).length === 0;

  const handleSubmit = useCallback(async () => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({ name: name.trim(), email: email.trim(), password, role, kelas: kelas.trim() });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan data pengguna');
    } finally {
      setIsSubmitting(false);
    }
  }, [isValid, isSubmitting, onSubmit, name, email, password, role, kelas, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-labelledby="user-form-title">
        <DialogHeader>
          <DialogTitle id="user-form-title">
            {mode === 'create' ? 'Tambah Pengguna' : 'Ubah Pengguna'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Isi data untuk membuat akun pengguna baru.'
              : 'Ubah data pengguna yang sudah ada.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Name */}
          <div className="space-y-1.5">
            <label htmlFor="user-name" className="text-sm font-medium text-foreground">
              Nama Lengkap <span className="text-destructive">*</span>
            </label>
            <input
              id="user-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              disabled={isSubmitting}
              placeholder="Nama lengkap pengguna"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:opacity-50"
            />
            {name.length > 0 && errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="user-email" className="text-sm font-medium text-foreground">
              Email <span className="text-destructive">*</span>
            </label>
            <input
              id="user-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={100}
              disabled={isSubmitting}
              placeholder="email@contoh.com"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:opacity-50"
            />
            {email.length > 0 && errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="user-password" className="text-sm font-medium text-foreground">
              Password {mode === 'create' && <span className="text-destructive">*</span>}
            </label>
            <input
              id="user-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={64}
              disabled={isSubmitting}
              placeholder={mode === 'edit' ? 'Kosongkan jika tidak ingin mengubah' : 'Minimal 8 karakter'}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:opacity-50"
            />
            {password.length > 0 && errors.password && (
              <p className="text-xs text-destructive">{errors.password}</p>
            )}
            {mode === 'edit' && (
              <p className="text-xs text-muted-foreground">Kosongkan jika tidak ingin mengubah password</p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <label htmlFor="user-role" className="text-sm font-medium text-foreground">
              Peran <span className="text-destructive">*</span>
            </label>
            <select
              id="user-role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              disabled={isSubmitting}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:opacity-50"
            >
              <option value="STUDENT">Siswa</option>
              <option value="ADMIN">Pengajar / Admin</option>
            </select>
          </div>

          {/* Kelas — only for STUDENT */}
          {role === 'STUDENT' && (
            <div className="space-y-1.5">
              <label htmlFor="user-kelas" className="text-sm font-medium text-foreground">
                ClassRoom <span className="text-destructive">*</span>
              </label>
              <select
                id="user-kelas"
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                disabled={isSubmitting || isLoadingKelas}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:opacity-50"
              >
                <option value="">{isLoadingKelas ? 'Memuat...' : 'Pilih Kelas'}</option>
                {kelasList.map((k) => (
                  <option key={k.id} value={k.name}>
                    {k.name}
                  </option>
                ))}
              </select>
              {kelas.length === 0 && errors.kelas && (
                <p className="text-xs text-destructive">{errors.kelas}</p>
              )}
            </div>
          )}

          {/* Error from API */}
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-md p-2" role="alert">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : mode === 'create' ? 'Tambah' : 'Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
