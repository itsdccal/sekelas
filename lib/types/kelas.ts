export interface ClassRoom {
  id: string;
  name: string;
  studentCount: number;
  createdAt: string; // ISO datetime
}

export interface CreateClassRoomRequest {
  name: string;
}

export interface UpdateClassRoomRequest {
  name: string;
}
