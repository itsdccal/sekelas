export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/**
 * Validate login form fields.
 * - email: required, max 100 chars
 * - password: required, min 8, max 64 chars
 */
export function validateLogin(email: string, password: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (!email || email.trim().length === 0) {
    errors.email = 'Email wajib diisi';
  } else if (email.length > 100) {
    errors.email = 'Email maksimal 100 karakter';
  }

  if (!password || password.length === 0) {
    errors.password = 'Password wajib diisi';
  } else if (password.length > 64) {
    errors.password = 'Password maksimal 64 karakter';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Validate Subject form fields.
 * - name: required, max 100 chars
 * - description: optional, max 500 chars
 */
export function validateSubject(name: string, description?: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (!name || name.trim().length === 0) {
    errors.name = 'Nama materi wajib diisi';
  } else if (name.length > 100) {
    errors.name = 'Nama materi maksimal 100 karakter';
  }

  if (description !== undefined && description !== null && description.length > 500) {
    errors.description = 'Deskripsi maksimal 500 karakter';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Validate Question form fields.
 * - text: required, max 1000 chars
 * - options: 4-6 non-empty options, each max 500 chars
 * - correctOption: must be selected (not null/undefined)
 */
export function validateQuestion(
  text: string,
  options: string[],
  correctOption: string | null | undefined
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!text || text.trim().length === 0) {
    errors.text = 'Pertanyaan wajib diisi';
  } else if (text.length > 1000) {
    errors.text = 'Pertanyaan maksimal 1000 karakter';
  }

  if (options.length < 4 || options.length > 6) {
    errors.options = 'Jumlah opsi harus antara 4 sampai 6';
  } else {
    const emptyIndex = options.findIndex((opt) => !opt || opt.trim().length === 0);
    if (emptyIndex !== -1) {
      errors.options = `Opsi ${emptyIndex + 1} tidak boleh kosong`;
    } else {
      const tooLongIndex = options.findIndex((opt) => opt.length > 500);
      if (tooLongIndex !== -1) {
        errors.options = `Opsi ${tooLongIndex + 1} maksimal 500 karakter`;
      }
    }
  }

  if (correctOption === null || correctOption === undefined) {
    errors.correctOption = 'Jawaban benar wajib dipilih';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Validate Override/Penyesuaian Nilai form fields.
 * - reason: required, min 10 chars, max 500 chars
 * - action: required
 * - score: required if action is FORCE_COMPLETE, 0-100 integer
 */
export function validateOverrideReason(reason: string): ValidationResult {
  const errors: Record<string, string> = {};

  if (!reason || reason.trim().length === 0) {
    errors.reason = 'Alasan wajib diisi';
  } else if (reason.length < 10) {
    errors.reason = 'Alasan minimal 10 karakter';
  } else if (reason.length > 500) {
    errors.reason = 'Alasan maksimal 500 karakter';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Validate override score field.
 * - score: required for FORCE_COMPLETE, 0–100 integer
 */
export function validateOverrideScore(score: string, required: boolean): ValidationResult {
  const errors: Record<string, string> = {};

  if (!required) {
    return { valid: true, errors };
  }

  if (score === '' || score === null || score === undefined) {
    errors.score = 'Skor wajib diisi untuk meluluskan chapter';
  } else {
    const numScore = Number(score);
    if (isNaN(numScore)) {
      errors.score = 'Skor harus berupa angka';
    } else if (!Number.isInteger(numScore)) {
      errors.score = 'Skor harus bilangan bulat';
    } else if (numScore < 0 || numScore > 100) {
      errors.score = 'Skor harus antara 0–100';
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Validate QuestionPattern patternCode.
 * - code: required, max 50 chars
 * - Must be unique within a chapter (checked against existingCodes)
 */
export function validatePatternCode(
  code: string,
  existingCodes: string[]
): ValidationResult {
  const errors: Record<string, string> = {};

  if (!code || code.trim().length === 0) {
    errors.code = 'Kode pola wajib diisi';
  } else if (code.length > 50) {
    errors.code = 'Kode pola maksimal 50 karakter';
  } else if (existingCodes.includes(code)) {
    errors.code = 'Kode pola sudah digunakan dalam chapter ini';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export interface VideoFileValidationResult {
  valid: boolean;
  error?: string;
}

const ALLOWED_VIDEO_MIME_TYPES = ['video/mp4', 'video/webm'];
const MAX_VIDEO_SIZE_BYTES = 500 * 1024 * 1024; // 500MB

/**
 * Validate video file for upload.
 * - Format: MP4 or WebM only (check MIME type)
 * - Size: max 500MB
 * - Returns specific error reason
 */
export function validateVideoFile(
  mimeType: string,
  sizeInBytes: number
): VideoFileValidationResult {
  if (!ALLOWED_VIDEO_MIME_TYPES.includes(mimeType)) {
    return {
      valid: false,
      error: 'Format video tidak valid. Hanya MP4 dan WebM yang diizinkan',
    };
  }

  if (sizeInBytes > MAX_VIDEO_SIZE_BYTES) {
    return {
      valid: false,
      error: 'Ukuran video melebihi batas maksimal 500MB',
    };
  }

  return { valid: true };
}
