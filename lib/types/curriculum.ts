export interface Subject {
  id: string;
  name: string; // max 100 chars
  description?: string; // max 500 chars
  orderIndex: number;
  sectionCount: number;
  isPublished: boolean;
  semesterId: string;
}

export interface Section {
  id: string;
  subjectId: string;
  name: string;
  orderIndex: number;
  chapterCount: number;
}

export interface Chapter {
  id: string;
  sectionId: string;
  name: string;
  orderIndex: number;
  videoUrl: string;
  passingGrade: number; // 0-100
}
