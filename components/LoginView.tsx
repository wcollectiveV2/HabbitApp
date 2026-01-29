
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface LoginViewProps {
  onSwitchToSignup: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
    } catch (err) {
      // Error handled by context
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-background-dark px-8 pt-20 pb-10 flex flex-col animate-in fade-in zoom-in duration-500">
      <div className="mb-12">
        <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center shadow-xl shadow-primary/30 mb-6">
          <span className="material-symbols-outlined text-white text-3xl">bolt</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-2">Welcome Back</h1>
        <p className="text-slate-400 font-medium">Log in to continue your streak.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-500 p-3 rounded-xl text-sm text-center">
            {error}
          </div>
        )}
        
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-slate-400 ml-1">Email Address</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
            <input 
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center ml-1">
            <label className="text-xs font-bold uppercase text-slate-400">Password</label>
            <button type="button" className="text-[10px] font-bold text-primary uppercase">Forgot?</button>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
            <input 
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
        </div>

        <button 
          disabled={isLoading}
          type="submit"
          className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>Log In <span className="material-symbols-outlined text-sm">arrow_forward</span></>
          )}
        </button>
      </form>

      <div className="mt-10">
        <div className="relative flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or Continue With</span>
          <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 font-bold text-xs active:scale-95 transition-transform">
            <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-4 h-4" alt="" />
            Google
          </button>
          <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 font-bold text-xs active:scale-95 transition-transform">
            <img src="https://www.svgrepo.com/show/443329/brand-apple.svg" className="w-4 h-4 dark:invert" alt="" />
            Apple
          </button>
        </div>
      </div>

      <div className="mt-auto text-center pt-10">
        <p className="text-sm text-slate-400">
          Don't have an account?{' '}
          <button onClick={onSwitchToSignup} className="text-primary font-bold">Sign Up</button>
        </p>
      </div>
    </div>
  );
};

export default LoginView;
