import React, { useState, useEffect, useCallback } from 'react';
import { challengeService } from '../services';
import type { Challenge } from '../services/challengeService';

interface DiscoverViewProps {
  onClose?: () => void;
  onJoin?: () => void;
}

const DiscoverView: React.FC<DiscoverViewProps> = ({ onClose, onJoin }) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [joiningId, setJoiningId] = useState<number | null>(null);

  const types = [
    { id: 'all', label: 'All', icon: 'apps' },
    { id: 'individual', label: 'Solo', icon: 'person' },
    { id: 'group', label: 'Group', icon: 'groups' },
    { id: 'competitive', label: 'Competitive', icon: 'emoji_events' },
  ];

  const fetchChallenges = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters: { type?: string; search?: string } = {};
      if (selectedType !== 'all') filters.type = selectedType;
      if (searchQuery.trim()) filters.search = searchQuery.trim();
      
      const data = await challengeService.discoverChallenges(filters);
      setChallenges(data.challenges || []);
    } catch (err) {
      console.error('Failed to fetch challenges:', err);
      setChallenges([]);
    }
    setIsLoading(false);
  }, [selectedType, searchQuery]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchChallenges();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchChallenges]);

  const handleJoin = async (challengeId: number) => {
    setJoiningId(challengeId);
    try {
      await challengeService.joinChallenge(challengeId);
      // Update the challenge in the list to show joined state
      setChallenges(prev => 
        prev.map(c => c.id === challengeId ? { ...c, isJoined: true } : c)
      );
      // Notify parent that a challenge was joined
      onJoin?.();
    } catch (err) {
      console.error('Failed to join challenge:', err);
    }
    setJoiningId(null);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'individual': return 'person';
      case 'group': return 'groups';
      case 'competitive': return 'emoji_events';
      default: return 'flag';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'upcoming': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="px-6 space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight">Discover Challenges</h2>
        <p className="text-slate-400 font-medium text-sm">Find new challenges to join</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          search
        </span>
        <input
          type="text"
          placeholder="Search challenges..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-card-dark rounded-2xl border border-slate-100 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 font-medium text-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        )}
      </div>

      {/* Type Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {types.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-xs uppercase tracking-wide whitespace-nowrap transition-all ${
              selectedType === type.id
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{type.icon}</span>
            {type.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="space-y-4">
        {isLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
            ))}
          </>
        ) : challenges.length > 0 ? (
          challenges.map((challenge) => (
            <div
              key={challenge.id}
              className="bg-white dark:bg-card-dark rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${getStatusColor(challenge.status)}`}>
                        {challenge.status}
                      </span>
                      <span className="text-slate-400 text-[10px] font-bold uppercase flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">{getTypeIcon(challenge.type)}</span>
                        {challenge.type}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg">{challenge.title}</h3>
                    {challenge.daily_action && (
                      <p className="text-primary text-sm font-semibold mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">task_alt</span>
                        {challenge.daily_action}
                      </p>
                    )}
                    <p className="text-slate-400 text-sm mt-1 line-clamp-2">{challenge.description}</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-2xl">
                      {challenge.icon || 'flag'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">group</span>
                      {challenge.participantCount || 0} joined
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      {challenge.targetDays || 21} days
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleJoin(challenge.id)}
                    disabled={joiningId === challenge.id || (challenge as any).isJoined}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide transition-all active:scale-95 ${
                      (challenge as any).isJoined
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-primary text-white shadow-lg shadow-primary/30'
                    }`}
                  >
                    {joiningId === challenge.id ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Joining...
                      </span>
                    ) : (challenge as any).isJoined ? (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">check</span>
                        Joined
                      </span>
                    ) : (
                      'Join Challenge'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-slate-300">search_off</span>
            </div>
            <h3 className="font-bold text-lg mb-1">No challenges found</h3>
            <p className="text-slate-400 text-sm">
              {searchQuery ? 'Try a different search term' : 'Check back later for new challenges'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverView;
