import { ArrowRight, Brain, TrendingUp, Eye, MapPin } from 'lucide-react';
import { Button } from './Button';
import { useThemeStore } from '../store/useThemeStore';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';

export function Landing() {
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const navigate = useAppStore((state) => state.navigate);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userRole = useAuthStore((state) => state.userRole);

  const handleProtectedNavigate = (screen) => {
    if (!isAuthenticated) {
      navigate('login');
    } else {
      navigate(screen);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
              <span className="text-white">CF</span>
            </div>
            <span className="text-slate-900 dark:text-white">CivicFix AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={toggleDarkMode}>
              {isDarkMode ? '☀️' : '🌙'}
            </Button>
            {!isAuthenticated ? (
              <>
                <Button variant="ghost" onClick={() => navigate('login')}>
                  Sign In
                </Button>
                <Button onClick={() => navigate('signup')}>
                  Get Started
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate(userRole === 'authority' ? 'authority-dashboard' : 'citizen-dashboard')}>
                Go to Dashboard
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-700 dark:text-blue-300 rounded-full mb-6 border border-blue-200/50 dark:border-blue-700/50">
                <Brain className="w-4 h-4" />
                <span>Powered by AI</span>
              </div>
              <h1 className="text-slate-900 dark:text-white mb-6">
                Report. Prioritize. Resolve civic issues intelligently.
              </h1>
              <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-lg text-lg leading-relaxed">
                An AI-powered platform that streamlines civic issue reporting,
                intelligent prioritization, and transparent resolution tracking
                for citizens and municipal authorities.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={() => handleProtectedNavigate('report-issue')}
                  className="shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all"
                >
                  Report an Issue
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => handleProtectedNavigate('map-view')}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  View Issues Near Me
                  <MapPin className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-2xl transform rotate-3 blur-2xl"></div>
              <div className="relative bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1643128647850-82067d00210f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwc2t5bGluZSUyMG1pbmltYWx8ZW58MXx8fHwxNzY2NDc1MjI1fDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="City skyline"
                  className="rounded-xl w-full h-[400px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-slate-900 dark:text-white mb-4">
              Intelligent Civic Infrastructure Management
            </h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-lg">
              Leveraging AI to create smarter, more responsive cities
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30 group-hover:shadow-2xl group-hover:shadow-blue-500/40 transition-all">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-slate-900 dark:text-white mb-2">AI-Powered Classification</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Automatically categorize and tag civic issues using advanced
                machine learning models for faster routing to the right department.
              </p>
            </div>

            <div className="group bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-600 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-green-500/30 group-hover:shadow-2xl group-hover:shadow-green-500/40 transition-all">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-slate-900 dark:text-white mb-2">Smart Priority Scoring</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Dynamic prioritization based on severity, impact area, community
                validation, and historical patterns to ensure critical issues are addressed first.
              </p>
            </div>

            <div className="group bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30 group-hover:shadow-2xl group-hover:shadow-purple-500/40 transition-all">
                <Eye className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-slate-900 dark:text-white mb-2">Transparent Tracking</h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Real-time status updates and full visibility into the resolution
                process, fostering accountability and trust in civic governance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative">
          <h2 className="text-white mb-4">
            Ready to make your city better?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Join thousands of citizens working together to improve civic infrastructure
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('signup')} className="bg-white/20 hover:bg-white/40 shadow-xl">
              Get Started as Citizen
            </Button>
            <Button size="lg" onClick={() => navigate('login')} className="bg-white/20 hover:bg-white/40 shadow-xl">
              Sign In as Authority
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
                <span className="text-white">CF</span>
              </div>
              <span className="text-slate-900 dark:text-white">CivicFix AI</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400">© 2024 CivicFix AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
