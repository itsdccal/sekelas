'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { CrudTable, type ColumnDef } from '@/components/admin/CrudTable';
import { UserFormDialog, type UserFormData } from '@/components/admin/UserFormDialog';
import { adminApi } from '@/lib/api';
import type { ManagedUser } from '@/lib/types';

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
      className="fixed bottom-4 right-4 z-50 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 shadow-lg"
      role="status"
      aria-live="polite"
    >
      ✓ {message}
    </div>
  );
}

export default function AdminUsersPage() {
  // Data
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Form dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);

  // Notification
  const [notification, setNotification] = useState<string | null>(null);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await adminApi.getUsers({
        page,
        pageSize,
        search: search || undefined,
        role: roleFilter || undefined,
      });
      setUsers(result.data);
      setTotal(result.total);
    } catch {
      // Error handled by retry mechanism
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [search, roleFilter]);

  // Handlers
  const handleAdd = useCallback(() => {
    setEditingUser(null);
    setDialogMode('create');
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((user: ManagedUser) => {
    setEditingUser(user);
    setDialogMode('edit');
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback(async (user: ManagedUser) => {
    try {
      await adminApi.deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setTotal((prev) => prev - 1);
      setNotification(`Pengguna "${user.name}" berhasil dihapus`);
    } catch {
      // Error handled by API layer
    }
  }, []);

  const handleFormSubmit = useCallback(async (data: UserFormData) => {
    if (dialogMode === 'create') {
      const newUser = await adminApi.createUser({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        kelas: data.role === 'STUDENT' ? data.kelas : undefined,
      });
      setUsers((prev) => [newUser, ...prev]);
      setTotal((prev) => prev + 1);
      setNotification(`Pengguna "${data.name}" berhasil ditambahkan`);
    } else if (editingUser) {
      const updated = await adminApi.updateUser(editingUser.id, {
        name: data.name,
        email: data.email,
        role: data.role,
        kelas: data.role === 'STUDENT' ? data.kelas : undefined,
      });
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setNotification(`Pengguna "${data.name}" berhasil diubah`);
    }
  }, [dialogMode, editingUser]);

  // Columns
  const columns: ColumnDef<ManagedUser>[] = useMemo(() => [
    { key: 'name', header: 'Nama' },
    { key: 'email', header: 'Email' },
    {
      key: 'role',
      header: 'Peran',
      render: (user) => (
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
          user.role === 'ADMIN'
            ? 'bg-purple-100 text-purple-800'
            : 'bg-blue-100 text-blue-800'
        }`}>
          {user.role === 'ADMIN' ? 'Pengajar' : 'Siswa'}
        </span>
      ),
    },
    {
      key: 'kelas',
      header: 'Kelas',
      render: (user) => (
        <span className="text-muted-foreground">{user.kelas || '—'}</span>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (user) => (
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
          user.isActive
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-600'
        }`}>
          {user.isActive ? 'Aktif' : 'Nonaktif'}
        </span>
      ),
    },
  ], []);

  // Pagination
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-foreground">Kelola Pengguna</h1>

      {/* Role Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
          aria-label="Filter berdasarkan peran"
        >
          <option value="">Semua Peran</option>
          <option value="STUDENT">Siswa</option>
          <option value="ADMIN">Pengajar / Admin</option>
        </select>
      </div>

      <CrudTable<ManagedUser>
        data={users}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
        addLabel="Tambah Pengguna"
        getItemName={(user) => user.name}
        getRowKey={(user) => user.id}
        searchConfig={{
          placeholder: 'Cari nama atau email...',
          value: search,
          onChange: setSearch,
        }}
        pagination={totalPages > 1 ? {
          currentPage: page,
          totalPages,
          pageSize,
          onPageChange: setPage,
        } : undefined}
      />

      {/* Form Dialog */}
      <UserFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleFormSubmit}
        initialData={editingUser}
        mode={dialogMode}
      />

      {/* Notification */}
      {notification && (
        <SuccessNotification
          message={notification}
          onDismiss={() => setNotification(null)}
        />
      )}
    </div>
  );
}
