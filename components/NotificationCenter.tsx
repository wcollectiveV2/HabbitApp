import React, { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notificationService';
import { Notification } from '../types';
import Skeleton from './ui/Skeleton';
import { colors, spacing, borderRadius, typography, shadows, zIndex } from '../theme/designSystem';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const getNotificationIcon = (type: string): { icon: string; color: string; bg: string } => {
  switch (type) {
    case 'friend_request':
      return { icon: 'person_add', color: '#3B82F6', bg: '#DBEAFE' };
    case 'challenge_invite':
    case 'CHALLENGE_INVITE':
      return { icon: 'emoji_events', color: '#A855F7', bg: '#F3E8FF' };
    case 'ORG_INVITE':
      return { icon: 'groups', color: colors.success, bg: colors.successBg };
    case 'achievement':
    case 'badge_earned':
      return { icon: 'military_tech', color: colors.warning, bg: colors.warningBg };
    case 'streak_milestone':
      return { icon: 'local_fire_department', color: '#F97316', bg: '#FFEDD5' };
    case 'reminder':
      return { icon: 'alarm', color: colors.error, bg: colors.errorBg };
    case 'system':
    default:
      return { icon: 'notifications', color: colors.text.secondary, bg: colors.gray[100] };
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

  const itemStyle = {
    padding: spacing[4],
    display: 'flex',
    gap: spacing[3],
    backgroundColor: notification.is_read ? colors.background.primary : '#EFF6FF',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  };

  const iconBoxStyle = {
    width: '40px',
    height: '40px',
    borderRadius: borderRadius.full,
    backgroundColor: bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const actionBtnStyle = {
    padding: `${spacing[1]} ${spacing[3]}`,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    borderRadius: borderRadius.full,
    border: 'none',
    cursor: 'pointer',
  };

  return (
    <div style={itemStyle} onClick={() => !notification.is_read && onMarkRead(notification.id)}>
      {/* Icon */}
      <div style={iconBoxStyle}>
        <span className="material-symbols-outlined" style={{ color }}>{icon}</span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing[2] }}>
          <h4 style={{
            fontWeight: typography.fontWeight.semibold,
            fontSize: typography.fontSize.sm,
            color: notification.is_read ? colors.text.secondary : colors.text.primary,
            margin: 0,
          }}>
            {notification.title}
          </h4>
          {!notification.is_read && (
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: borderRadius.full,
              backgroundColor: colors.primary,
              flexShrink: 0,
              marginTop: '6px',
            }} />
          )}
        </div>
        {notification.message && (
          <p style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.secondary,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            margin: 0,
          }}>{notification.message}</p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing[2] }}>
          <span style={{ fontSize: typography.fontSize.xs, color: colors.gray[400] }}>{formatTimeAgo(notification.created_at)}</span>
          {hasAction && !notification.is_read && (
            <div style={{ display: 'flex', gap: spacing[2] }}>
              <button 
                onClick={(e) => { e.stopPropagation(); onAction?.(notification); }}
                style={{ ...actionBtnStyle, backgroundColor: colors.primary, color: 'white' }}
              >
                Accept
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDecline?.(notification); }}
                style={{ ...actionBtnStyle, backgroundColor: colors.gray[200], color: colors.text.secondary }}
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

  const centerStyles = {
    container: {
      position: 'fixed' as const,
      inset: 0,
      zIndex: zIndex.modal,
      backgroundColor: colors.background.primary,
      display: 'flex',
      flexDirection: 'column' as const,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing[4],
      borderBottom: `1px solid ${colors.gray[100]}`,
    },
    backBtn: {
      padding: spacing[2],
      marginLeft: `-${spacing[2]}`,
      borderRadius: borderRadius.full,
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      color: colors.text.primary,
    },
    markAllBtn: {
      color: colors.primary,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
    },
    tabBar: {
      display: 'flex',
      borderBottom: `1px solid ${colors.gray[100]}`,
    },
    tabBtn: (active: boolean) => ({
      flex: 1,
      padding: spacing[3],
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      color: active ? colors.primary : colors.text.secondary,
      borderBottom: active ? `2px solid ${colors.primary}` : 'none',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
    badge: {
      marginLeft: spacing[1],
      padding: `${spacing[0.5]} ${spacing[1.5]}`,
      backgroundColor: colors.primary,
      color: 'white',
      fontSize: typography.fontSize.xs,
      borderRadius: borderRadius.full,
    },
    emptyState: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      textAlign: 'center' as const,
      padding: spacing[6],
    },
  };

  if (!isOpen) return null;

  return (
    <div style={centerStyles.container}>
      {/* Header */}
      <div style={centerStyles.header}>
        <button onClick={onClose} style={centerStyles.backBtn}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 style={{ fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.lg, color: colors.text.primary }}>Notifications</h2>
        <button 
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0}
          style={{ ...centerStyles.markAllBtn, opacity: unreadCount === 0 ? 0.5 : 1 }}
        >
          Mark all read
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={centerStyles.tabBar}>
        <button onClick={() => setFilter('all')} style={centerStyles.tabBtn(filter === 'all')}>
          All
        </button>
        <button onClick={() => setFilter('unread')} style={centerStyles.tabBtn(filter === 'unread')}>
          Unread
          {unreadCount > 0 && (
            <span style={centerStyles.badge}>{unreadCount}</span>
          )}
        </button>
      </div>

      {/* Notification List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: spacing[4], display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
            <Skeleton variant="card" className="h-20" />
            <Skeleton variant="card" className="h-20" />
            <Skeleton variant="card" className="h-20" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div style={centerStyles.emptyState}>
            <span className="material-symbols-outlined" style={{ fontSize: '60px', color: colors.gray[300], marginBottom: spacing[4] }}>notifications_off</span>
            <h3 style={{ fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.lg, color: colors.text.secondary, marginBottom: spacing[2] }}>
              {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
            </h3>
            <p style={{ color: colors.gray[400] }}>
              {filter === 'unread' 
                ? 'You have no unread notifications' 
                : 'When you get notifications, they\'ll show up here'}
            </p>
          </div>
        ) : (
          <div>
            {filteredNotifications.map((notification, index) => (
              <div key={notification.id} style={{ borderBottom: index < filteredNotifications.length - 1 ? `1px solid ${colors.gray[100]}` : 'none' }}>
                <NotificationItem
                  notification={notification}
                  onMarkRead={handleMarkRead}
                  onAction={handleAction}
                  onDecline={handleDecline}
                />
              </div>
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

  const bellStyle = {
    position: 'relative' as const,
    padding: spacing[2],
    borderRadius: borderRadius.full,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    color: colors.text.primary,
    transition: 'background-color 0.2s ease',
  };

  const badgeStyle = {
    position: 'absolute' as const,
    top: spacing[1],
    right: spacing[1],
    width: '16px',
    height: '16px',
    backgroundColor: colors.error,
    color: 'white',
    fontSize: '10px',
    fontWeight: typography.fontWeight.bold,
    borderRadius: borderRadius.full,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <button
      onClick={onClick}
      style={bellStyle}
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
    >
      <span className="material-symbols-outlined">notifications</span>
      {unreadCount > 0 && (
        <span style={badgeStyle}>
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationCenter;
