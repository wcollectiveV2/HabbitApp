
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
import { MOCK_CHALLENGES, MOCK_TASKS } from './constants';
import { Tab, Task, AuthMode } from './types';

const ActiveView: React.FC<{ tasks: Task[], onToggle: (id: string) => void }> = ({ tasks, onToggle }) => (
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
        {MOCK_CHALLENGES.map((challenge) => (
          <ProgressCard key={challenge.id} challenge={challenge} />
        ))}
        {/* Spacer for scroll end */}
        <div className="min-w-[1px] h-full" />
      </div>
    </section>

    {/* Tasks Section */}
    <section className="mt-8 px-6">
      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Today's Tasks</h2>
      <div className="space-y-4">
        {tasks.map((task) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onToggle={onToggle} 
          />
        ))}
      </div>
    </section>
  </div>
);

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('habit_logged_in') === 'true';
  });
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [activeTab, setActiveTab] = useState<Tab>('active');
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('habit_tasks');
    return saved ? JSON.parse(saved) : MOCK_TASKS;
  });

  // Persist tasks whenever they change
  useEffect(() => {
    localStorage.setItem('habit_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleToggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('habit_logged_in', 'true');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('habit_logged_in');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView tasks={tasks} />;
      case 'social':
        return <SocialView />;
      case 'me':
        return <ProfileView onLogout={handleLogout} />;
      case 'active':
      default:
        return <ActiveView tasks={tasks} onToggle={handleToggleTask} />;
    }
  };

  if (!isLoggedIn) {
    return authMode === 'login' ? (
      <LoginView onLogin={handleLogin} onSwitchToSignup={() => setAuthMode('signup')} />
    ) : (
      <SignupView onSignup={handleLogin} onSwitchToLogin={() => setAuthMode('login')} />
    );
  }

  return (
    <div className="min-h-screen pb-40">
      <Header />
      <main className="pt-2">
        {renderContent()}
      </main>
      
      {/* Habit Coach AI Integration */}
      <HabitCoach />

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;
