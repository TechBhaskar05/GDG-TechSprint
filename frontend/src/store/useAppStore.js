import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * APP STORE
 * Manages global navigation, issue context, and spatial data.
 * Updated with Persist middleware to handle browser refreshes seamlessly.
 */
export const useAppStore = create(
  persist(
    (set) => ({
      // Navigation state: tracks which screen is currently rendered
      currentScreen: "landing",

      // Selected issue for authority detail view or citizen discovery
      selectedIssue: null,

      // Holds { lat, lng } captured for ward assignment
      selectedLocation: null,

      // Persisted image preview (for UI only)
      reportImage: null,

      // Persisted actual File object (Note: Files cannot be persisted in localStorage)
      reportFile: null,

      // Dynamic address for Header
      currentAddress: "Detecting Location...",

      /**
       * Navigate to a screen with an optional data payload.
       */
      navigate: (screen, data = null) =>
        set((state) => ({
          currentScreen: screen,
          selectedLocation: data !== null ? data : state.selectedLocation,
        })),

      /**
       * Update human-readable address
       */
      setCurrentAddress: (address) =>
        set({
          currentAddress: address,
        }),

      /**
       * Switch to the issue detail screen
       */
      viewIssue: (issue) =>
        set({
          selectedIssue: issue,
          currentScreen: "issue-detail",
        }),

      /**
       * Reset selected issue
       */
      clearSelectedIssue: () =>
        set({
          selectedIssue: null,
        }),

      /**
       * Location handlers
       */
      setSelectedLocation: (location) =>
        set({
          selectedLocation: location,
        }),

      clearSelectedLocation: () =>
        set({
          selectedLocation: null,
          currentAddress: "Lucknow, Uttar Pradesh",
        }),

      /**
       * Report image (preview)
       */
      setReportImage: (image) =>
        set({
          reportImage: image,
        }),

      clearReportImage: () =>
        set({
          reportImage: null,
        }),

      /**
       * Report file
       */
      setReportFile: (file) =>
        set({
          reportFile: file,
        }),

      clearReportFile: () =>
        set({
          reportFile: null,
        }),

      /**
       * Reset full report context (after submit / cancel)
       */
      clearReportContext: () =>
        set({
          selectedLocation: null,
          reportImage: null,
          reportFile: null,
          editingIssue: null,
          currentAddress: "Lucknow, Uttar Pradesh",
        }),
    }),
    {
      name: "civicfix-app-storage", // Unique name for localStorage key
      storage: createJSONStorage(() => localStorage),
      // PARTIALIZE: We exclude 'reportFile' because File objects cannot be stringified
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => !["reportFile"].includes(key))
        ),
    }
  )
);
