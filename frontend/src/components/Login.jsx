import { useState } from 'react';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';

export function Login({ isSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('citizen');

  const navigate = useAppStore((state) => state.navigate);
  const login = useAuthStore((state) => state.login);

  const handleSubmit = (e) => {
    e.preventDefault();
    login(role);

    if (role === 'citizen') {
      navigate('citizen-dashboard');
    } else if (role === 'authority') {
      navigate('authority-dashboard');
    }
  };

  const handleGoogleLogin = () => {
    login(role);

    if (role === 'citizen') {
      navigate('citizen-dashboard');
    } else if (role === 'authority') {
      navigate('authority-dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <button 
          onClick={() => navigate('landing')}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-cyan-400 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </button>

        <Card className="p-8 shadow-xl dark:shadow-2xl dark:shadow-cyan-500/10 dark:border-slate-800">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-cyan-500 dark:to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/30 dark:shadow-cyan-500/50">
                <span className="text-white">CF</span>
              </div>
              <span className="text-slate-900 dark:text-white">CivicFix AI</span>
            </div>
            <h2 className="text-slate-900 dark:text-white mb-2">
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              {isSignup ? 'Sign up to start reporting civic issues' : 'Sign in to your account'}
            </p>
          </div>

          {/* Role Selection */}
          <div className="flex gap-2 mb-6 p-1 bg-slate-100 dark:bg-slate-900/50 rounded-lg border dark:border-slate-800">
            <button
              onClick={() => setRole('citizen')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                role === 'citizen' 
                  ? 'bg-white dark:bg-gradient-to-r dark:from-cyan-500/20 dark:to-purple-500/20 text-slate-900 dark:text-cyan-400 shadow-md dark:shadow-cyan-500/20 dark:border dark:border-cyan-500/30' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-cyan-300'
              }`}
            >
              Citizen
            </button>
            <button
              onClick={() => setRole('authority')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                role === 'authority' 
                  ? 'bg-white dark:bg-gradient-to-r dark:from-cyan-500/20 dark:to-purple-500/20 text-slate-900 dark:text-cyan-400 shadow-md dark:shadow-cyan-500/20 dark:border dark:border-cyan-500/30' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-cyan-300'
              }`}
            >
              Authority
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label htmlFor="email" className="block text-slate-700 dark:text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 focus:border-transparent transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-slate-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 focus:border-transparent transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  required
                />
              </div>
            </div>

            {!isSignup && (
              <div className="flex justify-end">
                <button type="button" className="text-blue-600 dark:text-cyan-400 hover:text-blue-700 dark:hover:text-cyan-300 transition-colors">
                  Forgot password?
                </button>
              </div>
            )}

            <Button type="submit" className="w-full shadow-lg shadow-blue-600/20 dark:shadow-cyan-500/30" size="lg">
              {isSignup ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                Or continue with
              </span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full hover:shadow-md dark:hover:shadow-cyan-500/10 transition-all" 
            onClick={handleGoogleLogin}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </Button>

          <p className="text-center text-slate-600 dark:text-slate-400 mt-6">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => navigate(isSignup ? 'login' : 'signup')}
              className="text-blue-600 dark:text-cyan-400 hover:text-blue-700 dark:hover:text-cyan-300 transition-colors"
            >
              {isSignup ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </Card>
      </div>
    </div>
  );
}
