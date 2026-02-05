import React from 'react';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme/designSystem';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  illustration?: 'tasks' | 'challenges' | 'social' | 'search' | 'generic';
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  illustration = 'generic'
}) => {
  // SVG illustrations for different empty states
  const getIllustration = () => {
    switch (illustration) {
      case 'tasks':
        return (
          <svg style={{ width: '100%', height: '100%' }} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="80" fill={colors.gray[100]} />
            <rect x="60" y="70" width="80" height="20" rx="4" fill={colors.gray[200]} />
            <rect x="60" y="100" width="60" height="20" rx="4" fill={colors.gray[200]} />
            <rect x="60" y="130" width="70" height="20" rx="4" fill={colors.gray[200]} />
            <circle cx="50" cy="80" r="6" fill={`${colors.primary}4D`} />
            <circle cx="50" cy="110" r="6" fill={`${colors.primary}4D`} />
            <circle cx="50" cy="140" r="6" fill={`${colors.primary}4D`} />
          </svg>
        );
      case 'challenges':
        return (
          <svg style={{ width: '100%', height: '100%' }} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="80" fill={colors.gray[100]} />
            <path d="M100 50L120 90H80L100 50Z" fill="#FACC15" />
            <rect x="70" y="90" width="60" height="60" rx="8" fill={`${colors.primary}33`} />
            <circle cx="100" cy="120" r="15" fill={`${colors.primary}66`} />
            <path d="M95 120L100 125L110 115" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'social':
        return (
          <svg style={{ width: '100%', height: '100%' }} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="80" fill={colors.gray[100]} />
            <circle cx="80" cy="90" r="20" fill={colors.gray[200]} />
            <circle cx="120" cy="90" r="20" fill={colors.gray[200]} />
            <circle cx="100" cy="130" r="20" fill={`${colors.primary}4D`} />
            <path d="M80 110L100 130M100 130L120 110" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'search':
        return (
          <svg style={{ width: '100%', height: '100%' }} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="80" fill={colors.gray[100]} />
            <circle cx="90" cy="90" r="30" stroke={colors.gray[300]} strokeWidth="4" fill="none" />
            <path d="M115 115L135 135" stroke={colors.gray[300]} strokeWidth="4" strokeLinecap="round" />
            <path d="M80 90H100M90 80V100" stroke={colors.gray[400]} strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      default:
        return (
          <svg style={{ width: '100%', height: '100%' }} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="80" fill={colors.gray[100]} />
            <rect x="70" y="70" width="60" height="60" rx="12" fill={colors.gray[200]} />
            <path d="M90 100L100 110L115 90" stroke={colors.primary} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
    }
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      padding: `${spacing[12]} ${spacing[6]}`,
      textAlign: 'center' as const,
    },
    illustration: {
      width: '160px',
      height: '160px',
      marginBottom: spacing[6],
    },
    iconBox: {
      width: '64px',
      height: '64px',
      marginBottom: spacing[4],
      borderRadius: borderRadius.full,
      backgroundColor: colors.gray[100],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontWeight: typography.fontWeight.bold,
      fontSize: typography.fontSize.lg,
      color: colors.text.primary,
      marginBottom: spacing[2],
    },
    description: {
      color: colors.gray[500],
      fontSize: typography.fontSize.sm,
      maxWidth: '280px',
      lineHeight: 1.6,
    },
    button: {
      marginTop: spacing[6],
      padding: `${spacing[3]} ${spacing[6]}`,
      backgroundColor: colors.primary,
      color: 'white',
      fontWeight: typography.fontWeight.bold,
      fontSize: typography.fontSize.sm,
      borderRadius: borderRadius['2xl'],
      boxShadow: `0 4px 12px ${colors.primary}4D`,
      border: 'none',
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.container}>
      {/* Illustration */}
      <div style={styles.illustration} role="img" aria-label={title}>
        {getIllustration()}
      </div>

      {/* Icon */}
      <div style={styles.iconBox}>
        <span className="material-symbols-outlined" style={{ fontSize: '30px', color: colors.gray[400] }} aria-hidden="true">
          {icon}
        </span>
      </div>

      {/* Text Content */}
      <h3 style={styles.title}>{title}</h3>
      <p style={styles.description}>{description}</p>

      {/* Action Button */}
      {actionLabel && onAction && (
        <button onClick={onAction} style={styles.button}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
