
import React from 'react';
import { Tab } from '../types';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs: { id: Tab; icon: string; label: string; fill?: boolean }[] = [
    { id: 'home', icon: 'grid_view', label: 'Home' },
    { id: 'active', icon: 'emoji_events', label: 'Active', fill: true },
    { id: 'social', icon: 'leaderboard', label: 'Social' },
    { id: 'me', icon: 'person', label: 'Me' },
  ];

  return (
    <>
      <nav className="fixed bottom-6 left-5 right-5 h-20 bg-slate-900/95 dark:bg-black/95 backdrop-blur-xl rounded-[2.5rem] p-2 flex items-center justify-between shadow-2xl z-50 overflow-hidden">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 h-full rounded-full flex flex-col items-center justify-center transition-all transform active:scale-95 ${
                isActive ? 'bg-primary text-white' : 'text-slate-500 hover:text-white'
              }`}
            >
              <span 
                className="material-symbols-outlined"
                style={tab.fill ? { fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" } : {}}
              >
                {tab.icon}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider mt-1">{tab.label}</span>
            </button>
          );
        })}
      </nav>
      {/* Home Indicator Mimic */}
      <div className="fixed bottom-1 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-slate-900/10 dark:bg-white/10 rounded-full z-[60]"></div>
    </>
  );
};

export default BottomNav;
