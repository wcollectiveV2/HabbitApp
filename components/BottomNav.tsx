
import React from 'react';
import { Tab } from '../types';
import { colors, spacing, shadows, borderRadius, typography, zIndex, transitions } from '../theme/designSystem';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs: { id: Tab; icon: string; label: string }[] = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'habits', icon: 'self_improvement', label: 'Habits' },
    { id: 'active', icon: 'emoji_events', label: 'Active' },
    { id: 'social', icon: 'leaderboard', label: 'Social' },
    { id: 'me', icon: 'person', label: 'Me' },
  ];

  return (
    <nav 
      style={{
        position: 'fixed',
        bottom: spacing[5],
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 40px)',
        maxWidth: '400px',
        height: '70px',
        background: `linear-gradient(135deg, ${colors.gray[800]} 0%, ${colors.gray[900]} 100%)`,
        borderRadius: borderRadius.full,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: `0 ${spacing[2]}`,
        boxShadow: shadows['2xl'],
        zIndex: zIndex.fixed,
      }}
      role="tablist"
      aria-label="Main navigation"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={isActive}
            style={{
              flex: 1,
              height: '54px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing[0],
              border: 'none',
              borderRadius: borderRadius.full,
              cursor: 'pointer',
              transition: transitions.all,
              background: isActive ? colors.primary : 'transparent',
              color: isActive ? colors.white : colors.gray[500],
            }}
          >
            <span 
              className="material-symbols-outlined"
              style={{ 
                fontSize: '22px',
                fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0"
              }}
            >
              {tab.icon}
            </span>
            <span style={{ 
              fontSize: typography.fontSize.xs, 
              fontWeight: typography.fontWeight.bold, 
              textTransform: 'uppercase',
              letterSpacing: typography.letterSpacing.wide
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
