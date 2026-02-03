
import React from 'react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string, e?: React.MouseEvent) => void;
  onIncrement?: (id: string) => void;
  onDecrement?: (id: string) => void;
}

const getPriorityBadge = (priority?: string) => {
  switch (priority) {
    case 'high':
      return { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', label: 'High' };
    case 'medium':
      return { bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'text-yellow-600 dark:text-yellow-400', label: 'Medium' };
    case 'low':
      return { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', label: 'Low' };
    default:
      return null;
  }
};

const formatDueDate = (dueDate?: string) => {
  if (!dueDate) return null;
  const date = new Date(dueDate);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) {
    return { label: 'Today', isOverdue: false };
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return { label: 'Tomorrow', isOverdue: false };
  }
  if (date < today) {
    return { label: 'Overdue', isOverdue: true };
  }
  return { 
    label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
    isOverdue: false 
  };
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onIncrement, onDecrement }) => {
  const progressPercent = Math.round((task.currentProgress / task.totalProgress) * 100);
  const priorityBadge = getPriorityBadge(task.priority);
  const dueDateInfo = formatDueDate(task.dueDate);
  const isCounterTask = task.type === 'counter';

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(task.id, e);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    onIncrement?.(task.id);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDecrement?.(task.id);
  };

  return (
    <div 
      className={`bg-white dark:bg-card-dark p-5 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-800 transition-all duration-300 ${
        task.completed ? 'opacity-100 scale-[0.98]' : 'opacity-100'
      }`}
      role="article"
      aria-label={`Task: ${task.title}${task.completed ? ' (completed)' : ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          {/* Task type icon indicator */}
          <div 
            className={`w-12 h-12 flex items-center justify-center rounded-2xl ${task.iconBg} ${task.iconColor}`}
            aria-hidden="true"
          >
            <span className="material-symbols-outlined text-3xl">{task.icon}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-bold text-lg leading-tight text-slate-900 dark:text-white ${task.completed ? 'line-through decoration-slate-400 dark:decoration-slate-500' : ''}`}>
                {task.title}
              </h3>
              {/* Priority Badge */}
              {priorityBadge && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${priorityBadge.bg} ${priorityBadge.text}`}>
                  {priorityBadge.label}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Fixed contrast: text-slate-400 -> text-slate-600 */}
              <p className="text-slate-600 dark:text-slate-400 text-xs font-medium">{task.challengeName}</p>
              {/* Due Date */}
              {dueDateInfo && (
                <span className={`flex items-center gap-1 text-[10px] font-bold ${
                  dueDateInfo.isOverdue 
                    ? 'text-red-500' 
                    : 'text-slate-500 dark:text-slate-400'
                }`}>
                  <span className="material-symbols-outlined text-xs">schedule</span>
                  {dueDateInfo.label}
                </span>
              )}
            </div>
          </div>
        </div>
        {/* Counter Controls or Toggle button */}
        {isCounterTask ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDecrement}
              disabled={(task.currentValue || 0) <= 0}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                (task.currentValue || 0) <= 0
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95'
              }`}
              aria-label={`Decrease ${task.title} count`}
            >
              <span className="material-symbols-outlined text-xl">remove</span>
            </button>
            <div className="text-center min-w-[60px]">
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {task.currentValue || 0}
              </span>
              {task.goal && (
                <span className="text-slate-500 dark:text-slate-400 text-sm">
                  /{task.goal}
                </span>
              )}
              {task.unit && (
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  {task.unit}
                </span>
              )}
            </div>
            <button
              onClick={handleIncrement}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary-dark active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label={`Increase ${task.title} count`}
            >
              <span className="material-symbols-outlined text-xl">add</span>
            </button>
          </div>
        ) : (
          /* Toggle button with minimum 48x48 touch target */
          <button 
            onClick={handleToggleClick}
            className={`min-w-[48px] min-h-[48px] flex items-center justify-center rounded-full relative transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
            role="switch"
            aria-checked={task.completed}
            aria-label={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
          >
            <div className={`w-12 h-6 rounded-full relative flex items-center p-1 transition-colors ${
              task.completed ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
            }`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${
                task.completed ? 'translate-x-6' : 'translate-x-0'
              }`}>
                {task.completed && (
                  <span className="material-symbols-outlined text-primary text-[10px] flex items-center justify-center h-full">
                    check
                  </span>
                )}
              </div>
            </div>
          </button>
        )}
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          {/* Fixed contrast: text-slate-400 -> text-slate-600 */}
          <span className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 tracking-wider">Progress</span>
          <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
            {task.currentProgress}/{task.totalProgress} days
          </span>
        </div>
        {/* Progress bar with ARIA attributes and improved contrast */}
        <div 
          className="flex gap-1"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progress: ${task.currentProgress} of ${task.totalProgress} days`}
        >
          {Array.from({ length: task.progressBlocks }).map((_, i) => (
            <div 
              key={i}
              className={`w-4 h-1.5 rounded-full transition-colors border ${
                i < task.activeBlocks 
                  ? 'bg-primary border-primary' 
                  : 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600'
              }`}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
