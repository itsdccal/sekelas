# Alur Fitur Lengkap — LMS Bimbel (Subtle & 20for80)

> Dokumen turunan dari **PRD LMS Bimbel v1.2**. Berisi alur kerja (flow) tiap fitur untuk memudahkan developer mengimplementasikan logika bisnis, endpoint, dan state transition.
>
> **Referensi:** PRD_Subtlex20for80.pdf | **Status:** Siap Development

---

## Daftar Isi

1. [Ringkasan Arsitektur Peran](#1-ringkasan-arsitektur-peran)
2. [Alur Hierarki Kurikulum](#2-alur-hierarki-kurikulum)
3. [Alur Belajar Siswa (End-to-End)](#3-alur-belajar-siswa-end-to-end)
4. [Alur Mastery Gate (Kuis Pola Serupa)](#4-alur-mastery-gate-kuis-pola-serupa)
5. [Alur Remediasi (Wajib Tonton Ulang Video)](#5-alur-remediasi-wajib-tonton-ulang-video)
6. [Alur Gamifikasi (XP & Milestone)](#6-alur-gamifikasi-xp--milestone)
7. [Alur Admin — Manajemen Kurikulum](#7-alur-admin--manajemen-kurikulum)
8. [Alur Admin — Quiz Builder (Pattern Grouping)](#8-alur-admin--quiz-builder-pattern-grouping)
9. [Alur Admin — Override Mastery Gate](#9-alur-admin--override-mastery-gate)
10. [Alur API Kontraktual (Sequence)](#10-alur-api-kontraktual-sequence)
11. [State Machine — ChapterStatus](#11-state-machine--chapterstatus)
12. [Checklist Non-Fungsional](#12-checklist-non-fungsional)

---

## 1. Ringkasan Arsitektur Peran

| Peran | Workspace | Akses Utama |
|---|---|---|
| **Siswa** | Student Workspace | Kurikulum, video, kuis, raport, gamifikasi |
| **Admin** | Admin Workspace | CRUD kurikulum, Quiz Builder, audit, Override |

```mermaid
flowchart LR
    A[User Login] --> B{Role?}
    B -->|STUDENT| C[Student Workspace]
    B -->|ADMIN| D[Admin Workspace]
    C --> C1[Kurikulum & Progress]
    D --> D1[Kelola Kurikulum & Soal]
```

---

## 2. Alur Hierarki Kurikulum

Struktur data **wajib** tiga tingkat: `Materi → Bab → Chapter`.

```mermaid
flowchart TD
    M[Materi: Pengetahuan Kuantitatif] --> B1[Bab 1: Bilangan]
    M --> B2[Bab 2: Aljabar]
    M --> B3[Bab 3: Geometri & Pengukuran]
    M --> B4[Bab 4: Statistika & Peluang]
    B1 --> C1[Chapter 1: Operasi Bilangan]
    B1 --> C2[Chapter 2: Pecahan, Desimal, Persen]
    B1 --> C3[Chapter 3: Perbandingan & Skala]
    C1 --> V1[Video Pembelajaran]
    C1 --> Q1[Kuis Pola Serupa]
```

**Catatan implementasi:**
- Setiap `Chapter` memiliki 1 `videoUrl` dan minimal 1 `QuestionPattern`.
- Urutan Chapter dikontrol oleh field `orderIndex` (menentukan Chapter mana yang terbuka setelah Chapter sebelumnya lulus).
- Bab memiliki Pre Test (sebelum Chapter pertama) dan Post Test (setelah Chapter terakhir) — lihat §3.

---

## 3. Alur Belajar Siswa (End-to-End)

```mermaid
flowchart TD
    Start([Siswa membuka Bab]) --> Pre[Pre Test Bab]
    Pre --> Ch[Buka Chapter pertama - status UNLOCKED]
    Ch --> Video[Tonton Video Pembelajaran]
    Video --> Quiz[Kerjakan Kuis Pola Serupa]
    Quiz --> Pass{Lulus passing grade?}
    Pass -->|Ya| XP[Dapatkan XP + status COMPLETED]
    Pass -->|Tidak| Remed[Status REMEDIATION_REQUIRED]
    Remed --> Rewatch[Wajib tonton ulang video 100%]
    Rewatch --> Retake[Tombol Retake aktif - soal baru diacak]
    Retake --> Quiz
    XP --> Next{Masih ada Chapter berikutnya?}
    Next -->|Ya| ChNext[Chapter berikutnya UNLOCKED]
    ChNext --> Video
    Next -->|Tidak| Post[Post Test Bab]
    Post --> Report[Update Raport Siswa]
```

**Aturan kunci:**
- Siswa **tidak bisa** menekan "Next Chapter" sebelum status Chapter aktif = `COMPLETED`.
- Chapter yang masih terkunci ditampilkan **grayscale + ikon gembok**, tidak bisa diklik sama sekali (disabled di level UI *dan* diblokir di level API).

---

## 4. Alur Mastery Gate (Kuis Pola Serupa)

```mermaid
sequenceDiagram
    participant S as Siswa (Client)
    participant API as Backend API
    participant DB as PostgreSQL
    participant Cache as Redis

    S->>API: GET /chapter/:id (mulai kuis)
    API->>DB: Ambil QuestionPattern milik Chapter
    API->>API: Acak 1 soal per Pattern (ID Pola)
    API-->>S: Kirim set soal hasil undian

    S->>API: POST /api/v1/quiz/submit (jawaban)
    API->>API: Hitung skor (server-side, anti-manipulasi)
    alt Skor >= passingGrade
        API->>DB: Update Progress.status = COMPLETED
        API-->>S: { status: PASSED, nextChapter: unlocked }
    else Skor < passingGrade
        API->>DB: Update Progress.status = REMEDIATION_REQUIRED
        API->>Cache: Kunci tombol retake (flag lokal)
        API-->>S: { status: FAILED, nextStatus: REMEDIATION_REQUIRED }
    end
```

**Poin validasi wajib (server-side):**
1. Skor dihitung di server, **bukan** client — mencegah manipulasi via inspect element.
2. Soal yang gagal **tidak boleh** muncul persis sama pada retake — sistem mengundi ulang dari `QuestionPattern` (ID Pola) yang sama, tapi item `Question` berbeda.
3. Jika gagal, endpoint quiz **menolak** request retake sampai `videoWatchTimePct = 100`.

---

## 5. Alur Remediasi (Wajib Tonton Ulang Video)

```mermaid
sequenceDiagram
    participant S as Siswa (Video Player)
    participant API as Backend API
    participant Cache as Redis

    Note over S: Status Chapter = REMEDIATION_REQUIRED
    Note over S: Tombol "Retake Quiz" disabled total

    loop Setiap 5 detik saat video diputar
        S->>API: POST /api/v1/video/track-progress { watchedPercentage }
        API->>Cache: Simpan progress tontonan real-time
    end

    S->>API: watchedPercentage = 100.0 (video selesai tanpa skip)
    API->>API: Validasi tidak ada skip (durasi timestamp konsisten)
    API->>Cache: Update status = READY_FOR_RETAKE
    API-->>S: { currentStatus: READY_FOR_RETAKE }
    S->>S: Tombol "Kerjakan Kuis Kembali" menjadi aktif
    S->>API: Request set soal baru (diacak ulang dari ID Pola)
```

**Aturan ketat:**
- Video **tidak boleh di-skip**. Backend memvalidasi heartbeat 5 detik berurutan; lompatan waktu yang tidak wajar dianggap invalid dan tidak menambah `watchedPercentage`.
- Selama status `REMEDIATION_REQUIRED`, endpoint `quiz/submit` untuk Chapter tersebut **menolak** request (403) sampai status berubah `READY_FOR_RETAKE`.
- Field `videoWatchAttempts` pada model `Progress` bertambah tiap kali siklus remediasi terjadi — dipakai untuk data Raport.

---

## 6. Alur Gamifikasi (XP & Milestone)

```mermaid
flowchart LR
    V[Video selesai ditonton] -->|+XP video| Total[Total XP Siswa]
    Q[Kuis lulus di percobaan awal] -->|+XP kuis full bonus| Total
    Q2[Kuis lulus setelah remediasi] -->|+XP kuis dikurangi/tanpa bonus| Total
    Total --> M{Mencapai threshold Milestone?}
    M -->|Ya| Badge[Tampilkan Badge/Milestone di profil]
    M -->|Tidak| Continue[Lanjut belajar]
```

**Catatan:** PRD menyebutkan XP didapat dari video selesai ditonton dan kuis yang **berhasil di percobaan awal** — disarankan tim produk mengonfirmasi apakah kuis yang lulus setelah remediasi tetap mendapat XP (penuh/berkurang), karena ini memengaruhi skema poin di backend.

---

## 7. Alur Admin — Manajemen Kurikulum

```mermaid
flowchart TD
    A[Admin masuk Panel Kurikulum] --> B[Buat/Edit Materi]
    B --> C[Tambah Bab ke dalam Materi]
    C --> D[Tambah Chapter ke dalam Bab]
    D --> E[Upload Video Chapter]
    E --> F[Buat Flashcard/Komponen Evaluasi Pengingat]
    F --> G[Lanjut ke Quiz Builder - lihat §8]
    G --> H[Publish Chapter]
    H --> I{Chapter pertama di Bab?}
    I -->|Ya| J[Status default: UNLOCKED]
    I -->|Tidak| K[Status default: LOCKED]
```

CRUD penuh (Create, Read, Update, Delete) berlaku di tiap level: Materi, Bab, Chapter.

---

## 8. Alur Admin — Quiz Builder (Pattern Grouping)

```mermaid
flowchart TD
    A[Admin buka Quiz Builder pada Chapter] --> B[Buat ID Pola baru]
    B --> C[Tambahkan beberapa Question ke dalam ID Pola yang sama]
    C --> D[Set opsi jawaban + correctOption per Question]
    D --> E{Tambah ID Pola lain?}
    E -->|Ya| B
    E -->|Tidak| F[Simpan QuestionPattern & Question ke DB]
    F --> G[Saat siswa akses kuis: sistem undi 1 Question per ID Pola]
```

**Contoh struktur data:**
- `QuestionPattern` (patternCode: "Rumus Cepat Pecahan") memiliki 5 `Question` dengan angka/variabel berbeda tapi logika penyelesaian sama.
- Saat siswa retake, sistem mengundi ulang **Question lain** dari `QuestionPattern` yang sama agar tidak identik dengan percobaan sebelumnya.

---

## 9. Alur Admin — Override Mastery Gate

```mermaid
sequenceDiagram
    participant Ad as Admin
    participant API as Backend API
    participant DB as PostgreSQL

    Ad->>API: POST /admin/override { userId, chapterId, alasan }
    API->>API: Validasi role = ADMIN (RBAC)
    API->>DB: Update Progress.status = COMPLETED (bypass manual)
    API->>DB: Insert AuditLog { adminId, action: "OVERRIDE", details, createdAt }
    API-->>Ad: Konfirmasi Override berhasil + log tercatat
```

**Wajib dicatat di `AuditLog`:** ID Admin, nama siswa, alasan override, timestamp — untuk keperluan audit trail dan transparansi.

---

## 10. Alur API Kontraktual (Sequence)

### 10.1 `POST /api/v1/quiz/submit`
```mermaid
sequenceDiagram
    Client->>Server: { chapterId, answers[] }
    Server->>Server: Validasi jawaban vs correctOption (server-side)
    Server-->>Client: { status, score, passingGrade, nextStatus, message }
```

### 10.2 `POST /api/v1/video/track-progress`
```mermaid
sequenceDiagram
    Client->>Server: { chapterId, watchedPercentage }
    Server->>Server: Validasi tidak ada skip / manipulasi timestamp
    Server-->>Client: { chapterId, currentStatus, message }
```

> Kedua endpoint ini adalah titik kritis keamanan — **semua logika kelulusan dan validasi tontonan wajib di server**, token pelacakan video dienkripsi.

---

## 11. State Machine — ChapterStatus

```mermaid
stateDiagram-v2
    [*] --> LOCKED
    LOCKED --> UNLOCKED: Chapter sebelumnya COMPLETED
    UNLOCKED --> COMPLETED: Lulus Kuis Pola Serupa
    UNLOCKED --> REMEDIATION_REQUIRED: Gagal Kuis Pola Serupa
    REMEDIATION_REQUIRED --> READY_FOR_RETAKE: Video ditonton ulang 100%
    READY_FOR_RETAKE --> COMPLETED: Lulus Kuis Pola Serupa (retake)
    READY_FOR_RETAKE --> REMEDIATION_REQUIRED: Gagal lagi
    LOCKED --> COMPLETED: Admin Override (bypass)
```

| Status | Deskripsi | Trigger |
|---|---|---|
| `LOCKED` | Chapter belum bisa diakses | Default, Chapter sebelum belum `COMPLETED` |
| `UNLOCKED` | Chapter bisa diakses, kuis belum dikerjakan/lulus | Chapter sebelumnya `COMPLETED` |
| `COMPLETED` | Siswa lulus kuis | Skor ≥ passing grade |
| `REMEDIATION_REQUIRED` | Gagal kuis, retake terkunci | Skor < passing grade |
| `READY_FOR_RETAKE` | Video sudah ditonton ulang 100% | `track-progress` = 100.0 |

---

## 12. Checklist Non-Fungsional

- [ ] Waktu muat komponen kuis interaktif **< 2 detik**
- [ ] Validasi kelulusan Mastery Gate **100% server-side**
- [ ] Token pelacakan durasi video **terenkripsi**
- [ ] Halaman kuis/flashcard **responsif** (mobile & tablet)
- [ ] Kontras warna sesuai **WCAG 2.1** (khusus tema hijau dominan)
- [ ] Komponen terkunci: **grayscale + ikon gembok**, non-interaktif di level UI dan API
- [ ] `AuditLog` tercatat untuk setiap aksi Override Admin

---

## Referensi Tech Stack Singkat

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 14+ (App Router), TypeScript, Tailwind CSS, Shadcn/Radix, Zustand |
| Video Player | Video.js / Plyr (custom wrapper anti-skip) |
| Backend | Node.js + NestJS, TypeScript, Prisma ORM |
| Auth | JWT + HttpOnly Cookie, RBAC |
| Database | PostgreSQL |
| Cache/Session | Redis |
| Object Storage | AWS S3 / Cloudflare R2 / DigitalOcean Spaces |
| Infra | Docker, GitHub Actions CI/CD, Vercel/AWS/Render |

---

*Dokumen ini disusun sebagai panduan implementasi alur kerja bagi tim developer, berdasarkan PRD LMS Bimbel v1.2 (Subtle & 20for80).*
