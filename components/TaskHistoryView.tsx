import React, { useState, useEffect } from 'react';
import { taskService, TaskHistory, HeatmapData } from '../services/taskService';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/designSystem';

const sharedStyles = {
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    border: `1px solid ${colors.gray[100]}`,
    overflow: 'hidden' as const,
  },
  header: {
    backgroundColor: colors.background.primary,
    borderBottom: `1px solid ${colors.gray[100]}`,
    position: 'sticky' as const,
    top: 0,
    zIndex: 10,
    padding: spacing[4],
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
  },
  backBtn: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    color: colors.text.primary,
  },
  statCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    textAlign: 'center' as const,
    border: `1px solid ${colors.gray[100]}`,
  },
  filterBtn: (active: boolean) => ({
    padding: `${spacing[1]} ${spacing[3]}`,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    borderRadius: borderRadius.full,
    border: 'none',
    cursor: 'pointer',
    backgroundColor: active ? colors.primary : colors.gray[100],
    color: active ? 'white' : colors.text.secondary,
    transition: 'all 0.2s ease',
  }),
};

// Heatmap component showing task completion intensity
const TaskHeatmap: React.FC<{ data: HeatmapData[], year: number, onYearChange: (year: number) => void }> = ({ 
  data, year, onYearChange 
}) => {
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 2, currentYear - 1, currentYear];
  
  // Create a map for quick lookup
  const dataMap = new Map<string, number>(data.map(d => [d.date, d.count]));
  
  // Generate all days of the year
  const getDaysInYear = (year: number) => {
    const days: { date: string; count: number; dayOfWeek: number; month: number }[] = [];
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        count: dataMap.get(dateStr) || 0,
        dayOfWeek: d.getDay(),
        month: d.getMonth()
      });
    }
    return days;
  };
  
  const days = getDaysInYear(year);
  
  // Get color intensity based on count
  const getColor = (count: number) => {
    if (count === 0) return colors.gray[100];
    if (count <= 2) return '#A7F3D0'; // emerald-200
    if (count <= 4) return '#34D399'; // emerald-400
    if (count <= 6) return '#10B981'; // emerald-500
    return '#059669'; // emerald-600
  };
  
  // Group days by week
  const weeks: (typeof days[0] | null)[][] = [];
  let currentWeek: (typeof days[0] | null)[] = [];
  
  // Pad the first week
  const firstDayOfWeek = days[0]?.dayOfWeek || 0;
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null);
  }
  
  days.forEach((day, index) => {
    currentWeek.push(day);
    if (day.dayOfWeek === 6 || index === days.length - 1) {
      // Pad the last week
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Calculate month positions
  const getMonthPositions = () => {
    const positions: { month: number; weekIndex: number }[] = [];
    let currentMonth = -1;
    weeks.forEach((week, weekIndex) => {
      const firstDayOfWeek = week.find(d => d !== null);
      if (firstDayOfWeek && firstDayOfWeek.month !== currentMonth) {
        currentMonth = firstDayOfWeek.month;
        positions.push({ month: currentMonth, weekIndex });
      }
    });
    return positions;
  };
  
  const monthPositions = getMonthPositions();

  const heatmapStyles = {
    container: {
      ...sharedStyles.card,
      borderRadius: borderRadius['2xl'],
      padding: spacing[4],
      boxShadow: shadows.sm,
    },
    headerRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing[4],
    },
    yearBtn: (active: boolean) => sharedStyles.filterBtn(active),
  };

  return (
    <div style={heatmapStyles.container}>
      {/* Year selector */}
      <div style={heatmapStyles.headerRow}>
        <h3 style={{ fontWeight: typography.fontWeight.bold, color: colors.text.primary, margin: 0 }}>Activity Heatmap</h3>
        <div style={{ display: 'flex', gap: spacing[1] }}>
          {years.map(y => (
            <button
              key={y}
              onClick={() => onYearChange(y)}
              style={heatmapStyles.yearBtn(y === year)}
            >
              {y}
            </button>
          ))}
        </div>
      </div>
      
      {/* Heatmap grid */}
      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'inline-block', minWidth: '100%' }}>
          {/* Month labels */}
          <div style={{ display: 'flex', marginBottom: spacing[1], marginLeft: '32px' }}>
            {monthPositions.map(({ month, weekIndex }) => (
              <span 
                key={month}
                style={{ 
                  fontSize: '10px',
                  color: colors.gray[500],
                  marginLeft: weekIndex === 0 ? 0 : `${(weekIndex - (monthPositions.find(p => p.month === month - 1)?.weekIndex || 0)) * 12 - 20}px`,
                  minWidth: '32px'
                }}
              >
                {monthLabels[month]}
              </span>
            ))}
          </div>
          
          {/* Day labels + grid */}
          <div style={{ display: 'flex' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginRight: spacing[2], fontSize: '10px', color: colors.gray[500] }}>
              <span style={{ height: '10px' }}></span>
              <span style={{ height: '10px' }}>Mon</span>
              <span style={{ height: '10px' }}></span>
              <span style={{ height: '10px' }}>Wed</span>
              <span style={{ height: '10px' }}></span>
              <span style={{ height: '10px' }}>Fri</span>
              <span style={{ height: '10px' }}></span>
            </div>
            <div style={{ display: 'flex', gap: '3px' }}>
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {week.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '2px',
                        backgroundColor: day ? getColor(day.count) : 'transparent',
                      }}
                      title={day ? `${day.date}: ${day.count} task${day.count !== 1 ? 's' : ''} completed` : ''}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          
          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: spacing[2], marginTop: spacing[3], fontSize: '10px', color: colors.gray[500] }}>
            <span>Less</span>
            <div style={{ display: 'flex', gap: spacing[1] }}>
              {[0, 2, 4, 6, 8].map((count) => (
                <div key={count} style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: getColor(count) }} />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// History list item
interface HistoryItemProps {
  history: TaskHistory;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ history }) => {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(history.date);
  const isToday = date.toDateString() === new Date().toDateString();
  const isYesterday = date.toDateString() === new Date(Date.now() - 86400000).toDateString();
  
  const getDateLabel = () => {
    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };
  
  const completionRate = history.totalCount > 0 
    ? Math.round((history.completedCount / history.totalCount) * 100) 
    : 0;
  
  const getCompletionStyle = () => {
    if (completionRate === 100) return { bg: '#D1FAE5', color: '#059669' }; // emerald
    if (completionRate >= 50) return { bg: '#FEF3C7', color: '#D97706' }; // amber
    return { bg: colors.gray[100], color: colors.gray[500] };
  };

  const completionStyle = getCompletionStyle();

  const itemStyles = {
    container: sharedStyles.card,
    button: {
      width: '100%',
      padding: spacing[4],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      textAlign: 'left' as const,
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
    },
    leftContent: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[3],
    },
    iconBox: {
      width: '40px',
      height: '40px',
      borderRadius: borderRadius.full,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: completionStyle.bg,
      color: completionStyle.color,
    },
    badge: {
      padding: `${spacing[1]} ${spacing[2]}`,
      borderRadius: borderRadius.full,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.bold,
      backgroundColor: completionRate === 100 ? '#D1FAE5' : colors.gray[100],
      color: completionRate === 100 ? '#059669' : colors.text.secondary,
    },
    expandedArea: {
      padding: `0 ${spacing[4]} ${spacing[4]}`,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacing[2],
      borderTop: `1px solid ${colors.gray[100]}`,
      paddingTop: spacing[3],
    },
    taskRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: `${spacing[2]} 0`,
    },
  };

  return (
    <div style={itemStyles.container}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={itemStyles.button}
      >
        <div style={itemStyles.leftContent}>
          <div style={itemStyles.iconBox}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              {completionRate === 100 ? 'check_circle' : 'radio_button_unchecked'}
            </span>
          </div>
          <div>
            <h4 style={{ fontWeight: typography.fontWeight.semibold, color: colors.text.primary, margin: 0 }}>{getDateLabel()}</h4>
            <p style={{ fontSize: typography.fontSize.sm, color: colors.gray[500], margin: 0 }}>
              {history.completedCount}/{history.totalCount} tasks completed
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
          <div style={itemStyles.badge}>
            {completionRate}%
          </div>
          <span 
            className="material-symbols-outlined" 
            style={{ 
              color: colors.gray[400], 
              transition: 'transform 0.2s ease',
              transform: expanded ? 'rotate(180deg)' : 'none'
            }}
          >
            expand_more
          </span>
        </div>
      </button>
      
      {expanded && history.tasks.length > 0 && (
        <div style={itemStyles.expandedArea}>
          {history.tasks.map((task) => (
            <div key={task.taskId} style={itemStyles.taskRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                <span 
                  className="material-symbols-outlined" 
                  style={{ 
                    fontSize: '18px',
                    color: task.status === 'completed' 
                      ? '#10B981' 
                      : task.status === 'skipped'
                      ? colors.gray[400]
                      : colors.gray[300]
                  }}
                >
                  {task.status === 'completed' ? 'check_circle' : task.status === 'skipped' ? 'cancel' : 'radio_button_unchecked'}
                </span>
                <span style={{ 
                  fontSize: typography.fontSize.sm,
                  color: task.status === 'completed' ? colors.text.primary : colors.gray[500]
                }}>
                  {task.title}
                </span>
              </div>
              {task.goal && (
                <span style={{ fontSize: typography.fontSize.xs, color: colors.gray[500] }}>
                  {task.value}/{task.goal}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface TaskHistoryViewProps {
  onBack?: () => void;
}

const TaskHistoryView: React.FC<TaskHistoryViewProps> = ({ onBack }) => {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [history, setHistory] = useState<TaskHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    fetchData();
  }, [selectedYear, dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch heatmap data
      const heatmapResult = await taskService.getHeatmapData(selectedYear);
      setHeatmapData(heatmapResult.data);

      // Fetch history based on date range
      let from: string | undefined;
      const today = new Date();
      
      if (dateRange === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        from = weekAgo.toISOString().split('T')[0];
      } else if (dateRange === 'month') {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        from = monthAgo.toISOString().split('T')[0];
      }

      const historyResult = await taskService.getHistory(from);
      setHistory(historyResult.data);
    } catch (err) {
      console.error('Failed to fetch task history:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const totalTasks = history.reduce((sum, h) => sum + h.totalCount, 0);
  const completedTasks = history.reduce((sum, h) => sum + h.completedCount, 0);
  const perfectDays = history.filter(h => h.completedCount === h.totalCount && h.totalCount > 0).length;
  const avgCompletion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const viewStyles = {
    container: {
      minHeight: '100vh',
      backgroundColor: colors.gray[50],
    },
    content: {
      padding: spacing[4],
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacing[4],
      paddingBottom: '96px',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: spacing[3],
    },
    emptyState: {
      textAlign: 'center' as const,
      padding: `${spacing[12]} 0`,
    },
  };

  return (
    <div style={viewStyles.container}>
      {/* Header */}
      <div style={sharedStyles.header}>
        {onBack && (
          <button onClick={onBack} style={sharedStyles.backBtn}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        )}
        <h1 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.text.primary, margin: 0 }}>Task History</h1>
      </div>

      <div style={viewStyles.content}>
        {/* Quick Stats */}
        <div style={viewStyles.statsGrid}>
          <div style={sharedStyles.statCard}>
            <p style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.primary, margin: 0 }}>{completedTasks}</p>
            <p style={{ fontSize: typography.fontSize.xs, color: colors.gray[500], marginTop: spacing[1] }}>Tasks Done</p>
          </div>
          <div style={sharedStyles.statCard}>
            <p style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: '#10B981', margin: 0 }}>{perfectDays}</p>
            <p style={{ fontSize: typography.fontSize.xs, color: colors.gray[500], marginTop: spacing[1] }}>Perfect Days</p>
          </div>
          <div style={sharedStyles.statCard}>
            <p style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: '#F59E0B', margin: 0 }}>{avgCompletion}%</p>
            <p style={{ fontSize: typography.fontSize.xs, color: colors.gray[500], marginTop: spacing[1] }}>Avg. Rate</p>
          </div>
        </div>

        {/* Heatmap */}
        {loading ? (
          <div style={{ ...sharedStyles.card, borderRadius: borderRadius['2xl'], padding: spacing[4], height: '160px', backgroundColor: colors.gray[100] }} />
        ) : (
          <TaskHeatmap 
            data={heatmapData} 
            year={selectedYear} 
            onYearChange={setSelectedYear} 
          />
        )}

        {/* Date Range Filter */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontWeight: typography.fontWeight.bold, color: colors.text.primary, margin: 0 }}>Recent Activity</h3>
          <div style={{ display: 'flex', gap: spacing[1] }}>
            {(['week', 'month', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                style={sharedStyles.filterBtn(range === dateRange)}
              >
                {range === 'week' ? '7 Days' : range === 'month' ? '30 Days' : 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* History List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ ...sharedStyles.card, height: '80px', backgroundColor: colors.gray[100] }} />
            ))}
          </div>
        ) : history.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
            {history.map((h) => (
              <HistoryItem key={h.date} history={h} />
            ))}
          </div>
        ) : (
          <div style={viewStyles.emptyState}>
            <span className="material-symbols-outlined" style={{ fontSize: '36px', color: colors.gray[300] }}>history</span>
            <p style={{ marginTop: spacing[2], color: colors.gray[500] }}>No history yet</p>
            <p style={{ fontSize: typography.fontSize.sm, color: colors.gray[400] }}>Complete tasks to see your history</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskHistoryView;
