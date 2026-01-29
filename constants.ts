
import { Challenge, Task, LeaderboardUser, FeedItem } from './types';

export const MOCK_CHALLENGES: Challenge[] = [
  {
    id: '1',
    title: 'Hydration Hero',
    timeLeft: '14 days left',
    progress: 70,
    joinedText: 'JOINED THIS WEEK',
    theme: 'primary',
    participants: [
      'https://picsum.photos/seed/p1/100/100',
      'https://picsum.photos/seed/p2/100/100'
    ],
    extraParticipants: 12
  },
  {
    id: '2',
    title: 'Morning Flow',
    timeLeft: '21 days left',
    progress: 33,
    joinedText: 'JOINED THIS WEEK',
    theme: 'dark',
    participants: [
      'https://picsum.photos/seed/p3/100/100',
      'https://picsum.photos/seed/p4/100/100'
    ],
    extraParticipants: 4
  }
];

export const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Drink 2L Water',
    challengeName: 'Hydration Hero',
    icon: 'water_drop',
    iconBg: 'bg-blue-50 dark:bg-blue-900/20',
    iconColor: 'text-blue-500',
    completed: true,
    currentProgress: 12,
    totalProgress: 30,
    progressBlocks: 4,
    activeBlocks: 2
  },
  {
    id: 't2',
    title: '15m Meditation',
    challengeName: 'Morning Flow',
    icon: 'self_improvement',
    iconBg: 'bg-purple-50 dark:bg-purple-900/20',
    iconColor: 'text-purple-500',
    completed: false,
    currentProgress: 3,
    totalProgress: 30,
    progressBlocks: 4,
    activeBlocks: 1
  },
  {
    id: 't3',
    title: 'No Elevator Day',
    challengeName: 'Step Up Challenge',
    icon: 'stairs',
    iconBg: 'bg-orange-50 dark:bg-orange-900/20',
    iconColor: 'text-orange-500',
    completed: false,
    currentProgress: 8,
    totalProgress: 14,
    progressBlocks: 4,
    activeBlocks: 2
  }
];

export const MOCK_LEADERBOARD: LeaderboardUser[] = [
  { rank: 1, name: 'Sarah Wilson', points: 2450, avatar: 'https://picsum.photos/seed/sarah/100/100' },
  { rank: 2, name: 'James Miller', points: 2210, avatar: 'https://picsum.photos/seed/james/100/100' },
  { rank: 3, name: 'Alex Rivera', points: 2100, avatar: 'https://picsum.photos/seed/user/100/100', isCurrentUser: true },
  { rank: 4, name: 'Emily Chen', points: 1980, avatar: 'https://picsum.photos/seed/emily/100/100' },
  { rank: 5, name: 'David Park', points: 1850, avatar: 'https://picsum.photos/seed/david/100/100' },
];

export const MOCK_FEED: FeedItem[] = [
  { id: 'f1', userName: 'Sarah Wilson', userAvatar: 'https://picsum.photos/seed/sarah/100/100', action: 'completed', target: 'Day 12 of Hydration Hero', timestamp: '2h ago' },
  { id: 'f2', userName: 'James Miller', userAvatar: 'https://picsum.photos/seed/james/100/100', action: 'started', target: 'New Challenge: 10K Steps', timestamp: '4h ago' },
];
