import React, { useEffect, useRef } from 'react';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme/designSystem';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onCancel();
      }
    };

    confirmButtonRef.current?.focus();

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  const styles = {
    overlay: {
      position: 'fixed' as const,
      inset: 0,
      zIndex: 300,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing[4],
    },
    backdrop: {
      position: 'absolute' as const,
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(4px)',
    },
    modal: {
      position: 'relative' as const,
      backgroundColor: colors.white,
      borderRadius: borderRadius['3xl'],
      padding: spacing[6],
      width: '100%',
      maxWidth: '384px',
      boxShadow: shadows['2xl'],
    },
    iconBox: {
      width: '56px',
      height: '56px',
      margin: '0 auto',
      marginBottom: spacing[4],
      borderRadius: borderRadius.full,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: confirmVariant === 'danger' ? colors.errorBg : colors.primaryAlpha(0.1),
    },
    title: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      textAlign: 'center' as const,
      marginBottom: spacing[2],
      color: colors.text.primary,
    },
    message: {
      color: colors.text.secondary,
      textAlign: 'center' as const,
      fontSize: typography.fontSize.sm,
      lineHeight: typography.lineHeight.relaxed,
      marginBottom: spacing[6],
    },
    cancelBtn: {
      flex: 1,
      padding: `${spacing[3]} ${spacing[4]}`,
      backgroundColor: colors.gray[100],
      color: colors.text.primary,
      fontWeight: typography.fontWeight.bold,
      fontSize: typography.fontSize.sm,
      borderRadius: borderRadius['2xl'],
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    confirmBtn: {
      flex: 1,
      padding: `${spacing[3]} ${spacing[4]}`,
      backgroundColor: confirmVariant === 'danger' ? colors.error : colors.primary,
      color: colors.white,
      fontWeight: typography.fontWeight.bold,
      fontSize: typography.fontSize.sm,
      borderRadius: borderRadius['2xl'],
      border: 'none',
      cursor: 'pointer',
      boxShadow: confirmVariant === 'danger' ? shadows.sm : shadows.primaryLg,
      transition: 'all 0.2s ease',
    },
  };

  return (
    <div style={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-description">
      <div style={styles.backdrop} onClick={isLoading ? undefined : onCancel} aria-hidden="true" />

      <div ref={modalRef} style={styles.modal}>
        <div style={styles.iconBox}>
          <span className="material-symbols-outlined" style={{ fontSize: '24px', color: confirmVariant === 'danger' ? colors.error : colors.primary }}>
            {confirmVariant === 'danger' ? 'warning' : 'help'}
          </span>
        </div>

        <h2 id="modal-title" style={styles.title}>{title}</h2>
        <p id="modal-description" style={styles.message}>{message}</p>

        <div style={{ display: 'flex', gap: spacing[3] }}>
          <button onClick={onCancel} disabled={isLoading} style={{ ...styles.cancelBtn, opacity: isLoading ? 0.5 : 1 }}>
            {cancelLabel}
          </button>
          <button ref={confirmButtonRef} onClick={onConfirm} disabled={isLoading} style={{ ...styles.confirmBtn, opacity: isLoading ? 0.5 : 1 }}>
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: spacing[2] }}>
                <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: colors.white, borderRadius: borderRadius.full, animation: 'spin 1s linear infinite' }} />
                Loading...
              </span>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
