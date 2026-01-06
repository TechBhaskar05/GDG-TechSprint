import { create } from "zustand";

/**
 * AUTH STORE
 * Manages user session and role-based access.
 * Includes rehydration logic to persist state on page refresh.
 */
export const useAuthStore = create((set) => ({
  // Auth state
  userRole: localStorage.getItem("role") || null, // 'citizen' | 'authority' | null

  isAuthenticated: false,
  login: (role) => {
    set({
      userRole: role,
      isAuthenticated: true,
    });

    return {
      role: role,
      message: "Login successful",
    };
  },

  /**
   * LOGOUT
   * Clears all storage and resets state.
   */
  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");

    set({
      userRole: null,
      isAuthenticated: false,
    });
  },

  /**
   * REHYDRATE (Optional Helper)
   * Manually force a sync with localStorage if needed.
   */
  checkAuth: () => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("accessToken");

    set({
      userRole: role || null,
      isAuthenticated: !!token,
    });
  },
}));
