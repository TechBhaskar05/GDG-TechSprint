import { useEffect, useCallback } from "react";
import { Landing } from "./components/Landing";
import { Login } from "./components/Login";
import { CitizenDashboard } from "./components/CitizenDashboard";
import { ReportIssue } from "./components/ReportIssue";
import { MapView } from "./components/MapView";
import { IssueDetail } from "./components/IssueDetail";
import { AuthorityDashboard } from "./components/AuthorityDashboard";
import { ComplaintManagement } from "./components/ComplaintManagement";
import { Analytics } from "./components/Analytics";
import { useAppStore } from "./store/useAppStore";
import { useAuthStore } from "./store/useAuthStore";
import VerifyOtp from "./components/VerifyOtp";

import { Toaster } from "react-hot-toast"

export default function App() {
  // --- App Store State ---
  const currentScreen = useAppStore((state) => state.currentScreen);
  const navigate = useAppStore((state) => state.navigate);
  const selectedIssue = useAppStore((state) => state.selectedIssue);
  const viewIssue = useAppStore((state) => state.viewIssue);
  const setCurrentAddress = useAppStore((state) => state.setCurrentAddress);
  const setSelectedLocation = useAppStore((state) => state.setSelectedLocation);

  // --- Auth Store State ---
  const userRole = useAuthStore((state) => state.userRole);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const setUserCity = useAuthStore((state) => state.setUserCity);

  /**
   * MEMOIZED LOCATION DETECTION
   * Resolves the "NH30" and "Lucknow" fallback issues.
   */
  const detectLocation = useCallback(() => {
    if (!("geolocation" in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setSelectedLocation({ lat: latitude, lng: longitude });

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();

          // FIX: Priority logic to find the city/district and skip road codes like "NH30"
          const cityName =
            data.address.city ||
            data.address.town ||
            data.address.village ||
            data.address.municipality ||
            data.address.district ||
            data.address.state_district ||
            "Prayagraj"; // Default to your current city

          // Sync location to both global stores
          setCurrentAddress(cityName);
          if (isAuthenticated) {
            setUserCity(cityName);
          }
        } catch (err) {
          console.error("Geocoding failed:", err);
          setCurrentAddress("Prayagraj"); // Fallback to Prayagraj on error
        }
      },
      (err) => {
        console.warn("GPS Access Denied:", err.message);
        setCurrentAddress("Prayagraj"); // Fallback if user blocks GPS
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, [isAuthenticated, setCurrentAddress, setSelectedLocation, setUserCity]);

  /**
   * SESSION & LOCATION REHYDRATION
   * Ensures GPS runs once the user is authenticated.
   */
  useEffect(() => {
    const savedRole = localStorage.getItem("role");
    const savedToken = localStorage.getItem("accessToken");

    // 1. Restore Auth Session if token exists
    if (savedRole && savedToken && !isAuthenticated) {
      login(savedRole);
    }

    // 2. Trigger GPS Detection for logged-in users
    if (isAuthenticated || savedToken) {
      detectLocation();
    }
  }, [isAuthenticated, login, detectLocation]);

  /**
   * AUTH HANDLERS
   */
  const handleLogin = (role, userData) => {
    login(role, userData);
    // Explicit navigation on fresh login
    navigate(role === "citizen" ? "citizen-dashboard" : "authority-dashboard");
  };

  const handleLogout = async () => {
    // Thorough cleanup of all local persistence
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    localStorage.removeItem("civicfix-app-storage");
    localStorage.removeItem("civicfix-auth-storage");

    await logout();
    navigate("landing");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <Toaster
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        duration: 4000,
      }}
    />
      {currentScreen === "landing" && <Landing onNavigate={navigate} />}
      {currentScreen === "verify-otp" && <VerifyOtp />}
      {(currentScreen === "login" || currentScreen === "signup") && (
        <Login
          isSignup={currentScreen === "signup"}
          onLogin={handleLogin}
          onNavigate={navigate}
        />
      )}

      {/* Citizen Dashboard Flow */}
      {currentScreen === "citizen-dashboard" && (
        <CitizenDashboard
          onNavigate={navigate}
          onLogout={handleLogout}
          onViewIssue={viewIssue}
        />
      )}
      {currentScreen === "report-issue" && (
        <ReportIssue onNavigate={navigate} />
      )}

      {/* Shared Features */}
      {currentScreen === "map-view" && (
        <MapView
          onNavigate={navigate}
          onViewIssue={viewIssue}
          userRole={userRole}
          onLogout={handleLogout}
        />
      )}
      {currentScreen === "issue-detail" && selectedIssue && (
        <IssueDetail
          issue={selectedIssue}
          onNavigate={navigate}
          userRole={userRole}
        />
      )}

      {/* Authority Flow */}
      {currentScreen === "authority-dashboard" && (
        <AuthorityDashboard
          onNavigate={navigate}
          onLogout={handleLogout}
          onViewIssue={viewIssue}
        />
      )}
      {currentScreen === "complaint-management" && (
        <ComplaintManagement onNavigate={navigate} onViewIssue={viewIssue} />
      )}
      {currentScreen === "analytics" && <Analytics onNavigate={navigate} />}
    </div>
  );
}
