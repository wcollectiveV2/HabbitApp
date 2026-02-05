
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services';
import { colors, spacing, borderRadius, typography, zIndex, shadows, getButtonStyle, getInputStyle } from '../theme/designSystem';

// Inline styles using design system
const styles = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    zIndex: zIndex.modal,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
  },
  modal: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius['3xl'],
    width: '100%',
    maxWidth: '400px',
    padding: spacing[6],
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[6],
  },
  modalTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    margin: 0,
    color: colors.text.primary,
  },
  closeBtn: {
    padding: spacing[2],
    borderRadius: borderRadius.full,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
  },
  errorBox: {
    backgroundColor: colors.errorBg,
    color: colors.error,
    padding: spacing[3],
    borderRadius: borderRadius.lg,
    fontSize: typography.fontSize.md,
    marginBottom: spacing[4],
    textAlign: 'center' as const,
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: spacing[4],
  },
  inputWrapper: {
    position: 'relative' as const,
  },
  inputIcon: {
    position: 'absolute' as const,
    left: spacing[4],
    top: '50%',
    transform: 'translateY(-50%)',
    color: colors.gray[400],
  },
  input: {
    ...getInputStyle(),
  },
  codeInput: {
    width: '100%',
    backgroundColor: colors.gray[50],
    color: colors.text.primary,
    border: 'none',
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.mono,
    textAlign: 'center' as const,
    letterSpacing: '0.5em',
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  submitBtn: {
    ...getButtonStyle('primary'),
    width: '100%',
  },
  linkBtn: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    color: colors.text.secondary,
    fontSize: typography.fontSize.md,
    cursor: 'pointer',
    padding: spacing[2],
  },
  successIcon: {
    width: '64px',
    height: '64px',
    backgroundColor: colors.successBg,
    borderRadius: borderRadius.full,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

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
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>
            {step === 'email' && 'Forgot Password'}
            {step === 'code' && 'Enter Code'}
            {step === 'newPassword' && 'New Password'}
            {step === 'success' && 'Success!'}
          </h2>
          <button onClick={handleClose} style={styles.closeBtn}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        {/* Email Step */}
        {step === 'email' && (
          <form onSubmit={handleSendCode} style={styles.formGroup}>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
              Enter your email address and we'll send you a code to reset your password.
            </p>
            <div style={styles.inputWrapper}>
              <span className="material-symbols-outlined" style={styles.inputIcon}>mail</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                style={styles.input}
              />
            </div>
            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? <div style={styles.spinner}></div> : 'Send Reset Code'}
            </button>
          </form>
        )}

        {/* Code Step */}
        {step === 'code' && (
          <form onSubmit={handleVerifyCode} style={styles.formGroup}>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
              We sent a 6-digit code to <strong>{email}</strong>. Enter it below.
            </p>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              required
              style={styles.codeInput}
            />
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              style={{ ...styles.submitBtn, opacity: loading || code.length !== 6 ? 0.5 : 1 }}
            >
              {loading ? <div style={styles.spinner}></div> : 'Verify Code'}
            </button>
            <button type="button" onClick={() => setStep('email')} style={styles.linkBtn}>
              Didn't receive the code? <span style={{ color: colors.primary, fontWeight: typography.fontWeight.bold }}>Resend</span>
            </button>
          </form>
        )}

        {/* New Password Step */}
        {step === 'newPassword' && (
          <form onSubmit={handleResetPassword} style={styles.formGroup}>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
              Create a new password for your account.
            </p>
            <div style={styles.inputWrapper}>
              <span className="material-symbols-outlined" style={styles.inputIcon}>lock</span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                required
                minLength={6}
                style={styles.input}
              />
            </div>
            <div style={styles.inputWrapper}>
              <span className="material-symbols-outlined" style={styles.inputIcon}>lock</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                minLength={6}
                style={styles.input}
              />
            </div>
            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? <div style={styles.spinner}></div> : 'Reset Password'}
            </button>
          </form>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={styles.successIcon}>
              <span className="material-symbols-outlined" style={{ color: '#22c55e', fontSize: '32px' }}>check_circle</span>
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>Password Reset!</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
              Your password has been successfully reset. You can now log in with your new password.
            </p>
            <button onClick={handleClose} style={styles.submitBtn}>Back to Login</button>
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

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: colors.background.primary,
    padding: `${spacing[20]} ${spacing[8]} ${spacing[10]}`,
    display: 'flex',
    flexDirection: 'column',
  };

  const logoStyle: React.CSSProperties = {
    width: '64px',
    height: '64px',
    backgroundColor: colors.primary,
    borderRadius: borderRadius['3xl'],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: shadows.primaryLg,
    marginBottom: spacing[6],
  };

  const titleStyle: React.CSSProperties = {
    fontSize: typography.fontSize['5xl'],
    fontWeight: typography.fontWeight.black,
    letterSpacing: typography.letterSpacing.tighter,
    marginBottom: spacing[2],
    color: colors.text.primary,
  };

  const subtitleStyle: React.CSSProperties = {
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.medium,
    margin: 0,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    textTransform: 'uppercase',
    color: colors.text.tertiary,
    marginLeft: spacing[1],
    marginBottom: spacing[1],
    display: 'block',
  };

  const inputBoxStyle: React.CSSProperties = {
    ...getInputStyle(),
  };

  const inputIconStyle: React.CSSProperties = {
    position: 'absolute',
    left: spacing[4],
    top: '50%',
    transform: 'translateY(-50%)',
    color: colors.gray[400],
    fontSize: '20px',
  };

  const primaryBtnStyle: React.CSSProperties = {
    ...getButtonStyle('primary'),
    width: '100%',
    marginTop: spacing[4],
  };

  const dividerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[4],
    marginBottom: spacing[8],
  };

  const lineStyle: React.CSSProperties = {
    flex: 1,
    height: '1px',
    backgroundColor: colors.gray[100],
  };

  const dividerTextStyle: React.CSSProperties = {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.widest,
  };

  const socialBtnStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    padding: `${spacing[3]} ${spacing[4]}`,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.background.primary,
    border: `1px solid ${colors.gray[100]}`,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.sm,
    cursor: 'pointer',
  };

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: spacing[12] }}>
        <div style={logoStyle}>
          <span className="material-symbols-outlined" style={{ color: colors.white, fontSize: '32px' }}>bolt</span>
        </div>
        <h1 style={titleStyle}>Welcome Back</h1>
        <p style={subtitleStyle}>Log in to continue your streak.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
        {error && (
          <div style={styles.errorBox}>{error}</div>
        )}
        
        <div>
          <label style={labelStyle}>Email Address</label>
          <div style={{ position: 'relative' }}>
            <span className="material-symbols-outlined" style={inputIconStyle}>mail</span>
            <input 
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              style={inputBoxStyle}
            />
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginLeft: spacing[1] }}>
            <label style={{ ...labelStyle, marginLeft: 0, marginBottom: 0 }}>Password</label>
            <button 
              type="button" 
              onClick={() => setShowForgotPassword(true)}
              style={{ background: 'none', border: 'none', fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, color: colors.primary, textTransform: 'uppercase', cursor: 'pointer' }}
            >
              Forgot?
            </button>
          </div>
          <div style={{ position: 'relative', marginTop: spacing[1] }}>
            <span className="material-symbols-outlined" style={inputIconStyle}>lock</span>
            <input 
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={inputBoxStyle}
            />
          </div>
        </div>

        <button 
          disabled={isLoading}
          type="submit"
          style={primaryBtnStyle}
        >
          {isLoading ? (
            <div style={styles.spinner}></div>
          ) : (
            <>Log In <span className="material-symbols-outlined" style={{ fontSize: typography.fontSize.md }}>arrow_forward</span></>
          )}
        </button>
      </form>

      <div style={{ marginTop: spacing[10] }}>
        <div style={dividerStyle}>
          <div style={lineStyle}></div>
          <span style={dividerTextStyle}>Or Continue With</span>
          <div style={lineStyle}></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[4] }}>
          <button style={socialBtnStyle}>
            <svg style={{ width: '20px', height: '20px' }} aria-hidden="true" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </button>
          <button style={socialBtnStyle}>
            <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.63 3.4 1.45-3.1 1.88-2.6 6.16.85 7.55-.57 1.44-1.44 2.92-2.9 4.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Apple
          </button>
        </div>
      </div>

      <div style={{ marginTop: 'auto', textAlign: 'center', paddingTop: spacing[10] }}>
        <p style={{ fontSize: typography.fontSize.md, color: colors.text.tertiary }}>
          Don't have an account?{' '}
          <button onClick={onSwitchToSignup} style={{ background: 'none', border: 'none', color: colors.primary, fontWeight: typography.fontWeight.bold, cursor: 'pointer' }}>Sign Up</button>
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
