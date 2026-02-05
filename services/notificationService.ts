import { api } from './api';
import { Notification } from '../types';

export const notificationService = {
  getNotifications: async (unreadOnly = false, limit = 20, offset = 0) => {
    return api.get<{ notifications: Notification[]; unreadCount: number }>(
      `/api/notifications?unreadOnly=${unreadOnly}&limit=${limit}&offset=${offset}`
    );
  },

  markAsRead: async (notificationId: string) => {
    return api.patch<{ success: boolean }>(`/api/notifications/${notificationId}/read`);
  },

  markAllAsRead: async () => {
    return api.post<{ success: boolean }>('/api/notifications/mark-all-read');
  },

  acceptNotification: async (notificationId: string, notificationType: string) => {
    // Different endpoints based on notification type
    switch (notificationType) {
      case 'friend_request':
        return api.post<{ success: boolean }>(`/api/social/friend-request/${notificationId}/accept`);
      case 'challenge_invite':
      case 'CHALLENGE_INVITE':
        return api.post<{ success: boolean }>(`/api/challenges/invite/${notificationId}/accept`);
      case 'ORG_INVITE':
        return api.post<{ success: boolean }>(`/api/organizations/invite/${notificationId}/accept`);
      default:
        return api.post<{ success: boolean }>(`/api/notifications/${notificationId}/accept`);
    }
  },

  declineNotification: async (notificationId: string, notificationType: string) => {
    switch (notificationType) {
      case 'friend_request':
        return api.post<{ success: boolean }>(`/api/social/friend-request/${notificationId}/decline`);
      case 'challenge_invite':
      case 'CHALLENGE_INVITE':
        return api.post<{ success: boolean }>(`/api/challenges/invite/${notificationId}/decline`);
      case 'ORG_INVITE':
        return api.post<{ success: boolean }>(`/api/organizations/invite/${notificationId}/decline`);
      default:
        return api.post<{ success: boolean }>(`/api/notifications/${notificationId}/decline`);
    }
  },
};
