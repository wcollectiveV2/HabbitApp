
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, borderRadius, typography, shadows, getButtonStyle, getInputStyle } from '../theme/designSystem';

interface SignupViewProps {
  onSwitchToLogin: () => void;
}

const SignupView: React.FC<SignupViewProps> = ({ onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, isLoading, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await register(email, password, name);
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
    backgroundColor: colors.primaryAlpha(0.1),
    color: colors.primary,
    borderRadius: borderRadius['3xl'],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
  };

  const errorBoxStyle: React.CSSProperties = {
    backgroundColor: colors.errorBg,
    color: colors.error,
    padding: spacing[3],
    borderRadius: borderRadius.lg,
    fontSize: typography.fontSize.md,
    textAlign: 'center',
  };

  const spinnerStyle: React.CSSProperties = {
    width: '20px',
    height: '20px',
    border: `2px solid ${colors.primaryAlpha(0.3)}`,
    borderTopColor: colors.white,
    borderRadius: borderRadius.full,
    animation: 'spin 1s linear infinite',
  };

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: spacing[10] }}>
        <div style={logoStyle}>
          <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>add_circle</span>
        </div>
        <h1 style={titleStyle}>Create Account</h1>
        <p style={subtitleStyle}>Start your wellness journey today.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
        {error && (
          <div style={errorBoxStyle}>{error}</div>
        )}
        
        <div>
          <label style={labelStyle}>Full Name</label>
          <div style={{ position: 'relative' }}>
            <span className="material-symbols-outlined" style={inputIconStyle}>person</span>
            <input 
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Rivera"
              style={inputBoxStyle}
            />
          </div>
        </div>

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
          <label style={labelStyle}>Create Password</label>
          <div style={{ position: 'relative' }}>
            <span className="material-symbols-outlined" style={inputIconStyle}>lock</span>
            <input 
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              style={inputBoxStyle}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[3], padding: `${spacing[2]} ${spacing[1]}` }}>
          <input type="checkbox" required style={{ marginTop: spacing[1], accentColor: colors.primary }} />
          <p style={{ fontSize: typography.fontSize.xs, color: colors.text.tertiary, lineHeight: typography.lineHeight.relaxed, fontWeight: typography.fontWeight.medium, margin: 0 }}>
            I agree to the <span style={{ color: colors.primary, fontWeight: typography.fontWeight.bold, textDecoration: 'underline' }}>Terms of Service</span> and <span style={{ color: colors.primary, fontWeight: typography.fontWeight.bold, textDecoration: 'underline' }}>Privacy Policy</span>.
          </p>
        </div>

        <button 
          disabled={isLoading}
          type="submit"
          style={primaryBtnStyle}
        >
          {isLoading ? (
            <div style={spinnerStyle}></div>
          ) : (
            <>Get Started <span className="material-symbols-outlined" style={{ fontSize: typography.fontSize.md }}>rocket_launch</span></>
          )}
        </button>
      </form>

      <div style={{ marginTop: 'auto', textAlign: 'center', paddingTop: spacing[10] }}>
        <p style={{ fontSize: typography.fontSize.md, color: colors.text.tertiary }}>
          Already have an account?{' '}
          <button onClick={onSwitchToLogin} style={{ background: 'none', border: 'none', color: colors.primary, fontWeight: typography.fontWeight.bold, cursor: 'pointer' }}>Log In</button>
        </p>
      </div>
    </div>
  );
};

export default SignupView;
