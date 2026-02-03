
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import ProgressCard from './components/ProgressCard';
import TaskCard from './components/TaskCard';
import BottomNav from './components/BottomNav';
import HomeView from './components/HomeView';
import HabitView from './components/HabitView';
import SocialView from './components/SocialView';
import ProfileView from './components/ProfileView';
import DiscoverView from './components/DiscoverView';
import HabitCoach from './components/HabitCoach';
import LoginView from './components/LoginView';
import SignupView from './components/SignupView';
import ChallengeDetailView from './components/ChallengeDetailView';
import OnboardingView from './components/OnboardingView';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { taskService, challengeService } from './services';
import { Tab, AuthMode } from './types';
import type { Task as UITask, Challenge as UIChallenge } from './types';
import { UndoSnackbar, PullToRefresh, EmptyState, CreateTaskModal, EditTaskModal } from './components/ui';
import { TaskCardSkeleton, ProgressCardSkeleton } from './components/ui/Skeleton';

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
  activeBlocks: Math.min(4, Math.ceil(((apiTask.currentValue || 0) / (apiTask.goal || 1)) * 4)),
  priority: apiTask.priority || 'medium',
  dueDate: apiTask.dueDate || apiTask.due_date,
  type: apiTask.type || 'check',
  // Counter-specific fields
  currentValue: apiTask.currentValue || 0,
  goal: apiTask.goal,
  unit: apiTask.unit,
  step: apiTask.step || 1
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

// Check if user has completed onboarding
const ONBOARDING_KEY = 'habitpulse_onboarding_complete';
const hasCompletedOnboarding = (): boolean => {
  return localStorage.getItem(ONBOARDING_KEY) === 'true';
};
const setOnboardingComplete = (): void => {
  localStorage.setItem(ONBOARDING_KEY, 'true');
};

const ActiveView: React.FC<{ 
  tasks: UITask[], 
  challenges: UIChallenge[],
  onToggle: (id: string) => void,
  onTaskClick: (task: UITask) => void,
  onIncrement: (id: string) => void,
  onDecrement: (id: string) => void,
  loading: boolean,
  onOpenDiscover: () => void,
  onChallengeClick: (challengeId: string) => void,
  onRefresh: () => Promise<void>,
  onCreateTask: () => void
}> = ({ tasks, challenges, onToggle, onTaskClick, onIncrement, onDecrement, loading, onOpenDiscover, onChallengeClick, onRefresh, onCreateTask }) => {
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);

  return (
    <PullToRefresh onRefresh={onRefresh} className="animate-in fade-in duration-500">
      {/* Discover Button */}
      <div className="px-6 mt-4">
        <button 
          onClick={onOpenDiscover}
          className="w-full p-4 bg-gradient-to-r from-primary to-purple-500 text-white rounded-2xl flex items-center justify-between shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Discover new challenges"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined" aria-hidden="true">explore</span>
            <span className="font-bold">Discover New Challenges</span>
          </div>
          <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
        </button>
      </div>

      {/* Progress Section */}
      <section className="mt-6" aria-label="Current progress">
        <div className="px-6 flex justify-between items-center mb-4">
          {/* Fixed contrast: text-slate-400 -> text-slate-600 */}
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Current Progress</h2>
          <button 
            className="text-primary text-xs font-bold uppercase tracking-widest active:opacity-50 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
            aria-label="View all challenges"
          >
            View All Challenges
          </button>
        </div>
        
        <div 
          className="flex overflow-x-auto gap-4 px-6 no-scrollbar snap-x pb-4"
          onScroll={(e) => {
            const container = e.currentTarget;
            const scrollPosition = container.scrollLeft;
            const cardWidth = 280 + 16; // card width + gap
            const index = Math.round(scrollPosition / cardWidth);
            setCurrentChallengeIndex(Math.min(index, challenges.length - 1));
          }}
        >
          {loading ? (
            <>
              <ProgressCardSkeleton />
              <ProgressCardSkeleton />
            </>
          ) : challenges.length > 0 ? (
            challenges.map((challenge, index) => (
              <ProgressCard 
                key={challenge.id} 
                challenge={challenge} 
                onClick={() => onChallengeClick(challenge.id)}
                currentIndex={currentChallengeIndex}
                totalCount={challenges.length}
              />
            ))
          ) : (
            <div className="min-w-full">
              <EmptyState
                icon="emoji_events"
                title="No active challenges"
                description="Join a challenge to start tracking your progress and building better habits."
                actionLabel="Discover Challenges"
                onAction={onOpenDiscover}
                illustration="challenges"
              />
            </div>
          )}
          <div className="min-w-[1px] h-full" aria-hidden="true" />
        </div>
      </section>

      {/* Tasks Section */}
      <section className="mt-8 px-6 pb-10" aria-label="Today's tasks">
        <div className="flex items-center justify-between mb-4">
          {/* Fixed contrast */}
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Today's Tasks</h2>
          <button
            onClick={onCreateTask}
            className="text-primary text-xs font-bold uppercase tracking-widest flex items-center gap-1 active:opacity-50 transition-opacity"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Task
          </button>
        </div>
        <div className="space-y-4" role="list">
          {loading ? (
            <>
              <TaskCardSkeleton />
              <TaskCardSkeleton />
            </>
          ) : tasks.length > 0 ? (
            tasks.map((task) => (
              <div key={task.id} onClick={() => onTaskClick(task)} className="cursor-pointer">
                <TaskCard 
                  task={task} 
                  onToggle={(e) => {
                    e?.stopPropagation?.();
                    onToggle(task.id);
                  }}
                  onIncrement={() => onIncrement(task.id)}
                  onDecrement={() => onDecrement(task.id)}
                />
              </div>
            ))
          ) : (
            <EmptyState
              icon="task_alt"
              title="No tasks for today"
              description="Create a new task or join a challenge to get daily tasks."
              actionLabel="Create Task"
              onAction={onCreateTask}
              illustration="tasks"
            />
          )}
        </div>
      </section>

      {/* Floating Action Button for Create Task */}
      <button
        onClick={onCreateTask}
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center active:scale-95 transition-transform z-50"
        aria-label="Create new task"
      >
        <span className="material-symbols-outlined text-2xl">add</span>
      </button>
    </PullToRefresh>
  );
};

