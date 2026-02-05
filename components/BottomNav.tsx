
import React from 'react';
import { Tab } from '../types';

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
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 40px)',
        maxWidth: '400px',
        height: '70px',
        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
        borderRadius: '35px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 8px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        zIndex: 9999,
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
              gap: '2px',
              border: 'none',
              borderRadius: '27px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: isActive ? '#5D5FEF' : 'transparent',
              color: isActive ? '#FFFFFF' : '#64748B',
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
              fontSize: '9px', 
              fontWeight: 700, 
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
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
