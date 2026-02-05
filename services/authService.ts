/**
 * Authentication Service
 */
import { authApi, api } from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  avatar?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface UserProfile {
  id: string;
  externalId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  avatar?: string;
  bio?: string;
  streakCount: number;
  totalPoints: number;
  currentXp: number;
  level: number;
  privacyShowLeaderboard: boolean;
  privacyShowActivity: boolean;
  privacyAllowFollowers: boolean;
  privacyPublicLeaderboard?: 'visible' | 'anonymous' | 'hidden';
  privacyChallengeLeaderboard?: 'visible' | 'anonymous' | 'hidden';
}

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    return authApi.post<AuthResponse>('/api/auth/login', data);
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    return authApi.post<AuthResponse>('/api/auth/register', data);
  },

  async logout(): Promise<void> {
    try {
      await authApi.post('/api/auth/logout');
    } catch (e) {
      // Ignore logout errors
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  async requestPasswordReset(email: string): Promise<{ success: boolean }> {
    return authApi.post<{ success: boolean }>('/api/auth/forgot-password', { email });
  },

  async verifyResetCode(email: string, code: string): Promise<{ valid: boolean }> {
    return authApi.post<{ valid: boolean }>('/api/auth/verify-reset-code', { email, code });
  },

  async resetPassword(email: string, code: string, newPassword: string): Promise<{ success: boolean }> {
    return authApi.post<{ success: boolean }>('/api/auth/reset-password', { email, code, newPassword });
  },

  storeAuth(response: AuthResponse): void {
    localStorage.setItem('token', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.user));
  },

  getStoredUser(): AuthUser | null {
    const user = localStorage.getItem('user');
    try {
      return user ? JSON.parse(user) : null;
    } catch (e) {
      console.error('Failed to parse user from storage', e);
      localStorage.removeItem('user'); // Clear corrupted data
      return null;
    }
  },

  getStoredToken(): string | null {
    return localStorage.getItem('token');
  },

  isAuthenticated(): boolean {
    return !!this.getStoredToken();
  }
};

export const userService = {
  async getProfile(): Promise<UserProfile> {
    return api.get<UserProfile>('/api/user/profile');
  },

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    return api.patch<UserProfile>('/api/user/profile', data);
  },

  async syncUser(data: { externalId: string; name: string; email: string; avatarUrl?: string }): Promise<UserProfile> {
    return api.post<UserProfile>('/api/user/sync', data);
  },

  async getActivity(): Promise<{ date: string; count: number }[]> {
    return api.get('/api/user/activity');
  },

  async getStats(): Promise<{
    streakCount: number;
    totalPoints: number;
    currentXp: number;
    level: number;
    completedToday: number;
    totalToday: number;
    badges?: string[];
    totalRewards?: number;
  }> {
    return api.get('/api/user/stats');
  },

  async changeEmail(newEmail: string, password: string): Promise<{ success: boolean }> {
    return api.post('/api/user/change-email', { newEmail, password });
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean }> {
    return api.post('/api/user/change-password', { oldPassword, newPassword });
  },

  async deleteAccount(password: string): Promise<{ success: boolean }> {
    return api.post('/api/user/delete', { password });
  },

  async exportData(): Promise<any> {
    return api.get('/api/user/export');
  },

  async getBlockedUsers(): Promise<{ id: string; name: string; avatar?: string }[]> {
    return api.get('/api/user/blocked');
  },

  async blockUser(userId: string): Promise<{ success: boolean }> {
    return api.post(`/api/user/block/${userId}`);
  },

  async unblockUser(userId: string): Promise<{ success: boolean }> {
    return api.delete(`/api/user/block/${userId}`);
  },

  async getNotificationSettings(): Promise<{
    pushEnabled: boolean;
    emailEnabled: boolean;
    dailyReminder: boolean;
    challengeUpdates: boolean;
    socialActivity: boolean;
    achievements: boolean;
    reminderTime: string;
  }> {
    return api.get('/api/user/notification-settings');
  },

  async updateNotificationSettings(settings: {
    pushEnabled?: boolean;
    emailEnabled?: boolean;
    dailyReminder?: boolean;
    challengeUpdates?: boolean;
    socialActivity?: boolean;
    achievements?: boolean;
    reminderTime?: string;
  }): Promise<{ success: boolean }> {
    return api.patch('/api/user/notification-settings', settings);
  }
};
