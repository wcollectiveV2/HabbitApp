
import React from 'react';
import { Task } from '../types';
import { colors, spacing, borderRadius, typography, shadows } from '../theme/designSystem';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string, e?: React.MouseEvent) => void;
  onIncrement?: (id: string) => void;
  onDecrement?: (id: string) => void;
}

const getPriorityStyles = (priority?: string) => {
  switch (priority) {
    case 'high':
      return { bg: colors.errorBg, color: colors.error, label: 'High' };
    case 'medium':
      return { bg: colors.warningBg, color: colors.warning, label: 'Medium' };
    case 'low':
      return { bg: colors.successBg, color: colors.success, label: 'Low' };
    default:
      return null;
  }
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onIncrement, onDecrement }) => {
  const progressPercent = Math.round((task.currentProgress / task.totalProgress) * 100);
  const priorityBadge = getPriorityStyles(task.priority);
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

  const cardStyle: React.CSSProperties = {
    background: colors.white,
    padding: spacing[4],
    borderRadius: borderRadius['2xl'],
    boxShadow: shadows.md,
    border: `1px solid ${colors.gray[100]}`,
    transition: 'all 0.2s ease',
    opacity: task.completed ? 0.7 : 1,
  };

  const iconContainerStyle: React.CSSProperties = {
    width: '48px',
    height: '48px',
    borderRadius: borderRadius.xl,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: task.completed ? colors.gray[200] : colors.primaryAlpha(0.1),
    color: task.completed ? colors.gray[400] : colors.primary,
    flexShrink: 0,
  };

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
        <div style={iconContainerStyle}>
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
            {task.icon}
          </span>
        </div>
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], flexWrap: 'wrap' }}>
            <h3 style={{ 
              fontSize: typography.fontSize.md, 
              fontWeight: typography.fontWeight.bold, 
              color: colors.text.primary,
              margin: 0,
              textDecoration: task.completed ? 'line-through' : 'none',
              opacity: task.completed ? 0.6 : 1,
            }}>
              {task.title}
            </h3>
            {priorityBadge && (
              <span style={{
                fontSize: typography.fontSize.xs,
                fontWeight: typography.fontWeight.bold,
                padding: `${spacing[1]} ${spacing[2]}`,
                borderRadius: borderRadius.full,
                background: priorityBadge.bg,
                color: priorityBadge.color,
              }}>
                {priorityBadge.label}
              </span>
            )}
          </div>
          <p style={{ 
            fontSize: typography.fontSize.sm, 
            color: colors.text.secondary, 
            margin: `${spacing[1]} 0 0 0`,
            fontWeight: typography.fontWeight.medium,
          }}>
            {task.challengeName}
          </p>
        </div>

        {/* Toggle or Counter */}
        {isCounterTask ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
            <button
              onClick={handleDecrement}
              disabled={(task.currentValue || 0) <= 0}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: borderRadius.full,
                border: 'none',
                background: colors.gray[100],
                color: (task.currentValue || 0) <= 0 ? colors.gray[300] : colors.gray[600],
                cursor: (task.currentValue || 0) <= 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>remove</span>
            </button>
            <div style={{ textAlign: 'center', minWidth: '50px' }}>
              <span style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: colors.text.primary }}>
                {task.currentValue || 0}
              </span>
              {task.goal && (
                <span style={{ fontSize: typography.fontSize.sm, color: colors.gray[400] }}>/{task.goal}</span>
              )}
            </div>
            <button
              onClick={handleIncrement}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: borderRadius.full,
                border: 'none',
                background: colors.primary,
                color: colors.white,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
            </button>
          </div>
        ) : (
          <button 
            onClick={handleToggleClick}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: borderRadius.full,
              border: task.completed ? 'none' : `2px solid ${colors.gray[300]}`,
              background: task.completed ? colors.primary : 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
          >
            {task.completed && (
              <span className="material-symbols-outlined" style={{ 
                fontSize: '18px', 
                color: colors.white,
                fontWeight: 700,
              }}>
                check
              </span>
            )}
          </button>
        )}
      </div>
      
      {/* Progress bar */}
      <div style={{ 
        marginTop: spacing[4], 
        paddingTop: spacing[4], 
        borderTop: `1px solid ${colors.gray[100]}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: typography.fontSize.xs, color: colors.gray[400], fontWeight: typography.fontWeight.semibold }}>
          {task.currentProgress}/{task.totalProgress} days
        </span>
        <div style={{ display: 'flex', gap: spacing[1] }}>
          {Array.from({ length: task.progressBlocks }).map((_, i) => (
            <div 
              key={i}
              style={{
                width: '20px',
                height: '6px',
                borderRadius: borderRadius.sm,
                background: i < task.activeBlocks ? colors.primary : colors.gray[200],
                transition: 'background 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
