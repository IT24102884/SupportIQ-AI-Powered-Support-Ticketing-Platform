import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { registerApi } from '../api/auth';
import { Logo } from '../components/Logo';
import { UserCheck, Shield, Sparkles, AlertCircle, Mail, Lock, User, Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, quickLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await registerApi(name, email, password, 'customer');
        await login(email, password);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 'Authentication failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: 'customer' | 'agent') => {
    setError(null);
    setLoading(true);
    try {
      await quickLogin(role);
    } catch (err: any) {
      setError('Could not connect to backend server. Make sure the FastAPI service is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      {/* Subtle ambient light gradient & grid backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-60" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-indigo-100/60 via-sky-50/40 to-transparent blur-3xl pointer-events-none" />

      {/* Header / Brand Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="flex justify-center mb-3">
          <Logo size="lg" showWordmark={false} />
        </div>
        <div className="flex items-center justify-center space-x-1.5">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Support</h2>
          <span className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent tracking-tight">
            IQ
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          AI-Powered Support Ticketing Platform
        </p>
      </div>

      {/* Main Unified Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7">
          
          {/* Quick Demo Access Buttons */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Quick Demo Access
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Click to enter</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('customer')}
                disabled={loading}
                className="p-3 bg-slate-50/80 hover:bg-sky-50/70 border border-slate-200/80 hover:border-sky-300 rounded-xl transition-all text-left group disabled:opacity-50"
              >
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-800 group-hover:text-sky-700">
                  <UserCheck className="w-3.5 h-3.5 text-sky-500" />
                  <span>Customer</span>
                </div>
                <div className="text-[11px] text-slate-600 font-medium mt-1">Alex Rivera</div>
                <div className="text-[10px] text-slate-400 font-mono truncate">customer@example.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('agent')}
                disabled={loading}
                className="p-3 bg-slate-50/80 hover:bg-indigo-50/70 border border-slate-200/80 hover:border-indigo-300 rounded-xl transition-all text-left group disabled:opacity-50"
              >
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-800 group-hover:text-indigo-700">
                  <Shield className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Admin / Agent</span>
                </div>
                <div className="text-[11px] text-slate-600 font-medium mt-1">Sarah Chen</div>
                <div className="text-[10px] text-slate-400 font-mono truncate">agent@example.com</div>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2.5 text-slate-400 text-[11px]">or use credentials</span>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(null); }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                !isRegister
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(null); }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                isRegister
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200/80 rounded-xl flex items-start space-x-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                />
              </div>
            </div>

            {isRegister && (
              <p className="text-[11px] text-slate-500 leading-tight">
                By creating an account, you agree to our{' '}
                <a href="#" className="text-indigo-600 hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-indigo-600 hover:underline">
                  Privacy Policy
                </a>.
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-sm transition disabled:opacity-50 flex items-center justify-center space-x-2 mt-2"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>
                {loading
                  ? 'Please wait...'
                  : isRegister
                  ? 'Create Customer Account'
                  : 'Sign In'}
              </span>
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};
