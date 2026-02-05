import React, { useState, useEffect, useCallback } from 'react';
import { challengeService } from '../services';
import type { Challenge } from '../services/challengeService';
import { ConfirmModal } from './ui';
import Skeleton from './ui/Skeleton';
import EmptyState from './ui/EmptyState';
import { colors, spacing, borderRadius, typography, shadows } from '../theme/designSystem';

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
  const [confirmJoinChallenge, setConfirmJoinChallenge] = useState<Challenge | null>(null);

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

  const handleJoinClick = (challenge: Challenge) => {
    // Show confirmation modal instead of joining immediately
    setConfirmJoinChallenge(challenge);
  };

  const handleConfirmJoin = async () => {
    if (!confirmJoinChallenge) return;
    
    const challengeId = confirmJoinChallenge.id;
    setJoiningId(challengeId);
    setConfirmJoinChallenge(null);
    
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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': return { backgroundColor: colors.successBg, color: colors.success };
      case 'upcoming': return { backgroundColor: '#DBEAFE', color: '#3B82F6' };
      default: return { backgroundColor: colors.gray[100], color: colors.text.secondary };
    }
  };

  const styles = {
    container: {
      padding: `0 ${spacing[6]}`,
      paddingBottom: spacing[10],
    } as React.CSSProperties,
    header: {
      marginBottom: spacing[6],
    } as React.CSSProperties,
    title: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.black,
      color: colors.text.primary,
      margin: 0,
    } as React.CSSProperties,
    subtitle: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: colors.text.secondary,
      margin: 0,
    } as React.CSSProperties,
    searchContainer: {
      position: 'relative' as const,
      marginBottom: spacing[6],
    } as React.CSSProperties,
    searchIcon: {
      position: 'absolute' as const,
      left: spacing[4],
      top: '50%',
      transform: 'translateY(-50%)',
      color: colors.text.secondary,
    } as React.CSSProperties,
    searchInput: {
      width: '100%',
      paddingLeft: spacing[12],
      paddingRight: spacing[4],
      paddingTop: spacing[4],
      paddingBottom: spacing[4],
      backgroundColor: colors.white,
      borderRadius: borderRadius['2xl'],
      border: `1px solid ${colors.gray[200]}`,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: colors.text.primary,
      outline: 'none',
    } as React.CSSProperties,
    filtersContainer: {
      display: 'flex',
      gap: spacing[2],
      overflowX: 'auto' as const,
      paddingBottom: spacing[2],
      marginBottom: spacing[6],
    } as React.CSSProperties,
    filterBtn: (active: boolean) => ({
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
      padding: `${spacing[2]} ${spacing[4]}`,
      borderRadius: borderRadius.full,
      fontWeight: typography.fontWeight.bold,
      fontSize: typography.fontSize.xs,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
      whiteSpace: 'nowrap' as const,
      border: 'none',
      cursor: 'pointer',
      backgroundColor: active ? colors.primary : colors.gray[100],
      color: active ? colors.white : colors.text.secondary,
      boxShadow: active ? shadows.primaryLg : 'none',
      transition: 'all 0.2s ease',
    } as React.CSSProperties),
    challengeCard: {
      backgroundColor: colors.white,
      borderRadius: borderRadius['3xl'],
      border: `1px solid ${colors.gray[100]}`,
      boxShadow: shadows.sm,
      overflow: 'hidden',
      marginBottom: spacing[4],
    } as React.CSSProperties,
    cardContent: {
      padding: spacing[5],
    } as React.CSSProperties,
    statusBadge: (status: string) => ({
      ...getStatusStyle(status),
      fontSize: '10px',
      fontWeight: typography.fontWeight.bold,
      textTransform: 'uppercase' as const,
      padding: `${spacing[1]} ${spacing[2]}`,
      borderRadius: borderRadius.full,
    } as React.CSSProperties),
    typeBadge: {
      color: colors.text.secondary,
      fontSize: '10px',
      fontWeight: typography.fontWeight.bold,
      textTransform: 'uppercase' as const,
      display: 'flex',
      alignItems: 'center',
      gap: spacing[1],
    } as React.CSSProperties,
    challengeTitle: {
      fontWeight: typography.fontWeight.bold,
      fontSize: typography.fontSize.lg,
      color: colors.text.primary,
      margin: 0,
    } as React.CSSProperties,
    dailyAction: {
      color: colors.primary,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      marginTop: spacing[1],
      display: 'flex',
      alignItems: 'center',
      gap: spacing[1],
    } as React.CSSProperties,
    description: {
      color: colors.text.secondary,
      fontSize: typography.fontSize.sm,
      marginTop: spacing[1],
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical' as const,
      overflow: 'hidden',
    } as React.CSSProperties,
    iconBox: {
      width: '56px',
      height: '56px',
      borderRadius: borderRadius['2xl'],
      backgroundColor: colors.primaryAlpha(0.1),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    } as React.CSSProperties,
    cardFooter: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing[4],
      paddingTop: spacing[4],
      borderTop: `1px solid ${colors.gray[100]}`,
    } as React.CSSProperties,
    metaInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[4],
      fontSize: typography.fontSize.xs,
      color: colors.text.secondary,
      fontWeight: typography.fontWeight.medium,
    } as React.CSSProperties,
    joinBtn: (isJoined: boolean) => ({
      padding: `${spacing[2]} ${spacing[5]}`,
      borderRadius: borderRadius.xl,
      fontWeight: typography.fontWeight.bold,
      fontSize: typography.fontSize.xs,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
      border: 'none',
      cursor: 'pointer',
      backgroundColor: isJoined ? colors.successBg : colors.primary,
      color: isJoined ? colors.success : colors.white,
      boxShadow: isJoined ? 'none' : shadows.primaryLg,
      transition: 'all 0.2s ease',
    } as React.CSSProperties),
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Discover Challenges</h2>
        <p style={styles.subtitle}>Find new challenges to join</p>
      </div>

      {/* Search Bar */}
      <div style={styles.searchContainer}>
        <span className="material-symbols-outlined" style={styles.searchIcon} aria-hidden="true">
          search
        </span>
        <input
          type="text"
          placeholder="Search challenges..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
          aria-label="Search challenges"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{
              position: 'absolute',
              right: spacing[4],
              top: '50%',
              transform: 'translateY(-50%)',
              color: colors.text.secondary,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: spacing[1],
            }}
            aria-label="Clear search"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
          </button>
        )}
      </div>

      {/* Type Filters */}
      <div style={styles.filtersContainer} role="tablist" aria-label="Challenge type filters">
        {types.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            style={styles.filterBtn(selectedType === type.id)}
            role="tab"
            aria-selected={selectedType === type.id}
            aria-label={`Filter by ${type.label} challenges`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }} aria-hidden="true">{type.icon}</span>
            {type.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div role="list" aria-label="Available challenges">
        {isLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ marginBottom: spacing[4] }}>
                <Skeleton variant="card" height="176px" />
              </div>
            ))}
          </>
        ) : challenges.length > 0 ? (
          challenges.map((challenge) => (
            <article key={challenge.id} style={styles.challengeCard} role="listitem">
              <div style={styles.cardContent}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing[4] }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[2] }}>
                      <span style={styles.statusBadge(challenge.status)}>
                        {challenge.status}
                      </span>
                      <span style={styles.typeBadge}>
                        <span className="material-symbols-outlined" style={{ fontSize: '12px' }} aria-hidden="true">{getTypeIcon(challenge.type)}</span>
                        {challenge.type}
                      </span>
                    </div>
                    <h3 style={styles.challengeTitle}>{challenge.title}</h3>
                    {challenge.daily_action && (
                      <p style={styles.dailyAction}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }} aria-hidden="true">task_alt</span>
                        {challenge.daily_action}
                      </p>
                    )}
                    <p style={styles.description}>{challenge.description}</p>
                  </div>
                  <div style={styles.iconBox} aria-hidden="true">
                    <span className="material-symbols-outlined" style={{ color: colors.primary, fontSize: '24px' }}>
                      {challenge.icon || 'flag'}
                    </span>
                  </div>
                </div>

                <div style={styles.cardFooter}>
                  <div style={styles.metaInfo}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }} aria-hidden="true">group</span>
                      {challenge.participantCount || 0} joined
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }} aria-hidden="true">schedule</span>
                      {challenge.targetDays || 21} days
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleJoinClick(challenge)}
                    disabled={joiningId === challenge.id || (challenge as any).isJoined}
                    style={{ ...styles.joinBtn((challenge as any).isJoined), opacity: joiningId === challenge.id ? 0.5 : 1 }}
                    aria-label={`${(challenge as any).isJoined ? 'Already joined' : 'Join'} ${challenge.title}`}
                  >
                    {joiningId === challenge.id ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                        <span style={{ width: '12px', height: '12px', border: `2px solid rgba(255,255,255,0.3)`, borderTopColor: colors.white, borderRadius: borderRadius.full, animation: 'spin 1s linear infinite' }} aria-hidden="true"></span>
                        Joining...
                      </span>
                    ) : (challenge as any).isJoined ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }} aria-hidden="true">check</span>
                        Joined
                      </span>
                    ) : (
                      'Join Challenge'
                    )}
                  </button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <EmptyState
            icon="search_off"
            title="No challenges found"
            description={searchQuery ? 'Try a different search term' : 'Check back later for new challenges'}
            illustration="search"
          />
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!confirmJoinChallenge}
        title="Join Challenge?"
        message={`Are you sure you want to join "${confirmJoinChallenge?.title}"? This challenge requires ${confirmJoinChallenge?.targetDays || 21} days of commitment.`}
        confirmLabel="Join Challenge"
        cancelLabel="Cancel"
        onConfirm={handleConfirmJoin}
        onCancel={() => setConfirmJoinChallenge(null)}
        isLoading={!!joiningId}
      />
    </div>
  );
};

export default DiscoverView;
