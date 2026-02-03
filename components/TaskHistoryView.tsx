import React, { useState, useEffect } from 'react';
import { taskService, TaskHistory, HeatmapData } from '../services/taskService';

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
    if (count === 0) return 'bg-slate-100 dark:bg-slate-800';
    if (count <= 2) return 'bg-emerald-200 dark:bg-emerald-900/60';
    if (count <= 4) return 'bg-emerald-400 dark:bg-emerald-700';
    if (count <= 6) return 'bg-emerald-500 dark:bg-emerald-600';
    return 'bg-emerald-600 dark:bg-emerald-500';
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

  return (
    <div className="bg-white dark:bg-card-dark rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
      {/* Year selector */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900 dark:text-white">Activity Heatmap</h3>
        <div className="flex gap-1">
          {years.map(y => (
            <button
              key={y}
              onClick={() => onYearChange(y)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                y === year
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>
      
      {/* Heatmap grid */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex mb-1 ml-8">
            {monthPositions.map(({ month, weekIndex }) => (
              <span 
                key={month}
                className="text-[10px] text-slate-500 dark:text-slate-400"
                style={{ 
                  marginLeft: weekIndex === 0 ? 0 : `${(weekIndex - (monthPositions.find(p => p.month === month - 1)?.weekIndex || 0)) * 12 - 20}px`,
                  minWidth: '32px'
                }}
              >
                {monthLabels[month]}
              </span>
            ))}
          </div>
          
          {/* Day labels + grid */}
          <div className="flex">
            <div className="flex flex-col gap-[3px] mr-2 text-[10px] text-slate-500 dark:text-slate-400">
              <span className="h-[10px]"></span>
              <span className="h-[10px]">Mon</span>
              <span className="h-[10px]"></span>
              <span className="h-[10px]">Wed</span>
              <span className="h-[10px]"></span>
              <span className="h-[10px]">Fri</span>
              <span className="h-[10px]"></span>
            </div>
            <div className="flex gap-[3px]">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[3px]">
                  {week.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={`w-[10px] h-[10px] rounded-sm ${day ? getColor(day.count) : 'bg-transparent'}`}
                      title={day ? `${day.date}: ${day.count} task${day.count !== 1 ? 's' : ''} completed` : ''}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-end gap-2 mt-3 text-[10px] text-slate-500 dark:text-slate-400">
            <span>Less</span>
            <div className="flex gap-1">
              {[0, 2, 4, 6, 8].map((count) => (
                <div key={count} className={`w-[10px] h-[10px] rounded-sm ${getColor(count)}`} />
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
  
  return (
    <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            completionRate === 100 
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
              : completionRate >= 50
              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
          }`}>
            <span className="material-symbols-outlined text-xl">
              {completionRate === 100 ? 'check_circle' : 'radio_button_unchecked'}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white">{getDateLabel()}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {history.completedCount}/{history.totalCount} tasks completed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-2 py-1 rounded-full text-xs font-bold ${
            completionRate === 100
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}>
            {completionRate}%
          </div>
          <span className={`material-symbols-outlined text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </div>
      </button>
      
      {expanded && history.tasks.length > 0 && (
        <div className="px-4 pb-4 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
          {history.tasks.map((task) => (
            <div key={task.taskId} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined text-lg ${
                  task.status === 'completed' 
                    ? 'text-emerald-500' 
                    : task.status === 'skipped'
                    ? 'text-slate-400'
                    : 'text-slate-300 dark:text-slate-600'
                }`}>
                  {task.status === 'completed' ? 'check_circle' : task.status === 'skipped' ? 'cancel' : 'radio_button_unchecked'}
                </span>
                <span className={`text-sm ${
                  task.status === 'completed'
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {task.title}
                </span>
              </div>
              {task.goal && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-bg-dark">
      {/* Header */}
      <div className="bg-white dark:bg-card-dark border-b border-slate-100 dark:border-slate-800 sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
          )}
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Task History</h1>
        </div>
      </div>

      <div className="p-4 space-y-4 pb-24">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-card-dark rounded-xl p-4 text-center border border-slate-100 dark:border-slate-800">
            <p className="text-2xl font-bold text-primary">{completedTasks}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Tasks Done</p>
          </div>
          <div className="bg-white dark:bg-card-dark rounded-xl p-4 text-center border border-slate-100 dark:border-slate-800">
            <p className="text-2xl font-bold text-emerald-500">{perfectDays}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Perfect Days</p>
          </div>
          <div className="bg-white dark:bg-card-dark rounded-xl p-4 text-center border border-slate-100 dark:border-slate-800">
            <p className="text-2xl font-bold text-amber-500">{avgCompletion}%</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Avg. Rate</p>
          </div>
        </div>

        {/* Heatmap */}
        {loading ? (
          <div className="bg-white dark:bg-card-dark rounded-2xl p-4 h-40 animate-pulse" />
        ) : (
          <TaskHeatmap 
            data={heatmapData} 
            year={selectedYear} 
            onYearChange={setSelectedYear} 
          />
        )}

        {/* Date Range Filter */}
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white">Recent Activity</h3>
          <div className="flex gap-1">
            {(['week', 'month', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors capitalize ${
                  range === dateRange
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {range === 'week' ? '7 Days' : range === 'month' ? '30 Days' : 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* History List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-card-dark rounded-xl h-20 animate-pulse" />
            ))}
          </div>
        ) : history.length > 0 ? (
          <div className="space-y-3">
            {history.map((h) => (
              <HistoryItem key={h.date} history={h} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">history</span>
            <p className="mt-2 text-slate-500 dark:text-slate-400">No history yet</p>
            <p className="text-sm text-slate-400 dark:text-slate-500">Complete tasks to see your history</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskHistoryView;
