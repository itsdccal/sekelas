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

### GET /api/v1/quiz/chapter/{chapterId}/questions

Ambil soal quiz untuk chapter. Backend mengambil 1 soal acak dari setiap topik (QuestionPattern).

**Response 200:**
```json
[
  {
    "id": "string",
    "patternId": "string",
    "text": "string",
    "options": [
      { "id": "string", "text": "string", "order": "number" }
    ]
  }
]
```

> **Catatan:** `correctOptionId` TIDAK dikirim ke student. Hanya backend yang tahu jawaban benar.

---

### POST /api/v1/quiz/submit

Submit jawaban quiz chapter.

**Request Body:**
```json
{
  "chapterId": "string",
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
  "passingGrade": "number (0-100)",
  "nextStatus": "COMPLETED | REMEDIATION_REQUIRED",
  "message": "string",
  "xpEarned": "number"
}
```

**Logika backend:**
- Hitung skor: `(jawaban benar / total soal) * 100`
- Jika `skor >= passingGrade` → PASSED, status chapter = COMPLETED, berikan XP
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

Ambil soal pre test untuk bab. Backend ambil soal dari topik Pre Test bab ini.

**Response 200:**
```json
[
  {
    "id": "string",
    "patternId": "string",
    "text": "string",
    "options": [
      { "id": "string", "text": "string", "order": "number" }
    ]
  }
]
```

> **Catatan:** Sama seperti quiz, `correctOptionId` TIDAK dikirim ke student.

---

### POST /api/v1/pretest/submit

Submit jawaban pre test. Backend hitung skor untuk tentukan placement.

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
- Hitung berapa soal yang dijawab benar
- Soal disusun berdasarkan chapter level (soal chapter 1, soal chapter 2, dst)
- Placement ditentukan: siswa mulai dari chapter pertama yang soalnya dijawab salah
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

Ambil soal post test untuk bab.

**Response 200:**
```json
[
  {
    "id": "string",
    "patternId": "string",
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
  "passingGrade": "number (0-100)",
  "xpEarned": "number",
  "message": "string",
  "nextBabUnlocked": "boolean",
  "nextBabId": "string | null",
  "remediationChapterIds": ["string"] 
}
```

**Logika backend:**
- Hitung skor berdasarkan jawaban benar × (100 / total soal)
- Jika `skor >= passingGrade` → PASSED, unlock bab berikutnya, berikan XP
- Jika `skor < passingGrade` → FAILED, kirim `remediationChapterIds` (chapter yang soalnya dijawab salah)
- `remediationChapterIds`: ID chapter yang terkait soal yang dijawab salah. Siswa harus tonton ulang video chapter ini sampai 100% sebelum bisa retake

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
  "xpPerQuestion": "number (0-1000, default 0)"
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
  "xpPerQuestion": "number"
}
```

---

### DELETE /api/v1/admin/quiz/questions/{questionId}

---

## 10. Admin — Quiz Config

### GET /api/v1/admin/quiz/config/{targetId}?type={quizType}

Ambil konfigurasi quiz/test.

**Response 200:**
```json
{
  "id": "string",
  "targetId": "string (chapterId atau babId)",
  "quizType": "CHAPTER_QUIZ | PRE_TEST | POST_TEST",
  "passingGrade": "number (0-100, default 70)",
  "questionsPerSession": "number (jumlah soal yang tampil per sesi)",
  "totalPotentialXP": "number (calculated: sum of all question XP)"
}
```

---

### PUT /api/v1/admin/quiz/config/{targetId}

Update konfigurasi quiz/test.

**Request Body:**
```json
{
  "quizType": "CHAPTER_QUIZ | PRE_TEST | POST_TEST",
  "passingGrade": "number (0-100, tidak berlaku untuk PRE_TEST)",
  "questionsPerSession": "number (1-50)"
}
```

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

- Soal Pre Test dikaitkan dengan level chapter (via topik/pattern)
- Backend analisa jawaban benar per level chapter
- Siswa ditempatkan mulai dari chapter pertama yang **belum dipahami** (soal salah)
- Chapter sebelumnya otomatis COMPLETED + XP diberikan

### Remediation (Post Test Gagal)

- Backend identifikasi chapter mana yang soalnya dijawab salah
- Kirim `remediationChapterIds` ke frontend
- Siswa harus tonton ulang video chapter tersebut sampai 100%
- Frontend cek via GET /video/chapter/{id}/info → `watchedPercentage >= 100`
- Setelah semua remediation video ditonton → siswa bisa retake Post Test

### XP Calculation

- Quiz/Post Test: XP = sum(xpPerQuestion) untuk soal yang dijawab benar
- Pre Test skip: XP = total XP dari semua chapter yang dilewati
- Video completion: bisa berikan XP tambahan (configurable)

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
