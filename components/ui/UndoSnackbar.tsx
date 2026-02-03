import React, { useEffect, useState } from 'react';

interface UndoSnackbarProps {
  message: string;
  actionLabel?: string;
  duration?: number;
  onUndo: () => void;
  onDismiss: () => void;
  isVisible: boolean;
}

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
    <div
      role="alert"
      aria-live="polite"
      className={`fixed bottom-32 left-4 right-4 z-[200] transition-all duration-300 ${
        isExiting ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
      }`}
    >
      <div className="bg-slate-900 dark:bg-slate-800 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4 overflow-hidden">
        {/* Progress bar at the bottom */}
        <div 
          className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
        
        <div className="flex items-center gap-3 flex-1">
          <span className="material-symbols-outlined text-green-400" aria-hidden="true">
            check_circle
          </span>
          <span className="text-white text-sm font-medium">{message}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            className="px-4 py-2 text-primary font-bold text-sm uppercase tracking-wide hover:bg-primary/10 rounded-xl transition-colors"
          >
            {actionLabel}
          </button>
          <button
            onClick={handleDismiss}
            className="p-2 text-slate-400 hover:text-white transition-colors rounded-full"
            aria-label="Dismiss"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UndoSnackbar;