const AppContent: React.FC = () => {
  const { user, profile, isLoading: authLoading, logout } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [activeTab, setActiveTab] = useState<Tab>('active');
  const [tasks, setTasks] = useState<UITask[]>([]);
  const [challenges, setChallenges] = useState<UIChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDiscover, setShowDiscover] = useState(false);
  const [selectedChallengeId, setSelectedChallengeId] = useState<number | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Task Modal States
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<UITask | null>(null);
  const [showEditTask, setShowEditTask] = useState(false);
  
  // Undo snackbar state
  const [undoState, setUndoState] = useState<{
    isVisible: boolean;
    taskId: string;
    previousState: boolean;
    message: string;
  }>({ isVisible: false, taskId: '', previousState: false, message: '' });

  // Check onboarding status when user logs in
  useEffect(() => {
    if (user && !hasCompletedOnboarding()) {
      setShowOnboarding(true);
    }
  }, [user]);

  // Fetch tasks and challenges from API
  const fetchData = useCallback(async () => {
    if (!user) return;

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
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    await fetchData();
  };

  const handleToggleTask = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const previousState = task.completed;
    const newState = !previousState;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: newState } : t))
    );

    // Show undo snackbar
    setUndoState({
      isVisible: true,
      taskId: id,
      previousState,
      message: newState ? 'Task completed!' : 'Task marked incomplete'
    });

    try {
      const newStatus = previousState ? 'pending' : 'completed';
      await taskService.updateTask(parseInt(id), newStatus as any);
    } catch (err) {
      // Revert on error
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: previousState } : t))
      );
      setUndoState(prev => ({ ...prev, isVisible: false }));
      console.error('Failed to update task:', err);
    }
  }, [tasks]);

  const handleIncrementTask = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task || task.type !== 'counter') return;

    const step = task.step || 1;
    const previousValue = task.currentValue || 0;
    const newValue = previousValue + step;
    const newCompleted = task.goal ? newValue >= task.goal : false;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, currentValue: newValue, completed: newCompleted } : t))
    );

    try {
      const newStatus = newCompleted ? 'completed' : 'pending';
      await taskService.updateTask(parseInt(id), newStatus as any, newValue);
    } catch (err) {
      // Revert on error
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, currentValue: previousValue, completed: task.completed } : t))
      );
      console.error('Failed to increment task:', err);
    }
  }, [tasks]);

  const handleDecrementTask = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task || task.type !== 'counter') return;

    const step = task.step || 1;
    const previousValue = task.currentValue || 0;
    const newValue = Math.max(0, previousValue - step);
    const newCompleted = task.goal ? newValue >= task.goal : false;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, currentValue: newValue, completed: newCompleted } : t))
    );

    try {
      const newStatus = newCompleted ? 'completed' : 'pending';
      await taskService.updateTask(parseInt(id), newStatus as any, newValue);
    } catch (err) {
      // Revert on error
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, currentValue: previousValue, completed: task.completed } : t))
      );
      console.error('Failed to decrement task:', err);
    }
  }, [tasks]);

  const handleUndo = useCallback(async () => {
    const { taskId, previousState } = undoState;
    
    // Revert the task state
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: previousState } : t))
    );
    
    // Update the backend
    try {
      const status = previousState ? 'completed' : 'pending';
      await taskService.updateTask(parseInt(taskId), status as any);
    } catch (err) {
      console.error('Failed to undo task:', err);
    }
    
    setUndoState(prev => ({ ...prev, isVisible: false }));
  }, [undoState]);

  const handleLogout = async () => {
    await logout();
  };

  const handleChallengeClick = (challengeId: string) => {
    setSelectedChallengeId(parseInt(challengeId));
  };

  const handleTaskClick = (task: UITask) => {
    setSelectedTask(task);
    setShowEditTask(true);
  };

  const handleTaskCreated = () => {
    fetchData();
  };

  const handleTaskDeleted = () => {
    setShowEditTask(false);
    setSelectedTask(null);
    fetchData();
  };

  const handleOnboardingComplete = () => {
    setOnboardingComplete();
    setShowOnboarding(false);
    // Open discover view to help user get started
    setShowDiscover(true);
  };

  const handleOnboardingSkip = () => {
    setOnboardingComplete();
    setShowOnboarding(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView tasks={tasks} profile={profile} />;
      case 'habits':
        return <HabitView />;
      case 'social':
        return <SocialView />;
      case 'me':
        return <ProfileView onLogout={handleLogout} profile={profile} />;
      case 'active':
      default:
        return (
          <ActiveView 
            tasks={tasks} 
            challenges={challenges} 
            onToggle={handleToggleTask}
            onTaskClick={handleTaskClick}
            onIncrement={handleIncrementTask}
            onDecrement={handleDecrementTask}
            loading={loading} 
            onOpenDiscover={() => setShowDiscover(true)} 
            onChallengeClick={handleChallengeClick}
            onRefresh={handleRefresh}
            onCreateTask={() => setShowCreateTask(true)}
          />
        );
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Loading">
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

  // Show onboarding for new users
  if (showOnboarding) {
    return (
      <OnboardingView 
        onComplete={handleOnboardingComplete} 
        onSkip={handleOnboardingSkip} 
      />
    );
  }

  return (
    <div className="min-h-screen pb-40">
      <Header userName={profile?.name || user.name} />
      <main className="pt-2">
        {renderContent()}
      </main>
      
      {/* <HabitCoach /> AI feature disabled */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Undo Snackbar */}
      <UndoSnackbar
        message={undoState.message}
        isVisible={undoState.isVisible}
        onUndo={handleUndo}
        onDismiss={() => setUndoState(prev => ({ ...prev, isVisible: false }))}
        duration={5000}
      />
      
      {/* Discover Modal */}
      {showDiscover && (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-900 overflow-auto">
          <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 flex items-center gap-4 border-b border-slate-100 dark:border-slate-800">
            <button 
              onClick={() => setShowDiscover(false)}
              className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Close discover view"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="text-xl font-bold">Discover Challenges</h1>
          </div>
          <DiscoverView onClose={() => setShowDiscover(false)} onJoin={fetchData} />
        </div>
      )}

      {/* Challenge Detail Modal */}
      {selectedChallengeId && (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-900 overflow-auto">
          <ChallengeDetailView 
            challengeId={selectedChallengeId} 
            onBack={() => setSelectedChallengeId(null)} 
          />
        </div>
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        onTaskCreated={handleTaskCreated}
      />

      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={showEditTask}
        task={selectedTask}
        onClose={() => {
          setShowEditTask(false);
          setSelectedTask(null);
        }}
        onTaskUpdated={handleTaskCreated}
        onTaskDeleted={handleTaskDeleted}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
