import React, { useState, useEffect } from 'react';
import { userService } from '../../services';
import { colors, spacing, borderRadius, shadows, typography, transitions } from '../../theme/designSystem';

interface DayActivity {
  date: string;
  completed: boolean;
  count?: number;
  tasks?: { title: string; completed: boolean }[];
}

interface WeeklyCalendarProps {
  onDayClick?: (date: string, activity: DayActivity) => void;
}

const calendarStyles = {
  container: {
    backgroundColor: colors.gray[900],
    borderRadius: borderRadius['2xl'],
    padding: spacing[6],
    color: colors.white,
    overflow: 'hidden',
    position: 'relative' as const,
  },
  innerContainer: {
    position: 'relative' as const,
    zIndex: 10,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  navBtns: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
  },
  navBtn: (disabled: boolean) => ({
    width: '2rem',
    height: '2rem',
    borderRadius: borderRadius.full,
    backgroundColor: disabled ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
    color: disabled ? 'rgba(255,255,255,0.3)' : colors.white,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: transitions.colors,
  }),
  weekRange: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: 'rgba(255,255,255,0.7)',
    minWidth: '100px',
    textAlign: 'center' as const,
  },
  daysGrid: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayBtn: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: spacing[3],
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: 0,
  },
  dayCircle: (isToday: boolean, isCompleted: boolean) => ({
    width: '2rem',
    height: '2rem',
    borderRadius: borderRadius.full,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: typography.fontWeight.bold,
    transition: transitions.all,
    backgroundColor: isToday 
      ? colors.primary 
      : isCompleted 
        ? `${colors.primary}33` 
        : 'rgba(255,255,255,0.1)',
    color: isToday 
      ? colors.white 
      : isCompleted 
        ? colors.primaryLight
        : 'rgba(255,255,255,0.5)',
    boxShadow: isToday ? `0 0 0 3px ${colors.primary}4D` : 'none',
  }),
  dayLabel: (isToday: boolean) => ({
    fontSize: '10px',
    fontWeight: typography.fontWeight.bold,
    color: isToday ? colors.white : 'rgba(255,255,255,0.5)',
  }),
  glow: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    width: '8rem',
    height: '8rem',
    backgroundColor: `${colors.primary}33`,
    filter: 'blur(60px)',
    borderRadius: borderRadius.full,
    transform: 'translateX(50%) translateY(-50%)',
  },
};

