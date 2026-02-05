import React, { useState, useEffect } from 'react';
import { challengeService } from '../services';
import type { Challenge, ChallengeParticipant } from '../services/challengeService';
import { colors, spacing, borderRadius, typography, shadows } from '../theme/designSystem';

interface ChallengeDetailViewProps {
  challengeId: number;
  onBack: () => void;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string;
  progress: number;
  points: number;
  isCurrentUser?: boolean;
}

// Shared styles
const styles = {
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    marginBottom: spacing[4],
  },
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius['3xl'],
    border: `1px solid ${colors.gray[100]}`,
    boxShadow: shadows.sm,
  },
  tabBtn: (active: boolean) => ({
    flex: 1,
    padding: `${spacing[3]} ${spacing[4]}`,
    borderRadius: borderRadius.xl,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.sm,
    backgroundColor: active ? colors.background.primary : 'transparent',
    color: active ? colors.primary : colors.text.secondary,
    boxShadow: active ? shadows.sm : 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  }),
  actionBtn: (danger?: boolean) => ({
    width: '100%',
    padding: spacing[4],
    borderRadius: borderRadius['2xl'],
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.sm,
    textTransform: 'uppercase' as const,
    letterSpacing: typography.letterSpacing.wide,
    backgroundColor: danger ? colors.errorBg : colors.primary,
    color: danger ? colors.error : 'white',
    boxShadow: danger ? 'none' : shadows.primaryLg,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  }),
};

// Helper function to transform participants to leaderboard entries
const mapParticipantsToLeaderboard = (participants: ChallengeParticipant[]): LeaderboardEntry[] => {
  // Deduplicate by userId and only use DB participants
  const uniqueParticipants = (participants || [])
    .filter((p, index, self) => 
      index === self.findIndex(t => t.userId === p.userId)
    );
  
  return uniqueParticipants
    .sort((a, b) => (b.progress || 0) - (a.progress || 0))
    .map((p, index) => ({
      rank: index + 1,
      userId: `user-${p.userId}`,
      name: p.userName || 'Anonymous',
      avatar: p.userAvatar || `https://i.pravatar.cc/150?u=${p.userId}`,
      progress: p.progress || 0,
      points: Math.round((p.progress || 0) * 10),
      isCurrentUser: false
    }));
};

