import React, { useEffect, useState } from 'react';
import { colors, spacing, typography, borderRadius, shadows, zIndex } from '../../theme/designSystem';

interface UndoSnackbarProps {
  message: string;
  actionLabel?: string;
  duration?: number;
  onUndo: () => void;
  onDismiss: () => void;
  isVisible: boolean;
}

const styles = {
  container: (isExiting: boolean) => ({
    position: 'fixed' as const,
    bottom: '128px',
    left: spacing[4],
    right: spacing[4],
    zIndex: 200,
    transition: 'all 0.3s ease',
    opacity: isExiting ? 0 : 1,
    transform: isExiting ? 'translateY(16px)' : 'translateY(0)',
  }),
  snackbar: {
    backgroundColor: '#1E293B',
    borderRadius: borderRadius['2xl'],
    padding: spacing[4],
    boxShadow: shadows['2xl'],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[4],
    overflow: 'hidden',
    position: 'relative' as const,
  },
  progressBar: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    height: '4px',
    backgroundColor: colors.primary,
    transition: 'all 0.1s linear',
  },
  leftContent: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
    flex: 1,
  },
  message: {
    color: 'white',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  buttonsArea: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
  },
  undoBtn: {
    padding: `${spacing[2]} ${spacing[4]}`,
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.sm,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    borderRadius: borderRadius.xl,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
  },
  dismissBtn: {
    padding: spacing[2],
    color: colors.gray[400],
    borderRadius: borderRadius.full,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
  },
};

const UndoSnackbar: React.FC<UndoSnackbarProps> = ({
  message,
  actionLabel = 'Undo',
  duration = 5000,
  onUndo,
  onDismiss,
  isVisible
}) => {
  const [progress, setProgress] = useState(100);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setProgress(100);
      setIsExiting(false);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        setIsExiting(true);
        setTimeout(() => {
          onDismiss();
        }, 300);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isVisible, duration, onDismiss]);

  const handleUndo = () => {
    setIsExiting(true);
    setTimeout(() => {
      onUndo();
    }, 150);
  };

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss();
    }, 150);
  };

  if (!isVisible) return null;

  return (
    <div role="alert" aria-live="polite" style={styles.container(isExiting)}>
      <div style={styles.snackbar}>
        {/* Progress bar at the bottom */}
        <div style={{ ...styles.progressBar, width: `${progress}%` }} />
        
        <div style={styles.leftContent}>
          <span className="material-symbols-outlined" style={{ color: '#4ADE80' }} aria-hidden="true">
            check_circle
          </span>
          <span style={styles.message}>{message}</span>
        </div>

        <div style={styles.buttonsArea}>
          <button onClick={handleUndo} style={styles.undoBtn}>
            {actionLabel}
          </button>
          <button onClick={handleDismiss} style={styles.dismissBtn} aria-label="Dismiss">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UndoSnackbar;
