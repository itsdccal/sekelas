import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from './uiStore';

describe('uiStore', () => {
  beforeEach(() => {
    // Reset store state between tests
    useUIStore.setState({
      sidebarOpen: false,
      selectedSemesterId: null,
      availableSemesters: [],
    });
  });

  describe('initial state', () => {
    it('should have sidebar closed by default', () => {
      const state = useUIStore.getState();
      expect(state.sidebarOpen).toBe(false);
    });

    it('should have no semester selected by default', () => {
      const state = useUIStore.getState();
      expect(state.selectedSemesterId).toBeNull();
    });

    it('should have empty available semesters by default', () => {
      const state = useUIStore.getState();
      expect(state.availableSemesters).toEqual([]);
    });
  });

  describe('toggleSidebar', () => {
    it('should open sidebar when closed', () => {
      useUIStore.getState().toggleSidebar();
      expect(useUIStore.getState().sidebarOpen).toBe(true);
    });

    it('should close sidebar when open', () => {
      useUIStore.setState({ sidebarOpen: true });
      useUIStore.getState().toggleSidebar();
      expect(useUIStore.getState().sidebarOpen).toBe(false);
    });
  });

  describe('setSidebarOpen', () => {
    it('should explicitly set sidebar open', () => {
      useUIStore.getState().setSidebarOpen(true);
      expect(useUIStore.getState().sidebarOpen).toBe(true);
    });

    it('should explicitly set sidebar closed', () => {
      useUIStore.setState({ sidebarOpen: true });
      useUIStore.getState().setSidebarOpen(false);
      expect(useUIStore.getState().sidebarOpen).toBe(false);
    });
  });

  describe('setSelectedSemester', () => {
    it('should set selected semester id', () => {
      useUIStore.getState().setSelectedSemester('semester-1');
      expect(useUIStore.getState().selectedSemesterId).toBe('semester-1');
    });

    it('should update selected semester when changed', () => {
      useUIStore.getState().setSelectedSemester('semester-1');
      useUIStore.getState().setSelectedSemester('semester-2');
      expect(useUIStore.getState().selectedSemesterId).toBe('semester-2');
    });
  });

  describe('setAvailableSemesters', () => {
    it('should set available semesters', () => {
      const semesters = [
        { id: 'sem-1', name: 'Semester 1' },
        { id: 'sem-2', name: 'Semester 2' },
      ];
      useUIStore.getState().setAvailableSemesters(semesters);
      expect(useUIStore.getState().availableSemesters).toEqual(semesters);
    });

    it('should replace existing semesters', () => {
      useUIStore.setState({
        availableSemesters: [{ id: 'old', name: 'Old' }],
      });
      const newSemesters = [{ id: 'new', name: 'New Semester' }];
      useUIStore.getState().setAvailableSemesters(newSemesters);
      expect(useUIStore.getState().availableSemesters).toEqual(newSemesters);
    });
  });
});