const ChallengeDetailView: React.FC<ChallengeDetailViewProps> = ({ challengeId, onBack }) => {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [participants, setParticipants] = useState<ChallengeParticipant[]>([]);
  const [currentUserProgress, setCurrentUserProgress] = useState<ChallengeParticipant | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'progress' | 'leaderboard'>('progress');
  const [joining, setJoining] = useState(false);
  const [loggingProgress, setLoggingProgress] = useState<number | null>(null); // Track which task is being logged
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<number>>(new Set()); // Track completed tasks by ID
  const [numericInputTaskId, setNumericInputTaskId] = useState<number | null>(null); // Track which numeric task has input open
  const [numericInputValue, setNumericInputValue] = useState<string>(''); // Input value for numeric tasks

  useEffect(() => {
    const fetchChallengeDetails = async () => {
      setLoading(true);
      try {
        const data = await challengeService.getChallenge(challengeId);
        setChallenge(data.challenge);
        setParticipants(data.participants || []);
        setIsJoined(data.isJoined);
        if (data.currentUserProgress) {
            setCurrentUserProgress(data.currentUserProgress);
        }

        // Initialize completed tasks from the challenge tasks data
        if (data.challenge?.tasks) {
          const completed = new Set<number>();
          data.challenge.tasks.forEach(task => {
            if (task.current_value && task.current_value >= task.target_value) {
              completed.add(task.id);
            }
          });
          setCompletedTaskIds(completed);
        }

        // Map participants to leaderboard entries (from DB only)
        setLeaderboard(mapParticipantsToLeaderboard(data.participants || []));
      } catch (err) {
        console.error('Failed to fetch challenge details:', err);
      }
      setLoading(false);
    };

    fetchChallengeDetails();
  }, [challengeId]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      await challengeService.joinChallenge(challengeId);
      setIsJoined(true);
      // Refresh challenge data
      const data = await challengeService.getChallenge(challengeId);
      setChallenge(data.challenge);
      setParticipants(data.participants || []);
      
      // Update leaderboard with refreshed data from DB
      setLeaderboard(mapParticipantsToLeaderboard(data.participants || []));
      
      // Update current user progress - should be initialized with 0 progress for new participant
      if (data.currentUserProgress) {
        setCurrentUserProgress(data.currentUserProgress);
      } else {
        // Set default progress for newly joined user
        setCurrentUserProgress({
          id: 0,
          challengeId: challengeId,
          userId: 0,
          userName: '',
          joinedAt: new Date().toISOString(),
          progress: 0,
          completedDays: 0,
          currentStreak: 0
        });
      }
    } catch (err) {
      console.error('Failed to join challenge:', err);
    }
    setJoining(false);
  };

  const handleLeave = async () => {
    try {
      await challengeService.leaveChallenge(challengeId);
      setIsJoined(false);
    } catch (err) {
      console.error('Failed to leave challenge:', err);
    }
  };

  // Handle logging progress for a specific task (boolean tasks)
  const handleLogTaskProgress = async (taskId: number, markComplete: boolean) => {
    if (loggingProgress !== null) return; // Already logging
    setLoggingProgress(taskId);
    
    try {
      const result = await challengeService.logProgress(challengeId, { 
        completed: markComplete, 
        taskId,
        value: markComplete ? 1 : 0 
      });
      
      // Update completed tasks set
      setCompletedTaskIds(prev => {
        const newSet = new Set(prev);
        if (markComplete) {
          newSet.add(taskId);
        } else {
          newSet.delete(taskId);
        }
        return newSet;
      });
      
      // Update local progress state
      setCurrentUserProgress(prev => prev ? {
        ...prev,
        progress: result.progress,
        completedDays: result.completedDays,
      } : prev);
      
      // Refresh challenge data to get updated tasks and leaderboard
      const data = await challengeService.getChallenge(challengeId);
      setChallenge(data.challenge);
      if (data.currentUserProgress) {
        setCurrentUserProgress(data.currentUserProgress);
      }
      
      // Update completed tasks from refreshed data
      if (data.challenge?.tasks) {
        const completed = new Set<number>();
        data.challenge.tasks.forEach(task => {
          if (task.current_value && task.current_value >= task.target_value) {
            completed.add(task.id);
          }
        });
        setCompletedTaskIds(completed);
      }
      
      // Update leaderboard from DB
      setLeaderboard(mapParticipantsToLeaderboard(data.participants || []));
    } catch (err) {
      console.error('Failed to log task progress:', err);
    }
    setLoggingProgress(null);
  };

  // Handle logging progress for numeric tasks (e.g., steps, water glasses)
  const handleLogNumericTaskProgress = async (taskId: number, numericValue: number, targetValue: number) => {
    if (loggingProgress !== null) return;
    setLoggingProgress(taskId);
    
    try {
      const isComplete = numericValue >= targetValue;
      const result = await challengeService.logProgress(challengeId, { 
        completed: isComplete, 
        taskId,
        value: numericValue
      });
      
      // Update completed tasks set based on whether target is met
      setCompletedTaskIds(prev => {
        const newSet = new Set(prev);
        if (isComplete) {
          newSet.add(taskId);
        } else {
          newSet.delete(taskId);
        }
        return newSet;
      });
      
      // Update local progress state
      setCurrentUserProgress(prev => prev ? {
        ...prev,
        progress: result.progress,
        completedDays: result.completedDays,
      } : prev);
      
      // Refresh challenge data to get updated tasks and leaderboard
      const data = await challengeService.getChallenge(challengeId);
      setChallenge(data.challenge);
      if (data.currentUserProgress) {
        setCurrentUserProgress(data.currentUserProgress);
      }
      
      // Update completed tasks from refreshed data
      if (data.challenge?.tasks) {
        const completed = new Set<number>();
        data.challenge.tasks.forEach(task => {
          if (task.current_value && task.current_value >= task.target_value) {
            completed.add(task.id);
          }
        });
        setCompletedTaskIds(completed);
      }
      
      // Update leaderboard from DB
      setLeaderboard(mapParticipantsToLeaderboard(data.participants || []));
    } catch (err) {
      console.error('Failed to log numeric task progress:', err);
    }
    setLoggingProgress(null);
    setNumericInputTaskId(null);
    setNumericInputValue('');
  };

  // Legacy handler for challenges without tasks (single daily action)
  const handleLogProgress = async (markComplete?: boolean) => {
    if (loggingProgress !== null) return;
    setLoggingProgress(-1); // Use -1 to indicate legacy logging
    
    const newCompletedState = markComplete !== undefined ? markComplete : completedTaskIds.size === 0;
    
    try {
      const result = await challengeService.logProgress(challengeId, { completed: newCompletedState });
      
      // Update local progress state
      setCurrentUserProgress(prev => prev ? {
        ...prev,
        progress: result.progress,
        completedDays: result.completedDays,
      } : prev);
      
      // Refresh challenge data to get updated leaderboard
      const data = await challengeService.getChallenge(challengeId);
      if (data.currentUserProgress) {
        setCurrentUserProgress(data.currentUserProgress);
      }
      // Update leaderboard from DB
      setLeaderboard(mapParticipantsToLeaderboard(data.participants || []));
    } catch (err) {
      console.error('Failed to log progress:', err);
    }
    setLoggingProgress(null);
  };

  const getDaysRemaining = () => {
    if (!challenge?.endDate) return 0;
    const end = new Date(challenge.endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'individual': return 'person';
      case 'group': return 'groups';
      case 'competitive': return 'emoji_events';
      default: return 'flag';
    }
  };

  if (loading) {
    return (
      <div>
        <div style={{ padding: `${spacing[4]} ${spacing[6]}` }}>
          <button onClick={onBack} style={styles.backBtn}>
            <span className="material-symbols-outlined">arrow_back</span>
            Back
          </button>
        </div>
        <div style={{ padding: `0 ${spacing[6]}`, display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
          <div style={{ height: '192px', backgroundColor: colors.gray[100], borderRadius: borderRadius['3xl'], opacity: 0.5 }} />
          <div style={{ height: '128px', backgroundColor: colors.gray[100], borderRadius: borderRadius['3xl'], opacity: 0.5 }} />
          <div style={{ height: '256px', backgroundColor: colors.gray[100], borderRadius: borderRadius['3xl'], opacity: 0.5 }} />
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div style={{ padding: `${spacing[4]} ${spacing[6]}` }}>
        <button onClick={onBack} style={styles.backBtn}>
          <span className="material-symbols-outlined">arrow_back</span>
          Back
        </button>
        <div style={{ textAlign: 'center', padding: `${spacing[12]} 0` }}>
          <p style={{ color: colors.gray[400] }}>Challenge not found</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: spacing[10] }}>
      {/* Back Button */}
      <div style={{ padding: `${spacing[4]} ${spacing[6]}` }}>
        <button onClick={onBack} style={styles.backBtn}>
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Challenges
        </button>
      </div>

      {/* Challenge Header Card */}
      <div style={{ padding: `0 ${spacing[6]}` }}>
        <div style={{
          background: `linear-gradient(to bottom right, ${colors.primary}, ${colors.primary}CC)`,
          borderRadius: '2rem',
          padding: spacing[6],
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: shadows.primaryLg,
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '160px',
            height: '160px',
            background: 'rgba(255,255,255,0.1)',
            filter: 'blur(48px)',
            borderRadius: borderRadius.full,
            transform: 'translate(50%, -50%)',
          }} />
          
          <div style={{ position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[2] }}>
              <span style={{
                fontSize: '10px',
                fontWeight: typography.fontWeight.bold,
                textTransform: 'uppercase',
                padding: `${spacing[1]} ${spacing[2]}`,
                borderRadius: borderRadius.full,
                backgroundColor: 'rgba(255,255,255,0.2)',
              }}>
                Active Challenge
              </span>
              <span style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '10px',
                fontWeight: typography.fontWeight.bold,
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: spacing[1],
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>{getTypeIcon(challenge.type)}</span>
                {challenge.type}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.extrabold, lineHeight: typography.lineHeight.tight, margin: 0 }}>{challenge.title}</h1>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: typography.fontSize.sm, marginTop: spacing[2], lineHeight: typography.lineHeight.relaxed }}>{challenge.description}</p>
              </div>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: borderRadius['2xl'],
                backgroundColor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginLeft: spacing[4],
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '30px' }}>
                  {challenge.icon || 'emoji_events'}
                </span>
              </div>
            </div>

            {/* Stats Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: spacing[4],
              marginTop: spacing[6],
              paddingTop: spacing[4],
              borderTop: '1px solid rgba(255,255,255,0.2)',
            }}>
              <div>
                <p style={{ fontSize: '10px', fontWeight: typography.fontWeight.bold, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>Remaining</p>
                <p style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.black }}>{getDaysRemaining()} Days Left</p>
              </div>
              <div>
                <p style={{ fontSize: '10px', fontWeight: typography.fontWeight.bold, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>Participants</p>
                <p style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.black }}>{challenge.participantCount?.toLocaleString() || participants.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: `${spacing[6]} ${spacing[6]} 0` }}>
        <div style={{
          display: 'flex',
          backgroundColor: colors.gray[100],
          borderRadius: borderRadius['2xl'],
          padding: spacing[1],
        }}>
          <button onClick={() => setActiveTab('progress')} style={styles.tabBtn(activeTab === 'progress')}>
            My Progress
          </button>
          <button onClick={() => setActiveTab('leaderboard')} style={styles.tabBtn(activeTab === 'leaderboard')}>
            Leaderboard
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ padding: `${spacing[6]} ${spacing[6]} 0` }}>
        {activeTab === 'leaderboard' ? (
          <div style={styles.card}>
            {leaderboard.length > 0 ? (
              leaderboard.map((entry, index) => (
                <div 
                  key={entry.userId} 
                  style={{
                    padding: spacing[4],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: entry.isCurrentUser ? colors.primaryAlpha(0.05) : 'transparent',
                    borderLeft: entry.isCurrentUser ? `4px solid ${colors.primary}` : 'none',
                    borderBottom: index < leaderboard.length - 1 ? `1px solid ${colors.gray[50]}` : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: typography.fontWeight.black,
                      fontSize: typography.fontSize.sm,
                      borderRadius: borderRadius.full,
                      backgroundColor: entry.rank === 1 ? '#FBBF24' : entry.rank === 2 ? '#CBD5E1' : entry.rank === 3 ? '#FDBA74' : 'transparent',
                      color: entry.rank === 1 ? 'white' : entry.rank === 2 ? '#475569' : entry.rank === 3 ? 'white' : colors.gray[400],
                    }}>
                      {entry.rank <= 3 ? (
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                          {entry.rank === 1 ? 'looks_one' : entry.rank === 2 ? 'looks_two' : 'looks_3'}
                        </span>
                      ) : entry.rank}
                    </div>
                    <img 
                      src={entry.avatar} 
                      style={{ width: '40px', height: '40px', borderRadius: borderRadius.full, backgroundColor: colors.gray[100] }} 
                      alt={entry.name} 
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                        <h4 style={{ fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.sm, margin: 0, color: colors.text.primary }}>{entry.name}</h4>
                        {entry.isCurrentUser && (
                          <span style={{
                            backgroundColor: colors.primaryAlpha(0.2),
                            color: colors.primary,
                            fontSize: '8px',
                            fontWeight: typography.fontWeight.black,
                            padding: `${spacing[0.5]} ${spacing[2]}`,
                            borderRadius: borderRadius.full,
                            textTransform: 'uppercase',
                          }}>
                            You
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '10px', fontWeight: typography.fontWeight.bold, color: colors.primary, margin: 0 }}>{entry.progress}% Done</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.black, color: colors.gray[400] }}>#{entry.rank}</span>
                    <p style={{ fontSize: '10px', fontWeight: typography.fontWeight.bold, color: colors.gray[400], margin: 0 }}>{entry.points.toLocaleString()} pts</p>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: spacing[8], textAlign: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '36px', color: colors.gray[300], marginBottom: spacing[2], display: 'block' }}>group</span>
                <p style={{ color: colors.gray[400], fontSize: typography.fontSize.sm }}>No participants yet</p>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
            {/* Progress Stats */}
            {isJoined ? (
              <>
                <div style={{ ...styles.card, padding: spacing[5] }}>
                  <h3 style={{ fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.sm, textTransform: 'uppercase', color: colors.gray[400], marginBottom: spacing[4] }}>
                    {challenge.tasks && challenge.tasks.length > 0 ? "Today's Progress" : 'Your Progress'}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
                    <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                      {/* Calculate today's task progress for challenges with tasks */}
                      {(() => {
                        let displayProgress = currentUserProgress?.progress || 0;
                        if (challenge.tasks && challenge.tasks.length > 0) {
                          const completedCount = challenge.tasks.filter(t => 
                            completedTaskIds.has(t.id) || (t.current_value !== undefined && t.current_value >= t.target_value)
                          ).length;
                          displayProgress = Math.round((completedCount / challenge.tasks.length) * 100);
                        }
                        return (
                          <>
                            <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                              <circle 
                                fill="transparent" cx="40" cy="40" r="32" 
                                stroke={colors.gray[100]} strokeWidth="8" 
                              />
                              <circle 
                                fill="transparent" cx="40" cy="40" r="32" 
                                stroke={colors.primary} strokeWidth="8" 
                                strokeDasharray={2 * Math.PI * 32}
                                strokeDashoffset={2 * Math.PI * 32 * (1 - (displayProgress / 100))}
                                strokeLinecap="round"
                                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                              />
                            </svg>
                            <span style={{
                              position: 'absolute',
                              inset: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: typography.fontSize.lg,
                              fontWeight: typography.fontWeight.black,
                              color: colors.primary,
                            }}>
                              {displayProgress}%
                            </span>
                          </>
                        );
                      })()}
                    </div>
                    <div style={{ flex: 1 }}>
                      {challenge.tasks && challenge.tasks.length > 0 ? (
                        <>
                          <p style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.black, margin: 0, color: colors.text.primary }}>
                            {challenge.tasks.filter(t => completedTaskIds.has(t.id) || (t.current_value !== undefined && t.current_value >= t.target_value)).length} / {challenge.tasks.length}
                          </p>
                          <p style={{ fontSize: typography.fontSize.sm, color: colors.gray[400], margin: 0 }}>Tasks Done Today</p>
                        </>
                      ) : (
                        <>
                          <p style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.black, margin: 0, color: colors.text.primary }}>{currentUserProgress?.completedDays || 0} / {challenge.targetDays}</p>
                          <p style={{ fontSize: typography.fontSize.sm, color: colors.gray[400], margin: 0 }}>Days Completed</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[4] }}>
                  <div style={{ ...styles.card, padding: spacing[4] }}>
                    <span className="material-symbols-outlined" style={{ color: '#F97316', fontSize: '24px' }}>local_fire_department</span>
                    <p style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.black, marginTop: spacing[2], color: colors.text.primary }}>{currentUserProgress?.currentStreak || 0}</p>
                    <p style={{ fontSize: typography.fontSize.xs, color: colors.gray[400], fontWeight: typography.fontWeight.medium }}>Current Streak</p>
                  </div>
                  <div style={{ ...styles.card, padding: spacing[4] }}>
                    <span className="material-symbols-outlined" style={{ color: '#EAB308', fontSize: '24px' }}>stars</span>
                    <p style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.black, marginTop: spacing[2], color: colors.text.primary }}>{(Math.round((currentUserProgress?.progress || 0) * 10)).toLocaleString()}</p>
                    <p style={{ fontSize: typography.fontSize.xs, color: colors.gray[400], fontWeight: typography.fontWeight.medium }}>Points Earned</p>
                  </div>
                </div>
                
                {/* Tasks List */}
                <div style={{ ...styles.card, padding: spacing[5] }}>
                  <h3 style={{ fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.sm, textTransform: 'uppercase', color: colors.gray[400], marginBottom: spacing[4] }}>Daily Tasks</h3>
                  {challenge.tasks && challenge.tasks.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
                      {challenge.tasks.map(task => {
                        // Check if this specific task is completed (from current_value or from our tracking set)
                        const isCompleted = completedTaskIds.has(task.id) || (task.current_value !== undefined && task.current_value >= task.target_value);
                        const isLogging = loggingProgress === task.id;
                        const isNumericTask = task.type === 'numeric';
                        const isInputOpen = numericInputTaskId === task.id;
                        
                        return (
                        <div key={task.id} style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: spacing[2],
                          padding: spacing[3],
                          backgroundColor: isCompleted ? colors.successBg : colors.gray[50],
                          borderRadius: borderRadius.xl,
                          transition: 'all 0.2s ease',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                            {/* Checkbox for boolean tasks, or progress indicator for numeric */}
                            {!isNumericTask ? (
                              <button 
                                onClick={() => handleLogTaskProgress(task.id, !isCompleted)}
                                disabled={loggingProgress !== null}
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: borderRadius.full,
                                  border: `2px solid ${isCompleted ? colors.success : colors.gray[300]}`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backgroundColor: isCompleted ? colors.success : 'transparent',
                                  color: 'white',
                                  cursor: loggingProgress !== null ? 'default' : 'pointer',
                                  opacity: loggingProgress !== null && !isLogging ? 0.5 : 1,
                                  transition: 'all 0.2s ease',
                                }}
                              >
                                {isCompleted && !isLogging ? (
                                  <span className="material-symbols-outlined" style={{ fontSize: '16px', fontWeight: 'bold' }}>check</span>
                                ) : isLogging ? (
                                  <span style={{ width: '12px', height: '12px', border: '2px solid', borderColor: `${colors.gray[300]} transparent`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                ) : null}
                              </button>
                            ) : (
                              <div style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: borderRadius.full,
                                backgroundColor: isCompleted ? colors.success : colors.primary,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'white' }}>
                                  {isCompleted ? 'check' : 'fitness_center'}
                                </span>
                              </div>
                            )}
                            
                            <div style={{ flex: 1 }}>
                              <p style={{ fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.sm, margin: 0, color: isCompleted ? colors.success : colors.text.primary }}>{task.title}</p>
                              {task.description && <p style={{ fontSize: typography.fontSize.xs, color: colors.gray[400], margin: 0 }}>{task.description}</p>}
                            </div>
                            
                            {/* Status badge */}
                            <div style={{ 
                              fontSize: typography.fontSize.xs, 
                              fontWeight: typography.fontWeight.bold, 
                              color: isCompleted ? colors.success : colors.gray[400],
                              padding: `${spacing[1]} ${spacing[2]}`,
                              backgroundColor: isCompleted ? colors.successBg : 'transparent',
                              borderRadius: borderRadius.full,
                            }}>
                               {isNumericTask 
                                  ? `${task.current_value || 0}/${task.target_value} ${task.unit || ''}`
                                  : (isCompleted ? '✓ Done' : 'Tap to complete')
                               }
                            </div>
                          </div>
                          
                          {/* Numeric input section for numeric tasks */}
                          {isNumericTask && (
                            <div style={{ marginTop: spacing[2] }}>
                              {!isInputOpen ? (
                                <button
                                  onClick={() => {
                                    setNumericInputTaskId(task.id);
                                    setNumericInputValue(String(task.current_value || ''));
                                  }}
                                  disabled={loggingProgress !== null}
                                  style={{
                                    width: '100%',
                                    padding: `${spacing[2]} ${spacing[3]}`,
                                    borderRadius: borderRadius.lg,
                                    border: `1px dashed ${colors.gray[300]}`,
                                    backgroundColor: 'transparent',
                                    color: colors.primary,
                                    fontSize: typography.fontSize.sm,
                                    fontWeight: typography.fontWeight.medium,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: spacing[2],
                                  }}
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                                  Log your {task.unit || 'progress'}
                                </button>
                              ) : (
                                <div style={{ display: 'flex', gap: spacing[2], alignItems: 'center' }}>
                                  <input
                                    type="number"
                                    value={numericInputValue}
                                    onChange={(e) => setNumericInputValue(e.target.value)}
                                    placeholder={`Enter ${task.unit || 'value'}`}
                                    autoFocus
                                    style={{
                                      flex: 1,
                                      padding: `${spacing[2]} ${spacing[3]}`,
                                      borderRadius: borderRadius.lg,
                                      border: `1px solid ${colors.gray[200]}`,
                                      fontSize: typography.fontSize.md,
                                      fontWeight: typography.fontWeight.bold,
                                      textAlign: 'center',
                                      outline: 'none',
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && numericInputValue) {
                                        handleLogNumericTaskProgress(task.id, parseInt(numericInputValue), task.target_value);
                                      } else if (e.key === 'Escape') {
                                        setNumericInputTaskId(null);
                                        setNumericInputValue('');
                                      }
                                    }}
                                  />
                                  <span style={{ color: colors.gray[500], fontSize: typography.fontSize.sm }}>{task.unit || ''}</span>
                                  <button
                                    onClick={() => {
                                      if (numericInputValue) {
                                        handleLogNumericTaskProgress(task.id, parseInt(numericInputValue), task.target_value);
                                      }
                                    }}
                                    disabled={!numericInputValue || loggingProgress !== null}
                                    style={{
                                      padding: `${spacing[2]} ${spacing[4]}`,
                                      borderRadius: borderRadius.lg,
                                      backgroundColor: numericInputValue ? colors.primary : colors.gray[200],
                                      color: 'white',
                                      border: 'none',
                                      fontWeight: typography.fontWeight.bold,
                                      fontSize: typography.fontSize.sm,
                                      cursor: numericInputValue ? 'pointer' : 'default',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: spacing[1],
                                    }}
                                  >
                                    {isLogging ? (
                                      <span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                    ) : (
                                      <>
                                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
                                        Save
                                      </>
                                    )}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setNumericInputTaskId(null);
                                      setNumericInputValue('');
                                    }}
                                    style={{
                                      padding: spacing[2],
                                      borderRadius: borderRadius.lg,
                                      backgroundColor: colors.gray[100],
                                      color: colors.gray[500],
                                      border: 'none',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                                  </button>
                                </div>
                              )}
                              
                              {/* Progress bar for numeric tasks */}
                              <div style={{ marginTop: spacing[2] }}>
                                <div style={{
                                  height: '6px',
                                  backgroundColor: colors.gray[200],
                                  borderRadius: borderRadius.full,
                                  overflow: 'hidden',
                                }}>
                                  <div style={{
                                    height: '100%',
                                    width: `${Math.min(100, ((task.current_value || 0) / task.target_value) * 100)}%`,
                                    backgroundColor: isCompleted ? colors.success : colors.primary,
                                    borderRadius: borderRadius.full,
                                    transition: 'width 0.3s ease',
                                  }} />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );})}
                    </div>
                  ) : (
                    <div style={{ padding: spacing[4] }}>
                        {/* Daily Action Display - for challenges without specific tasks */}
                        {challenge.dailyAction && (
                            <div style={{
                              marginBottom: spacing[4],
                              padding: spacing[4],
                              backgroundColor: (currentUserProgress?.progress || 0) >= 100 ? colors.successBg : colors.primaryAlpha(0.05),
                              borderRadius: borderRadius.xl,
                              color: (currentUserProgress?.progress || 0) >= 100 ? colors.success : colors.primary,
                              fontWeight: typography.fontWeight.medium,
                              fontSize: typography.fontSize.sm,
                              textAlign: 'center',
                            }}>
                                <p style={{ margin: 0, marginBottom: spacing[2] }}>
                                  {(currentUserProgress?.progress || 0) >= 100 ? "✓ Completed Today!" : "Today's Goal:"}
                                </p>
                                <p style={{ margin: 0, fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold }}>{challenge.dailyAction}</p>
                            </div>
                        )}
                        
                        {/* Mark Complete / Undo Button */}
                        <button
                          onClick={() => handleLogProgress((currentUserProgress?.progress || 0) < 100)}
                          disabled={loggingProgress !== null}
                          style={{
                            width: '100%',
                            padding: spacing[4],
                            borderRadius: borderRadius['2xl'],
                            backgroundColor: (currentUserProgress?.progress || 0) >= 100 ? colors.gray[200] : colors.success,
                            color: (currentUserProgress?.progress || 0) >= 100 ? colors.gray[600] : 'white',
                            border: 'none',
                            fontSize: typography.fontSize.md,
                            fontWeight: typography.fontWeight.bold,
                            cursor: loggingProgress !== null ? 'default' : 'pointer',
                            opacity: loggingProgress !== null ? 0.7 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: spacing[2],
                            boxShadow: (currentUserProgress?.progress || 0) >= 100 ? 'none' : shadows.md,
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {loggingProgress === -1 ? (
                            <>
                              <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: (currentUserProgress?.progress || 0) >= 100 ? colors.gray[600] : 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                              {(currentUserProgress?.progress || 0) >= 100 ? 'Undoing...' : 'Logging...'}
                            </>
                          ) : (currentUserProgress?.progress || 0) >= 100 ? (
                            <>
                              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>undo</span>
                              Undo Today's Completion
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check_circle</span>
                              Mark Today as Complete
                            </>
                          )}
                        </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{
                backgroundColor: colors.gray[50],
                borderRadius: borderRadius['3xl'],
                padding: spacing[8],
                textAlign: 'center',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '48px', color: colors.gray[300], marginBottom: spacing[4], display: 'block' }}>lock</span>
                <h3 style={{ fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.lg, marginBottom: spacing[2], color: colors.text.primary }}>Join to Track Progress</h3>
                <p style={{ color: colors.gray[400], fontSize: typography.fontSize.sm, marginBottom: spacing[4] }}>Join this challenge to start tracking your progress and compete with others.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Challenge Info Section */}
      <div style={{ padding: `${spacing[6]} ${spacing[6]} 0` }}>
        <h3 style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold, textTransform: 'uppercase', letterSpacing: typography.letterSpacing.wider, color: colors.gray[400], marginBottom: spacing[4] }}>Challenge Details</h3>
        <div style={{ ...styles.card, padding: spacing[5], display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: borderRadius.full,
              backgroundColor: colors.primaryAlpha(0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span className="material-symbols-outlined" style={{ color: colors.primary }}>person</span>
            </div>
            <div>
              <p style={{ fontSize: typography.fontSize.xs, color: colors.gray[400], fontWeight: typography.fontWeight.medium }}>Created by</p>
              <p style={{ fontWeight: typography.fontWeight.bold, color: colors.text.primary }}>{challenge.creatorName || 'HabitPulse Team'}</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: borderRadius.full,
              backgroundColor: colors.successBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span className="material-symbols-outlined" style={{ color: colors.success }}>calendar_today</span>
            </div>
            <div>
              <p style={{ fontSize: typography.fontSize.xs, color: colors.gray[400], fontWeight: typography.fontWeight.medium }}>Duration</p>
              <p style={{ fontWeight: typography.fontWeight.bold, color: colors.text.primary }}>{challenge.targetDays || 30} Days</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: borderRadius.full,
              backgroundColor: colors.warningBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span className="material-symbols-outlined" style={{ color: colors.warning }}>emoji_events</span>
            </div>
            <div>
              <p style={{ fontSize: typography.fontSize.xs, color: colors.gray[400], fontWeight: typography.fontWeight.medium }}>Rewards</p>
              <p style={{ fontWeight: typography.fontWeight.bold, color: colors.text.primary }}>{challenge.rewards ? `${challenge.rewards.xp} XP${challenge.rewards.badge ? ` + ${challenge.rewards.badge}` : ''}` : '500 XP + Badge'}</p>
            </div>
          </div>

          {challenge.habitTemplate && (
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: borderRadius.full,
                backgroundColor: '#DBEAFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span className="material-symbols-outlined" style={{ color: '#3B82F6' }}>checklist</span>
              </div>
              <div>
                <p style={{ fontSize: typography.fontSize.xs, color: colors.gray[400], fontWeight: typography.fontWeight.medium }}>Daily Task</p>
                <p style={{ fontWeight: typography.fontWeight.bold, color: colors.text.primary }}>{challenge.habitTemplate.title}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div style={{ padding: `${spacing[6]} ${spacing[6]} 0` }}>
        {isJoined ? (
          <button onClick={handleLeave} style={styles.actionBtn(true)}>
            Leave Challenge
          </button>
        ) : (
          <button onClick={handleJoin} disabled={joining} style={{ ...styles.actionBtn(), opacity: joining ? 0.5 : 1 }}>
            {joining ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: spacing[2] }}>
                <span style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: borderRadius.full,
                  animation: 'spin 1s linear infinite',
                }} />
                Joining...
              </span>
            ) : (
              'Join Challenge'
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default ChallengeDetailView;
