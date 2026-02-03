import React from 'react';

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
          <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="80" className="fill-slate-100 dark:fill-slate-800" />
            <rect x="60" y="70" width="80" height="20" rx="4" className="fill-slate-200 dark:fill-slate-700" />
            <rect x="60" y="100" width="60" height="20" rx="4" className="fill-slate-200 dark:fill-slate-700" />
            <rect x="60" y="130" width="70" height="20" rx="4" className="fill-slate-200 dark:fill-slate-700" />
            <circle cx="50" cy="80" r="6" className="fill-primary/30" />
            <circle cx="50" cy="110" r="6" className="fill-primary/30" />
            <circle cx="50" cy="140" r="6" className="fill-primary/30" />
          </svg>
        );
      case 'challenges':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="80" className="fill-slate-100 dark:fill-slate-800" />
            <path d="M100 50L120 90H80L100 50Z" className="fill-yellow-400" />
            <rect x="70" y="90" width="60" height="60" rx="8" className="fill-primary/20" />
            <circle cx="100" cy="120" r="15" className="fill-primary/40" />
            <path d="M95 120L100 125L110 115" className="stroke-primary stroke-2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'social':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="80" className="fill-slate-100 dark:fill-slate-800" />
            <circle cx="80" cy="90" r="20" className="fill-slate-200 dark:fill-slate-700" />
            <circle cx="120" cy="90" r="20" className="fill-slate-200 dark:fill-slate-700" />
            <circle cx="100" cy="130" r="20" className="fill-primary/30" />
            <path d="M80 110L100 130M100 130L120 110" className="stroke-primary stroke-2" strokeLinecap="round" />
          </svg>
        );
      case 'search':
        return (
          <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="80" className="fill-slate-100 dark:fill-slate-800" />
            <circle cx="90" cy="90" r="30" className="stroke-slate-300 dark:stroke-slate-600 stroke-4" fill="none" />
            <path d="M115 115L135 135" className="stroke-slate-300 dark:stroke-slate-600 stroke-4" strokeLinecap="round" />
            <path d="M80 90H100M90 80V100" className="stroke-slate-400 dark:stroke-slate-500 stroke-2" strokeLinecap="round" />
          </svg>
        );
      default:
        return (
          <svg className="w-full h-full" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="80" className="fill-slate-100 dark:fill-slate-800" />
            <rect x="70" y="70" width="60" height="60" rx="12" className="fill-slate-200 dark:fill-slate-700" />
            <path d="M90 100L100 110L115 90" className="stroke-primary stroke-3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      {/* Illustration */}
      <div className="w-40 h-40 mb-6" role="img" aria-label={title}>
        {getIllustration()}
      </div>

      {/* Icon */}
      <div className="w-16 h-16 mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <span className="material-symbols-outlined text-3xl text-slate-400" aria-hidden="true">
          {icon}
        </span>
      </div>

      {/* Text Content */}
      <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs leading-relaxed">
        {description}
      </p>

      {/* Action Button */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-6 px-6 py-3 bg-primary text-white font-bold text-sm rounded-2xl shadow-lg shadow-primary/30 active:scale-95 transition-transform"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
