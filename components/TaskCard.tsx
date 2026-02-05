
import React from 'react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string, e?: React.MouseEvent) => void;
  onIncrement?: (id: string) => void;
  onDecrement?: (id: string) => void;
}

const getPriorityStyles = (priority?: string) => {
  switch (priority) {
    case 'high':
      return { bg: '#FEE2E2', color: '#DC2626', label: 'High' };
    case 'medium':
      return { bg: '#FEF3C7', color: '#D97706', label: 'Medium' };
    case 'low':
      return { bg: '#D1FAE5', color: '#059669', label: 'Low' };
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
    background: '#FFFFFF',
    padding: '16px',
    borderRadius: '20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    border: '1px solid #F1F5F9',
    transition: 'all 0.2s ease',
    opacity: task.completed ? 0.7 : 1,
  };

  const iconContainerStyle: React.CSSProperties = {
    width: '48px',
    height: '48px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: task.completed ? '#E2E8F0' : '#EEF2FF',
    color: task.completed ? '#94A3B8' : '#5D5FEF',
    flexShrink: 0,
  };

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={iconContainerStyle}>
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
            {task.icon}
          </span>
        </div>
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: 700, 
              color: '#1E293B',
              margin: 0,
              textDecoration: task.completed ? 'line-through' : 'none',
              opacity: task.completed ? 0.6 : 1,
            }}>
              {task.title}
            </h3>
            {priorityBadge && (
              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '20px',
                background: priorityBadge.bg,
                color: priorityBadge.color,
              }}>
                {priorityBadge.label}
              </span>
            )}
          </div>
          <p style={{ 
            fontSize: '12px', 
            color: '#64748B', 
            margin: '4px 0 0 0',
            fontWeight: 500,
          }}>
            {task.challengeName}
          </p>
        </div>

        {/* Toggle or Counter */}
        {isCounterTask ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleDecrement}
              disabled={(task.currentValue || 0) <= 0}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: 'none',
                background: '#F1F5F9',
                color: (task.currentValue || 0) <= 0 ? '#CBD5E1' : '#475569',
                cursor: (task.currentValue || 0) <= 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>remove</span>
            </button>
            <div style={{ textAlign: 'center', minWidth: '50px' }}>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#1E293B' }}>
                {task.currentValue || 0}
              </span>
              {task.goal && (
                <span style={{ fontSize: '14px', color: '#94A3B8' }}>/{task.goal}</span>
              )}
            </div>
            <button
              onClick={handleIncrement}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: 'none',
                background: '#5D5FEF',
                color: '#FFFFFF',
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
              borderRadius: '50%',
              border: task.completed ? 'none' : '2px solid #CBD5E1',
              background: task.completed ? '#5D5FEF' : 'transparent',
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
                color: '#FFFFFF',
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
        marginTop: '14px', 
        paddingTop: '14px', 
        borderTop: '1px solid #F1F5F9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>
          {task.currentProgress}/{task.totalProgress} days
        </span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {Array.from({ length: task.progressBlocks }).map((_, i) => (
            <div 
              key={i}
              style={{
                width: '20px',
                height: '6px',
                borderRadius: '3px',
                background: i < task.activeBlocks ? '#5D5FEF' : '#E2E8F0',
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
