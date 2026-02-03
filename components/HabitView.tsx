import React, { useState, useEffect, useCallback } from 'react';
import { habitService, type Habit, type CreateHabitData } from '../services/habitService';
import Skeleton from './ui/Skeleton';
import { ConfirmModal } from './ui';

// Category options with icons and colors
const CATEGORIES = [
  { id: 'health', label: 'Health', icon: 'favorite', color: 'bg-red-500' },
  { id: 'fitness', label: 'Fitness', icon: 'fitness_center', color: 'bg-orange-500' },
  { id: 'mindfulness', label: 'Mindfulness', icon: 'self_improvement', color: 'bg-purple-500' },
  { id: 'productivity', label: 'Productivity', icon: 'task_alt', color: 'bg-blue-500' },
  { id: 'learning', label: 'Learning', icon: 'school', color: 'bg-green-500' },
  { id: 'social', label: 'Social', icon: 'people', color: 'bg-pink-500' },
  { id: 'finance', label: 'Finance', icon: 'savings', color: 'bg-yellow-500' },
  { id: 'general', label: 'General', icon: 'star', color: 'bg-slate-500' },
];

const FREQUENCY_OPTIONS = [
  { id: 'daily', label: 'Daily', description: 'Every day' },
  { id: 'weekly', label: 'Weekly', description: 'Once a week' },
  { id: 'custom', label: 'Custom', description: 'Set your own schedule' },
];

const getCategoryInfo = (categoryId: string) => {
  return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[CATEGORIES.length - 1];
};

