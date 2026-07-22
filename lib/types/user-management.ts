export type UserRole = 'STUDENT' | 'ADMIN';

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  kelas?: string; // Hanya untuk siswa
  isActive: boolean;
  createdAt: string; // ISO datetime
}

export interface CreateUserRequest {
  name: string; // min 2, max 100 chars
  email: string; // valid email, max 100 chars
  password: string; // min 8, max 64 chars
  role: UserRole;
  kelas?: string; // Wajib jika role = STUDENT
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: UserRole;
  kelas?: string;
  isActive?: boolean;
}
