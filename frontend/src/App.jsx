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
  // App state (Zustand)
  const currentScreen = useAppStore((state) => state.currentScreen);
  const navigate = useAppStore((state) => state.navigate);
  const selectedIssue = useAppStore((state) => state.selectedIssue);

  // IMPORTANT: use the ORIGINAL name for compatibility
  const viewIssue = useAppStore((state) => state.viewIssue);

  // Auth state (Zustand)
  const userRole = useAuthStore((state) => state.userRole);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("landing");
    }
  }, [isAuthenticated, navigate]);

  // Login handler (LOGIC UNCHANGED)
  const handleLogin = (role) => {
    login(role);

    if (role === "citizen") {
      navigate("citizen-dashboard");
    } else if (role === "authority") {
      navigate("authority-dashboard");
    }
  };

  // Logout handler (LOGIC UNCHANGED)
  const handleLogout = () => {
    logout();
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
        <ReportIssue
          onNavigate={navigate}
          onBack={() => navigate("citizen-dashboard")}
        />
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
