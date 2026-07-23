# API Specification — Sekelas LMS

Dokumentasi lengkap endpoint API yang dibutuhkan frontend. Semua endpoint menggunakan base URL `/api/v1`. Autentikasi via HttpOnly cookie (token JWT).

---

## Daftar Isi

1. [Auth](#1-auth)
2. [Courses (Student)](#2-courses-student)
3. [Video & Progress](#3-video--progress)
4. [Quiz Chapter](#4-quiz-chapter)
5. [Pre Test](#5-pre-test)
6. [Post Test](#6-post-test)
7. [Gamification](#7-gamification)
8. [Admin — Courses CRUD](#8-admin--courses-crud)
9. [Admin — Quiz Builder](#9-admin--quiz-builder)
10. [Admin — Quiz Config](#10-admin--quiz-config)
11. [Admin — Monitoring](#11-admin--monitoring)
12. [Admin — Override](#12-admin--override)
13. [Admin — Video Upload](#13-admin--video-upload)
14. [Admin — Milestone Management](#14-admin--milestone-management)
15. [Admin — User Management](#15-admin--user-management)
16. [Admin — Class Management](#16-admin--class-management)
17. [Offline Mode](#17-offline-mode-mode-pembelajaran-tatap-muka)

---

## 1. Auth

### POST /api/v1/auth/login

Login pengguna.

**Request Body:**
```json
{
  "email": "string (max 100 char)",
  "password": "string (min 8, max 64 char)"
}
```

**Response 200:**
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "STUDENT | ADMIN",
    "kelas": "string (optional, for student)"
  },
  "token": "string (JWT)"
}
```

**Response 401:**
```json
{ "message": "Email atau password salah" }
```

---

### POST /api/v1/auth/logout

Logout pengguna. Clear cookie.

**Response 200:**
```json
{ "message": "Berhasil logout" }
```

---

### GET /api/v1/auth/me

Validasi token dan ambil data user saat ini.

**Response 200:**
```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "role": "STUDENT | ADMIN",
  "kelas": "string | null"
}
```

**Response 401:** Token expired/invalid

---

## 2. Courses (Student)

### GET /api/v1/courses/subjects?semesterId={id}

Daftar Subject untuk semester tertentu.

**Response 200:**
```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string | null",
    "orderIndex": "number",
    "sectionCount": "number",
    "isPublished": "boolean",
    "semesterId": "string"
  }
]
```

---

### GET /api/v1/courses/subjects/{subjectId}/Section

Daftar Section dalam Subject.

**Response 200:**
```json
[
  {
    "id": "string",
    "subjectId": "string",
    "name": "string",
    "orderIndex": "number",
    "chapterCount": "number"
  }
]
```

---

### GET /api/v1/courses/sections/{sectionId}/chapters

Daftar chapter dalam Section.

**Response 200:**
```json
[
  {
    "id": "string",
    "sectionId": "string",
    "name": "string",
    "orderIndex": "number",
    "videoUrl": "string",
    "passingGrade": "number (0-100)"
  }
]
```

---

## 3. Video & Progress

### GET /api/v1/video/chapter/{chapterId}/info

Info video dan progress untuk chapter tertentu.

**Response 200:**
```json
{
  "chapterId": "string",
  "title": "string",
  "status": "LOCKED | UNLOCKED | COMPLETED | REMEDIATION_REQUIRED | READY_FOR_RETAKE",
  "watchedPercentage": "number (0-100)",
  "videoUrl": "string",
  "videoDurationMinutes": "number",
  "lastScore": "number | null",
  "quizAttempts": "number",
  "scoreHistory": "number[] (array skor per percobaan, index 0 = percobaan pertama)",
  "passingGrade": "number",
  "maxAttempts": "number",
  "nextChapterId": "string | null"
}
```

---

### POST /api/v1/video/track-progress

Heartbeat progress tontonan video (dikirim setiap 5 detik).

**Request Body:**
```json
{
  "chapterId": "string",
  "currentTimeSeconds": "number",
  "totalDurationSeconds": "number"
}
```

**Response 200:**
```json
{
  "chapterId": "string",
  "watchedPercentage": "number (0-100)",
  "status": "UNLOCKED | COMPLETED | READY_FOR_RETAKE"
}
```

---

### POST /api/v1/video/track-progress/batch

Batch kirim heartbeats yang ter-queue (saat koneksi sempat terputus).

**Request Body:**
```json
{
  "heartbeats": [
    {
      "chapterId": "string",
      "currentTimeSeconds": "number",
      "totalDurationSeconds": "number"
    }
  ]
}
```

**Response 200:**
```json
{ "processed": "number (jumlah heartbeat yang berhasil diproses)" }
```

**Logika backend:**
- Hitung `watchedPercentage = (currentTime / totalDuration) * 100`
- Jika `watchedPercentage >= 100` dan status `REMEDIATION_REQUIRED` → ubah status ke `READY_FOR_RETAKE`
- Jika `watchedPercentage >= 100` dan status `UNLOCKED` → status tetap sampai quiz lulus

---

### GET /api/v1/student/progress

Progress keseluruhan siswa (untuk dashboard dan raport).

**Response 200:**
```json
{
  "userId": "string",
  "completedChapters": "number",
  "totalChapters": "number",
  "totalXP": "number",
  "currentStreak": "number",
  "subjectProgress": [
    {
      "subjectId": "string",
      "subjectName": "string",
      "completionPercentage": "number (0-100)",
      "sections": [
        {
          "sectionId": "string",
          "sectionName": "string",
          "status": "LOCKED | UNLOCKED | IN_PROGRESS | COMPLETED",
          "preTestCompleted": "boolean",
          "postTestCompleted": "boolean",
          "preTestScore": "number | null",
          "postTestScore": "number | null",
          "chapters": [
            {
              "chapterId": "string",
              "title": "string",
              "status": "LOCKED | UNLOCKED | COMPLETED | REMEDIATION_REQUIRED | READY_FOR_RETAKE",
              "watchedPercentage": "number",
              "lastScore": "number | null",
              "quizAttempts": "number",
              "scoreHistory": "number[] (array skor per percobaan, index 0 = percobaan pertama)",
              "videoWatchAttempts": "number",
              "xpEarned": "number"
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 4. Quiz Chapter

### Tipe Soal (Question Types)

Sistem mendukung 3 tipe soal:

| Tipe | Deskripsi | Format Jawaban |
|------|-----------|----------------|
| `MULTIPLE_CHOICE` | Pilihan ganda (default) | `selectedOptionId`: ID opsi yang dipilih |
| `ESSAY` | Esai panjang (min 50 karakter) | `textAnswer`: teks jawaban esai |
| `SHORT_ANSWER` | Jawaban singkat (1 baris) | `textAnswer`: teks jawaban singkat |

> **Catatan:** Jika `questionType` tidak diset, soal diperlakukan sebagai `MULTIPLE_CHOICE`.

---

### GET /api/v1/quiz/chapter/{chapterId}/questions

Ambil soal quiz untuk chapter. Backend mengambil 1 soal acak dari setiap topik (QuestionPattern).

**Response 200:**
```json
[
  {
    "id": "string",
    "patternId": "string",
    "text": "string",
    "questionType": "MULTIPLE_CHOICE | ESSAY | SHORT_ANSWER (optional, default MC)",
    "options": [
      { "id": "string", "text": "string", "order": "number" }
    ],
    "subjectLabel": "string | null (label Subject asal untuk UTBK-style)"
  }
]
```

> **Catatan:** `correctOptionId` TIDAK dikirim ke student. Field `options` kosong untuk tipe ESSAY/SHORT_ANSWER.

---

### POST /api/v1/quiz/submit

Submit jawaban quiz chapter. Format jawaban berbeda per tipe soal.

**Request Body:**
```json
{
  "chapterId": "string",
  "answers": [
    {
      "questionId": "string",
      "selectedOptionId": "string (untuk MULTIPLE_CHOICE)",
      "textAnswer": "string (untuk ESSAY dan SHORT_ANSWER)"
    }
  ]
}
```

> **Catatan:** Kirim `selectedOptionId` untuk soal pilihan ganda, `textAnswer` untuk soal esai/singkat. Tidak perlu kirim keduanya.

**Response 200:**
```json
{
  "status": "PASSED | FAILED | PENDING_REVIEW",
  "score": "number (0-100, hanya dari soal yang bisa dinilai otomatis)",
  "passingGrade": "number (0-100)",
  "nextStatus": "COMPLETED | REMEDIATION_REQUIRED | UNLOCKED",
  "message": "string",
  "xpEarned": "number",
  "reviewDetails": [
    {
      "questionId": "string",
      "questionText": "string",
      "questionType": "MULTIPLE_CHOICE | ESSAY | SHORT_ANSWER",
      "isCorrect": "boolean | null (null = pending review)",
      "selectedOptionId": "string | null",
      "correctOptionId": "string | null",
      "textAnswer": "string | null"
    }
  ]
}
```

**Status logic:**
- `PASSED`: Semua soal auto-graded benar ≥ passingGrade, dan **tidak ada** soal essay/short_answer
- `FAILED`: Skor < passingGrade
- `PENDING_REVIEW`: Skor MC ≥ passingGrade TAPI ada soal essay/short_answer yang perlu dinilai manual oleh pengajar

**Field `reviewDetails`:**
- Dikirim ketika status = `PASSED` atau `PENDING_REVIEW`
- `isCorrect: true` = jawaban benar (MC)
- `isCorrect: false` = jawaban salah (MC)
- `isCorrect: null` = menunggu review manual (ESSAY/SHORT_ANSWER)

**Logika backend:**
- Hitung skor MC: `(jawaban MC benar / total soal MC) * 100`
- Jika ada soal essay/short_answer dan skor MC ≥ passingGrade → `PENDING_REVIEW`
- Jika hanya MC dan `skor >= passingGrade` → PASSED, status chapter = COMPLETED, berikan XP
- Jika `skor < passingGrade` → FAILED, status chapter = REMEDIATION_REQUIRED
- XP = jumlah soal benar × xpPerQuestion (dari config)

---

## 5. Pre Test

### GET /api/v1/pretest/subjects/{subjectId}/status

Cek apakah pre test sudah dikerjakan untuk Section ini.

**Response 200:**
```json
{
  "completed": "boolean",
  "startChapterIndex": "number (0-based, jika completed)"
}
```

---

### GET /api/v1/pretest/subjects/{subjectId}/questions

Ambil soal pre test untuk Section. **Backend mengambil soal dari Bank Soal per chapter sesuai distribusi yang dikonfigurasi admin.**

**Logika backend:**
1. Baca config distribusi Pre Test untuk Section ini
2. Untuk setiap chapter: ambil N soal acak dari Bank Soal chapter tersebut
3. Urutkan soal berdasarkan orderIndex chapter (soal chapter 1 dulu, lalu chapter 2, dst)
4. Kirim tanpa `correctOptionId`

**Response 200:**
```json
[
  {
    "id": "string",
    "chapterId": "string (chapter asal soal ini)",
    "text": "string",
    "options": [
      { "id": "string", "text": "string", "order": "number" }
    ]
  }
]
```

> **Catatan:** `correctOptionId` TIDAK dikirim ke student. Field `chapterId` digunakan backend untuk menentukan placement.

---

### POST /api/v1/pretest/submit

Submit jawaban pre test. Backend hitung skor per chapter untuk tentukan placement.

**Request Body:**
```json
{
  "sectionId": "string",
  "answers": [
    { "questionId": "string", "selectedOptionId": "string" }
  ]
}
```

**Response 200:**
```json
{
  "sectionId": "string",
  "startChapterIndex": "number (0-based)",
  "startChapterName": "string",
  "totalChaptersSkipped": "number",
  "xpEarned": "number",
  "message": "string"
}
```

**Logika backend:**
- Kelompokkan jawaban berdasarkan chapter asal soal
- Hitung persentase benar per chapter
- Placement: siswa mulai dari **chapter pertama** yang persentase benarnya di bawah threshold (misal < 70%)
- Jika semua chapter benar → siswa mulai dari chapter terakhir
- Chapter yang dilewati → status COMPLETED, XP diberikan (sum XP dari video + quiz chapter tersebut)
- Pre test hanya bisa dikerjakan **1 kali** per Section per siswa

---

## 6. Post Test

### GET /api/v1/posttest/subjects/{subjectId}/status

Cek status post test untuk Section.

**Response 200:**
```json
{
  "available": "boolean (true jika semua chapter COMPLETED)",
  "completed": "boolean",
  "lastScore": "number | null",
  "passed": "boolean"
}
```

---

### GET /api/v1/posttest/subjects/{subjectId}/questions

Ambil soal post test untuk Section. **Backend mengambil soal dari Bank Soal per chapter sesuai distribusi yang dikonfigurasi admin.**

**Logika backend:** Sama seperti Pre Test — ambil soal dari chapter sesuai distribusi config.

**Response 200:**
```json
[
  {
    "id": "string",
    "chapterId": "string (chapter asal soal ini)",
    "text": "string",
    "options": [
      { "id": "string", "text": "string", "order": "number" }
    ]
  }
]
```

---

### POST /api/v1/posttest/submit

Submit jawaban post test.

**Request Body:**
```json
{
  "sectionId": "string",
  "answers": [
    { "questionId": "string", "selectedOptionId": "string" }
  ]
}
```

**Response 200:**
```json
{
  "status": "PASSED | FAILED",
  "score": "number (0-100)",
  "passingGrade": "number (0-100, dari config admin)",
  "xpEarned": "number",
  "message": "string",
  "nextSectionUnlocked": "boolean",
  "nextSectionId": "string | null",
  "remediationChapterIds": ["string"],
  "remediationChapterNames": ["string"]
}
```

**Logika backend:**
- Hitung skor berdasarkan jawaban benar: `(benar / total) * 100`
- Bandingkan dengan `passingGrade` dari config admin (bukan hardcoded)
- Jika `skor >= passingGrade` → PASSED, unlock Section berikutnya, berikan XP
- Jika `skor < passingGrade` → FAILED:
  - Identifikasi chapter yang soalnya dijawab salah (via `chapterId` di soal)
  - Kirim `remediationChapterIds` + `remediationChapterNames` ke frontend
  - Siswa harus tonton ulang video chapter-chapter ini sampai 100% sebelum retake
- XP = sum(xpPerQuestion) untuk soal yang dijawab benar

---

## 7. Gamification

### GET /api/v1/gamification/status

Status gamifikasi siswa (XP, badges, milestones).

**Response 200:**
```json
{
  "totalXP": "number",
  "currentStreak": "number",
  "badges": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "iconUrl": "string",
      "earnedAt": "string (ISO date) | null",
      "isEarned": "boolean"
    }
  ],
  "milestones": [
    {
      "id": "string",
      "name": "string",
      "xpThreshold": "number",
      "isReached": "boolean"
    }
  ],
  "nextMilestone": {
    "name": "string",
    "xpThreshold": "number",
    "currentXP": "number"
  }
}
```

---

## 8. Admin — Courses CRUD

### POST /api/v1/admin/courses/subjects

Buat Subject baru.

**Request Body:**
```json
{
  "name": "string (max 100)",
  "description": "string (max 500, optional)",
  "semesterId": "string"
}
```

**Response 201:** Object Subject

---

### PUT /api/v1/admin/courses/subjects/{subjectId}

Update Subject.

**Request Body:**
```json
{
  "name": "string (optional)",
  "description": "string (optional)"
}
```

---

### DELETE /api/v1/admin/courses/subjects/{subjectId}

Hapus Subject (cascade delete Section dan chapter di dalamnya).

---

### POST /api/v1/admin/courses/sections

**Request Body:**
```json
{
  "subjectId": "string",
  "name": "string",
  "orderIndex": "number"
}
```

---

### PUT /api/v1/admin/courses/sections/{sectionId}

### DELETE /api/v1/admin/courses/sections/{sectionId}

---

### POST /api/v1/admin/courses/chapter

**Request Body:**
```json
{
  "sectionId": "string",
  "name": "string",
  "orderIndex": "number",
  "videoUrl": "string",
  "passingGrade": "number (0-100, default 70)"
}
```

---

### PUT /api/v1/admin/courses/chapter/{chapterId}

### DELETE /api/v1/admin/courses/chapter/{chapterId}

---

## 9. Admin — Quiz Builder

### GET /api/v1/admin/quiz/chapter/{targetId}/patterns

Ambil daftar topik soal (QuestionPattern) untuk chapter atau Section.

**Query Params (optional):**
- `type`: `CHAPTER_QUIZ | PRE_TEST | POST_TEST` (default: CHAPTER_QUIZ)

**Response 200:**
```json
[
  {
    "id": "string",
    "chapterId": "string | null",
    "sectionId": "string | null",
    "quizType": "CHAPTER_QUIZ | PRE_TEST | POST_TEST",
    "patternCode": "string",
    "description": "string",
    "questionCount": "number"
  }
]
```

---

### POST /api/v1/admin/quiz/patterns

Buat topik soal baru.

**Request Body:**
```json
{
  "chapterId": "string (untuk CHAPTER_QUIZ, atau sectionId untuk PRE/POST)",
  "patternCode": "string (auto-generated dari nama topik, max 50, unique)",
  "description": "string (nama topik, max 200)",
  "quizType": "CHAPTER_QUIZ | PRE_TEST | POST_TEST"
}
```

---

### DELETE /api/v1/admin/quiz/patterns/{patternId}

Hapus topik beserta semua soalnya.

---

### GET /api/v1/admin/quiz/patterns/{patternId}/questions

Daftar soal dalam topik.

**Response 200:**
```json
[
  {
    "id": "string",
    "patternId": "string",
    "text": "string",
    "questionType": "MULTIPLE_CHOICE | SHORT_ANSWER",
    "imageUrl": "string | null",
    "options": [
      { "id": "string", "text": "string", "order": "number" }
    ],
    "correctOptionId": "string",
    "xpPerQuestion": "number",
    "weight": "number (1-100, default 1)"
  }
]
```

---

### POST /api/v1/admin/quiz/questions

Buat soal baru.

**Request Body:**
```json
{
  "patternId": "string",
  "text": "string",
  "options": [
    { "text": "string (max 500)", "order": "number" }
  ],
  "correctOptionIndex": "number (0-based index dari options array)",
  "xpPerQuestion": "number (0-1000, default 0)",
  "weight": "number (1-100, question weight toward total score, default 1)"
}
```

---

### PUT /api/v1/admin/quiz/questions/{questionId}

Update soal.

**Request Body:** (semua optional)
```json
{
  "text": "string",
  "options": [{ "text": "string", "order": "number" }],
  "correctOptionIndex": "number",
  "xpPerQuestion": "number",
  "weight": "number (1-100)"
}
```

---

### DELETE /api/v1/admin/quiz/questions/{questionId}

---

## 10. Admin — Pre Test & Post Test (Subtest Model)

Pre Test and Post Test use a **subtest** model (not pattern-based randomization like Chapter Quiz). Each subtest contains questions that are directly shown to students — no randomization.

### Terminology

- **Subtest**: A category/group of questions (e.g., Penalaran Umum, Literasi Bahasa Indonesia)
- Subtests are stored as `QuestionPattern` records with `quizType = PRE_TEST | POST_TEST`
- Questions inside subtests are shown directly (all active questions appear)

### GET /api/v1/admin/quiz/config/{subjectId}?type={quizType}

Get Pre Test or Post Test configuration for a Subject.

**Query Params:**
- `type`: `PRE_TEST | POST_TEST` (required)

**Response 200:**
```json
{
  "id": "string",
  "subjectId": "string",
  "quizType": "PRE_TEST | POST_TEST",
  "timerMinutes": "number (default 135 for UTBK-style)",
  "passingGrade": "number (0-100, only for POST_TEST, default 70)",
  "subtests": [
    {
      "patternId": "string",
      "name": "string",
      "activeQuestionIds": ["string (question IDs that are enabled)"],
      "questionWeights": { "questionId": "number (1-100)" }
    }
  ]
}
```

---

### PUT /api/v1/admin/quiz/config/{subjectId}

Save/update Pre Test or Post Test configuration.

**Request Body:**
```json
{
  "quizType": "PRE_TEST | POST_TEST",
  "timerMinutes": "number (5-180)",
  "passingGrade": "number (0-100, ignored for PRE_TEST)",
  "subtests": [
    {
      "patternId": "string",
      "activeQuestionIds": ["string"],
      "questionWeights": { "questionId": "number (1-100)" }
    }
  ]
}
```

**Response 200:**
```json
{ "message": "Configuration saved successfully" }
```

**Backend validation:**
- `timerMinutes` must be between 5 and 180
- `passingGrade` ignored for PRE_TEST
- `activeQuestionIds` must reference valid questions within the pattern
- `questionWeights` values must be 1-100

---

### How Backend Serves Pre/Post Test to Students

When a student takes a Pre Test or Post Test:

1. Backend reads config for the Subject
2. For each subtest: collect only `activeQuestionIds` (questions admin has enabled)
3. Apply `questionWeights` for scoring calculation
4. Send all active questions to frontend grouped by subtest (without correctOptionId)
5. On submit:
   - **Pre Test**: determine placement (which Section student starts from)
   - **Post Test**: calculate weighted score, compare against passingGrade

---

**Key differences from Chapter Quiz:**
- Pre/Post Test questions are NOT randomized — all active questions appear
- Questions are grouped by subtest (PU, PM, LBI, LBE etc.)
- Admin can toggle individual questions on/off and set per-question weights
- Test is taken only once (no retry via pattern re-roll)

---

## 11. Admin — Monitoring

### GET /api/v1/admin/monitoring/students

Daftar siswa dengan progres.

**Query Params:**
- `page`: number (default 1)
- `pageSize`: number (default 20)
- `search`: string (partial name match, case-insensitive)
- `kelas`: string (filter by class)

**Response 200:**
```json
{
  "data": [
    {
      "userId": "string",
      "name": "string",
      "kelas": "string",
      "totalProgress": "number (0-100%)",
      "totalXP": "number",
      "averageScore": "number | null (rata-rata nilai quiz, null jika belum pernah quiz)"
    }
  ],
  "total": "number",
  "page": "number",
  "pageSize": "number"
}
```

---

### GET /api/v1/admin/monitoring/students/{userId}

Detail progres satu siswa (sama seperti GET /student/progress tapi untuk admin).

**Response 200:**
```json
{
  "userId": "string",
  "completedChapters": "number",
  "totalChapters": "number",
  "totalXP": "number",
  "subjectProgress": [
    {
      "subjectId": "string",
      "subjectName": "string",
      "completionPercentage": "number (0-100)",
      "sections": [
        {
          "sectionId": "string",
          "sectionName": "string",
          "status": "LOCKED | UNLOCKED | IN_PROGRESS | COMPLETED",
          "preTestCompleted": "boolean",
          "postTestCompleted": "boolean",
          "preTestScore": "number | null",
          "postTestScore": "number | null",
          "chapters": [
            {
              "chapterId": "string",
              "status": "LOCKED | UNLOCKED | COMPLETED | REMEDIATION_REQUIRED | READY_FOR_RETAKE",
              "watchedPercentage": "number (0-100)",
              "lastScore": "number | null",
              "quizAttempts": "number",
              "scoreHistory": "number[] (array skor per percobaan, index 0 = percobaan pertama)",
              "videoWatchAttempts": "number"
            }
          ]
        }
      ]
    }
  ]
}
```

**Catatan `scoreHistory`:**
- Array berisi nilai setiap kali siswa mengerjakan quiz untuk chapter tersebut
- `scoreHistory[0]` = nilai percobaan pertama, `scoreHistory[1]` = nilai percobaan kedua, dst.
- `scoreHistory.length` selalu sama dengan `quizAttempts`
- Jika siswa belum pernah mengerjakan quiz → `scoreHistory: []`
- Digunakan untuk fitur export Excel monitoring (menampilkan progres nilai per percobaan)

---

## 12. Admin — Override

### POST /api/v1/admin/override

Override status chapter siswa menjadi COMPLETED.

**Request Body:**
```json
{
  "userId": "string",
  "chapterId": "string",
  "reason": "string (min 10, max 500 char)"
}
```

**Response 200:**
```json
{ "message": "Override berhasil" }
```

---

### GET /api/v1/admin/override/audit-log

Riwayat override yang pernah dilakukan.

**Response 200:**
```json
[
  {
    "id": "string",
    "adminName": "string",
    "studentName": "string",
    "chapterName": "string",
    "reason": "string",
    "timestamp": "string (ISO date)",
    "action": "string"
  }
]
```

---

## 13. Admin — Video Upload

### POST /api/v1/admin/video/upload

Upload video chapter. Multipart form data.

**Request Body:** `multipart/form-data`
- `video`: File (MP4/WebM, max 500MB)

**Response 200:**
```json
{
  "videoUrl": "string (URL video yang tersimpan)",
  "thumbnailUrl": "string",
  "durationSeconds": "number",
  "fileSizeBytes": "number"
}
```

---

## 14. Admin — Milestone Management

### GET /api/v1/admin/milestones

Daftar semua milestone (badge berbasis XP threshold).

**Response 200:**
```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "imageUrl": "string",
    "xpThreshold": "number",
    "isActive": "boolean",
    "createdAt": "string (ISO date)",
    "updatedAt": "string (ISO date)"
  }
]
```

---

### POST /api/v1/admin/milestones

Buat milestone baru.

**Request Body:**
```json
{
  "name": "string (max 50)",
  "description": "string (max 200)",
  "imageUrl": "string",
  "xpThreshold": "number (> 0)",
  "isActive": "boolean (default true)"
}
```

**Response 201:** Object milestone

---

### PUT /api/v1/admin/milestones/{milestoneId}

Update milestone.

**Request Body:** (semua optional)
```json
{
  "name": "string",
  "description": "string",
  "imageUrl": "string",
  "xpThreshold": "number",
  "isActive": "boolean"
}
```

---

### DELETE /api/v1/admin/milestones/{milestoneId}

Hapus milestone.

---

## 15. Admin — User Management

Kelola pengguna (siswa dan admin/pengajar). Hanya admin yang dapat mengakses endpoint ini.

### GET /api/v1/admin/users

Daftar pengguna dengan pagination, search, dan filter.

**Query Params:**
- `page`: number (default 1)
- `pageSize`: number (default 20)
- `search`: string (partial match nama atau email, case-insensitive)
- `role`: string (filter: `STUDENT` | `ADMIN`, kosong = semua)

**Response 200:**
```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "STUDENT | ADMIN",
      "kelas": "string | null (hanya untuk STUDENT)",
      "isActive": "boolean",
      "createdAt": "string (ISO date)"
    }
  ],
  "total": "number",
  "page": "number",
  "pageSize": "number"
}
```

---

### POST /api/v1/admin/users

Buat pengguna baru.

**Request Body:**
```json
{
  "name": "string (min 2, max 100 char)",
  "email": "string (valid email, max 100 char, unik)",
  "password": "string (min 8, max 64 char)",
  "role": "STUDENT | ADMIN",
  "kelas": "string (wajib jika role = STUDENT)"
}
```

**Response 201:**
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "role": "STUDENT | ADMIN",
  "kelas": "string | null",
  "isActive": true,
  "createdAt": "string (ISO date)"
}
```

**Response 400:**
```json
{ "message": "Nama wajib diisi (minimal 2 karakter)" }
```

**Response 409:**
```json
{ "message": "Email sudah terdaftar" }
```

---

### PUT /api/v1/admin/users/{userId}

Update data pengguna.

**Request Body:** (semua field optional, kirim yang ingin diubah)
```json
{
  "name": "string (min 2, max 100 char)",
  "email": "string (valid email, max 100 char)",
  "role": "STUDENT | ADMIN",
  "kelas": "string (wajib jika role = STUDENT)",
  "isActive": "boolean"
}
```

**Response 200:**
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "role": "STUDENT | ADMIN",
  "kelas": "string | null",
  "isActive": "boolean",
  "createdAt": "string (ISO date)"
}
```

**Response 400:**
```json
{ "message": "Email tidak valid" }
```

**Response 404:**
```json
{ "message": "Pengguna tidak ditemukan" }
```

**Catatan:**
- Jika `role` diubah dari STUDENT ke ADMIN, field `kelas` akan dihapus (set null)
- Jika `isActive` diubah ke `false`, pengguna tidak bisa login tapi data tetap tersimpan
- Password tidak bisa diubah via endpoint ini (gunakan endpoint reset password terpisah jika diperlukan)

---

### DELETE /api/v1/admin/users/{userId}

Hapus pengguna. Soft delete (set `isActive = false` dan tandai `deletedAt`).

**Response 200:**
```json
{
  "success": true,
  "message": "Pengguna berhasil dihapus"
}
```

**Response 404:**
```json
{ "message": "Pengguna tidak ditemukan" }
```

**Catatan:**
- Penghapusan bersifat soft delete — data tidak hilang dari database
- Progres belajar siswa yang dihapus tetap tersimpan untuk keperluan audit
- Admin tidak bisa menghapus dirinya sendiri

---

### Validasi Backend — User Management

| Field | Rule |
|-------|------|
| name | Wajib, min 2, max 100 karakter |
| email | Wajib, format email valid, max 100 karakter, unik |
| password | Wajib saat create, min 8, max 64 karakter, hash sebelum simpan |
| role | Wajib, hanya `STUDENT` atau `ADMIN` |
| kelas | Wajib jika role = STUDENT, diabaikan jika role = ADMIN |

---

## Business Logic Summary (untuk Backend)

### State Machine — Chapter Status

```
LOCKED → UNLOCKED (chapter sebelumnya COMPLETED, atau placement dari Pre Test)
UNLOCKED → COMPLETED (quiz lulus, skor >= passingGrade)
UNLOCKED → REMEDIATION_REQUIRED (quiz gagal, skor < passingGrade)
REMEDIATION_REQUIRED → READY_FOR_RETAKE (video ditonton ulang 100%)
READY_FOR_RETAKE → COMPLETED (retake quiz lulus)
READY_FOR_RETAKE → REMEDIATION_REQUIRED (retake quiz gagal lagi)
```

### State Machine — Section Status

```
LOCKED → UNLOCKED (Post Test Section sebelumnya lulus, atau Section pertama dalam Subject)
UNLOCKED → IN_PROGRESS (Pre Test dikerjakan)
IN_PROGRESS → COMPLETED (Post Test lulus)
```

### Flow Progresif

1. Section pertama dalam Subject selalu UNLOCKED
2. Section berikutnya LOCKED sampai Post Test Section sebelumnya PASSED
3. Masuk Section → harus Pre Test dulu (1 kali, tidak bisa diulang)
4. Chapter sequential: chapter N+1 baru UNLOCKED setelah chapter N COMPLETED
5. Semua chapter COMPLETED → Post Test available
6. Post Test lulus → Section berikutnya UNLOCKED

### Pre Test Placement Logic

- Soal Pre Test diambil dari Bank Soal per chapter (sesuai config distribusi admin)
- Setiap soal terkait dengan 1 chapter (via chapterId)
- Backend kelompokkan jawaban per chapter, hitung persentase benar per chapter
- Siswa ditempatkan mulai dari chapter pertama yang **persentase benarnya < threshold**
- Chapter sebelumnya otomatis COMPLETED + XP diberikan

### Remediation (Post Test Gagal)

- Backend identifikasi chapter mana yang soalnya dijawab salah (via chapterId di soal)
- Kirim `remediationChapterIds` + `remediationChapterNames` ke frontend
- Siswa harus tonton ulang video chapter tersebut sampai 100%
- Frontend cek via GET /video/chapter/{id}/info → `watchedPercentage >= 100`
- Setelah semua remediation video ditonton → siswa bisa retake Post Test

### Konsep Bank Soal

- Bank Soal dibuat per **chapter** (via tab "Kuis Chapter" di admin)
- Pre Test dan Post Test **TIDAK punya soal sendiri** — mengambil dari Bank Soal chapter
- Admin hanya mengatur **distribusi** (berapa soal dari tiap chapter) dan **KKM** (Post Test)
- Saat quiz/test dijalankan, backend mengambil N soal acak per chapter sesuai config

### XP Calculation

- Quiz/Post Test: XP = sum(xpPerQuestion) untuk soal yang dijawab benar
- Pre Test skip: XP = total XP dari semua chapter yang dilewati
- Video completion: bisa berikan XP tambahan (configurable)

### Score Calculation (Bobot Nilai)

Skor kuis/post test dihitung berdasarkan bobot (weight) per soal:

```
Skor = (sum of weight soal yang benar / sum of weight seluruh soal) × 100%
```

**Contoh:**
- Soal 1 (weight: 1) → benar
- Soal 2 (weight: 3) → salah
- Soal 3 (weight: 2) → benar
- Total weight benar = 1 + 2 = 3
- Total weight semua = 1 + 3 + 2 = 6
- Skor = (3/6) × 100 = 50%

Jika semua soal memiliki weight = 1 (default), maka skor = persentase soal benar biasa.

---

## Error Responses (Standard)

Semua endpoint menggunakan format error yang sama:

```json
{
  "message": "string (human-readable error message)",
  "code": "string (optional, machine-readable error code)"
}
```

| Status | Arti |
|--------|------|
| 400 | Bad Request — validasi gagal |
| 401 | Unauthorized — token expired/invalid |
| 403 | Forbidden — role tidak sesuai |
| 404 | Not Found — resource tidak ditemukan |
| 409 | Conflict — data duplikat (misal patternCode) |
| 500 | Internal Server Error |

---

## Auth Notes

- Token dikirim via HttpOnly cookie (set by backend on login)
- Frontend menyertakan `withCredentials: true` di setiap request
- Token expiry: backend return 401 → frontend redirect ke /login
- Role-based access: STUDENT hanya bisa akses /api/v1/student/*, /api/v1/quiz/*, /api/v1/courses/*, /api/v1/gamification/*
- ADMIN bisa akses /api/v1/admin/* dan semua endpoint student


---

## 16. Admin — Class Management

Kelola kelas (classroom). Kelas digunakan untuk mengelompokkan siswa.

### GET /api/v1/admin/classes

Daftar semua kelas.

**Response 200:**
```json
[
  {
    "id": "string",
    "name": "string",
    "studentCount": "number",
    "createdAt": "string (ISO date)"
  }
]
```

---

### POST /api/v1/admin/classes

Buat kelas baru.

**Request Body:**
```json
{
  "name": "string (min 1, max 50, unik)"
}
```

**Response 201:**
```json
{
  "id": "string",
  "name": "string",
  "studentCount": 0,
  "createdAt": "string (ISO date)"
}
```

**Response 409:**
```json
{ "message": "Nama kelas sudah ada" }
```

---

### PUT /api/v1/admin/classes/{classId}

Update nama kelas.

**Request Body:**
```json
{
  "name": "string (min 1, max 50, unik)"
}
```

**Response 200:** Object kelas yang diupdate

---

### DELETE /api/v1/admin/classes/{classId}

Hapus kelas. Hanya bisa dihapus jika tidak ada siswa yang terdaftar di kelas tersebut.

**Response 200:**
```json
{ "success": true, "message": "Kelas berhasil dihapus" }
```

**Response 400:**
```json
{ "message": "Tidak dapat menghapus kelas \"10A\" karena masih memiliki 8 siswa" }
```

---

## 17. Offline Mode (Mode Pembelajaran Tatap Muka)

Offline Mode adalah konfigurasi khusus untuk deployment di institusi yang menggunakan pengajaran tatap muka (misal: pondok pesantren). Mode ini di-toggle via environment variable, bukan per-user.

### Konfigurasi

```
NEXT_PUBLIC_OFFLINE_MODE=true   → Aktifkan offline mode
NEXT_PUBLIC_OFFLINE_MODE=false  → Mode standar (default)
```

Backend juga perlu membaca env var ini (misal `OFFLINE_MODE=true` tanpa prefix `NEXT_PUBLIC_`) untuk menyesuaikan logika server-side.

### Perubahan Perilaku Backend saat Offline Mode Aktif

#### 1. Quiz Submit (`POST /api/v1/quiz/submit`)

| Aspek | Mode Online (Standar) | Mode Offline |
|-------|----------------------|--------------|
| Scoring | Skor vs passingGrade → PASSED/FAILED | Skor dihitung tapi **selalu return PASSED** |
| nextStatus | COMPLETED / REMEDIATION_REQUIRED | **Selalu COMPLETED** |
| Chapter unlock | Hanya jika PASSED | **Selalu unlock next chapter** |
| scoreHistory | Append setiap submit | Append setiap submit (sama) |
| Nilai resmi | `lastScore` (skor terakhir lulus) | **`scoreHistory[0]`** (percobaan pertama) |

**Catatan untuk BE:** Saat offline mode, `POST /api/v1/quiz/submit` harus:
1. Tetap hitung skor seperti biasa
2. Append skor ke `scoreHistory[]`
3. Selalu return `nextStatus: 'COMPLETED'` dan `status: 'PASSED'`
4. Tidak pernah return `REMEDIATION_REQUIRED` atau `READY_FOR_RETAKE`

#### 2. Chapter State Machine (Simplified)

**Mode Offline** hanya menggunakan 3 state:

```
LOCKED → UNLOCKED → COMPLETED
```

- **Tidak ada** `REMEDIATION_REQUIRED`
- **Tidak ada** `READY_FOR_RETAKE`
- Chapter langsung COMPLETED setelah quiz pertama di-submit (apapun skornya)
- Chapter yang sudah COMPLETED tetap bisa diakses quiz-nya (untuk latihan ulang)

#### 3. Video Heartbeat (`POST /api/v1/video/track-progress`)

- Masih bisa dikirim (jika siswa menonton video)
- Tapi **tidak memblokir akses quiz** — siswa bisa langsung ke quiz tanpa video 100%
- Backend tetap simpan `watchedPercentage` untuk statistik

#### 4. User Management (`POST/PUT /api/v1/admin/users`)

| Field | Mode Online | Mode Offline |
|-------|-------------|--------------|
| `kelas` | **Wajib** jika role = STUDENT | **Opsional** (boleh kosong/null) |

#### 5. Monitoring & Export

- `scoreHistory[0]` = nilai resmi untuk ranking dan export
- `lastScore` tetap berisi skor terakhir (mungkin dari latihan ulang)
- Untuk ranking/export, gunakan `scoreHistory[0]` bukan `lastScore`

### Catatan Implementasi untuk Backend Developer

1. **Baca env var saat startup** — simpan sebagai config constant, jangan baca ulang tiap request
2. **Jangan buat endpoint baru** — semua endpoint tetap sama, hanya logika internal yang berubah
3. **scoreHistory tetap append** — setiap submit quiz (baik percobaan pertama maupun latihan ulang) tetap masuk ke array
4. **Retake di offline mode** — siswa boleh submit quiz berulang kali pada chapter COMPLETED, tapi status tidak berubah
5. **Pre Test & Post Test** — behavior tetap sama di kedua mode (tidak terpengaruh offline mode)
6. **Export/Ranking** — selalu pakai `scoreHistory[0]` sebagai nilai resmi di offline mode, `lastScore` di online mode
