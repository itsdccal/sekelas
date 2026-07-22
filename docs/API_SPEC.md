# API Specification — Sekelas LMS

Dokumentasi lengkap endpoint API yang dibutuhkan frontend. Semua endpoint menggunakan base URL `/api/v1`. Autentikasi via HttpOnly cookie (token JWT).

---

## Daftar Isi

1. [Auth](#1-auth)
2. [Curriculum (Student)](#2-curriculum-student)
3. [Video & Progress](#3-video--progress)
4. [Quiz Chapter](#4-quiz-chapter)
5. [Pre Test](#5-pre-test)
6. [Post Test](#6-post-test)
7. [Gamification](#7-gamification)
8. [Admin — Curriculum CRUD](#8-admin--curriculum-crud)
9. [Admin — Quiz Builder](#9-admin--quiz-builder)
10. [Admin — Quiz Config](#10-admin--quiz-config)
11. [Admin — Monitoring](#11-admin--monitoring)
12. [Admin — Override](#12-admin--override)
13. [Admin — Video Upload](#13-admin--video-upload)
14. [Admin — Badge Management](#14-admin--badge-management)
15. [Admin — User Management](#15-admin--user-management)

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

## 2. Curriculum (Student)

### GET /api/v1/curriculum/materi?semesterId={id}

Daftar materi untuk semester tertentu.

**Response 200:**
```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string | null",
    "orderIndex": "number",
    "babCount": "number",
    "isPublished": "boolean",
    "semesterId": "string"
  }
]
```

---

### GET /api/v1/curriculum/materi/{materiId}/bab

Daftar bab dalam materi.

**Response 200:**
```json
[
  {
    "id": "string",
    "materiId": "string",
    "name": "string",
    "orderIndex": "number",
    "chapterCount": "number"
  }
]
```

---

### GET /api/v1/curriculum/bab/{babId}/chapters

Daftar chapter dalam bab.

**Response 200:**
```json
[
  {
    "id": "string",
    "babId": "string",
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
  "materiProgress": [
    {
      "materiId": "string",
      "materiName": "string",
      "completionPercentage": "number (0-100)",
      "babs": [
        {
          "babId": "string",
          "babName": "string",
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
    "materiLabel": "string | null (label materi asal untuk UTBK-style)"
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

### GET /api/v1/pretest/bab/{babId}/status

Cek apakah pre test sudah dikerjakan untuk bab ini.

**Response 200:**
```json
{
  "completed": "boolean",
  "startChapterIndex": "number (0-based, jika completed)"
}
```

---

### GET /api/v1/pretest/bab/{babId}/questions

Ambil soal pre test untuk bab. **Backend mengambil soal dari Bank Soal per chapter sesuai distribusi yang dikonfigurasi admin.**

**Logika backend:**
1. Baca config distribusi Pre Test untuk bab ini
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
  "babId": "string",
  "answers": [
    { "questionId": "string", "selectedOptionId": "string" }
  ]
}
```

**Response 200:**
```json
{
  "babId": "string",
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
- Pre test hanya bisa dikerjakan **1 kali** per bab per siswa

---

## 6. Post Test

### GET /api/v1/posttest/bab/{babId}/status

Cek status post test untuk bab.

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

### GET /api/v1/posttest/bab/{babId}/questions

Ambil soal post test untuk bab. **Backend mengambil soal dari Bank Soal per chapter sesuai distribusi yang dikonfigurasi admin.**

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
  "babId": "string",
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
  "nextBabUnlocked": "boolean",
  "nextBabId": "string | null",
  "remediationChapterIds": ["string"],
  "remediationChapterNames": ["string"]
}
```

**Logika backend:**
- Hitung skor berdasarkan jawaban benar: `(benar / total) * 100`
- Bandingkan dengan `passingGrade` dari config admin (bukan hardcoded)
- Jika `skor >= passingGrade` → PASSED, unlock bab berikutnya, berikan XP
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

## 8. Admin — Curriculum CRUD

### POST /api/v1/admin/curriculum/materi

Buat materi baru.

**Request Body:**
```json
{
  "name": "string (max 100)",
  "description": "string (max 500, optional)",
  "semesterId": "string"
}
```

**Response 201:** Object Materi

---

### PUT /api/v1/admin/curriculum/materi/{materiId}

Update materi.

**Request Body:**
```json
{
  "name": "string (optional)",
  "description": "string (optional)"
}
```

---

### DELETE /api/v1/admin/curriculum/materi/{materiId}

Hapus materi (cascade delete bab dan chapter di dalamnya).

---

### POST /api/v1/admin/curriculum/bab

**Request Body:**
```json
{
  "materiId": "string",
  "name": "string",
  "orderIndex": "number"
}
```

---

### PUT /api/v1/admin/curriculum/bab/{babId}

### DELETE /api/v1/admin/curriculum/bab/{babId}

---

### POST /api/v1/admin/curriculum/chapter

**Request Body:**
```json
{
  "babId": "string",
  "name": "string",
  "orderIndex": "number",
  "videoUrl": "string",
  "passingGrade": "number (0-100, default 70)"
}
```

---

### PUT /api/v1/admin/curriculum/chapter/{chapterId}

### DELETE /api/v1/admin/curriculum/chapter/{chapterId}

---

## 9. Admin — Quiz Builder

### GET /api/v1/admin/quiz/chapter/{targetId}/patterns

Ambil daftar topik soal (QuestionPattern) untuk chapter atau bab.

**Query Params (optional):**
- `type`: `CHAPTER_QUIZ | PRE_TEST | POST_TEST` (default: CHAPTER_QUIZ)

**Response 200:**
```json
[
  {
    "id": "string",
    "chapterId": "string | null",
    "babId": "string | null",
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
  "chapterId": "string (untuk CHAPTER_QUIZ, atau babId untuk PRE/POST)",
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
    "options": [
      { "id": "string", "text": "string", "order": "number" }
    ],
    "correctOptionId": "string",
    "xpPerQuestion": "number"
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
  "text": "string (max 1000)",
  "options": [
    { "text": "string (max 500)", "order": "number" }
  ],
  "correctOptionIndex": "number (0-based index dari options array)",
  "xpPerQuestion": "number (0-1000, default 0)",
  "weight": "number (1-10, bobot soal terhadap skor total, default 1)"
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
  "weight": "number (1-10)"
}
```

---

### DELETE /api/v1/admin/quiz/questions/{questionId}

---

## 10. Admin — Quiz Config (Pre Test & Post Test)

### GET /api/v1/admin/quiz/config/{babId}?type={quizType}

Ambil konfigurasi Pre Test atau Post Test untuk suatu bab.

**Query Params:**
- `type`: `PRE_TEST | POST_TEST` (required)

**Response 200:**
```json
{
  "id": "string",
  "babId": "string",
  "quizType": "PRE_TEST | POST_TEST",
  "passingGrade": "number (0-100, default 70, hanya untuk POST_TEST)",
  "distribution": [
    {
      "chapterId": "string",
      "chapterName": "string",
      "availableQuestions": "number (total soal di Bank Soal chapter ini)",
      "questionsToTake": "number (berapa soal yang diambil untuk test)"
    }
  ],
  "totalQuestionsPerSession": "number (sum of all questionsToTake)"
}
```

---

### PUT /api/v1/admin/quiz/config/{babId}

Simpan/update konfigurasi Pre Test atau Post Test.

**Request Body:**
```json
{
  "quizType": "PRE_TEST | POST_TEST",
  "passingGrade": "number (0-100, tidak berlaku untuk PRE_TEST)",
  "distribution": [
    {
      "chapterId": "string",
      "questionsToTake": "number (0 sampai availableQuestions)"
    }
  ]
}
```

**Response 200:**
```json
{ "message": "Konfigurasi berhasil disimpan" }
```

**Logika backend:**
- Validasi: `questionsToTake` tidak boleh melebihi jumlah soal yang tersedia di chapter tersebut
- Validasi: total soal minimal 1
- Untuk PRE_TEST: abaikan field `passingGrade`

---

### Cara Backend Mengambil Soal untuk Pre/Post Test

Ketika siswa mengerjakan Pre Test atau Post Test:

1. Backend baca config distribusi untuk bab tersebut
2. Untuk setiap entry di `distribution`:
   - Ambil `questionsToTake` soal secara acak dari Bank Soal chapter yang bersangkutan
   - Soal diambil dari semua topik (QuestionPattern) yang ada di chapter tersebut
3. Gabungkan semua soal → kirim ke frontend (tanpa correctOptionId)
4. Saat siswa submit → backend cek jawaban benar per chapter untuk menentukan:
   - **Pre Test**: placement (chapter pertama yang soalnya salah)
   - **Post Test**: skor dan lulus/gagal berdasarkan passingGrade

---

**Catatan Penting:**
- Pre Test dan Post Test **TIDAK punya Bank Soal sendiri**
- Soalnya diambil dari Bank Soal per chapter (yang dibuat admin via tab "Kuis Chapter")
- Jika chapter belum punya soal, Pre/Post Test tidak bisa dijalankan untuk chapter tersebut

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
      "totalXP": "number"
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

**Response 200:** Sama dengan format di section 3 (Student Progress).

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

## 14. Admin — Badge Management

### GET /api/v1/admin/badges

Daftar semua badge.

### POST /api/v1/admin/badges

Buat badge baru.

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "iconUrl": "string",
  "criteriaType": "XP_THRESHOLD | CHAPTER_COMPLETED | STREAK",
  "criteriaValue": "number"
}
```

### PUT /api/v1/admin/badges/{badgeId}

### DELETE /api/v1/admin/badges/{badgeId}

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

### State Machine — Bab Status

```
LOCKED → UNLOCKED (Post Test bab sebelumnya lulus, atau bab pertama dalam materi)
UNLOCKED → IN_PROGRESS (Pre Test dikerjakan)
IN_PROGRESS → COMPLETED (Post Test lulus)
```

### Flow Progresif

1. Bab pertama dalam materi selalu UNLOCKED
2. Bab berikutnya LOCKED sampai Post Test bab sebelumnya PASSED
3. Masuk bab → harus Pre Test dulu (1 kali, tidak bisa diulang)
4. Chapter sequential: chapter N+1 baru UNLOCKED setelah chapter N COMPLETED
5. Semua chapter COMPLETED → Post Test available
6. Post Test lulus → bab berikutnya UNLOCKED

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
- Role-based access: STUDENT hanya bisa akses /api/v1/student/*, /api/v1/quiz/*, /api/v1/curriculum/*, /api/v1/gamification/*
- ADMIN bisa akses /api/v1/admin/* dan semua endpoint student
