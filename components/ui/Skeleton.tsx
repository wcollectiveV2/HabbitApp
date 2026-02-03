import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  count?: number;
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  variant = 'rectangular',
  width,
  height,
  count = 1
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded';
      case 'circular':
        return 'rounded-full aspect-square';
      case 'card':
        return 'rounded-3xl';
      case 'rectangular':
      default:
        return 'rounded-2xl';
    }
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  const items = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`bg-slate-200 dark:bg-slate-700 animate-pulse ${getVariantClasses()} ${className}`}
      style={style}
      role="progressbar"
      aria-label="Loading..."
      aria-busy="true"
    />
  ));

  return count === 1 ? items[0] : <>{items}</>;
};

// Pre-built skeleton components for common use cases
export const TaskCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-card-dark p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
    <div className="flex items-center gap-4 mb-3">
      <Skeleton variant="rectangular" className="w-12 h-12 rounded-2xl" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" className="w-3/4 h-5" />
        <Skeleton variant="text" className="w-1/2 h-3" />
      </div>
      <Skeleton variant="rectangular" className="w-12 h-6 rounded-full" />
    </div>
    <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-800">
      <Skeleton variant="text" className="w-24 h-4" />
      <div className="flex gap-1">
        <Skeleton className="w-4 h-1 rounded-full" />
        <Skeleton className="w-4 h-1 rounded-full" />
        <Skeleton className="w-4 h-1 rounded-full" />
        <Skeleton className="w-4 h-1 rounded-full" />
      </div>
    </div>
  </div>
);

export const ProgressCardSkeleton: React.FC = () => (
  <div className="min-w-[280px] h-40 bg-slate-200 dark:bg-slate-700 rounded-3xl animate-pulse" />
);

export const LeaderboardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-card-dark rounded-3xl border border-slate-100 dark:border-slate-800 divide-y divide-slate-50 dark:divide-slate-800 overflow-hidden">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="p-4 flex items-center gap-4">
        <Skeleton variant="circular" className="w-8 h-8" />
        <Skeleton variant="circular" className="w-10 h-10" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-24 h-4" />
          <Skeleton variant="text" className="w-16 h-3" />
        </div>
      </div>
    ))}
  </div>
);

export const FeedItemSkeleton: React.FC = () => (
  <div className="flex gap-4 p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/50">
    <Skeleton variant="circular" className="w-10 h-10" />
    <div className="flex-1 space-y-2">
      <Skeleton variant="text" className="w-full h-4" />
      <Skeleton variant="text" className="w-16 h-3" />
    </div>
  </div>
);

export default Skeleton;
