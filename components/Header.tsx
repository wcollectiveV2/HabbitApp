
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { NotificationCenter, NotificationBell } from './NotificationCenter';

interface HeaderProps {
  title?: string;
  userName?: string;
  avatarUrl?: string;
}

const Header: React.FC<HeaderProps> = ({ title = 'Active Challenges', userName, avatarUrl }) => {
  const { user, profile } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  
  const displayAvatar = avatarUrl || profile?.avatar || user?.avatar || `https://i.pravatar.cc/200?u=${user?.id || 'default'}`;

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-6 pt-4 pb-2 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-primary tracking-tight">{title}</h1>
        <div className="flex gap-2">
          <NotificationBell onClick={() => setShowNotifications(true)} />
          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-primary/20 cursor-pointer active:scale-95 transition-transform">
            <img 
              alt={userName || 'User'} 
              className="w-full h-full object-cover" 
              src={displayAvatar}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/user/200/200';
              }}
            />
          </div>
        </div>
      </header>
      
      {/* Notification Center Modal */}
      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </>
  );
};

export default Header;
