import React, { useState, useEffect } from 'react';
import { taskService } from '../../services';

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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center animate-in fade-in">
      <div 
        className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-10"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <button 
            onClick={onClose}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <h2 className="font-bold text-lg">Create Task</h2>
          <button 
            onClick={handleSubmit}
            disabled={loading || !formData.title.trim()}
            className="text-primary font-bold text-sm disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[70vh]">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-500 text-sm rounded-xl">
              {error}
            </div>
          )}

          {/* Icon & Title Row */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowIconPicker(!showIconPicker)}
              className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0"
            >
              <span className="material-symbols-outlined text-2xl">{formData.icon}</span>
            </button>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="Task title"
              className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 py-3 font-semibold focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          {/* Icon Picker */}
          {showIconPicker && (
            <div className="grid grid-cols-6 gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              {ICONS.map(icon => (
                <button
                  key={icon.name}
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, icon: icon.name });
                    setShowIconPicker(false);
                  }}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    formData.icon === icon.name 
                      ? 'bg-primary text-white' 
                      : 'bg-white dark:bg-slate-700 hover:bg-primary/10'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">{icon.name}</span>
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
            className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 py-3 font-medium focus:ring-2 focus:ring-primary outline-none resize-none"
          />

          {/* Task Type */}
          <div>
            <label className="text-sm font-bold text-slate-500 mb-2 block">Task Type</label>
            <div className="flex gap-2">
              {(['check', 'counter', 'log'] as TaskType[]).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, type })}
                  className={`flex-1 p-3 rounded-xl font-semibold text-sm capitalize transition-colors ${
                    formData.type === type
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Counter Settings */}
          {formData.type === 'counter' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-bold text-slate-500 mb-2 block">Goal</label>
                <input
                  type="number"
                  value={formData.goal}
                  onChange={e => setFormData({ ...formData, goal: parseInt(e.target.value) || 1 })}
                  min={1}
                  className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-500 mb-2 block">Unit</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={e => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="e.g., glasses, minutes"
                  className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>
          )}

          {/* Priority */}
          <div>
            <label className="text-sm font-bold text-slate-500 mb-2 block">Priority</label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as TaskPriority[]).map(priority => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority })}
                  className={`flex-1 p-3 rounded-xl font-semibold text-sm capitalize transition-colors ${
                    formData.priority === priority
                      ? priority === 'high' ? 'bg-red-500 text-white' :
                        priority === 'medium' ? 'bg-yellow-500 text-white' :
                        'bg-green-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="text-sm font-bold text-slate-500 mb-2 block">Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          {/* Recurring Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
            <div>
              <span className="font-bold text-slate-900 dark:text-white">Recurring Task</span>
              <p className="text-xs text-slate-500">Repeat this task automatically</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isRecurring: !formData.isRecurring })}
              className={`w-12 h-6 rounded-full relative transition-colors ${
                formData.isRecurring ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                formData.isRecurring ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* Recurring Options */}
          {formData.isRecurring && (
            <div className="space-y-3">
              <div className="flex gap-2">
                {(['daily', 'weekly', 'custom'] as const).map(freq => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setFormData({ ...formData, frequency: freq })}
                    className={`flex-1 p-2 rounded-xl font-semibold text-xs capitalize transition-colors ${
                      formData.frequency === freq
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {freq}
                  </button>
                ))}
              </div>

              {formData.frequency === 'custom' && (
                <div className="flex gap-1">
                  {DAYS.map((day, i) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleRecurringDay(i)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                        formData.recurringDays.includes(i)
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                      }`}
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
