import React, { useState, useEffect } from 'react';
import { userService } from '../../services';

interface DayActivity {
  date: string;
  completed: boolean;
  count?: number;
  tasks?: { title: string; completed: boolean }[];
}

interface WeeklyCalendarProps {
  onDayClick?: (date: string, activity: DayActivity) => void;
}

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
      className="bg-slate-900 rounded-[2rem] p-6 text-white overflow-hidden relative"
      role="region"
      aria-label="Weekly activity"
    >
      <div className="relative z-10">
        {/* Week Navigation Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Weekly Activity</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevWeek}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              aria-label="Previous week"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <span className="text-xs font-medium text-white/70 min-w-[100px] text-center">
              {formatWeekRange()}
            </span>
            <button
              onClick={handleNextWeek}
              disabled={weekOffset >= 0}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                weekOffset >= 0 
                  ? 'bg-white/5 text-white/30 cursor-not-allowed' 
                  : 'bg-white/10 hover:bg-white/20'
              }`}
              aria-label="Next week"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Days Grid */}
        <div className="flex justify-between items-center" role="list" aria-label="Days of the week">
          {weekDates.map((date, i) => {
            const dateStr = date.toISOString().split('T')[0];
            const isToday = dateStr === todayStr;
            const dayActivity = activity[i] || { date: dateStr, completed: false, count: 0 };
            
            return (
              <button
                key={i}
                onClick={() => handleDayClick(dayActivity)}
                className="flex flex-col items-center gap-3 group cursor-pointer"
                role="listitem"
                aria-label={`${days[date.getDay()]}${isToday ? ' (today)' : ''}${dayActivity.completed ? ' - completed' : ''}, ${date.toLocaleDateString()}`}
              >
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all group-hover:scale-110 ${
                    isToday ? 'bg-primary text-white ring-2 ring-primary/30' : 
                    dayActivity.completed ? 'bg-primary/20 text-primary' : 
                    'bg-white/10 text-white/50 group-hover:bg-white/20'
                  }`}
                >
                  {dayActivity.completed && !isToday ? (
                    <span className="material-symbols-outlined text-sm" aria-hidden="true">check</span>
                  ) : date.getDate()}
                </div>
                <span className={`text-[10px] font-bold ${isToday ? 'text-white' : 'text-white/50'}`} aria-hidden="true">
                  {days[date.getDay()]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2" aria-hidden="true"></div>

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl p-6 m-4 max-w-sm w-full shadow-2xl animate-in zoom-in-95"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">{formattedDate}</h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
        
        <div className="space-y-4">
          <div className={`p-4 rounded-2xl ${activity.completed ? 'bg-green-50 dark:bg-green-900/20' : 'bg-slate-50 dark:bg-slate-800'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                activity.completed ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              }`}>
                <span className="material-symbols-outlined">
                  {activity.completed ? 'check_circle' : 'radio_button_unchecked'}
                </span>
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  {activity.completed ? 'Tasks Completed!' : 'No activity'}
                </p>
                <p className="text-sm text-slate-500">
                  {activity.count || 0} task{(activity.count || 0) !== 1 ? 's' : ''} completed
                </p>
              </div>
            </div>
          </div>

          {activity.tasks && activity.tasks.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Tasks</h4>
              {activity.tasks.map((task, i) => (
                <div key={i} className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className={`material-symbols-outlined text-sm ${task.completed ? 'text-green-500' : 'text-slate-400'}`}>
                    {task.completed ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <span className={`text-sm ${task.completed ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
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
