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
import { useEffect } from "react";
import VerifyOtp from "./components/VerifyOtp";

export default function App() {
  const currentScreen = useAppStore((state) => state.currentScreen);
  const navigate = useAppStore((state) => state.navigate);
  const selectedIssue = useAppStore((state) => state.selectedIssue);
  const viewIssue = useAppStore((state) => state.viewIssue);

  const setCurrentAddress = useAppStore((state) => state.setCurrentAddress);
  const setSelectedLocation = useAppStore((state) => state.setSelectedLocation);

  const userRole = useAuthStore((state) => state.userRole);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);

  /**
   * 1. SESSION REHYDRATION & GPS DETECTION
   * This effect runs once on mount to restore the session and detect location.
   */
  useEffect(() => {
    const savedRole = localStorage.getItem("role");
    const savedToken = localStorage.getItem("accessToken");

    // A. Rehydration Logic: Prioritize existing session to prevent logout on refresh
    if (savedRole && savedToken) {
      if (!isAuthenticated) {
        login(savedRole); // Restore auth state in memory
      }

      // Only navigate if we are stuck on the landing/login screens
      if (currentScreen === "landing" || currentScreen === "login") {
        navigate(
          savedRole === "authority"
            ? "authority-dashboard"
            : "citizen-dashboard"
        );
      }
    }

    // B. GPS Detection: Triggered for authenticated citizens
    if (
      (isAuthenticated || savedToken) &&
      (userRole === "citizen" || savedRole === "citizen")
    ) {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setSelectedLocation({ lat: latitude, lng: longitude });

            try {
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
              );
              const data = await res.json();
              const cityName =
                data.address.city ||
                data.address.town ||
                data.address.suburb ||
                "Lucknow";
              setCurrentAddress(cityName); // Update dynamic header
            } catch (err) {
              console.error("Geocoding error:", err);
              setCurrentAddress("Lucknow");
            }
          },
          (err) => console.warn("GPS Blocked:", err.message)
        );
      }
    }
  }, [
    isAuthenticated,
    userRole,
    login,
    navigate,
    setCurrentAddress,
    setSelectedLocation,
  ]);

  const handleLogin = (role) => {
    login(role);
    navigate(role === "citizen" ? "citizen-dashboard" : "authority-dashboard");
  };

  const handleLogout = async () => {
    await logout();
    navigate("landing");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      {currentScreen === "landing" && <Landing onNavigate={navigate} />}
      {currentScreen === "verify-otp" && <VerifyOtp />}

      {(currentScreen === "login" || currentScreen === "signup") && (
        <Login
          isSignup={currentScreen === "signup"}
          onLogin={handleLogin}
          onNavigate={navigate}
        />
      )}

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
          onBack={() =>
            navigate(
              userRole === "authority"
                ? "authority-dashboard"
                : "citizen-dashboard"
            )
          }
          userRole={userRole}
        />
      )}

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
