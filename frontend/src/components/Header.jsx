import {
  MapPin,
  User,
  Moon,
  Sun,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Map as MapIcon,
} from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";
import { useAppStore } from "../store/useAppStore";
import { useAuthStore } from "../store/useAuthStore";

export function Header() {
  // 1. Pull dynamic data from stabilized stores
  const userRole = useAuthStore((state) => state.userRole);
  const user = useAuthStore((state) => state.user); // Accessing user profile for name/email
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const toggleDarkMode = useThemeStore((state) => state.toggleDarkMode);
  const onNavigate = useAppStore((state) => state.navigate);

  // 2. Consume the dynamic address (detected via GPS in App.jsx)
  const currentAddress = useAppStore((state) => state.currentAddress);

  const handleLogout = () => {
    logout();
    onNavigate("landing");
  };

  /**
   * REHYDRATION GUARD:
   * Prevents layout shift during store rehydration on page refresh.
   */
  if (!isAuthenticated && !userRole) return null;

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Branding */}
            <button
              onClick={() =>
                onNavigate(
                  userRole === "authority"
                    ? "authority-dashboard"
                    : "citizen-dashboard"
                )
              }
              className="flex items-center gap-2 group"
            >
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform duration-200">
                <span className="text-white font-black text-sm">CF</span>
              </div>
              <span className="text-slate-900 dark:text-white font-black text-lg tracking-tighter">
                CivicFix AI
              </span>
            </button>

            {/* DYNAMIC LOCATION LABEL */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
              <MapPin className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                {currentAddress !== "Detecting Location..."
                  ? currentAddress
                  : user?.city || "Locating..."}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Contextual Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 mr-2">
              <button
                onClick={() =>
                  onNavigate(
                    userRole === "authority"
                      ? "authority-dashboard"
                      : "citizen-dashboard"
                  )
                }
                className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => onNavigate("map-view")}
                className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Map View
              </button>
            </nav>

            <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800" />

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* User Profile Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500/50 transition-all">
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs uppercase">
                  {user?.name?.charAt(0) || userRole?.charAt(0) || "U"}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all z-50 overflow-hidden">
                <div className="p-4">
                  <div className="mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Signed in as
                    </p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {user?.email || "Civic User"}
                    </p>
                    <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-tighter">
                      {userRole} Account
                    </div>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() =>
                        onNavigate(
                          userRole === "authority"
                            ? "authority-dashboard"
                            : "citizen-dashboard"
                        )
                      }
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => onNavigate("map-view")}
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
                    >
                      <MapIcon className="w-4 h-4" />
                      Live Map
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2.5 mt-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg text-xs font-black uppercase tracking-widest transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
