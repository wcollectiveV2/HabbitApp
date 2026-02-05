import React, { useState, useCallback, useRef, ReactNode } from 'react';
import { colors, borderRadius, shadows } from '../../theme/designSystem';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  threshold?: number;
  className?: string;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  threshold = 80,
  className = ''
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY.current);
    
    // Apply resistance to make it feel natural
    const resistedDistance = Math.min(threshold * 1.5, distance * 0.5);
    setPullDistance(resistedDistance);
  }, [isPulling, isRefreshing, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;
    
    setIsPulling(false);
    
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(threshold * 0.6); // Keep spinner visible during refresh
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [isPulling, pullDistance, threshold, isRefreshing, onRefresh]);

  const progress = Math.min(1, pullDistance / threshold);
  const showIndicator = pullDistance > 10 || isRefreshing;

  const styles = {
    container: {
      position: 'relative' as const,
      overflow: 'auto',
    },
    indicator: {
      position: 'absolute' as const,
      left: 0,
      right: 0,
      top: 0,
      display: 'flex',
      justifyContent: 'center',
      transition: 'transform 0.2s ease',
      zIndex: 10,
      opacity: showIndicator ? 1 : 0,
      transform: `translateY(${Math.max(0, pullDistance - 40)}px)`,
    },
    indicatorCircle: {
      width: '40px',
      height: '40px',
      borderRadius: borderRadius.full,
      backgroundColor: colors.background.primary,
      boxShadow: shadows.lg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    spinner: {
      width: '20px',
      height: '20px',
      border: `2px solid ${colors.primary}4D`,
      borderTopColor: colors.primary,
      borderRadius: borderRadius.full,
      animation: 'spin 1s linear infinite',
    },
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={styles.container}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div 
        style={styles.indicator}
        role="status"
        aria-label={isRefreshing ? 'Refreshing...' : 'Pull to refresh'}
      >
        <div style={styles.indicatorCircle}>
          {isRefreshing ? (
            <div style={styles.spinner} />
          ) : (
            <span 
              className="material-symbols-outlined"
              style={{ 
                color: colors.primary,
                transform: `rotate(${progress * 180}deg)`,
                opacity: progress,
                transition: 'transform 0.2s ease',
              }}
            >
              arrow_downward
            </span>
          )}
        </div>
      </div>

      {/* Content with transform */}
      <div 
        style={{ 
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.2s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
