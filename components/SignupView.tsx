
import React, { useState } from 'react';

interface SignupViewProps {
  onSignup: () => void;
  onSwitchToLogin: () => void;
}

const SignupView: React.FC<SignupViewProps> = ({ onSignup, onSwitchToLogin }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSignup();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-background-dark px-8 pt-20 pb-10 flex flex-col animate-in slide-in-from-right duration-500">
      <div className="mb-10">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-3xl">add_circle</span>
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-2">Create Account</h1>
        <p className="text-slate-400 font-medium">Start your wellness journey today.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-slate-400 ml-1">Full Name</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">person</span>
            <input 
              required
              type="text" 
              placeholder="Alex Rivera"
              className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-slate-400 ml-1">Email Address</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
            <input 
              required
              type="email" 
              placeholder="alex@example.com"
              className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-slate-400 ml-1">Create Password</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
            <input 
              required
              type="password" 
              placeholder="••••••••"
              className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
        </div>

        <div className="flex items-start gap-3 py-2 px-1">
          <input type="checkbox" required className="mt-1 rounded border-slate-200 text-primary focus:ring-primary" />
          <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
            I agree to the <span className="text-primary font-bold underline">Terms of Service</span> and <span className="text-primary font-bold underline">Privacy Policy</span>.
          </p>
        </div>

        <button 
          disabled={loading}
          type="submit"
          className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>Get Started <span className="material-symbols-outlined text-sm">rocket_launch</span></>
          )}
        </button>
      </form>

      <div className="mt-auto text-center pt-10">
        <p className="text-sm text-slate-400">
          Already have an account?{' '}
          <button onClick={onSwitchToLogin} className="text-primary font-bold">Log In</button>
        </p>
      </div>
    </div>
  );
};

export default SignupView;
