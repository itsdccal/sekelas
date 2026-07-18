"use client";

import * as React from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/api";
import type { StudentMonitoringRow } from "@/lib/types";

// --- Constants ---
const PAGE_SIZE = 20;

// --- Props ---
export interface StudentProgressTableProps {
  onStudentClick: (userId: string) => void;
}

// --- Main Component ---
export function StudentProgressTable({ onStudentClick }: StudentProgressTableProps) {
  // Filter state
  const [search, setSearch] = useState("");
  const [kelas, setKelas] = useState("");
  const [page, setPage] = useState(1);

  // Data state
  const [data, setData] = useState<StudentMonitoringRow[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Available classes extracted from data for the filter
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on search change
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when class filter changes
  useEffect(() => {
    setPage(1);
  }, [kelas]);

  // Fetch data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await adminApi.getStudentMonitoring({
        page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch || undefined,
        kelas: kelas || undefined,
      });
      setData(result.data);
      setTotal(result.total);

      // Extract unique classes for the filter dropdown (on first load or when no filter is active)
      if (!kelas && !debouncedSearch && page === 1) {
        const classes = [...new Set(result.data.map((row) => row.kelas))].sort();
        setAvailableClasses((prev) =>
          classes.length > 0 ? classes : prev
        );
      }
    } catch {
      setError("Gagal memuat data siswa. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, kelas]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Also fetch all classes on mount for the dropdown
  useEffect(() => {
    async function fetchClasses() {
      try {
        const result = await adminApi.getStudentMonitoring({
          page: 1,
          pageSize: 1000,
        });
        const classes = [...new Set(result.data.map((row) => row.kelas))].sort();
        if (classes.length > 0) {
          setAvailableClasses(classes);
        }
      } catch {
        // Non-critical, filter will still work without pre-populated options
      }
    }
    fetchClasses();
  }, []);

  // Pagination calculations
  const totalPages = useMemo(() => Math.ceil(total / PAGE_SIZE), [total]);

  // Sort data by totalProgress ascending (lowest first) — server may already sort,
  // but we ensure client-side sort as well for safety
  const sortedData = useMemo(
    () => [...data].sort((a, b) => a.totalProgress - b.totalProgress),
    [data]
  );

  return (
    <div className="space-y-4">
      {/* Toolbar: Search + Class Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Cari nama siswa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
            aria-label="Cari nama siswa"
          />
        </div>

        {/* Class Filter Dropdown */}
        <div className="shrink-0">
          <select
            value={kelas}
            onChange={(e) => setKelas(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
            aria-label="Filter berdasarkan kelas"
          >
            <option value="">Semua Kelas</option>
            {availableClasses.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/5 p-4 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            className="mt-2"
          >
            Coba Lagi
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !error && (
        <div className="space-y-3" role="status" aria-label="Memuat data siswa...">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="flex gap-4 animate-pulse">
              <div className="h-10 flex-1 rounded-md bg-muted" />
              <div className="h-10 w-20 rounded-md bg-muted" />
              <div className="h-10 w-16 rounded-md bg-muted" />
              <div className="h-10 w-20 rounded-md bg-muted" />
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm" role="table">
            <thead className="bg-muted">
              <tr>
                <th
                  className="px-4 py-3 text-left font-medium text-foreground"
                  scope="col"
                >
                  Nama
                </th>
                <th
                  className="px-4 py-3 text-left font-medium text-foreground"
                  scope="col"
                >
                  Kelas
                </th>
                <th
                  className="px-4 py-3 text-left font-medium text-foreground"
                  scope="col"
                >
                  Progres (%)
                </th>
                <th
                  className="px-4 py-3 text-left font-medium text-foreground"
                  scope="col"
                >
                  Total XP
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Tidak ada data siswa ditemukan.
                  </td>
                </tr>
              ) : (
                sortedData.map((student) => (
                  <tr
                    key={student.userId}
                    className="hover:bg-accent/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="text-left font-medium text-primary-700 hover:text-primary-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1 rounded-sm"
                        onClick={() => onStudentClick(student.userId)}
                        aria-label={`Lihat detail ${student.name}`}
                      >
                        {student.name}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {student.kelas}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary-600 transition-all"
                            style={{ width: `${student.totalProgress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {student.totalProgress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {student.totalXP.toLocaleString("id-ID")} XP
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !error && totalPages > 1 && (
        <div
          className="flex items-center justify-between px-2"
          role="navigation"
          aria-label="Navigasi halaman"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Sebelumnya
          </Button>

          <span className="text-sm text-muted-foreground" aria-live="polite">
            Halaman {page} dari {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            aria-label="Halaman berikutnya"
          >
            Berikutnya
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      )}
    </div>
  );
}
