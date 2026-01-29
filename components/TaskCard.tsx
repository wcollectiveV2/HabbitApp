
import React from 'react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle }) => {
  return (
    <div className={`bg-white dark:bg-card-dark p-5 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-800 transition-opacity ${
      task.completed ? 'opacity-100' : 'opacity-80'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 flex items-center justify-center rounded-2xl ${task.iconBg} ${task.iconColor}`}>
            <span className="material-symbols-outlined text-3xl">{task.icon}</span>
          </div>
          <div>
            <h3 className={`font-bold text-lg leading-tight ${task.completed ? 'line-through decoration-slate-300' : ''}`}>
              {task.title}
            </h3>
            <p className="text-slate-400 text-xs font-medium">{task.challengeName}</p>
          </div>
        </div>
        <button 
          onClick={() => onToggle(task.id)}
          className={`w-12 h-6 rounded-full relative flex items-center p-1 transition-colors ${
            task.completed ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
          }`}
        >
          <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${
            task.completed ? 'translate-x-6' : 'translate-x-0'
          }`} />
        </button>
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Progress</span>
          <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
            {task.currentProgress}/{task.totalProgress} days
          </span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: task.progressBlocks }).map((_, i) => (
            <div 
              key={i}
              className={`w-4 h-1 rounded-full transition-colors ${
                i < task.activeBlocks ? 'bg-primary' : 'bg-primary/20'
              }`} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
