
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import ProgressCard from './components/ProgressCard';
import TaskCard from './components/TaskCard';
import BottomNav from './components/BottomNav';
import HomeView from './components/HomeView';
import SocialView from './components/SocialView';
import ProfileView from './components/ProfileView';
import HabitCoach from './components/HabitCoach';
import LoginView from './components/LoginView';
import SignupView from './components/SignupView';
import { AuthProvider, useAuth } from './context/AuthContext';
import { taskService, challengeService } from './services';
import { Tab, AuthMode } from './types';
import type { Task as UITask, Challenge as UIChallenge } from './types';

// Transform API task to UI task format
const transformTask = (apiTask: any): UITask => ({
  id: String(apiTask.id),
  title: apiTask.title,
  challengeName: apiTask.description || 'Daily Habit',
  icon: apiTask.icon || 'check_circle',
  iconBg: 'bg-primary/10',
  iconColor: 'text-primary',
  completed: apiTask.status === 'completed',
  currentProgress: apiTask.currentValue || 0,
  totalProgress: apiTask.goal || 1,
  progressBlocks: 4,
  activeBlocks: Math.min(4, Math.ceil(((apiTask.currentValue || 0) / (apiTask.goal || 1)) * 4))
});

// Transform API challenge to UI challenge format
const transformChallenge = (apiChallenge: any): UIChallenge => ({
  id: String(apiChallenge.id),
  title: apiChallenge.title,
  timeLeft: `${apiChallenge.daysRemaining || 0} days left`,
  progress: apiChallenge.progress || 0,
  joinedText: 'JOINED',
  theme: apiChallenge.id % 2 === 0 ? 'dark' : 'primary',
  participants: [],
  extraParticipants: apiChallenge.participantCount || 0
});

const ActiveView: React.FC<{ 
  tasks: UITask[], 
  challenges: UIChallenge[],
  onToggle: (id: string) => void,
  loading: boolean 
}> = ({ tasks, challenges, onToggle, loading }) => (
  <div className="animate-in fade-in duration-500">
    {/* Progress Section */}
    <section className="mt-4">
      <div className="px-6 flex justify-between items-center mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Current Progress</h2>
        <button className="text-primary text-xs font-bold uppercase tracking-widest active:opacity-50 transition-opacity">
          View All
        </button>
      </div>
      
      <div className="flex overflow-x-auto gap-4 px-6 no-scrollbar snap-x pb-4">
        {loading ? (
          <div className="min-w-[280px] h-40 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse"></div>
        ) : challenges.length > 0 ? (
          challenges.map((challenge) => (
            <ProgressCard key={challenge.id} challenge={challenge} />
          ))
        ) : (
          <div className="min-w-[280px] p-6 bg-slate-100 dark:bg-slate-800 rounded-3xl text-center text-slate-400">
            No active challenges. Join one!
          </div>
        )}
        <div className="min-w-[1px] h-full" />
      </div>
    </section>

    {/* Tasks Section */}
    <section className="mt-8 px-6">
      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Today's Tasks</h2>
      <div className="space-y-4">
        {loading ? (
          <>
            <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse"></div>
            <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse"></div>
          </>
        ) : tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onToggle={onToggle} 
            />
          ))
        ) : (
          <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-3xl text-center text-slate-400">
            No tasks for today. Create some habits!
          </div>
        )}
      </div>
    </section>
  </div>
);

const AppContent: React.FC = () => {
  const { user, profile, isLoading: authLoading, logout } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [activeTab, setActiveTab] = useState<Tab>('active');
  const [tasks, setTasks] = useState<UITask[]>([]);
  const [challenges, setChallenges] = useState<UIChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch tasks and challenges from API
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [taskData, challengeData] = await Promise.all([
          taskService.getTodayTasks().catch(() => ({ tasks: [] })),
          challengeService.getActiveChallenges().catch(() => [])
        ]);
        
        setTasks((taskData.tasks || []).map(transformTask));
        setChallenges((challengeData || []).map(transformChallenge));
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleToggleTask = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );

    try {
      const newStatus = task.completed ? 'pending' : 'completed';
      await taskService.updateTask(parseInt(id), newStatus as any);
    } catch (err) {
      // Revert on error
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: task.completed } : t))
      );
      console.error('Failed to update task:', err);
    }
  }, [tasks]);

  const handleLogout = async () => {
    await logout();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView tasks={tasks} profile={profile} />;
      case 'social':
        return <SocialView />;
      case 'me':
        return <ProfileView onLogout={handleLogout} profile={profile} />;
      case 'active':
      default:
        return <ActiveView tasks={tasks} challenges={challenges} onToggle={handleToggleTask} loading={loading} />;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return authMode === 'login' ? (
      <LoginView onSwitchToSignup={() => setAuthMode('signup')} />
    ) : (
      <SignupView onSwitchToLogin={() => setAuthMode('login')} />
    );
  }

  return (
    <div className="min-h-screen pb-40">
      <Header userName={profile?.name || user.name} />
      <main className="pt-2">
        {renderContent()}
      </main>
      
      <HabitCoach />
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
