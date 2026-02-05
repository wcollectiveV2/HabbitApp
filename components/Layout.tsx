import React, { ReactNode } from 'react';
import BottomNav from './BottomNav';
import Header from './Header';
import { Tab } from '../types';
import { colors, shadows, spacing, components, borderRadius } from '../theme/designSystem';

interface LayoutProps {
  children: ReactNode;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  title?: string;
  headerContent?: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, title, headerContent }) => {
  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: colors.gradients.primary.replace('135deg', '180deg').replace(colors.primary, colors.gray[50]).replace(colors.primaryLight, '#EEF2FF'),
      display: 'flex',
      justifyContent: 'center',
    }}>
      <div style={{
        width: '100%',
        maxWidth: components.layout.maxWidth,
        minHeight: '100vh',
        background: colors.background.primary,
        position: 'relative',
        boxShadow: shadows['2xl'],
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Header title={title} />
        <main style={{
          flex: 1,
          padding: `0 ${spacing[5]} 120px ${spacing[5]}`,
          overflowY: 'auto',
          overflowX: 'hidden',
        }} className="no-scrollbar">
          {children}
        </main>
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
};

export default Layout;
