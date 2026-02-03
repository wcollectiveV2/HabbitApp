import React, { useEffect, useRef } from 'react';

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

  // Focus trap and escape key handling
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onCancel();
      }
    };

    // Focus the confirm button when modal opens
    confirmButtonRef.current?.focus();

    document.addEventListener('keydown', handleEscape);
    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  const confirmStyles = confirmVariant === 'danger'
    ? 'bg-red-500 text-white shadow-red-500/30 hover:bg-red-600'
    : 'bg-primary text-white shadow-primary/30 hover:bg-primary/90';

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={isLoading ? undefined : onCancel}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className="relative bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 fade-in duration-200"
      >
        {/* Icon */}
        <div className={`w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center ${
          confirmVariant === 'danger' 
            ? 'bg-red-100 dark:bg-red-900/30' 
            : 'bg-primary/10'
        }`}>
          <span className={`material-symbols-outlined text-2xl ${
            confirmVariant === 'danger' ? 'text-red-500' : 'text-primary'
          }`}>
            {confirmVariant === 'danger' ? 'warning' : 'help'}
          </span>
        </div>

        {/* Title */}
        <h2 
          id="modal-title"
          className="text-xl font-bold text-center mb-2"
        >
          {title}
        </h2>

        {/* Message */}
        <p 
          id="modal-description"
          className="text-slate-500 dark:text-slate-400 text-center text-sm leading-relaxed mb-6"
        >
          {message}
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-2xl transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmButtonRef}
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-3 font-bold text-sm rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50 ${confirmStyles}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
