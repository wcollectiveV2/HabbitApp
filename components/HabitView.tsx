import React, { useState, useEffect, useCallback } from 'react';
import { habitService, type Habit, type CreateHabitData } from '../services/habitService';
import Skeleton from './ui/Skeleton';
import { ConfirmModal } from './ui';
import { colors, spacing, borderRadius, typography, shadows } from '../theme/designSystem';

// Category options with icons and colors
const CATEGORIES = [
  { id: 'health', label: 'Health', icon: 'favorite', color: colors.error },
  { id: 'fitness', label: 'Fitness', icon: 'fitness_center', color: '#F97316' },
  { id: 'mindfulness', label: 'Mindfulness', icon: 'self_improvement', color: '#8B5CF6' },
  { id: 'productivity', label: 'Productivity', icon: 'task_alt', color: '#3B82F6' },
  { id: 'learning', label: 'Learning', icon: 'school', color: colors.success },
  { id: 'social', label: 'Social', icon: 'people', color: '#EC4899' },
  { id: 'finance', label: 'Finance', icon: 'savings', color: colors.warning },
  { id: 'general', label: 'General', icon: 'star', color: colors.gray[500] },
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
  const target = habit.targetCount || 1;
  const current = habit.completionsToday || 0;
  const isCompleted = current >= target;
  
  const progressPercent = Math.min(100, Math.round((current / target) * 100));
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progressPercent / 100) * circumference;
  
  const cardStyle: React.CSSProperties = {
    backgroundColor: colors.white,
    borderRadius: borderRadius['3xl'],
    padding: spacing[4],
    boxShadow: shadows.sm,
    border: `1px solid ${colors.gray[100]}`,
    transition: 'all 0.2s ease',
    opacity: loading ? 0.5 : 1,
  };

  const toggleBtnStyle: React.CSSProperties = {
    width: '48px',
    height: '48px',
    borderRadius: borderRadius.full,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    backgroundColor: isCompleted ? colors.success : colors.gray[100],
    color: isCompleted ? colors.white : colors.gray[400],
    border: 'none',
    cursor: 'pointer',
  };
  
  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(habit.id); }}
          disabled={loading}
          style={toggleBtnStyle}
          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {target > 1 && !isCompleted ? (
            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)', position: 'absolute', inset: 0 }}>
                <circle cx="24" cy="24" r={radius} fill="none" stroke="currentColor" strokeWidth="3" opacity={0.2} />
                <circle
                  cx="24" cy="24" r={radius}
                  fill="none"
                  stroke={progressPercent > 0 ? colors.primary : 'currentColor'}
                  strokeWidth="3"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  style={{ transition: 'all 0.5s ease' }}
                />
              </svg>
              <span style={{ fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, position: 'relative', zIndex: 10 }}>{current}/{target}</span>
            </div>
          ) : (
            <span className="material-symbols-outlined" style={{ fontVariationSettings: isCompleted ? "'FILL' 1" : "'FILL' 0" }}>
              {isCompleted ? 'check_circle' : 'radio_button_unchecked'}
            </span>
          )}
        </button>

        <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => onClick(habit)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <h3 style={{ 
              fontWeight: typography.fontWeight.bold, 
              color: colors.text.primary, 
              margin: 0,
              textDecoration: isCompleted ? 'line-through' : 'none',
              opacity: isCompleted ? 0.5 : 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {habit.name}
            </h3>
            <span style={{ width: '8px', height: '8px', borderRadius: borderRadius.full, backgroundColor: category.color }}></span>
          </div>
          {habit.description && (
            <p style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{habit.description}</p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginTop: spacing[1] }}>
            <span style={{ fontSize: typography.fontSize.xs, color: colors.gray[400], display: 'flex', alignItems: 'center', gap: spacing[1] }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{category.icon}</span>
              {category.label}
            </span>
            <span style={{ fontSize: typography.fontSize.xs, color: colors.gray[400] }}>•</span>
            <span style={{ fontSize: typography.fontSize.xs, color: colors.gray[400], textTransform: 'capitalize' }}>{habit.frequency}</span>
            {habit.streak && habit.streak > 0 && (
              <>
                <span style={{ fontSize: typography.fontSize.xs, color: colors.gray[400] }}>•</span>
                <span style={{ fontSize: typography.fontSize.xs, color: '#F97316', fontWeight: typography.fontWeight.bold, display: 'flex', alignItems: 'center', gap: spacing[1] }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>local_fire_department</span>
                  {habit.streak}
                </span>
              </>
            )}
          </div>
        </div>

        <span className="material-symbols-outlined" style={{ color: colors.gray[300], cursor: 'pointer' }} onClick={() => onClick(habit)}>chevron_right</span>
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

  const modalStyles = {
    container: {
      position: 'fixed' as const,
      inset: 0,
      zIndex: 50,
      backgroundColor: colors.background.primary,
      display: 'flex',
      flexDirection: 'column' as const,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing[4],
      borderBottom: `1px solid ${colors.gray[100]}`,
    },
    backBtn: {
      padding: spacing[2],
      marginLeft: `-${spacing[2]}`,
      borderRadius: borderRadius.full,
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      color: colors.text.primary,
    },
    saveBtn: {
      color: colors.primary,
      fontWeight: typography.fontWeight.bold,
      fontSize: typography.fontSize.sm,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
    },
    content: {
      flex: 1,
      overflowY: 'auto' as const,
      padding: spacing[6],
    },
    label: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      color: colors.text.secondary,
      marginBottom: spacing[2],
      display: 'block',
    },
    input: {
      width: '100%',
      backgroundColor: colors.gray[50],
      border: 'none',
      borderRadius: borderRadius['2xl'],
      padding: spacing[4],
      fontWeight: typography.fontWeight.semibold,
      fontSize: typography.fontSize.md,
      color: colors.text.primary,
      outline: 'none',
    },
    textarea: {
      width: '100%',
      backgroundColor: colors.gray[50],
      border: 'none',
      borderRadius: borderRadius['2xl'],
      padding: spacing[4],
      fontWeight: typography.fontWeight.medium,
      fontSize: typography.fontSize.md,
      color: colors.text.primary,
      outline: 'none',
      minHeight: '80px',
      resize: 'none' as const,
    },
    categoryGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: spacing[2],
    },
    categoryBtn: (active: boolean) => ({
      padding: spacing[3],
      borderRadius: borderRadius['2xl'],
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      gap: spacing[1],
      backgroundColor: active ? colors.primaryAlpha(0.1) : colors.gray[50],
      border: active ? `2px solid ${colors.primary}` : 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    } as React.CSSProperties),
    frequencyBtn: (active: boolean) => ({
      width: '100%',
      padding: spacing[4],
      borderRadius: borderRadius['2xl'],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: active ? colors.primaryAlpha(0.1) : colors.gray[50],
      border: active ? `2px solid ${colors.primary}` : 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      marginBottom: spacing[2],
    } as React.CSSProperties),
    counterBtn: {
      width: '48px',
      height: '48px',
      borderRadius: borderRadius.full,
      backgroundColor: colors.gray[100],
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
      color: colors.text.primary,
    },
    deleteBtn: {
      width: '100%',
      padding: spacing[4],
      borderRadius: borderRadius['2xl'],
      backgroundColor: colors.errorBg,
      color: colors.error,
      fontWeight: typography.fontWeight.bold,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing[2],
      border: 'none',
      cursor: 'pointer',
    },
  };

  return (
    <div style={modalStyles.container}>
      <div style={modalStyles.header}>
        <button onClick={onClose} style={modalStyles.backBtn}>
          <span className="material-symbols-outlined">close</span>
        </button>
        <h2 style={{ fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.xl, color: colors.text.primary }}>{habit ? 'Edit Habit' : 'New Habit'}</h2>
        <button onClick={handleSubmit} disabled={loading || !formData.name.trim()} style={{ ...modalStyles.saveBtn, opacity: loading || !formData.name.trim() ? 0.5 : 1 }}>
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div style={modalStyles.content}>
        {/* Name */}
        <div style={{ marginBottom: spacing[6] }}>
          <label style={modalStyles.label}>Habit Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Morning meditation"
            style={modalStyles.input}
            autoFocus
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: spacing[6] }}>
          <label style={modalStyles.label}>Description</label>
          <textarea
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="Add more details about this habit..."
            style={modalStyles.textarea}
          />
        </div>

        {/* Category */}
        <div style={{ marginBottom: spacing[6] }}>
          <label style={modalStyles.label}>Category</label>
          <div style={modalStyles.categoryGrid}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFormData({ ...formData, category: cat.id })}
                style={modalStyles.categoryBtn(formData.category === cat.id)}
              >
                <span className="material-symbols-outlined" style={{ color: formData.category === cat.id ? colors.primary : colors.gray[400] }}>
                  {cat.icon}
                </span>
                <span style={{ fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.medium, color: formData.category === cat.id ? colors.primary : colors.text.secondary }}>
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Frequency */}
        <div style={{ marginBottom: spacing[6] }}>
          <label style={modalStyles.label}>Frequency</label>
          {FREQUENCY_OPTIONS.map(freq => (
            <button
              key={freq.id}
              type="button"
              onClick={() => setFormData({ ...formData, frequency: freq.id as any })}
              style={modalStyles.frequencyBtn(formData.frequency === freq.id)}
            >
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontWeight: typography.fontWeight.bold, display: 'block', color: formData.frequency === freq.id ? colors.primary : colors.text.primary }}>
                  {freq.label}
                </span>
                <span style={{ fontSize: typography.fontSize.xs, color: colors.gray[400] }}>{freq.description}</span>
              </div>
              {formData.frequency === freq.id && (
                <span className="material-symbols-outlined" style={{ color: colors.primary }}>check_circle</span>
              )}
            </button>
          ))}
        </div>

        {/* Target Count */}
        <div style={{ marginBottom: spacing[6] }}>
          <label style={modalStyles.label}>
            Target per {formData.frequency === 'daily' ? 'day' : formData.frequency === 'weekly' ? 'week' : 'period'}
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, target_count: Math.max(1, (formData.target_count || 1) - 1) })}
              style={modalStyles.counterBtn}
            >
              <span className="material-symbols-outlined">remove</span>
            </button>
            <span style={{ fontSize: typography.fontSize['3xl'], fontWeight: typography.fontWeight.black, width: '64px', textAlign: 'center', color: colors.text.primary }}>{formData.target_count || 1}</span>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, target_count: (formData.target_count || 1) + 1 })}
              style={modalStyles.counterBtn}
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
          <p style={{ fontSize: typography.fontSize.xs, color: colors.gray[400], marginTop: spacing[2] }}>
            {formData.target_count === 1 
              ? 'Simple check-off habit' 
              : `You'll need to complete this ${formData.target_count} times per ${formData.frequency === 'daily' ? 'day' : 'period'} to mark as done`}
          </p>
        </div>

        {/* Delete Button */}
        {habit && onDelete && (
          <button type="button" onClick={() => setShowDeleteConfirm(true)} style={modalStyles.deleteBtn}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span>
            Delete Habit
          </button>
        )}
      </div>

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

  const detailStyles = {
    container: {
      position: 'fixed' as const,
      inset: 0,
      zIndex: 50,
      backgroundColor: colors.background.primary,
      display: 'flex',
      flexDirection: 'column' as const,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing[4],
      borderBottom: `1px solid ${colors.gray[100]}`,
    },
    iconBtn: {
      padding: spacing[2],
      borderRadius: borderRadius.full,
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      color: colors.text.primary,
    },
    content: {
      flex: 1,
      overflowY: 'auto' as const,
      padding: spacing[6],
    },
    categoryIcon: {
      width: '80px',
      height: '80px',
      backgroundColor: category.colorValue,
      borderRadius: borderRadius['3xl'],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto',
      marginBottom: spacing[4],
    },
    badge: {
      padding: `${spacing[1]} ${spacing[3]}`,
      backgroundColor: colors.gray[100],
      borderRadius: borderRadius.full,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.bold,
      textTransform: 'capitalize' as const,
      color: colors.text.primary,
    },
    actionCard: {
      background: `linear-gradient(to right, ${colors.primary}, #A855F7)`,
      borderRadius: borderRadius['3xl'],
      padding: spacing[6],
      color: 'white',
      marginBottom: spacing[6],
    },
    actionBtn: (completed: boolean) => ({
      width: '100%',
      padding: spacing[4],
      borderRadius: borderRadius['2xl'],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing[3],
      fontWeight: typography.fontWeight.bold,
      backgroundColor: completed ? 'rgba(255,255,255,0.2)' : 'white',
      color: completed ? 'white' : colors.primary,
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    } as React.CSSProperties),
    statCard: {
      backgroundColor: colors.gray[50],
      borderRadius: borderRadius['2xl'],
      padding: spacing[4],
      textAlign: 'center' as const,
    },
    dayCircle: (completed: boolean) => ({
      width: '32px',
      height: '32px',
      borderRadius: borderRadius.full,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: completed ? colors.success : colors.gray[200],
      color: completed ? 'white' : colors.text.primary,
    }),
  };

  return (
    <div style={detailStyles.container}>
      {/* Header */}
      <div style={detailStyles.header}>
        <button onClick={onClose} style={{ ...detailStyles.iconBtn, marginLeft: `-${spacing[2]}` }}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 style={{ fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.lg, color: colors.text.primary }}>Habit Details</h2>
        <button onClick={onEdit} style={{ ...detailStyles.iconBtn, marginRight: `-${spacing[2]}` }}>
          <span className="material-symbols-outlined">edit</span>
        </button>
      </div>

      <div style={detailStyles.content}>
        {/* Habit Header */}
        <div style={{ textAlign: 'center', marginBottom: spacing[6] }}>
          <div style={detailStyles.categoryIcon}>
            <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '30px' }}>{category.icon}</span>
          </div>
          <h1 style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.black, color: colors.text.primary }}>{habit.name}</h1>
          {habit.description && (
            <p style={{ color: colors.text.secondary, marginTop: spacing[1] }}>{habit.description}</p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: spacing[2], marginTop: spacing[2] }}>
            <span style={detailStyles.badge}>{habit.frequency}</span>
            <span style={detailStyles.badge}>{category.label}</span>
          </div>
        </div>

        {/* Today's Action */}
        <div style={detailStyles.actionCard}>
          <p style={{ fontSize: typography.fontSize.sm, opacity: 0.8, marginBottom: spacing[2] }}>Today's Status</p>
          <button onClick={() => onToggle(habit.id)} style={detailStyles.actionBtn(habit.completedToday)}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: habit.completedToday ? "'FILL' 1" : "'FILL' 0" }}>
              {habit.completedToday ? 'check_circle' : 'radio_button_unchecked'}
            </span>
            {habit.completedToday ? 'Completed!' : 'Mark as Done'}
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: spacing[4], marginBottom: spacing[6] }}>
          <div style={detailStyles.statCard}>
            <span className="material-symbols-outlined" style={{ color: '#F97316', marginBottom: spacing[1] }}>local_fire_department</span>
            <p style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.black, color: colors.text.primary }}>{stats?.currentStreak || 0}</p>
            <p style={{ fontSize: typography.fontSize.xs, color: colors.gray[400] }}>Current Streak</p>
          </div>
          <div style={detailStyles.statCard}>
            <span className="material-symbols-outlined" style={{ color: '#EAB308', marginBottom: spacing[1] }}>emoji_events</span>
            <p style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.black, color: colors.text.primary }}>{stats?.longestStreak || 0}</p>
            <p style={{ fontSize: typography.fontSize.xs, color: colors.gray[400] }}>Best Streak</p>
          </div>
          <div style={detailStyles.statCard}>
            <span className="material-symbols-outlined" style={{ color: colors.success, marginBottom: spacing[1] }}>trending_up</span>
            <p style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.black, color: colors.text.primary }}>{stats?.completionRate || 0}%</p>
            <p style={{ fontSize: typography.fontSize.xs, color: colors.gray[400] }}>Success Rate</p>
          </div>
        </div>

        {/* Last 7 Days */}
        <div style={{ backgroundColor: colors.gray[50], borderRadius: borderRadius['2xl'], padding: spacing[4] }}>
          <h3 style={{ fontWeight: typography.fontWeight.bold, marginBottom: spacing[4], color: colors.text.primary }}>Last 7 Days</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {days.map((day, i) => {
              const completed = stats?.lastSevenDays?.[i] || false;
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing[2] }}>
                  <span style={{ fontSize: typography.fontSize.xs, color: colors.gray[400] }}>{day}</span>
                  <div style={detailStyles.dayCircle(completed)}>
                    {completed && <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check</span>}
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
    
    // Don't toggle if loading
    if (toggleLoading === id) return;

    setToggleLoading(id);
    
    // Determine action
    const current = habit.completionsToday || 0;
    const target = habit.targetCount || 1;
    const isCompleted = current >= target;
    const shouldUncomplete = isCompleted; // Look here: only uncomplete IF it's fully done. 
    // Actually, user might want to decrement progress.
    // If target > 1, behavior: click adds 1. If we exceed target, maybe that's fine?
    // But how to decrement? Just assume click always increments unless fully done?
    // Let's implementation: 
    // If not completed: Increment.
    // If completed: Mark undone (decrement by 1? or fully reset? usually full reset or decrement)
    
    // Better UX for counters:
    // If target > 1:
    //   Clicking the ring increments.
    //   Wait, users might tap by mistake.
    //   If it is completed, click uncompletes it (removes 1? or all?).
    //   Let's match backend: backend uncomplete removes ONE log.
    
    const newCount = shouldUncomplete ? current - 1 : current + 1;
    
    // Optimistic update
    const updateHabitState = (h: Habit) => ({ 
      ...h, 
      completionsToday: newCount,
      completedToday: newCount >= (h.targetCount || 1)
    });

    setHabits(prev => prev.map(h => h.id === id ? updateHabitState(h) : h));
    if (selectedHabit?.id === id) {
      setSelectedHabit(prev => prev ? updateHabitState(prev) : prev);
    }

    try {
      if (shouldUncomplete) {
        await habitService.uncompleteHabit(id);
      } else {
        await habitService.completeHabit(id);
      }
    } catch (err) {
      // Revert on error
      setHabits(prev => prev.map(h => h.id === id ? habit : h));
      if (selectedHabit?.id === id) {
        setSelectedHabit(prev => prev ? habit : prev);
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

  const viewStyles = {
    container: {
      padding: `0 ${spacing[6]} ${spacing[32]}`,
    },
    progressCard: {
      background: `linear-gradient(to right, ${colors.primary}, #A855F7)`,
      borderRadius: borderRadius['3xl'],
      padding: spacing[6],
      color: 'white',
      marginBottom: spacing[6],
    },
    filterTab: (active: boolean) => ({
      padding: `${spacing[2]} ${spacing[4]}`,
      borderRadius: borderRadius.full,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      whiteSpace: 'nowrap' as const,
      backgroundColor: active ? colors.primary : colors.gray[100],
      color: active ? 'white' : colors.text.secondary,
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
    emptyState: {
      textAlign: 'center' as const,
      padding: `${spacing[12]} 0`,
    },
    createBtn: {
      padding: `${spacing[3]} ${spacing[6]}`,
      backgroundColor: colors.primary,
      color: 'white',
      borderRadius: borderRadius.full,
      fontWeight: typography.fontWeight.bold,
      border: 'none',
      cursor: 'pointer',
    },
    fab: {
      position: 'fixed' as const,
      bottom: '112px',
      right: spacing[6],
      width: '56px',
      height: '56px',
      backgroundColor: colors.primary,
      color: 'white',
      borderRadius: borderRadius.full,
      boxShadow: shadows.lg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 40,
      border: 'none',
      cursor: 'pointer',
    },
  };

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
    <div style={viewStyles.container}>
      {/* Header Stats */}
      <div style={viewStyles.progressCard}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[4] }}>
          <div>
            <p style={{ fontSize: typography.fontSize.sm, opacity: 0.8 }}>Today's Progress</p>
            <p style={{ fontSize: typography.fontSize['3xl'], fontWeight: typography.fontWeight.black }}>{completedCount}/{habits.length}</p>
          </div>
          <div style={{ width: '64px', height: '64px', position: 'relative' }}>
            <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
              <circle 
                cx="32" cy="32" r="28" fill="none" stroke="white" strokeWidth="8"
                strokeDasharray={`${progressPercent * 1.76} 176`}
                strokeLinecap="round"
              />
            </svg>
            <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold }}>{progressPercent}%</span>
          </div>
        </div>
        <div style={{ fontSize: typography.fontSize.sm, opacity: 0.8 }}>
          {completedCount === habits.length && habits.length > 0 
            ? '🎉 All habits completed! Great job!' 
            : `${habits.length - completedCount} habits remaining today`}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: spacing[2], marginBottom: spacing[4], overflowX: 'auto', paddingBottom: spacing[2] }}>
        {[
          { id: 'all', label: 'All', count: habits.length },
          { id: 'today', label: 'To Do', count: habits.filter(h => !h.completedToday).length },
          { id: 'completed', label: 'Done', count: completedCount },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            style={viewStyles.filterTab(filter === tab.id)}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Habits List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
        {loading ? (
          <>
            <Skeleton variant="card" className="h-24" />
            <Skeleton variant="card" className="h-24" />
            <Skeleton variant="card" className="h-24" />
          </>
        ) : filteredHabits.length === 0 ? (
          <div style={viewStyles.emptyState}>
            <span className="material-symbols-outlined" style={{ fontSize: '60px', color: colors.gray[300], marginBottom: spacing[4], display: 'block' }}>self_improvement</span>
            <h3 style={{ fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.lg, color: colors.text.secondary, marginBottom: spacing[2] }}>
              {filter === 'all' ? 'No habits yet' : filter === 'today' ? 'All done for today!' : 'No completed habits'}
            </h3>
            <p style={{ color: colors.gray[400], marginBottom: spacing[4] }}>
              {filter === 'all' ? 'Start building better habits today' : filter === 'today' ? 'You\'ve completed all your habits' : 'Complete some habits to see them here'}
            </p>
            {filter === 'all' && (
              <button onClick={() => setShowModal(true)} style={viewStyles.createBtn}>
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
        style={viewStyles.fab}
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
