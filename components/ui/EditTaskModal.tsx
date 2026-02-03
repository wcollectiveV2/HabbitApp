import React, { useState } from 'react';
import { Task } from '../../types';
import { taskService } from '../../services';

interface EditTaskModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onTaskUpdated: () => void;
  onTaskDeleted: () => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ 
  isOpen, 
  task, 
  onClose, 
  onTaskUpdated,
  onTaskDeleted 
}) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.challengeName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  React.useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.challengeName || '');
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !title.trim()) return;

    setLoading(true);
    setError('');

    try {
      await taskService.updateTask(task.id, task.completed ? 'completed' : 'pending');
      onTaskUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;

    setLoading(true);
    try {
      await taskService.deleteTask(task.id);
      onTaskDeleted();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !task) return null;

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
          <h2 className="font-bold text-lg">Edit Task</h2>
          <button 
            onClick={handleSubmit}
            disabled={loading || !title.trim()}
            className="text-primary font-bold text-sm disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-500 text-sm rounded-xl">
              {error}
            </div>
          )}

          {/* Icon & Title */}
          <div className="flex gap-3">
            <div className={`w-14 h-14 rounded-2xl ${task.iconBg} ${task.iconColor} flex items-center justify-center flex-shrink-0`}>
              <span className="material-symbols-outlined text-2xl">{task.icon}</span>
            </div>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Task title"
              className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 py-3 font-semibold focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          {/* Description */}
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Description"
            rows={2}
            className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 py-3 font-medium focus:ring-2 focus:ring-primary outline-none resize-none"
          />

          {/* Task Progress Info */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-slate-500">Progress</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {task.currentProgress}/{task.totalProgress}
              </span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: task.progressBlocks }).map((_, i) => (
                <div 
                  key={i}
                  className={`flex-1 h-2 rounded-full ${
                    i < task.activeBlocks ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Status Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
            <div className="flex items-center gap-3">
              <span className={`material-symbols-outlined ${task.completed ? 'text-green-500' : 'text-slate-400'}`}>
                {task.completed ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {task.completed ? 'Completed' : 'In Progress'}
              </span>
            </div>
          </div>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full p-4 bg-red-50 dark:bg-red-900/10 text-red-500 font-bold rounded-2xl flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
            Delete Task
          </button>
        </form>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full">
              <h3 className="font-bold text-lg mb-2">Delete Task?</h3>
              <p className="text-slate-500 text-sm mb-4">
                This action cannot be undone. The task will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 p-3 bg-red-500 text-white rounded-xl font-bold disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditTaskModal;
