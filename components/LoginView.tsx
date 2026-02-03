
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services';

interface LoginViewProps {
  onSwitchToSignup: () => void;
}

// Forgot Password Modal Component
const ForgotPasswordModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'code' | 'newPassword' | 'success'>('email');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.requestPasswordReset(email);
      setStep('code');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.verifyResetCode(email, code);
      setStep('newPassword');
    } catch (err: any) {
      setError(err.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authService.resetPassword(email, code, newPassword);
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('email');
    setEmail('');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-6 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            {step === 'email' && 'Forgot Password'}
            {step === 'code' && 'Enter Code'}
            {step === 'newPassword' && 'New Password'}
            {step === 'success' && 'Success!'}
          </h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-500 p-3 rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        {/* Email Step */}
        {step === 'email' && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <p className="text-slate-500 text-sm mb-4">
              Enter your email address and we'll send you a code to reset your password.
            </p>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Send Reset Code'
              )}
            </button>
          </form>
        )}

        {/* Code Step */}
        {step === 'code' && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <p className="text-slate-500 text-sm mb-4">
              We sent a 6-digit code to <strong>{email}</strong>. Enter it below.
            </p>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              required
              className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 px-4 text-center text-2xl font-mono tracking-[0.5em] focus:ring-2 focus:ring-primary outline-none"
            />
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Verify Code'
              )}
            </button>
            <button
              type="button"
              onClick={() => setStep('email')}
              className="w-full text-slate-500 text-sm"
            >
              Didn't receive the code? <span className="text-primary font-bold">Resend</span>
            </button>
          </form>
        )}

        {/* New Password Step */}
        {step === 'newPassword' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-slate-500 text-sm mb-4">
              Create a new password for your account.
            </p>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                required
                minLength={6}
                className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                minLength={6}
                className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-green-500 text-3xl">check_circle</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Password Reset!</h3>
            <p className="text-slate-500 text-sm mb-6">
              Your password has been successfully reset. You can now log in with your new password.
            </p>
            <button
              onClick={handleClose}
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-sm"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const LoginView: React.FC<LoginViewProps> = ({ onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
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
            <button 
              type="button" 
              onClick={() => setShowForgotPassword(true)}
              className="text-[10px] font-bold text-primary uppercase"
            >
              Forgot?
            </button>
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

      {/* Forgot Password Modal */}
      <ForgotPasswordModal 
        isOpen={showForgotPassword} 
        onClose={() => setShowForgotPassword(false)} 
      />
    </div>
  );
};

export default LoginView;
