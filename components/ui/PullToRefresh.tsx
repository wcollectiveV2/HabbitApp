import React, { useState, useCallback, useRef, ReactNode } from 'react';

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

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div 
        className={`absolute left-0 right-0 flex justify-center transition-transform duration-200 z-10 ${
          showIndicator ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ 
          transform: `translateY(${Math.max(0, pullDistance - 40)}px)`,
          top: 0
        }}
        role="status"
        aria-label={isRefreshing ? 'Refreshing...' : 'Pull to refresh'}
      >
        <div className={`w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center transition-all ${
          isRefreshing ? 'animate-pulse' : ''
        }`}>
          {isRefreshing ? (
            <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          ) : (
            <span 
              className="material-symbols-outlined text-primary transition-transform duration-200"
              style={{ 
                transform: `rotate(${progress * 180}deg)`,
                opacity: progress
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
