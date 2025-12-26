import { MapPin, User, Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';

export function Header({ currentLocation = 'Mumbai, Maharashtra' }) {
  const userRole = useAuthStore((state) => state.userRole);
  const logout = useAuthStore((state) => state.logout);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const toggleDarkMode = useThemeStore((state) => state.toggleDarkMode);
  const onNavigate = useAppStore((state) => state.navigate);

  const handleLogout = () => {
    logout();
    onNavigate('landing');
  };
  
  return (
    <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-700/60 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => onNavigate(userRole === 'authority' ? 'authority-dashboard' : 'citizen-dashboard')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
                <span className="text-white">CF</span>
              </div>
              <span className="text-slate-900 dark:text-white">CivicFix AI</span>
            </button>
            
            {userRole === 'citizen' && (
              <button 
                onClick={() => onNavigate('map-view')}
                className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <MapPin className="w-4 h-4" />
                <span>{currentLocation}</span>
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {userRole === 'citizen' && (
              <>
                <button 
                  onClick={() => onNavigate('citizen-dashboard')}
                  className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  My Reports
                </button>
                <button 
                  onClick={() => onNavigate('map-view')}
                  className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  Map View
                </button>
              </>
            )}
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                <div className="w-8 h-8 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 rounded-full flex items-center justify-center ring-2 ring-slate-100 dark:ring-slate-600">
                  <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </div>
              </button>
              
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="p-2">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                    <div className="text-slate-500 dark:text-slate-400">Signed in as</div>
                    <div className="text-slate-900 dark:text-white">
                      {userRole === 'authority' ? 'Ward Officer' : 'Citizen'}
                    </div>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-all"
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
