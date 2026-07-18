export interface Materi {
  id: string;
  name: string; // max 100 chars
  description?: string; // max 500 chars
  orderIndex: number;
  babCount: number;
  isPublished: boolean;
  semesterId: string;
}

export interface Bab {
  id: string;
  materiId: string;
  name: string;
  orderIndex: number;
  chapterCount: number;
}

export interface Chapter {
  id: string;
  babId: string;
  name: string;
  orderIndex: number;
  videoUrl: string;
  passingGrade: number; // 0-100
}
