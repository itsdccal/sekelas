import { create } from 'zustand';

interface Semester {
  id: string;
  name: string;
}

interface UIState {
  sidebarOpen: boolean;
  selectedSemesterId: string | null;
  availableSemesters: Semester[];

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSelectedSemester: (semesterId: string) => void;
  setAvailableSemesters: (semesters: Semester[]) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  selectedSemesterId: null,
  availableSemesters: [],

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  setSidebarOpen: (open: boolean) => {
    set({ sidebarOpen: open });
  },

  setSelectedSemester: (semesterId: string) => {
    set({ selectedSemesterId: semesterId });
  },

  setAvailableSemesters: (semesters: Semester[]) => {
    set({ availableSemesters: semesters });
  },
}));
