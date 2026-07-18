export interface User {
  id: string;
  email: string;
  name: string;
  firstName: string;
  role: 'STUDENT' | 'ADMIN';
  kelas?: string;
}

export interface LoginRequest {
  email: string; // max 100 chars
  password: string; // min 8, max 64 chars
}

export interface LoginResponse {
  user: User;
  expiresAt: string; // ISO datetime
}
