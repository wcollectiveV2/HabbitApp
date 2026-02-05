import React, { useState, useEffect } from 'react';
import { taskService } from '../../services';
import { colors, spacing, borderRadius, shadows, typography, transitions } from '../../theme/designSystem';

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskType = 'check' | 'counter' | 'log';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
}

interface TaskFormData {
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  goal: number;
  unit: string;
  icon: string;
  dueDate: string;
  isRecurring: boolean;
  frequency: 'daily' | 'weekly' | 'custom';
  recurringDays: number[];
}

const ICONS = [
  { name: 'check_circle', label: 'Check' },
  { name: 'fitness_center', label: 'Fitness' },
  { name: 'local_drink', label: 'Drink' },
  { name: 'book', label: 'Read' },
  { name: 'self_improvement', label: 'Meditate' },
  { name: 'directions_run', label: 'Run' },
  { name: 'bedtime', label: 'Sleep' },
  { name: 'restaurant', label: 'Eat' },
  { name: 'code', label: 'Code' },
  { name: 'edit_note', label: 'Write' },
  { name: 'call', label: 'Call' },
  { name: 'savings', label: 'Save' },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const styles = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    zIndex: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  modal: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius['3xl'],
    borderTopRightRadius: borderRadius['3xl'],
    width: '100%',
    maxWidth: '32rem',
    maxHeight: '90vh',
    overflow: 'hidden',
    boxShadow: shadows.xl,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
    borderBottom: `1px solid ${colors.gray[100]}`,
  },
  closeBtn: {
    padding: spacing[2],
    marginLeft: `-${spacing[2]}`,
    borderRadius: borderRadius.full,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: transitions.colors,
  },
  headerTitle: {
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.lg,
    color: colors.gray[900],
  },
  createBtn: {
    color: colors.primaryDark,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.sm,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    padding: `${spacing[2]} ${spacing[3]}`,
    borderRadius: borderRadius.lg,
    transition: transitions.colors,
  },
  createBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  form: {
    padding: spacing[4],
    display: 'flex',
    flexDirection: 'column' as const,
    gap: spacing[4],
    overflowY: 'auto' as const,
    maxHeight: '70vh',
  },
  errorBox: {
    padding: spacing[3],
    backgroundColor: colors.red[50],
    color: colors.red[500],
    fontSize: typography.fontSize.sm,
    borderRadius: borderRadius.xl,
  },
  iconTitleRow: {
    display: 'flex',
    gap: spacing[3],
  },
  iconBtn: {
    width: '3.5rem',
    height: '3.5rem',
    borderRadius: borderRadius['2xl'],
    backgroundColor: `${colors.primary}15`,
    color: colors.primaryDark,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: 'none',
    cursor: 'pointer',
    transition: transitions.colors,
  },
  titleInput: {
    flex: 1,
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius['2xl'],
    padding: `${spacing[3]} ${spacing[4]}`,
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.base,
    border: `1px solid ${colors.gray[200]}`,
    outline: 'none',
    transition: transitions.colors,
  },
  iconPickerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: spacing[2],
    padding: spacing[3],
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius['2xl'],
  },
  iconPickerBtn: (isSelected: boolean) => ({
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: borderRadius.xl,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
    transition: transitions.colors,
    backgroundColor: isSelected ? colors.primary : colors.white,
    color: isSelected ? colors.white : colors.gray[600],
  }),
  textarea: {
    width: '100%',
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius['2xl'],
    padding: `${spacing[3]} ${spacing[4]}`,
    fontWeight: typography.fontWeight.medium,
    fontSize: typography.fontSize.base,
    border: `1px solid ${colors.gray[200]}`,
    outline: 'none',
    resize: 'none' as const,
    fontFamily: 'inherit',
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[500],
    marginBottom: spacing[2],
    display: 'block',
  },
  typeButtonRow: {
    display: 'flex',
    gap: spacing[2],
  },
  typeBtn: (isSelected: boolean) => ({
    flex: 1,
    padding: spacing[3],
    borderRadius: borderRadius.xl,
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.sm,
    textTransform: 'capitalize' as const,
    border: 'none',
    cursor: 'pointer',
    transition: transitions.colors,
    backgroundColor: isSelected ? colors.primary : colors.gray[100],
    color: isSelected ? colors.white : colors.gray[600],
  }),
  counterGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: spacing[3],
  },
  input: {
    width: '100%',
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.xl,
    padding: `${spacing[3]} ${spacing[4]}`,
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.base,
    border: `1px solid ${colors.gray[200]}`,
    outline: 'none',
  },
  priorityBtn: (isSelected: boolean, priority: TaskPriority) => {
    const priorityColors = {
      high: colors.red[500],
      medium: colors.yellow[500],
      low: colors.green[500],
    };
    return {
      flex: 1,
      padding: spacing[3],
      borderRadius: borderRadius.xl,
      fontWeight: typography.fontWeight.semibold,
      fontSize: typography.fontSize.sm,
      textTransform: 'capitalize' as const,
      border: 'none',
      cursor: 'pointer',
      transition: transitions.colors,
      backgroundColor: isSelected ? priorityColors[priority] : colors.gray[100],
      color: isSelected ? colors.white : colors.gray[600],
    };
  },
  recurringBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius['2xl'],
  },
  recurringLabel: {
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
  },
  recurringDesc: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
  },
  toggle: (isOn: boolean) => ({
    width: '3rem',
    height: '1.5rem',
    borderRadius: borderRadius.full,
    position: 'relative' as const,
    border: 'none',
    cursor: 'pointer',
    transition: transitions.colors,
    backgroundColor: isOn ? colors.primary : colors.gray[300],
  }),
  toggleKnob: (isOn: boolean) => ({
    width: '1rem',
    height: '1rem',
    backgroundColor: colors.white,
    borderRadius: borderRadius.full,
    position: 'absolute' as const,
    top: '0.25rem',
    left: isOn ? '1.75rem' : '0.25rem',
    transition: transitions.all,
  }),
  freqBtnRow: {
    display: 'flex',
    gap: spacing[2],
  },
  freqBtn: (isSelected: boolean) => ({
    flex: 1,
    padding: spacing[2],
    borderRadius: borderRadius.xl,
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.xs,
    textTransform: 'capitalize' as const,
    border: 'none',
    cursor: 'pointer',
    transition: transitions.colors,
    backgroundColor: isSelected ? colors.primary : colors.gray[100],
    color: isSelected ? colors.white : colors.gray[600],
  }),
  daysRow: {
    display: 'flex',
    gap: '0.25rem',
  },
  dayBtn: (isSelected: boolean) => ({
    flex: 1,
    padding: `${spacing[2]} 0`,
    borderRadius: borderRadius.lg,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    border: 'none',
    cursor: 'pointer',
    transition: transitions.colors,
    backgroundColor: isSelected ? colors.primary : colors.gray[100],
    color: isSelected ? colors.white : colors.gray[500],
  }),
};

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, onTaskCreated }) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    type: 'check',
    priority: 'medium',
    goal: 1,
    unit: '',
    icon: 'check_circle',
    dueDate: new Date().toISOString().split('T')[0],
    isRecurring: false,
    frequency: 'daily',
    recurringDays: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showIconPicker, setShowIconPicker] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        type: 'check',
        priority: 'medium',
        goal: 1,
        unit: '',
        icon: 'check_circle',
        dueDate: new Date().toISOString().split('T')[0],
        isRecurring: false,
        frequency: 'daily',
        recurringDays: [],
      });
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await taskService.createTask({
        title: formData.title,
        description: formData.description,
        type: formData.type,
        icon: formData.icon,
        goal: formData.type === 'counter' ? formData.goal : 1,
        unit: formData.type === 'counter' ? formData.unit : undefined,
        frequency: formData.isRecurring ? formData.frequency : undefined,
      });
      onTaskCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const toggleRecurringDay = (dayIndex: number) => {
    setFormData(prev => ({
      ...prev,
      recurringDays: prev.recurringDays.includes(dayIndex)
        ? prev.recurringDays.filter(d => d !== dayIndex)
        : [...prev.recurringDays, dayIndex]
    }));
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div 
        style={styles.modal}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={styles.header}>
          <button 
            onClick={onClose}
            style={styles.closeBtn}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.gray[100]}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <h2 style={styles.headerTitle}>Create Task</h2>
          <button 
            onClick={handleSubmit}
            disabled={loading || !formData.title.trim()}
            style={{
              ...styles.createBtn,
              ...(loading || !formData.title.trim() ? styles.createBtnDisabled : {}),
            }}
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && (
            <div style={styles.errorBox}>
              {error}
            </div>
          )}

          {/* Icon & Title Row */}
          <div style={styles.iconTitleRow}>
            <button
              type="button"
              onClick={() => setShowIconPicker(!showIconPicker)}
              style={styles.iconBtn}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>{formData.icon}</span>
            </button>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="Task title"
              style={styles.titleInput}
            />
          </div>

          {/* Icon Picker */}
          {showIconPicker && (
            <div style={styles.iconPickerGrid}>
              {ICONS.map(icon => (
                <button
                  key={icon.name}
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, icon: icon.name });
                    setShowIconPicker(false);
                  }}
                  style={styles.iconPickerBtn(formData.icon === icon.name)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>{icon.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Description */}
          <textarea
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="Description (optional)"
            rows={2}
            style={styles.textarea}
          />

          {/* Task Type */}
          <div>
            <label style={styles.label}>Task Type</label>
            <div style={styles.typeButtonRow}>
              {(['check', 'counter', 'log'] as TaskType[]).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, type })}
                  style={styles.typeBtn(formData.type === type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Counter Settings */}
          {formData.type === 'counter' && (
            <div style={styles.counterGrid}>
              <div>
                <label style={styles.label}>Goal</label>
                <input
                  type="number"
                  value={formData.goal}
                  onChange={e => setFormData({ ...formData, goal: parseInt(e.target.value) || 1 })}
                  min={1}
                  style={styles.input}
                />
              </div>
              <div>
                <label style={styles.label}>Unit</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={e => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="e.g., glasses, minutes"
                  style={{ ...styles.input, fontWeight: typography.fontWeight.medium }}
                />
              </div>
            </div>
          )}

          {/* Priority */}
          <div>
            <label style={styles.label}>Priority</label>
            <div style={styles.typeButtonRow}>
              {(['low', 'medium', 'high'] as TaskPriority[]).map(priority => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority })}
                  style={styles.priorityBtn(formData.priority === priority, priority)}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label style={styles.label}>Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
              style={{ ...styles.input, fontWeight: typography.fontWeight.medium }}
            />
          </div>

          {/* Recurring Toggle */}
          <div style={styles.recurringBox}>
            <div>
              <span style={styles.recurringLabel}>Recurring Task</span>
              <p style={styles.recurringDesc}>Repeat this task automatically</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isRecurring: !formData.isRecurring })}
              style={styles.toggle(formData.isRecurring)}
            >
              <div style={styles.toggleKnob(formData.isRecurring)} />
            </button>
          </div>

          {/* Recurring Options */}
          {formData.isRecurring && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
              <div style={styles.freqBtnRow}>
                {(['daily', 'weekly', 'custom'] as const).map(freq => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setFormData({ ...formData, frequency: freq })}
                    style={styles.freqBtn(formData.frequency === freq)}
                  >
                    {freq}
                  </button>
                ))}
              </div>

              {formData.frequency === 'custom' && (
                <div style={styles.daysRow}>
                  {DAYS.map((day, i) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleRecurringDay(i)}
                      style={styles.dayBtn(formData.recurringDays.includes(i))}
                    >
                      {day[0]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
