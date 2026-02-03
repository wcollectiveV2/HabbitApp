import React, { useState, useEffect, useCallback } from 'react';
import { protocolService, Protocol, ProtocolProgress, ProtocolElement } from '../services/protocolService';

interface ProtocolViewProps {
  onBack?: () => void;
}

// Element input components based on type
const ElementInput: React.FC<{
  element: ProtocolElement;
  onLog: (elementId: number, data: any) => Promise<void>;
  loading?: boolean;
}> = ({ element, onLog, loading }) => {
  const [value, setValue] = useState<number | string>(element.value ?? element.textValue ?? '');
  const [isLogging, setIsLogging] = useState(false);

  const handleLog = async (logData: any) => {
    setIsLogging(true);
    try {
      await onLog(element.id, logData);
    } finally {
      setIsLogging(false);
    }
  };

  const isCompleted = element.completed || element.pointsEarned! > 0;

  switch (element.type) {
    case 'check':
      return (
        <button
          onClick={() => handleLog({ completed: !element.completed })}
          disabled={isLogging || loading}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
            element.completed 
              ? 'bg-green-500 text-white' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
          } ${isLogging ? 'opacity-50' : ''}`}
        >
          <span className="material-symbols-outlined">
            {element.completed ? 'check' : 'radio_button_unchecked'}
          </span>
        </button>
      );

    case 'number':
    case 'timer':
      return (
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={element.goal ? `Goal: ${element.goal}` : '0'}
            className={`w-24 px-3 py-2 rounded-xl text-center border-2 transition-all ${
              isCompleted 
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
            }`}
          />
          {element.unit && <span className="text-sm text-slate-500">{element.unit}</span>}
          <button
            onClick={() => handleLog({ value: Number(value) })}
            disabled={isLogging || loading}
            className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium disabled:opacity-50"
          >
            {isLogging ? '...' : 'Save'}
          </button>
        </div>
      );

    case 'range':
      const min = element.minValue ?? 0;
      const max = element.maxValue ?? 10;
      return (
        <div className="flex items-center gap-2 flex-wrap">
          {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((num) => (
            <button
              key={num}
              onClick={() => handleLog({ value: num })}
              disabled={isLogging || loading}
              className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                element.value === num
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {num}
            </button>
          ))}
          {element.unit && <span className="text-sm text-slate-500 ml-2">{element.unit}</span>}
        </div>
      );

    case 'text':
      return (
        <div className="flex flex-col gap-2 w-full">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter your note..."
            rows={2}
            className={`w-full px-4 py-2 rounded-xl border-2 resize-none transition-all ${
              isCompleted 
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
            }`}
          />
          <button
            onClick={() => handleLog({ text_value: value })}
            disabled={isLogging || loading || !value}
            className="self-end px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium disabled:opacity-50"
          >
            {isLogging ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      );

    default:
      return null;
  }
};

// Protocol Card for list view
const ProtocolCard: React.FC<{
  protocol: Protocol;
  onClick: () => void;
}> = ({ protocol, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-left transition-all hover:shadow-md active:scale-[0.98]"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary">
            {protocol.icon || 'checklist'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 dark:text-white truncate">{protocol.name}</h3>
          {protocol.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
              {protocol.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">task_alt</span>
              {protocol.elements.length} elements
            </span>
            {protocol.organizationName && (
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">business</span>
                {protocol.organizationName}
              </span>
            )}
          </div>
        </div>
        <span className="material-symbols-outlined text-slate-400">chevron_right</span>
      </div>
    </button>
  );
};

// Protocol Detail View
const ProtocolDetail: React.FC<{
  protocol: Protocol;
  onBack: () => void;
  onShowLeaderboard: () => void;
}> = ({ protocol, onBack, onShowLeaderboard }) => {
  const [progress, setProgress] = useState<ProtocolProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchProgress = useCallback(async () => {
    setLoading(true);
    try {
      const data = await protocolService.getMyProgress(protocol.id, date);
      setProgress(data);
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    } finally {
      setLoading(false);
    }
  }, [protocol.id, date]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const handleLogElement = async (elementId: number, data: any) => {
    try {
      await protocolService.logElement(protocol.id, elementId, { ...data, log_date: date });
      // Refresh progress
      await fetchProgress();
    } catch (err) {
      console.error('Failed to log element:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-purple-600 text-white p-6 pb-24 relative">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/80 hover:text-white mb-4"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span>Back</span>
        </button>
        
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">
              {protocol.icon || 'checklist'}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{protocol.name}</h1>
            {protocol.description && (
              <p className="text-white/70 mt-1">{protocol.description}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        {progress?.stats && (
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{progress.stats.totalPoints}</div>
              <div className="text-xs text-white/60">Total Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{progress.stats.currentStreak}</div>
              <div className="text-xs text-white/60">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{progress.stats.totalCompletions}</div>
              <div className="text-xs text-white/60">Completions</div>
            </div>
          </div>
        )}
      </div>

      {/* Content Card - overlapping header */}
      <div className="px-4 -mt-16 relative z-10">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
          {/* Date selector & Leaderboard button */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400">calendar_today</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent text-sm font-medium"
              />
            </div>
            <button
              onClick={onShowLeaderboard}
              className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg text-sm font-medium"
            >
              <span className="material-symbols-outlined text-sm">leaderboard</span>
              Leaderboard
            </button>
          </div>

          {/* Today's Progress */}
          {progress && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Today's Progress
                </span>
                <span className="text-sm font-bold text-primary">
                  +{progress.todayProgress.pointsEarned} pts
                </span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress.todayProgress.percentage}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-slate-500 text-right">
                {progress.todayProgress.completed}/{progress.todayProgress.total} completed
              </div>
            </div>
          )}

          {/* Elements */}
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                    <div className="flex-1">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mt-2" />
                    </div>
                  </div>
                </div>
              ))
            ) : progress?.elements.map((element) => (
              <div key={element.id} className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    element.pointsEarned! > 0 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600' 
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                  }`}>
                    <span className="material-symbols-outlined text-xl">
                      {element.type === 'check' ? 'check_circle' : 
                       element.type === 'number' ? 'pin' :
                       element.type === 'range' ? 'tune' :
                       element.type === 'timer' ? 'timer' : 'edit_note'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900 dark:text-white">
                      {element.title}
                      {element.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </h4>
                    {element.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        {element.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">star</span>
                        {element.points} pts
                      </span>
                      {element.goal && (
                        <span>• Goal: {element.goal} {element.unit || ''}</span>
                      )}
                    </div>
                  </div>
                  {element.pointsEarned! > 0 && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-medium rounded-lg">
                      +{element.pointsEarned}
                    </span>
                  )}
                </div>
                <div className="ml-13 pl-10">
                  <ElementInput element={element} onLog={handleLogElement} loading={loading} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Leaderboard View
const LeaderboardView: React.FC<{
  protocolId?: number;
  organizationId?: number;
  title: string;
  onBack: () => void;
}> = ({ protocolId, organizationId, title, onBack }) => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'all' | 'monthly' | 'weekly' | 'daily'>('all');
  const [myRank, setMyRank] = useState<{ rank: number; totalPoints: number } | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        let data;
        if (protocolId) {
          data = await protocolService.getProtocolLeaderboard(protocolId, { period, limit: 50 });
        } else if (organizationId) {
          data = await protocolService.getOrganizationLeaderboard(organizationId, { period, limit: 50 });
        }
        if (data) {
          setLeaderboard(data.leaderboard);
          setMyRank(data.myRank || null);
        }
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [protocolId, organizationId, period]);

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-amber-400 text-amber-900';
    if (rank === 2) return 'bg-slate-300 text-slate-700';
    if (rank === 3) return 'bg-amber-600 text-amber-100';
    return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-400 to-orange-500 text-white p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/80 hover:text-white mb-4"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span>Back</span>
        </button>
        
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-4xl">leaderboard</span>
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-white/70">Leaderboard</p>
          </div>
        </div>

        {/* Period selector */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {(['all', 'monthly', 'weekly', 'daily'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                period === p 
                  ? 'bg-white text-amber-600' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {p === 'all' ? 'All Time' : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* My Rank (if hidden) */}
      {myRank && (
        <div className="mx-4 mt-4 p-4 bg-primary/10 rounded-xl border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                #{myRank.rank}
              </div>
              <div>
                <div className="font-medium text-slate-900 dark:text-white">Your Rank</div>
                <div className="text-xs text-slate-500">(Hidden from others)</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-primary">{myRank.totalPoints.toLocaleString()}</div>
              <div className="text-xs text-slate-500">points</div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard list */}
      <div className="p-4 space-y-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 bg-white dark:bg-slate-800 rounded-xl animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                </div>
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-16" />
              </div>
            </div>
          ))
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <span className="material-symbols-outlined text-4xl mb-2">emoji_events</span>
            <p>No rankings yet. Be the first!</p>
          </div>
        ) : (
          leaderboard.map((entry) => (
            <div 
              key={entry.userId}
              className={`p-4 rounded-xl transition-all ${
                entry.isCurrentUser 
                  ? 'bg-primary/10 border-2 border-primary' 
                  : 'bg-white dark:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getRankStyle(entry.rank)}`}>
                  {entry.rank <= 3 ? (
                    <span className="material-symbols-outlined">
                      {entry.rank === 1 ? 'emoji_events' : 'military_tech'}
                    </span>
                  ) : (
                    `#${entry.rank}`
                  )}
                </div>
                
                {entry.avatarUrl ? (
                  <img 
                    src={entry.avatarUrl} 
                    alt={entry.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-400">person</span>
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 dark:text-white truncate">
                    {entry.name}
                    {entry.isCurrentUser && (
                      <span className="ml-2 px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                        You
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    {entry.activeDays} active days
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-slate-900 dark:text-white">
                    {entry.totalPoints.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500">points</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Main Protocol View Component
const ProtocolView: React.FC<ProtocolViewProps> = ({ onBack }) => {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    const fetchProtocols = async () => {
      try {
        const data = await protocolService.getMyProtocols();
        setProtocols(data);
      } catch (err) {
        console.error('Failed to fetch protocols:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProtocols();
  }, []);

  if (showLeaderboard && selectedProtocol) {
    return (
      <LeaderboardView
        protocolId={selectedProtocol.id}
        title={selectedProtocol.name}
        onBack={() => setShowLeaderboard(false)}
      />
    );
  }

  if (selectedProtocol) {
    return (
      <ProtocolDetail
        protocol={selectedProtocol}
        onBack={() => setSelectedProtocol(null)}
        onShowLeaderboard={() => setShowLeaderboard(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-6 shadow-sm">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mb-4"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        )}
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Protocols</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Complete daily actions to earn points
        </p>
      </div>

      {/* Protocol List */}
      <div className="p-4 space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 bg-white dark:bg-slate-800 rounded-2xl animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                <div className="flex-1">
                  <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mt-2" />
                </div>
              </div>
            </div>
          ))
        ) : protocols.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600 mb-4">
              checklist
            </span>
            <h3 className="font-medium text-slate-600 dark:text-slate-400">No protocols assigned</h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              Ask your organization manager to assign you a protocol
            </p>
          </div>
        ) : (
          protocols.map((protocol) => (
            <ProtocolCard
              key={protocol.id}
              protocol={protocol}
              onClick={() => setSelectedProtocol(protocol)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ProtocolView;
