import { MapPin, User, Moon, Sun } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";
import { useAppStore } from "../store/useAppStore";
import { useAuthStore } from "../store/useAuthStore";

export function Header() {
  // 1. Pull dynamic data from stabilized stores
  const userRole = useAuthStore((state) => state.userRole);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const toggleDarkMode = useThemeStore((state) => state.toggleDarkMode);
  const onNavigate = useAppStore((state) => state.navigate);

  // 2. Consume the dynamic address (replaces hardcoded Mumbai)
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
    <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-700/60 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button
              onClick={() =>
                onNavigate(
                  userRole === "authority"
                    ? "authority-dashboard"
                    : "citizen-dashboard"
                )
              }
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
                <span className="text-white font-bold">CF</span>
              </div>
              <span className="text-slate-900 dark:text-white font-bold text-lg tracking-tight">
                CivicFix AI
              </span>
            </button>

            {/* DYNAMIC LOCATION LABEL */}
            {userRole === "citizen" && (
              <button
                onClick={() => onNavigate("map-view")}
                className="hidden md:flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors"
              >
                <MapPin className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-semibold tracking-wide uppercase">
                  {currentAddress}
                </span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Citizen Specific Links */}
            {userRole === "citizen" && (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => onNavigate("citizen-dashboard")}
                  className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => onNavigate("map-view")}
                  className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                >
                  Map View
                </button>
              </div>
            )}

            {/* Authority Specific Links */}
            {userRole === "authority" && (
              <button
                onClick={() => onNavigate("authority-dashboard")}
                className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-lg text-sm font-semibold transition-all"
              >
                Officer Console
              </button>
            )}

            <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700 mx-2" />

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
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
              <button className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                <div className="w-8 h-8 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-800">
                  <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </div>
              </button>

              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="p-3">
                  <div className="px-3 py-3 mb-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Account Type
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                      {userRole}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-bold transition-all"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
