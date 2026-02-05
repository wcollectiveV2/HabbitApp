import React, { ReactNode } from 'react';
import BottomNav from './BottomNav';
import Header from './Header';
import { Tab } from '../types';

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
      background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF2FF 100%)',
      display: 'flex',
      justifyContent: 'center',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '430px',
        minHeight: '100vh',
        background: '#FFFFFF',
        position: 'relative',
        boxShadow: '0 0 60px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Header title={title} />
        <main style={{
          flex: 1,
          padding: '0 20px 120px 20px',
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
