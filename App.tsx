
import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
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

import Layout from './components/Layout';

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

  const pendingTasks = tasks.filter(t => !t.completed).length;

  return (
    <div style={{ paddingBottom: '100px' }} className="animate-fade-in">
      {/* Greeting Section */}
      <div style={{ marginTop: '16px', marginBottom: '20px' }}>
         <h1 style={{ 
           fontSize: '28px', 
           fontWeight: 800, 
           color: '#1E293B',
           margin: 0,
           letterSpacing: '-0.5px',
         }}>
           Hello there! 👋
         </h1>
         <p style={{ 
           fontSize: '15px', 
           color: '#64748B', 
           margin: '4px 0 0 0',
           fontWeight: 500,
         }}>
           Ready to crush your goals today?
         </p>
      </div>

      {/* Discover Button */}
      <button 
        onClick={onOpenDiscover}
        style={{
          width: '100%',
          padding: '20px',
          background: 'linear-gradient(135deg, #5D5FEF 0%, #8B5CF6 100%)',
          color: '#FFFFFF',
          borderRadius: '24px',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 10px 40px rgba(93,95,239,0.3)',
          marginBottom: '24px',
        }}
      >
        <div style={{ textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="material-symbols-outlined" style={{ color: '#FDE047' }}>emoji_events</span>
            <span style={{ fontSize: '18px', fontWeight: 700 }}>Join a Challenge</span>
          </div>
          <span style={{ fontSize: '13px', opacity: 0.85 }}>Competitions starting soon</span>
        </div>
        <div style={{
          width: '44px',
          height: '44px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span className="material-symbols-outlined">arrow_forward</span>
        </div>
      </button>

      {/* Challenges Section */}
      <section style={{ marginBottom: '24px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px',
        }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: 700, 
            color: '#1E293B',
            margin: 0,
          }}>
            Your Challenges
          </h2>
          <button style={{
            background: 'none',
            border: 'none',
            color: '#5D5FEF',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}>
            See All
          </button>
        </div>
        
        <div 
          style={{
            display: 'flex',
            gap: '16px',
            overflowX: 'auto',
            paddingBottom: '8px',
            marginLeft: '-20px',
            marginRight: '-20px',
            paddingLeft: '20px',
            paddingRight: '20px',
          }}
          className="no-scrollbar"
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
            <div style={{ 
              width: '100%', 
              padding: '40px 20px',
              background: '#F8FAFC',
              borderRadius: '20px',
              textAlign: 'center',
            }}>
              <span className="material-symbols-outlined" style={{ 
                fontSize: '48px', 
                color: '#CBD5E1',
                marginBottom: '12px',
                display: 'block',
              }}>
                rocket_launch
              </span>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#475569', margin: '0 0 8px 0' }}>
                Start your journey
              </h3>
              <p style={{ fontSize: '13px', color: '#94A3B8', margin: '0 0 16px 0' }}>
                Join your first challenge today
              </p>
              <button 
                onClick={onOpenDiscover}
                style={{
                  background: '#5D5FEF',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Explore Challenges
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Tasks Section */}
      <section>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: 700, 
            color: '#1E293B',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            Today's Focus
            <span style={{
              background: '#EEF2FF',
              color: '#5D5FEF',
              fontSize: '12px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '20px',
            }}>
              {pendingTasks}
            </span>
          </h2>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {loading ? (
            <>
              <TaskCardSkeleton />
              <TaskCardSkeleton />
            </>
          ) : tasks.length > 0 ? (
            tasks.map((task) => (
              <div key={task.id} onClick={() => onTaskClick(task)} style={{ cursor: 'pointer' }}>
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
              icon="check_circle"
              title="All caught up!"
              description="You've completed all your tasks for today. Great job!"
              actionLabel="Add Another Task"
              onAction={onCreateTask}
              illustration="tasks"
            />
          )}
        </div>
      </section>

      {/* Floating Action Button */}
      <button
        onClick={onCreateTask}
        style={{
          position: 'fixed',
          bottom: '100px',
          right: '24px',
          width: '56px',
          height: '56px',
          background: 'linear-gradient(135deg, #5D5FEF 0%, #8B5CF6 100%)',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '18px',
          boxShadow: '0 8px 30px rgba(93,95,239,0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>add</span>
      </button>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user, profile, isLoading: authLoading, logout } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [tasks, setTasks] = useState<UITask[]>([]);
  const [challenges, setChallenges] = useState<UIChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDiscover, setShowDiscover] = useState(false);
  const [selectedChallengeId, setSelectedChallengeId] = useState<number | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Routing
  const location = useLocation();
  const navigate = useNavigate();

  const getTabFromPath = (path: string): Tab => {
    if (path === '/') return 'active';
    if (path === '/home') return 'home';
    if (path === '/habits') return 'habits';
    if (path === '/social') return 'social';
    if (path === '/profile') return 'me';
    return 'active';
  };

  const activeTab = getTabFromPath(location.pathname);

  const handleTabChange = (tab: Tab) => {
    switch (tab) {
      case 'active': navigate('/'); break;
      case 'home': navigate('/home'); break;
      case 'habits': navigate('/habits'); break;
      case 'social': navigate('/social'); break;
      case 'me': navigate('/profile'); break;
      default: navigate('/');
    }
  };

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
    <>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab} title={activeTab === 'active' ? 'My Progress' : undefined}>
          {renderContent()}
      </Layout>

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
          <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-900 overflow-auto animate-in slide-in-from-bottom-5">
             <div className="mx-auto max-w-md bg-white dark:bg-slate-900 min-h-screen relative">
                <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 flex items-center gap-4 border-b border-slate-100 dark:border-slate-800">
                  <button 
                    onClick={() => setShowDiscover(false)}
                    className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    aria-label="Close discover view"
                  >
                    <span className="material-symbols-outlined">arrow_back</span>
                  </button>
                  <h1 className="text-xl font-bold">Discover Challenges</h1>
                </div>
                <DiscoverView onClose={() => setShowDiscover(false)} onJoin={fetchData} />
             </div>
          </div>
        )}

        {/* Challenge Detail Modal */}
        {selectedChallengeId && (
          <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-900 overflow-auto animate-in slide-in-from-right-5">
            <div className="mx-auto max-w-md bg-white dark:bg-slate-900 min-h-screen relative">
              <ChallengeDetailView 
                challengeId={selectedChallengeId} 
                onBack={() => setSelectedChallengeId(null)} 
              />
            </div>
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
    </>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
