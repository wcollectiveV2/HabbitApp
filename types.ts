
export interface Challenge {
  id: string;
  title: string;
  timeLeft: string;
  progress: number;
  joinedText: string;
  theme: 'primary' | 'dark';
  participants: string[];
  extraParticipants: number;
  daily_action?: string;
  icon?: string;
  targetDays?: number;
}

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskType = 'check' | 'counter' | 'log';

export interface Task {
  id: string;
  title: string;
  challengeName: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  completed: boolean;
  currentProgress: number;
  totalProgress: number;
  progressBlocks: number;
  activeBlocks: number;
  priority?: TaskPriority;
  dueDate?: string;
  type?: TaskType;
  // Counter-specific fields
  currentValue?: number;
  goal?: number;
  unit?: string;
  step?: number;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  points: number;
  avatar: string;
  isCurrentUser?: boolean;
}

export interface FeedItem {
  id: string;
  userName: string;
  userAvatar: string;
  action: string;
  target: string;
  timestamp: string;
}

export type Tab = 'home' | 'habits' | 'active' | 'social' | 'me';
export type AuthMode = 'login' | 'signup';

export interface Notification {
  id: string;
  user_id: string;
  type: 'friend_request' | 'challenge_invite' | 'system' | 'reminder' | 'achievement';
  title: string;
  message?: string;
  data?: any;
  is_read: boolean;
  created_at: string;
}
