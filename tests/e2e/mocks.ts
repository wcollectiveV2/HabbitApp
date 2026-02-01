export const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  avatar: 'https://i.pravatar.cc/150?u=1'
};

export const mockAuthResponse = {
  accessToken: 'fake_jwt_token',
  refreshToken: 'fake_refresh_token',
  user: mockUser
};

export const mockTasks = [
  {
    id: 1,
    title: 'Drink Water',
    description: 'Daily Habit',
    icon: 'local_drink',
    status: 'pending',
    currentValue: 1,
    goal: 8
  },
  {
    id: 2,
    title: 'Read Book',
    description: 'Daily Habit',
    icon: 'menu_book',
    status: 'completed',
    currentValue: 1,
    goal: 1
  }
];

export const mockChallenges = [
  {
    id: 1,
    title: 'Morning Yoga Challenge',
    daysRemaining: 12,
    progress: 45,
    participantCount: 156,
    active: true
  },
  {
    id: 2,
    title: 'No Sugar Week',
    daysRemaining: 5,
    progress: 80,
    participantCount: 89,
    active: true
  }
];

export const mockDiscoverChallenges = {
  challenges: [
    {
      id: 3,
      title: 'Marathon Training',
      description: 'Run 42km in 4 weeks',
      participantCount: 500,
      daysRemaining: 28,
      type: 'competitive',
      isJoined: false
    },
    {
      id: 4,
      title: 'Meditation Master',
      description: 'Meditate daily',
      participantCount: 200,
      daysRemaining: 15,
      type: 'individual',
      isJoined: false
    }
  ]
};
