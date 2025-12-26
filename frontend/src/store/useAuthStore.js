import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  // Auth state
  userRole: null, // 'citizen' | 'authority' | null
  isAuthenticated: false,

  // Login handler
  login: (role) =>
    set(() => ({
      userRole: role,
      isAuthenticated: true,
    })),

  // Logout handler
  logout: () =>
    set(() => ({
      userRole: null,
      isAuthenticated: false,
    })),
}));
