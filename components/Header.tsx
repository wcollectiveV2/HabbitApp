
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { NotificationCenter, NotificationBell } from './NotificationCenter';

interface HeaderProps {
  title?: string;
  userName?: string;
  avatarUrl?: string;
}

const Header: React.FC<HeaderProps> = ({ title = 'My Progress', userName, avatarUrl }) => {
  const { user, profile } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  
  const displayAvatar = avatarUrl || profile?.avatar || user?.avatar || `https://i.pravatar.cc/100?u=${user?.id || 'default'}`;

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 800,
          color: '#5D5FEF',
          margin: 0,
          letterSpacing: '-0.5px',
        }}>
          {title}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <NotificationBell onClick={() => setShowNotifications(true)} />
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '3px solid #5D5FEF',
            boxShadow: '0 4px 12px rgba(93,95,239,0.3)',
          }}>
            <img 
              alt={userName || 'User'} 
              src={displayAvatar}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://i.pravatar.cc/100?u=default';
              }}
            />
          </div>
        </div>
      </header>
      
      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </>
  );
};

export default Header;