// Habit Card Component
const HabitCard: React.FC<{
  habit: Habit;
  onToggle: (id: string) => void;
  onClick: (habit: Habit) => void;
  loading?: boolean;
}> = ({ habit, onToggle, onClick, loading }) => {
  const category = getCategoryInfo(habit.category);
  
  return (
    <div 
      className={`bg-white dark:bg-card-dark rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 transition-all duration-200 ${loading ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-4">
        {/* Completion Circle */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(habit.id); }}
          disabled={loading}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
            habit.completedToday 
              ? 'bg-green-500 text-white scale-100' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
          aria-label={habit.completedToday ? 'Mark as incomplete' : 'Mark as complete'}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: habit.completedToday ? "'FILL' 1" : "'FILL' 0" }}>
            {habit.completedToday ? 'check_circle' : 'radio_button_unchecked'}
          </span>
        </button>

        {/* Habit Info */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onClick(habit)}>
          <div className="flex items-center gap-2">
            <h3 className={`font-bold text-slate-900 dark:text-white truncate ${habit.completedToday ? 'line-through text-slate-400' : ''}`}>
              {habit.name}
            </h3>
            <span className={`w-2 h-2 rounded-full ${category.color}`}></span>
          </div>
          {habit.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{habit.description}</p>
          )}
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">{category.icon}</span>
              {category.label}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-400 capitalize">{habit.frequency}</span>
            {habit.streak && habit.streak > 0 && (
              <>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-orange-500 font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">local_fire_department</span>
                  {habit.streak}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Chevron */}
        <span className="material-symbols-outlined text-slate-300" onClick={() => onClick(habit)}>chevron_right</span>
      </div>
    </div>
  );
};

// Create/Edit Habit Modal
const HabitModal: React.FC<{
  isOpen: boolean;
  habit?: Habit | null;
  onClose: () => void;
  onSave: (data: CreateHabitData) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}> = ({ isOpen, habit, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState<CreateHabitData>({
    name: '',
    description: '',
    frequency: 'daily',
    target_count: 1,
    category: 'general',
  });
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (habit) {
      setFormData({
        name: habit.name,
        description: habit.description || '',
        frequency: habit.frequency,
        target_count: habit.targetCount,
        category: habit.category,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        frequency: 'daily',
        target_count: 1,
        category: 'general',
      });
    }
  }, [habit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!habit || !onDelete) return;
    setLoading(true);
    try {
      await onDelete(habit.id);
      setShowDeleteConfirm(false);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col animate-in slide-in-from-bottom-10">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
        <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
          <span className="material-symbols-outlined">close</span>
        </button>
        <h2 className="font-bold text-lg">{habit ? 'Edit Habit' : 'New Habit'}</h2>
        <button 
          onClick={handleSubmit}
          disabled={loading || !formData.name.trim()}
          className="text-primary font-bold text-sm disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Name */}
        <div>
          <label className="text-sm font-bold text-slate-500 mb-2 block">Habit Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Morning meditation"
            className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 font-semibold focus:ring-2 focus:ring-primary outline-none"
            autoFocus
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-bold text-slate-500 mb-2 block">Description</label>
          <textarea
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="Add more details about this habit..."
            className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 font-medium focus:ring-2 focus:ring-primary outline-none min-h-[80px] resize-none"
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-sm font-bold text-slate-500 mb-2 block">Category</label>
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFormData({ ...formData, category: cat.id })}
                className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${
                  formData.category === cat.id 
                    ? 'bg-primary/10 ring-2 ring-primary' 
                    : 'bg-slate-50 dark:bg-slate-900'
                }`}
              >
                <span className={`material-symbols-outlined ${formData.category === cat.id ? 'text-primary' : 'text-slate-400'}`}>
                  {cat.icon}
                </span>
                <span className={`text-xs font-medium ${formData.category === cat.id ? 'text-primary' : 'text-slate-500'}`}>
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Frequency */}
        <div>
          <label className="text-sm font-bold text-slate-500 mb-2 block">Frequency</label>
          <div className="space-y-2">
            {FREQUENCY_OPTIONS.map(freq => (
              <button
                key={freq.id}
                type="button"
                onClick={() => setFormData({ ...formData, frequency: freq.id as any })}
                className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all ${
                  formData.frequency === freq.id 
                    ? 'bg-primary/10 ring-2 ring-primary' 
                    : 'bg-slate-50 dark:bg-slate-900'
                }`}
              >
                <div className="text-left">
                  <span className={`font-bold block ${formData.frequency === freq.id ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
                    {freq.label}
                  </span>
                  <span className="text-xs text-slate-400">{freq.description}</span>
                </div>
                {formData.frequency === freq.id && (
                  <span className="material-symbols-outlined text-primary">check_circle</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Target Count (for weekly/custom) */}
        {formData.frequency !== 'daily' && (
          <div>
            <label className="text-sm font-bold text-slate-500 mb-2 block">Times per {formData.frequency === 'weekly' ? 'week' : 'period'}</label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, target_count: Math.max(1, (formData.target_count || 1) - 1) })}
                className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
              >
                <span className="material-symbols-outlined">remove</span>
              </button>
              <span className="text-3xl font-black w-16 text-center">{formData.target_count || 1}</span>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, target_count: (formData.target_count || 1) + 1 })}
                className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
          </div>
        )}

        {/* Delete Button (edit mode only) */}
        {habit && onDelete && (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 text-red-500 font-bold flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
            Delete Habit
          </button>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Habit?"
        message="This will permanently delete this habit and all its history. This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

// Habit Detail View
const HabitDetailView: React.FC<{
  habit: Habit;
  onClose: () => void;
  onEdit: () => void;
  onToggle: (id: string) => void;
}> = ({ habit, onClose, onEdit, onToggle }) => {
  const [stats, setStats] = useState<{ currentStreak: number; longestStreak: number; completionRate: number; lastSevenDays: boolean[] } | null>(null);
  const category = getCategoryInfo(habit.category);

  useEffect(() => {
    habitService.getHabitStats(habit.id).then(setStats).catch(console.error);
  }, [habit.id]);

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col animate-in slide-in-from-right-10">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
        <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="font-bold text-lg">Habit Details</h2>
        <button onClick={onEdit} className="p-2 -mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
          <span className="material-symbols-outlined">edit</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Habit Header */}
        <div className="text-center">
          <div className={`w-20 h-20 ${category.color} rounded-3xl flex items-center justify-center mx-auto mb-4`}>
            <span className="material-symbols-outlined text-white text-3xl">{category.icon}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">{habit.name}</h1>
          {habit.description && (
            <p className="text-slate-500 mt-1">{habit.description}</p>
          )}
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold capitalize">{habit.frequency}</span>
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold">{category.label}</span>
          </div>
        </div>

        {/* Today's Action */}
        <div className="bg-gradient-to-r from-primary to-purple-500 rounded-3xl p-6 text-white">
          <p className="text-sm opacity-80 mb-2">Today's Status</p>
          <button
            onClick={() => onToggle(habit.id)}
            className={`w-full p-4 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all ${
              habit.completedToday 
                ? 'bg-white/20' 
                : 'bg-white text-primary'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: habit.completedToday ? "'FILL' 1" : "'FILL' 0" }}>
              {habit.completedToday ? 'check_circle' : 'radio_button_unchecked'}
            </span>
            {habit.completedToday ? 'Completed!' : 'Mark as Done'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 text-center">
            <span className="material-symbols-outlined text-orange-500 mb-1">local_fire_department</span>
            <p className="text-2xl font-black">{stats?.currentStreak || 0}</p>
            <p className="text-xs text-slate-400">Current Streak</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 text-center">
            <span className="material-symbols-outlined text-yellow-500 mb-1">emoji_events</span>
            <p className="text-2xl font-black">{stats?.longestStreak || 0}</p>
            <p className="text-xs text-slate-400">Best Streak</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 text-center">
            <span className="material-symbols-outlined text-green-500 mb-1">trending_up</span>
            <p className="text-2xl font-black">{stats?.completionRate || 0}%</p>
            <p className="text-xs text-slate-400">Success Rate</p>
          </div>
        </div>

        {/* Last 7 Days */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4">
          <h3 className="font-bold mb-4">Last 7 Days</h3>
          <div className="flex justify-between">
            {days.map((day, i) => {
              const completed = stats?.lastSevenDays?.[i] || false;
              return (
                <div key={i} className="flex flex-col items-center gap-2">
                  <span className="text-xs text-slate-400">{day}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    completed ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-700'
                  }`}>
                    {completed && <span className="material-symbols-outlined text-sm">check</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main HabitView Component
const HabitView: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [filter, setFilter] = useState<'all' | 'today' | 'completed'>('all');

  const fetchHabits = useCallback(async () => {
    try {
      const data = await habitService.getHabits();
      setHabits(data);
    } catch (err) {
      console.error('Failed to fetch habits:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const handleToggle = async (id: string) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    setToggleLoading(id);
    
    // Optimistic update
    setHabits(prev => prev.map(h => 
      h.id === id ? { ...h, completedToday: !h.completedToday } : h
    ));
    if (selectedHabit?.id === id) {
      setSelectedHabit(prev => prev ? { ...prev, completedToday: !prev.completedToday } : prev);
    }

    try {
      if (habit.completedToday) {
        await habitService.uncompleteHabit(id);
      } else {
        await habitService.completeHabit(id);
      }
    } catch (err) {
      // Revert on error
      setHabits(prev => prev.map(h => 
        h.id === id ? { ...h, completedToday: habit.completedToday } : h
      ));
      if (selectedHabit?.id === id) {
        setSelectedHabit(prev => prev ? { ...prev, completedToday: habit.completedToday } : prev);
      }
      console.error('Failed to toggle habit:', err);
    } finally {
      setToggleLoading(null);
    }
  };

  const handleSave = async (data: CreateHabitData) => {
    if (editingHabit) {
      const updated = await habitService.updateHabit(editingHabit.id, data);
      setHabits(prev => prev.map(h => h.id === editingHabit.id ? updated : h));
    } else {
      const newHabit = await habitService.createHabit(data);
      setHabits(prev => [newHabit, ...prev]);
    }
    setEditingHabit(null);
  };

  const handleDelete = async (id: string) => {
    await habitService.deleteHabit(id);
    setHabits(prev => prev.filter(h => h.id !== id));
    setSelectedHabit(null);
  };

  const filteredHabits = habits.filter(h => {
    if (filter === 'today') return !h.completedToday;
    if (filter === 'completed') return h.completedToday;
    return true;
  });

  const completedCount = habits.filter(h => h.completedToday).length;
  const progressPercent = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  if (selectedHabit) {
    return (
      <HabitDetailView
        habit={selectedHabit}
        onClose={() => setSelectedHabit(null)}
        onEdit={() => { setEditingHabit(selectedHabit); setShowModal(true); }}
        onToggle={handleToggle}
      />
    );
  }

  return (
    <div className="px-6 pb-32 animate-in fade-in duration-500">
      {/* Header Stats */}
      <div className="bg-gradient-to-r from-primary to-purple-500 rounded-3xl p-6 text-white mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm opacity-80">Today's Progress</p>
            <p className="text-3xl font-black">{completedCount}/{habits.length}</p>
          </div>
          <div className="w-16 h-16 relative">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
              <circle 
                cx="32" cy="32" r="28" fill="none" stroke="white" strokeWidth="8"
                strokeDasharray={`${progressPercent * 1.76} 176`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{progressPercent}%</span>
          </div>
        </div>
        <div className="text-sm opacity-80">
          {completedCount === habits.length && habits.length > 0 
            ? '🎉 All habits completed! Great job!' 
            : `${habits.length - completedCount} habits remaining today`}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {[
          { id: 'all', label: 'All', count: habits.length },
          { id: 'today', label: 'To Do', count: habits.filter(h => !h.completedToday).length },
          { id: 'completed', label: 'Done', count: completedCount },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
              filter === tab.id 
                ? 'bg-primary text-white' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Habits List */}
      <div className="space-y-3">
        {loading ? (
          <>
            <Skeleton variant="card" className="h-24" />
            <Skeleton variant="card" className="h-24" />
            <Skeleton variant="card" className="h-24" />
          </>
        ) : filteredHabits.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">self_improvement</span>
            <h3 className="font-bold text-lg text-slate-600 dark:text-slate-300 mb-2">
              {filter === 'all' ? 'No habits yet' : filter === 'today' ? 'All done for today!' : 'No completed habits'}
            </h3>
            <p className="text-slate-400 mb-4">
              {filter === 'all' ? 'Start building better habits today' : filter === 'today' ? 'You\'ve completed all your habits' : 'Complete some habits to see them here'}
            </p>
            {filter === 'all' && (
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-primary text-white rounded-full font-bold"
              >
                Create Your First Habit
              </button>
            )}
          </div>
        ) : (
          filteredHabits.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggle={handleToggle}
              onClick={setSelectedHabit}
              loading={toggleLoading === habit.id}
            />
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => { setEditingHabit(null); setShowModal(true); }}
        className="fixed bottom-28 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center z-40"
        aria-label="Add new habit"
      >
        <span className="material-symbols-outlined">add</span>
      </button>

      {/* Create/Edit Modal */}
      <HabitModal
        isOpen={showModal}
        habit={editingHabit}
        onClose={() => { setShowModal(false); setEditingHabit(null); }}
        onSave={handleSave}
        onDelete={editingHabit ? handleDelete : undefined}
      />
    </div>
  );
};

export default HabitView;
