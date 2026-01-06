import { create } from "zustand";

/**
 * APP STORE
 * Manages global navigation, issue context, and spatial data.
 */
export const useAppStore = create((set) => ({
  // Navigation state: tracks which screen is currently rendered
  currentScreen: "landing",

  // Selected issue for authority detail view or authority dashboard
  selectedIssue: null,

  // Holds {lat, lng} captured for ward assignment
  selectedLocation: null,

  // 1. ADD: Dynamic address for the Header (Replaces hardcoded Mumbai)
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
   * 2. ADD: Action to update the human-readable address
   * Call this from the MapView or Geolocation handler.
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
   * Resets the selected issue context
   */
  clearSelectedIssue: () =>
    set({
      selectedIssue: null,
    }),

  /**
   * Resets the location data after submission
   */
  clearSelectedLocation: () =>
    set({
      selectedLocation: null,
      currentAddress: "Prayagraj, Uttar Pradesh", // Default reset location
    }),

  /**
   * Manual update for location
   */
  setSelectedLocation: (location) =>
    set({
      selectedLocation: location,
    }),
}));
