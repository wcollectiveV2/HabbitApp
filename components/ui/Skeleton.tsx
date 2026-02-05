import React from 'react';
import { colors, spacing, borderRadius } from '../../theme/designSystem';

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
  const getBaseStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      backgroundColor: colors.gray[200],
    };

    switch (variant) {
      case 'text':
        return { ...base, height: '16px', borderRadius: borderRadius.md };
      case 'circular':
        return { ...base, borderRadius: borderRadius.full, aspectRatio: '1' };
      case 'card':
        return { ...base, borderRadius: borderRadius['3xl'] };
      case 'rectangular':
      default:
        return { ...base, borderRadius: borderRadius['2xl'] };
    }
  };

  const style: React.CSSProperties = {
    ...getBaseStyle(),
    ...(width ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
    ...(height ? { height: typeof height === 'number' ? `${height}px` : height } : {}),
  };

  const items = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`animate-pulse ${className}`}
      style={style}
      role="progressbar"
      aria-label="Loading..."
      aria-busy="true"
    />
  ));

  return count === 1 ? items[0] : <>{items}</>;
};

// Pre-built skeleton components for common use cases
export const TaskCardSkeleton: React.FC = () => {
  const cardStyle = {
    backgroundColor: colors.background.primary,
    padding: spacing[5],
    borderRadius: borderRadius['2xl'],
    border: `1px solid ${colors.gray[100]}`,
  };

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4], marginBottom: spacing[3] }}>
        <Skeleton variant="rectangular" width={48} height={48} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
          <Skeleton variant="text" width="75%" height={20} />
          <Skeleton variant="text" width="50%" height={12} />
        </div>
        <Skeleton variant="rectangular" width={48} height={24} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: spacing[3], borderTop: `1px solid ${colors.gray[50]}` }}>
        <Skeleton variant="text" width={96} height={16} />
        <div style={{ display: 'flex', gap: spacing[1] }}>
          <Skeleton width={16} height={4} />
          <Skeleton width={16} height={4} />
          <Skeleton width={16} height={4} />
          <Skeleton width={16} height={4} />
        </div>
      </div>
    </div>
  );
};

export const ProgressCardSkeleton: React.FC = () => (
  <div style={{ minWidth: '280px', height: '160px', backgroundColor: colors.gray[200], borderRadius: borderRadius['3xl'] }} />
);

export const LeaderboardSkeleton: React.FC = () => {
  const containerStyle = {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius['3xl'],
    border: `1px solid ${colors.gray[100]}`,
    overflow: 'hidden' as const,
  };

  const itemStyle = {
    padding: spacing[4],
    display: 'flex',
    alignItems: 'center',
    gap: spacing[4],
    borderBottom: `1px solid ${colors.gray[50]}`,
  };

  return (
    <div style={containerStyle}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} style={{ ...itemStyle, borderBottom: i < 5 ? itemStyle.borderBottom : 'none' }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={40} height={40} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
            <Skeleton variant="text" width={96} height={16} />
            <Skeleton variant="text" width={64} height={12} />
          </div>
        </div>
      ))}
    </div>
  );
};

export const FeedItemSkeleton: React.FC = () => (
  <div style={{ display: 'flex', gap: spacing[4], padding: spacing[4], borderRadius: borderRadius['3xl'], backgroundColor: colors.gray[50] }}>
    <Skeleton variant="circular" width={40} height={40} />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
      <Skeleton variant="text" width="100%" height={16} />
      <Skeleton variant="text" width={64} height={12} />
    </div>
  </div>
);

export default Skeleton;
