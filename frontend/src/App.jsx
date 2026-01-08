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

import { Toaster } from "react-hot-toast";

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

          // Priority logic to skip road codes like "NH30"
          const cityName =
            data.address.city ||
            data.address.town ||
            data.address.village ||
            data.address.municipality ||
            data.address.district ||
            data.address.state_district ||
            "Prayagraj";

          setCurrentAddress(cityName);
          if (isAuthenticated) {
            setUserCity(cityName);
          }
        } catch (err) {
          console.error("Geocoding failed:", err);
          setCurrentAddress("Prayagraj");
        }
      },
      (err) => {
        console.warn("GPS Access Denied:", err.message);
        setCurrentAddress("Prayagraj");
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, [isAuthenticated, setCurrentAddress, setSelectedLocation, setUserCity]);

  /**
   * SESSION & LOCATION REHYDRATION
   */
  useEffect(() => {
    const savedRole = localStorage.getItem("role");
    const savedToken = localStorage.getItem("accessToken");

    if (savedRole && savedToken && !isAuthenticated) {
      login(savedRole);
    }

    if (isAuthenticated || savedToken) {
      detectLocation();
    }
  }, [isAuthenticated, login, detectLocation]);

  /**
   * AUTH HANDLERS
   */
  const handleLogin = (role, userData) => {
    login(role, userData);
    navigate(role === "citizen" ? "citizen-dashboard" : "authority-dashboard");
  };

  const handleLogout = async () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    localStorage.removeItem("civicfix-app-storage");
    localStorage.removeItem("civicfix-auth-storage");

    await logout();
    navigate("landing");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

      {/* 1. Landing & Auth Screens (No Header) */}
      {currentScreen === "landing" && <Landing onNavigate={navigate} />}
      {currentScreen === "verify-otp" && <VerifyOtp />}
      {(currentScreen === "login" || currentScreen === "signup") && (
        <Login
          isSignup={currentScreen === "signup"}
          onLogin={handleLogin}
          onNavigate={navigate}
        />
      )}

      {/* 2. Citizen Flow - Headers are managed inside the components */}
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

      {/* 3. Shared Features */}
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

      {/* 4. Authority Flow - Ensure all components render the Header */}
      {currentScreen === "authority-dashboard" && (
        <AuthorityDashboard
          onNavigate={navigate}
          onLogout={handleLogout}
          onViewIssue={viewIssue}
        />
      )}
      {currentScreen === "complaint-management" && (
        <ComplaintManagement
          onNavigate={navigate}
          onViewIssue={viewIssue}
          onLogout={handleLogout} // Passes logout to allow header to function
        />
      )}
      {currentScreen === "analytics" && (
        <Analytics
          onNavigate={navigate}
          onLogout={handleLogout} // FIXED: Analytics now has access to header actions
        />
      )}
    </div>
  );
}
