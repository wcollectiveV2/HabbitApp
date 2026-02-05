
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { NotificationCenter, NotificationBell } from './NotificationCenter';
import { colors, spacing, shadows, typography, zIndex, components } from '../theme/designSystem';

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
        zIndex: zIndex.sticky,
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: `${spacing[4]} ${spacing[5]}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${colors.gray[100]}`,
      }}>
        <h1 style={{
          fontSize: typography.fontSize['3xl'],
          fontWeight: typography.fontWeight.extrabold,
          color: colors.primary,
          margin: 0,
          letterSpacing: typography.letterSpacing.tighter,
        }}>
          {title}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
          <NotificationBell onClick={() => setShowNotifications(true)} />
          <div style={{
            width: components.avatar.sizes.lg,
            height: components.avatar.sizes.lg,
            borderRadius: components.avatar.borderRadius,
            overflow: 'hidden',
            border: `3px solid ${colors.primary}`,
            boxShadow: shadows.primary,
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
