import React, { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notificationService';
import { Notification } from '../types';
import Skeleton from './ui/Skeleton';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const getNotificationIcon = (type: string): { icon: string; color: string; bg: string } => {
  switch (type) {
    case 'friend_request':
      return { icon: 'person_add', color: 'text-blue-500', bg: 'bg-blue-100' };
    case 'challenge_invite':
    case 'CHALLENGE_INVITE':
      return { icon: 'emoji_events', color: 'text-purple-500', bg: 'bg-purple-100' };
    case 'ORG_INVITE':
      return { icon: 'groups', color: 'text-green-500', bg: 'bg-green-100' };
    case 'achievement':
    case 'badge_earned':
      return { icon: 'military_tech', color: 'text-yellow-500', bg: 'bg-yellow-100' };
    case 'streak_milestone':
      return { icon: 'local_fire_department', color: 'text-orange-500', bg: 'bg-orange-100' };
    case 'reminder':
      return { icon: 'alarm', color: 'text-red-500', bg: 'bg-red-100' };
    case 'system':
    default:
      return { icon: 'notifications', color: 'text-slate-500', bg: 'bg-slate-100' };
  }
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const NotificationItem: React.FC<{
  notification: Notification;
  onMarkRead: (id: string) => void;
  onAction?: (notification: Notification) => void;
  onDecline?: (notification: Notification) => void;
}> = ({ notification, onMarkRead, onAction, onDecline }) => {
  const { icon, color, bg } = getNotificationIcon(notification.type);
  const hasAction = ['friend_request', 'challenge_invite', 'CHALLENGE_INVITE', 'ORG_INVITE'].includes(notification.type);

  return (
    <div 
      className={`p-4 flex gap-3 transition-colors ${
        notification.is_read ? 'bg-white dark:bg-slate-900' : 'bg-blue-50 dark:bg-blue-900/20'
      }`}
      onClick={() => !notification.is_read && onMarkRead(notification.id)}
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-full ${bg} dark:bg-opacity-20 flex items-center justify-center flex-shrink-0`}>
        <span className={`material-symbols-outlined ${color}`}>{icon}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className={`font-semibold text-sm ${notification.is_read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
            {notification.title}
          </h4>
          {!notification.is_read && (
            <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5"></span>
          )}
        </div>
        {notification.message && (
          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{notification.message}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-slate-400">{formatTimeAgo(notification.created_at)}</span>
          {hasAction && !notification.is_read && (
            <div className="flex gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); onAction?.(notification); }}
                className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full"
              >
                Accept
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDecline?.(notification); }}
                className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-full"
              >
                Decline
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await notificationService.getNotifications(filter === 'unread');
      setNotifications(response.notifications || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleAction = async (notification: Notification) => {
    // Handle accept actions for invites based on notification type
    try {
      await notificationService.acceptNotification(notification.id, notification.type);
      // Remove from list or mark as read after successful accept
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.error('Failed to accept:', err);
      alert('Failed to accept. Please try again.');
    }
  };

  const handleDecline = async (notification: Notification) => {
    // Handle decline actions for invites based on notification type
    try {
      await notificationService.declineNotification(notification.id, notification.type);
      // Mark as read after successful decline
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.error('Failed to decline:', err);
      alert('Failed to decline. Please try again.');
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.is_read) 
    : notifications;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col animate-in slide-in-from-right-10">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
        <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="font-bold text-lg">Notifications</h2>
        <button 
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0}
          className="text-primary text-sm font-bold disabled:opacity-50"
        >
          Mark all read
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-3 text-sm font-bold transition-colors ${
            filter === 'all' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-slate-500'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`flex-1 py-3 text-sm font-bold transition-colors relative ${
            filter === 'unread' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-slate-500'
          }`}
        >
          Unread
          {unreadCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-primary text-white text-xs rounded-full">{unreadCount}</span>
          )}
        </button>
      </div>

      {/* Notification List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-4">
            <Skeleton variant="card" className="h-20" />
            <Skeleton variant="card" className="h-20" />
            <Skeleton variant="card" className="h-20" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">notifications_off</span>
            <h3 className="font-bold text-lg text-slate-600 dark:text-slate-300 mb-2">
              {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
            </h3>
            <p className="text-slate-400">
              {filter === 'unread' 
                ? 'You have no unread notifications' 
                : 'When you get notifications, they\'ll show up here'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredNotifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={handleMarkRead}
                onAction={handleAction}
                onDecline={handleDecline}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Notification Bell Icon with Badge for Header
export const NotificationBell: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await notificationService.getNotifications(true, 1);
        setUnreadCount(response.unreadCount || 0);
      } catch (err) {
        console.error('Failed to fetch unread count:', err);
      }
    };

    fetchUnreadCount();
    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
    >
      <span className="material-symbols-outlined">notifications</span>
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationCenter;