const modalStyles = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: borderRadius['3xl'],
    padding: spacing[6],
    margin: spacing[4],
    maxWidth: '24rem',
    width: '100%',
    boxShadow: shadows['2xl'],
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  title: {
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.lg,
    color: colors.gray[900],
  },
  closeBtn: {
    width: '2rem',
    height: '2rem',
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[100],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
  },
  content: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: spacing[4],
  },
  statusBox: (isCompleted: boolean) => ({
    padding: spacing[4],
    borderRadius: borderRadius['2xl'],
    backgroundColor: isCompleted ? colors.green[50] : colors.gray[50],
  }),
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
  },
  statusIcon: (isCompleted: boolean) => ({
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: borderRadius.full,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isCompleted ? colors.green[500] : colors.gray[200],
    color: isCompleted ? colors.white : colors.gray[500],
  }),
  statusTitle: {
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[900],
  },
  statusSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
  },
  tasksSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: spacing[2],
  },
  tasksLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[500],
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  taskItem: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    padding: spacing[3],
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.xl,
  },
  taskText: (isCompleted: boolean) => ({
    fontSize: typography.fontSize.sm,
    color: isCompleted ? colors.gray[900] : colors.gray[500],
  }),
};

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ onDayClick }) => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [activity, setActivity] = useState<DayActivity[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayActivity | null>(null);
  const [loading, setLoading] = useState(false);

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const getWeekDates = (offset: number) => {
    const today = new Date();
    const currentDay = today.getDay();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - currentDay + (offset * 7));
    
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(weekOffset);
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchActivity = async () => {
      setLoading(true);
      try {
        const activityData = await userService.getActivity();
        const weekActivity = weekDates.map(date => {
          const dateStr = date.toISOString().split('T')[0];
          const dayData = activityData.find((a: any) => a.date === dateStr);
          return {
            date: dateStr,
            completed: dayData ? dayData.count > 0 : false,
            count: dayData?.count || 0
          };
        });
        setActivity(weekActivity);
      } catch {
        setActivity(weekDates.map(date => ({
          date: date.toISOString().split('T')[0],
          completed: false,
          count: 0
        })));
      }
      setLoading(false);
    };
    fetchActivity();
  }, [weekOffset]);

  const handlePrevWeek = () => {
    setWeekOffset(prev => prev - 1);
  };

  const handleNextWeek = () => {
    if (weekOffset < 0) {
      setWeekOffset(prev => prev + 1);
    }
  };

  const handleDayClick = (dayActivity: DayActivity) => {
    setSelectedDay(dayActivity);
    onDayClick?.(dayActivity.date, dayActivity);
  };

  const formatWeekRange = () => {
    const start = weekDates[0];
    const end = weekDates[6];
    const monthFormat = new Intl.DateTimeFormat('en', { month: 'short' });
    const startMonth = monthFormat.format(start);
    const endMonth = monthFormat.format(end);
    
    if (startMonth === endMonth) {
      return `${startMonth} ${start.getDate()} - ${end.getDate()}`;
    }
    return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}`;
  };

  return (
    <section 
      style={calendarStyles.container}
      role="region"
      aria-label="Weekly activity"
    >
      <div style={calendarStyles.innerContainer}>
        {/* Week Navigation Header */}
        <div style={calendarStyles.header}>
          <h3 style={calendarStyles.title}>Weekly Activity</h3>
          <div style={calendarStyles.navBtns}>
            <button
              onClick={handlePrevWeek}
              style={calendarStyles.navBtn(false)}
              aria-label="Previous week"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>chevron_left</span>
            </button>
            <span style={calendarStyles.weekRange}>
              {formatWeekRange()}
            </span>
            <button
              onClick={handleNextWeek}
              disabled={weekOffset >= 0}
              style={calendarStyles.navBtn(weekOffset >= 0)}
              aria-label="Next week"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>chevron_right</span>
            </button>
          </div>
        </div>

        {/* Days Grid */}
        <div style={calendarStyles.daysGrid} role="list" aria-label="Days of the week">
          {weekDates.map((date, i) => {
            const dateStr = date.toISOString().split('T')[0];
            const isToday = dateStr === todayStr;
            const dayActivity = activity[i] || { date: dateStr, completed: false, count: 0 };
            
            return (
              <button
                key={i}
                onClick={() => handleDayClick(dayActivity)}
                style={calendarStyles.dayBtn}
                role="listitem"
                aria-label={`${days[date.getDay()]}${isToday ? ' (today)' : ''}${dayActivity.completed ? ' - completed' : ''}, ${date.toLocaleDateString()}`}
              >
                <div style={calendarStyles.dayCircle(isToday, dayActivity.completed)}>
                  {dayActivity.completed && !isToday ? (
                    <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }} aria-hidden="true">check</span>
                  ) : date.getDate()}
                </div>
                <span style={calendarStyles.dayLabel(isToday)} aria-hidden="true">
                  {days[date.getDay()]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div style={calendarStyles.glow} aria-hidden="true"></div>

      {/* Day Detail Modal */}
      {selectedDay && (
        <DayDetailModal 
          activity={selectedDay} 
          onClose={() => setSelectedDay(null)} 
        />
      )}
    </section>
  );
};

const DayDetailModal: React.FC<{ activity: DayActivity; onClose: () => void }> = ({ activity, onClose }) => {
  const date = new Date(activity.date);
  const formattedDate = date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div 
      style={modalStyles.overlay}
      onClick={onClose}
    >
      <div 
        style={modalStyles.modal}
        onClick={e => e.stopPropagation()}
      >
        <div style={modalStyles.header}>
          <h3 style={modalStyles.title}>{formattedDate}</h3>
          <button 
            onClick={onClose}
            style={modalStyles.closeBtn}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>close</span>
          </button>
        </div>
        
        <div style={modalStyles.content}>
          <div style={modalStyles.statusBox(activity.completed)}>
            <div style={modalStyles.statusRow}>
              <div style={modalStyles.statusIcon(activity.completed)}>
                <span className="material-symbols-outlined">
                  {activity.completed ? 'check_circle' : 'radio_button_unchecked'}
                </span>
              </div>
              <div>
                <p style={modalStyles.statusTitle}>
                  {activity.completed ? 'Tasks Completed!' : 'No activity'}
                </p>
                <p style={modalStyles.statusSubtitle}>
                  {activity.count || 0} task{(activity.count || 0) !== 1 ? 's' : ''} completed
                </p>
              </div>
            </div>
          </div>

          {activity.tasks && activity.tasks.length > 0 && (
            <div style={modalStyles.tasksSection}>
              <h4 style={modalStyles.tasksLabel}>Tasks</h4>
              {activity.tasks.map((task, i) => (
                <div key={i} style={modalStyles.taskItem}>
                  <span 
                    className="material-symbols-outlined" 
                    style={{ 
                      fontSize: '1rem', 
                      color: task.completed ? colors.green[500] : colors.gray[400] 
                    }}
                  >
                    {task.completed ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <span style={modalStyles.taskText(task.completed)}>
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyCalendar;
