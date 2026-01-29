
export interface Challenge {
  id: string;
  title: string;
  timeLeft: string;
  progress: number;
  joinedText: string;
  theme: 'primary' | 'dark';
  participants: string[];
  extraParticipants: number;
}

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

export type Tab = 'home' | 'active' | 'social' | 'me';
export type AuthMode = 'login' | 'signup';
