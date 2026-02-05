
import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import ProgressCard from './components/ProgressCard';
import TaskCard from './components/TaskCard';
import HomeView from './components/HomeView';
import HabitView from './components/HabitView';
import SocialView from './components/SocialView';
import ProfileView from './components/ProfileView';
import DiscoverView from './components/DiscoverView';
import LoginView from './components/LoginView';
import SignupView from './components/SignupView';
import ChallengeDetailView from './components/ChallengeDetailView';
import OnboardingView from './components/OnboardingView';
import NotFoundView from './components/NotFoundView';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { taskService, challengeService } from './services';
import type { ChallengeTask } from './services/challengeService';
import { Tab, AuthMode } from './types';
import type { Task as UITask, Challenge as UIChallenge } from './types';
import { EmptyState } from './components/ui';
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
const hasCompletedOnboarding = (userId: string): boolean => {
  return localStorage.getItem(`${ONBOARDING_KEY}_${userId}`) === 'true';
};
const setOnboardingComplete = (userId: string): void => {
  localStorage.setItem(`${ONBOARDING_KEY}_${userId}`, 'true');
};

import Layout from './components/Layout';

const ActiveView: React.FC<{ 
  tasks: UITask[],
  challenges: UIChallenge[],
  challengeTasks: ChallengeTask[],
  onToggle: (id: string) => void,
  onTaskClick: (task: UITask) => void,
  onIncrement: (id: string) => void,
  onDecrement: (id: string) => void,
  onChallengeTaskComplete: (task: ChallengeTask, value?: number) => void,
  loading: boolean,
  onOpenDiscover: () => void,
  onChallengeClick: (challengeId: string) => void,
}> = ({ tasks, challenges, challengeTasks, onToggle, onTaskClick, onIncrement, onDecrement, onChallengeTaskComplete, loading, onOpenDiscover, onChallengeClick }) => {
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [numericInputTaskId, setNumericInputTaskId] = useState<number | null>(null);
  const [numericInputValue, setNumericInputValue] = useState<string>('');

  const pendingChallengeTasks = challengeTasks.filter(t => !t.isCompleted).length;

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
          <button 
            onClick={onOpenDiscover}
            style={{
              background: 'none',
              border: 'none',
              color: '#5D5FEF',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
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
            Current Progress
            <span style={{
              background: '#EEF2FF',
              color: '#5D5FEF',
              fontSize: '12px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '20px',
            }}>
              {pendingChallengeTasks}
            </span>
          </h2>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {loading ? (
            <>
              <TaskCardSkeleton />
              <TaskCardSkeleton />
            </>
          ) : challengeTasks.length > 0 ? (
            <>
              {/* Challenge Tasks */}
              {challengeTasks.map((task) => (
                <div
                  key={`challenge-task-${task.id}`}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '20px',
                    padding: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    border: '1px solid #F1F5F9',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Checkbox / Complete button */}
                    <button
                      onClick={() => {
                        if (task.type === 'numeric') {
                          setNumericInputTaskId(task.id);
                          setNumericInputValue(String(task.currentValue || ''));
                        } else {
                          onChallengeTaskComplete(task);
                        }
                      }}
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '14px',
                        border: 'none',
                        background: task.isCompleted 
                          ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' 
                          : 'linear-gradient(135deg, #5D5FEF 0%, #8B5CF6 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: task.isCompleted
                          ? '0 4px 12px rgba(16,185,129,0.3)'
                          : '0 4px 12px rgba(93,95,239,0.3)',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ color: '#FFFFFF', fontSize: '20px' }}>
                        {task.isCompleted ? 'check' : (task.type === 'numeric' ? 'edit' : 'add')}
                      </span>
                    </button>
                    
                    {/* Task Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ 
                          fontSize: '15px', 
                          fontWeight: 600, 
                          color: task.isCompleted ? '#10B981' : '#1E293B',
                          textDecoration: task.isCompleted ? 'line-through' : 'none',
                        }}>
                          {task.title}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#5D5FEF' }}>
                          {task.challengeIcon || 'emoji_events'}
                        </span>
                        <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
                          {task.challengeTitle}
                        </span>
                      </div>
                    </div>
                    
                    {/* Progress indicator for numeric tasks */}
                    {task.type === 'numeric' && (
                      <div style={{ 
                        textAlign: 'right',
                        minWidth: '70px',
                      }}>
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: 700, 
                          color: task.isCompleted ? '#10B981' : '#5D5FEF',
                        }}>
                          {task.currentValue}/{task.targetValue}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>
                          {task.unit || 'units'}
                        </div>
                      </div>
                    )}
                    
                    {/* Completed badge for boolean tasks */}
                    {task.type !== 'numeric' && task.isCompleted && (
                      <span style={{
                        background: '#D1FAE5',
                        color: '#059669',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '20px',
                      }}>
                        ✓ Done
                      </span>
                    )}
                  </div>
                  
                  {/* Numeric input section */}
                  {numericInputTaskId === task.id && (
                    <div style={{ 
                      marginTop: '12px', 
                      paddingTop: '12px', 
                      borderTop: '1px solid #F1F5F9',
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                    }}>
                      <input
                        type="number"
                        value={numericInputValue}
                        onChange={(e) => setNumericInputValue(e.target.value)}
                        placeholder={`Enter ${task.unit || 'value'}`}
                        autoFocus
                        style={{
                          flex: 1,
                          padding: '10px 14px',
                          borderRadius: '12px',
                          border: '1px solid #E2E8F0',
                          fontSize: '16px',
                          fontWeight: 600,
                          textAlign: 'center',
                          outline: 'none',
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && numericInputValue) {
                            onChallengeTaskComplete(task, parseInt(numericInputValue));
                            setNumericInputTaskId(null);
                            setNumericInputValue('');
                          } else if (e.key === 'Escape') {
                            setNumericInputTaskId(null);
                            setNumericInputValue('');
                          }
                        }}
                      />
                      <span style={{ color: '#64748B', fontSize: '14px' }}>{task.unit || ''}</span>
                      <button
                        onClick={() => {
                          if (numericInputValue) {
                            onChallengeTaskComplete(task, parseInt(numericInputValue));
                            setNumericInputTaskId(null);
                            setNumericInputValue('');
                          }
                        }}
                        disabled={!numericInputValue}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '12px',
                          background: numericInputValue ? 'linear-gradient(135deg, #5D5FEF 0%, #8B5CF6 100%)' : '#E2E8F0',
                          color: '#FFFFFF',
                          border: 'none',
                          fontWeight: 700,
                          fontSize: '14px',
                          cursor: numericInputValue ? 'pointer' : 'default',
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setNumericInputTaskId(null);
                          setNumericInputValue('');
                        }}
                        style={{
                          padding: '10px',
                          borderRadius: '12px',
                          background: '#F1F5F9',
                          color: '#64748B',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                      </button>
                    </div>
                  )}
                  
                  {/* Progress bar for numeric tasks */}
                  {task.type === 'numeric' && numericInputTaskId !== task.id && (
                    <div style={{ marginTop: '12px' }}>
                      <div style={{
                        height: '6px',
                        background: '#F1F5F9',
                        borderRadius: '10px',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${Math.min(100, (task.currentValue / task.targetValue) * 100)}%`,
                          background: task.isCompleted 
                            ? 'linear-gradient(90deg, #10B981 0%, #059669 100%)'
                            : 'linear-gradient(90deg, #5D5FEF 0%, #8B5CF6 100%)',
                          borderRadius: '10px',
                          transition: 'width 0.3s ease',
                        }} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <EmptyState
              icon="emoji_events"
              title="No challenge tasks yet"
              description="Join a challenge to see your daily actions here!"
              actionLabel="Explore Challenges"
              onAction={onOpenDiscover}
              illustration="challenges"
            />
          )}
        </div>
      </section>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user, profile, isLoading: authLoading, logout } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [tasks, setTasks] = useState<UITask[]>([]);
  const [challenges, setChallenges] = useState<UIChallenge[]>([]);
  const [challengeTasks, setChallengeTasks] = useState<ChallengeTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDiscover, setShowDiscover] = useState(false);
  const [selectedChallengeId, setSelectedChallengeId] = useState<number | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Routing
  const location = useLocation();
  const navigate = useNavigate();

  // Switch to signup if invitation token is present
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('invitationToken') || searchParams.get('token')) {
      setAuthMode('signup');
    }
  }, []);

  const getTabFromPath = (path: string): Tab => {
    if (path === '/') return 'home';
    if (path === '/active') return 'active';
    if (path === '/habits') return 'habits';
    if (path === '/social') return 'social';
    if (path === '/profile') return 'me';
    return 'home';
  };

  const activeTab = getTabFromPath(location.pathname);

  const handleTabChange = (tab: Tab) => {
    switch (tab) {
      case 'active': navigate('/active'); break;
      case 'home': navigate('/'); break;
      case 'habits': navigate('/habits'); break;
      case 'social': navigate('/social'); break;
      case 'me': navigate('/profile'); break;
      default: navigate('/');
    }
  };



  // Check onboarding status when user logs in
  useEffect(() => {
    if (user && user.id && !hasCompletedOnboarding(String(user.id))) {
      setShowOnboarding(true);
    }
  }, [user]);

  // Fetch tasks and challenges from API
  const fetchData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [taskData, challengeData, challengeTasksData] = await Promise.all([
        taskService.getTodayTasks().catch(() => ({ tasks: [] })),
        challengeService.getActiveChallenges().catch(() => []),
        challengeService.getAllChallengeTasks().catch(() => [])
      ]);
      
      setTasks((taskData.tasks || []).map(transformTask));
      setChallenges((challengeData || []).map(transformChallenge));
      setChallengeTasks(challengeTasksData || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle challenge task completion from the home screen
  const handleChallengeTaskComplete = useCallback(async (task: ChallengeTask, value?: number) => {
    const previousValue = task.currentValue;
    const previousCompleted = task.isCompleted;
    
    // For numeric tasks, use the provided value; for boolean tasks, toggle completion
    const newValue = value !== undefined ? value : (task.isCompleted ? 0 : task.targetValue);
    const newCompleted = newValue >= task.targetValue;
    
    // Optimistic update
    setChallengeTasks(prev => 
      prev.map(t => t.id === task.id 
        ? { ...t, currentValue: newValue, isCompleted: newCompleted }
        : t
      )
    );
    
    try {
      await challengeService.logProgress(task.challengeId, {
        completed: newCompleted,
        taskId: task.id,
        value: newValue
      });
      
      // Refresh to get accurate data
      const updatedTasks = await challengeService.getAllChallengeTasks();
      setChallengeTasks(updatedTasks);
    } catch (err) {
      // Revert on error
      setChallengeTasks(prev =>
        prev.map(t => t.id === task.id
          ? { ...t, currentValue: previousValue, isCompleted: previousCompleted }
          : t
        )
      );
      console.error('Failed to update challenge task:', err);
    }
  }, []);

  const handleToggleTask = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newCompleted = !task.completed;
    const newStatus = newCompleted ? 'completed' : 'pending';
    
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, completed: newCompleted } : t
    ));

    try {
      await taskService.updateTask(taskId, newStatus as any);
      const { tasks: updated } = await taskService.getTodayTasks();
      setTasks(updated.map(transformTask));
    } catch (err) {
      console.error('Toggle task failed', err);
      setTasks(prev => prev.map(t => 
        t.id === taskId ? task : t
      ));
    }
  }, [tasks]);

  const handleIncrement = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const newValue = (task.currentValue || 0) + (task.step || 1);
    setTasks(prev => prev.map(t => 
       t.id === taskId ? { ...t, currentValue: newValue } : t
    ));

    try {
      await taskService.updateTask(taskId, task.status as any, newValue);
    } catch (err) {
       console.error(err);
       setTasks(prev => prev.map(t => t.id === taskId ? task : t));
    }
  }, [tasks]);

  const handleDecrement = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const newValue = Math.max(0, (task.currentValue || 0) - (task.step || 1));
    setTasks(prev => prev.map(t => 
       t.id === taskId ? { ...t, currentValue: newValue } : t
    ));

    try {
      await taskService.updateTask(taskId, task.status as any, newValue);
    } catch (err) {
       console.error(err);
       setTasks(prev => prev.map(t => t.id === taskId ? task : t));
    }
  }, [tasks]);

  const handleLogout = async () => {
    await logout();
  };

  const handleChallengeClick = (challengeId: string) => {
    setSelectedChallengeId(parseInt(challengeId));
  };

  const handleOnboardingComplete = () => {
    if (user && user.id) {
      setOnboardingComplete(String(user.id));
    }
    setShowOnboarding(false);
    // Open discover view to help user get started
    setShowDiscover(true);
  };

  const handleOnboardingSkip = () => {
    if (user && user.id) {
      setOnboardingComplete(String(user.id));
    }
    setShowOnboarding(false);
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
      <Layout activeTab={activeTab} setActiveTab={handleTabChange} title={activeTab === 'active' ? 'My Progress' : undefined}>
        <Routes>
          <Route path="/" element={<HomeView tasks={tasks} challengeTasks={challengeTasks} profile={profile} />} />
          <Route path="/active" element={
            <ActiveView 
              tasks={tasks}
              challenges={challenges}
              challengeTasks={challengeTasks}
              onToggle={handleToggleTask}
              onTaskClick={() => {}} 
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              onChallengeTaskComplete={handleChallengeTaskComplete}
              loading={loading} 
              onOpenDiscover={() => setShowDiscover(true)} 
              onChallengeClick={handleChallengeClick}
            />
          } />
          <Route path="/habits" element={<HabitView />} />
          <Route path="/social" element={<SocialView />} />
          <Route path="/profile" element={<ProfileView onLogout={handleLogout} profile={profile} />} />
          <Route path="*" element={<NotFoundView />} />
        </Routes>
      </Layout>
        
        {/* Discover Modal */}
        {showDiscover && (
          <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-900 overflow-auto">
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
                <DiscoverView 
                  onClose={() => setShowDiscover(false)} 
                  onJoin={fetchData} 
                  onViewDetail={handleChallengeClick}
                />
             </div>
          </div>
        )}

        {/* Challenge Detail Modal */}
        {selectedChallengeId && (
          <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-900 overflow-auto">
            <div className="mx-auto max-w-md bg-white dark:bg-slate-900 min-h-screen relative">
              <ChallengeDetailView 
                challengeId={selectedChallengeId} 
                onBack={() => setSelectedChallengeId(null)} 
              />
            </div>
          </div>
        )}
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
