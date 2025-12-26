import { create } from 'zustand';

export const useThemeStore = create((set) => ({
  isDarkMode: (() => {
    // Check localStorage first
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return saved === 'true';
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  })(),

  toggleDarkMode: () =>
    set((state) => {
      const next = !state.isDarkMode;

      // Update document class and localStorage
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('darkMode', 'false');
      }

      return { isDarkMode: next };
    }),
}));
