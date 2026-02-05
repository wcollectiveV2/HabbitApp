import React, { useState } from 'react';
import { Task } from '../../types';
import { taskService } from '../../services';
import { colors, spacing, borderRadius, shadows, typography, transitions } from '../../theme/designSystem';

interface EditTaskModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onTaskUpdated: () => void;
  onTaskDeleted: () => void;
}

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
    position: 'relative' as const,
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
  saveBtn: {
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
  saveBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  form: {
    padding: spacing[4],
    display: 'flex',
    flexDirection: 'column' as const,
    gap: spacing[4],
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
  iconBox: {
    width: '3.5rem',
    height: '3.5rem',
    borderRadius: borderRadius['2xl'],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: `${colors.primary}15`,
    color: colors.primaryDark,
  },
  input: {
    flex: 1,
    backgroundColor: colors.gray[50],
    color: colors.text.primary,
    borderRadius: borderRadius['2xl'],
    padding: `${spacing[3]} ${spacing[4]}`,
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.base,
    border: `1px solid ${colors.gray[200]}`,
    outline: 'none',
  },
  textarea: {
    width: '100%',
    backgroundColor: colors.gray[50],
    color: colors.text.primary,
    borderRadius: borderRadius['2xl'],
    padding: `${spacing[3]} ${spacing[4]}`,
    fontWeight: typography.fontWeight.medium,
    fontSize: typography.fontSize.base,
    border: `1px solid ${colors.gray[200]}`,
    outline: 'none',
    resize: 'none' as const,
    fontFamily: 'inherit',
  },
  infoBox: {
    padding: spacing[4],
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius['2xl'],
  },
  infoHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  infoLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[500],
  },
  infoValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
  },
  progressBar: {
    display: 'flex',
    gap: '0.25rem',
  },
  progressBlock: (isActive: boolean) => ({
    flex: 1,
    height: '0.5rem',
    borderRadius: borderRadius.full,
    backgroundColor: isActive ? colors.primary : colors.gray[200],
  }),
  statusBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing[4],
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius['2xl'],
  },
  statusLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
  },
  statusText: {
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
  },
  deleteBtn: {
    width: '100%',
    padding: spacing[4],
    backgroundColor: colors.red[50],
    color: colors.red[500],
    fontWeight: typography.fontWeight.bold,
    borderRadius: borderRadius['2xl'],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    border: 'none',
    cursor: 'pointer',
    transition: transitions.colors,
  },
  confirmOverlay: {
    position: 'absolute' as const,
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
  },
  confirmBox: {
    backgroundColor: colors.white,
    borderRadius: borderRadius['2xl'],
    padding: spacing[6],
    maxWidth: '24rem',
    width: '100%',
  },
  confirmTitle: {
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.lg,
    marginBottom: spacing[2],
    color: colors.gray[900],
  },
  confirmText: {
    color: colors.gray[500],
    fontSize: typography.fontSize.sm,
    marginBottom: spacing[4],
  },
  confirmBtns: {
    display: 'flex',
    gap: spacing[3],
  },
  cancelBtn: {
    flex: 1,
    padding: spacing[3],
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.xl,
    fontWeight: typography.fontWeight.bold,
    border: 'none',
    cursor: 'pointer',
    color: colors.gray[700],
  },
  confirmDeleteBtn: {
    flex: 1,
    padding: spacing[3],
    backgroundColor: colors.red[500],
    color: colors.white,
    borderRadius: borderRadius.xl,
    fontWeight: typography.fontWeight.bold,
    border: 'none',
    cursor: 'pointer',
  },
};

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
          <h2 style={styles.headerTitle}>Edit Task</h2>
          <button 
            onClick={handleSubmit}
            disabled={loading || !title.trim()}
            style={{
              ...styles.saveBtn,
              ...(loading || !title.trim() ? styles.saveBtnDisabled : {}),
            }}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && (
            <div style={styles.errorBox}>
              {error}
            </div>
          )}

          {/* Icon & Title */}
          <div style={styles.iconTitleRow}>
            <div style={styles.iconBox}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.5rem' }}>{task.icon}</span>
            </div>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Task title"
              style={styles.input}
            />
          </div>

          {/* Description */}
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Description"
            rows={2}
            style={styles.textarea}
          />

          {/* Task Progress Info */}
          <div style={styles.infoBox}>
            <div style={styles.infoHeader}>
              <span style={styles.infoLabel}>Progress</span>
              <span style={styles.infoValue}>
                {task.currentProgress}/{task.totalProgress}
              </span>
            </div>
            <div style={styles.progressBar}>
              {Array.from({ length: task.progressBlocks }).map((_, i) => (
                <div 
                  key={i}
                  style={styles.progressBlock(i < task.activeBlocks)}
                />
              ))}
            </div>
          </div>

          {/* Status Toggle */}
          <div style={styles.statusBox}>
            <div style={styles.statusLeft}>
              <span 
                className="material-symbols-outlined" 
                style={{ color: task.completed ? colors.green[500] : colors.gray[400] }}
              >
                {task.completed ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <span style={styles.statusText}>
                {task.completed ? 'Completed' : 'In Progress'}
              </span>
            </div>
          </div>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            style={styles.deleteBtn}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>delete</span>
            Delete Task
          </button>
        </form>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div style={styles.confirmOverlay}>
            <div style={styles.confirmBox}>
              <h3 style={styles.confirmTitle}>Delete Task?</h3>
              <p style={styles.confirmText}>
                This action cannot be undone. The task will be permanently deleted.
              </p>
              <div style={styles.confirmBtns}>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  style={{
                    ...styles.confirmDeleteBtn,
                    ...(loading ? { opacity: 0.5 } : {}),
                  }}
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
