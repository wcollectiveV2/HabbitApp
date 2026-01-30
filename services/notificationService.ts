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
};
