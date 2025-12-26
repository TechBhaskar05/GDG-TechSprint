import { create } from 'zustand';

export const useAppStore = create((set) => ({
  // Navigation state
  currentScreen: 'landing',

  // Selected issue for detail view
  selectedIssue: null,

  // Navigate to a screen
  navigate: (screen) =>
    set({
      currentScreen: screen,
    }),

  // View issue detail
  viewIssue: (issue) =>
    set({
      selectedIssue: issue,
      currentScreen: 'issue-detail',
    }),

  // Clear selected issue (optional helper)
  clearSelectedIssue: () =>
    set({
      selectedIssue: null,
    }),
}));
