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

const ChallengeDetailView: React.FC<ChallengeDetailViewProps> = ({ challengeId, onBack }) => {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [participants, setParticipants] = useState<ChallengeParticipant[]>([]);
  const [currentUserProgress, setCurrentUserProgress] = useState<ChallengeParticipant | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'progress' | 'leaderboard'>('leaderboard');
  const [joining, setJoining] = useState(false);

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

        // Map participants to leaderboard entries
        const leaderboardData = (data.participants || [])
          .sort((a, b) => b.progress - a.progress)
          .map((p, index) => ({
            rank: index + 1,
            userId: String(p.userId),
            name: p.userName || 'Anonymous',
            avatar: p.userAvatar || `https://i.pravatar.cc/150?u=${p.userId}`,
            progress: p.progress || 0,
            points: Math.round((p.progress || 0) * 10), // Estimate points from progress
            isCurrentUser: false // Will be determined by comparing with current user
          }));
        setLeaderboard(leaderboardData);
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
      
      // Update leaderboard with refreshed data
      const leaderboardData = (data.participants || [])
        .sort((a, b) => b.progress - a.progress)
        .map((p, index) => ({
          rank: index + 1,
          userId: String(p.userId),
          name: p.userName || 'Anonymous',
          avatar: p.userAvatar || `https://i.pravatar.cc/150?u=${p.userId}`,
          progress: p.progress || 0,
          points: Math.round((p.progress || 0) * 10),
          isCurrentUser: false
        }));
      setLeaderboard(leaderboardData);
      
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
                  <h3 style={{ fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.sm, textTransform: 'uppercase', color: colors.gray[400], marginBottom: spacing[4] }}>Your Progress</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
                    <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                      <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                        <circle 
                          fill="transparent" cx="40" cy="40" r="32" 
                          stroke={colors.gray[100]} strokeWidth="8" 
                        />
                        <circle 
                          fill="transparent" cx="40" cy="40" r="32" 
                          stroke={colors.primary} strokeWidth="8" 
                          strokeDasharray={2 * Math.PI * 32}
                          strokeDashoffset={2 * Math.PI * 32 * (1 - ((currentUserProgress?.progress || 0) / 100))}
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
                        {currentUserProgress?.progress || 0}%
                      </span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.black, margin: 0, color: colors.text.primary }}>{currentUserProgress?.completedDays || 0} / {challenge.targetDays}</p>
                      <p style={{ fontSize: typography.fontSize.sm, color: colors.gray[400], margin: 0 }}>Days Completed</p>
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
                      {challenge.tasks.map(task => (
                        <div key={task.id} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: spacing[3],
                          padding: spacing[3],
                          backgroundColor: colors.gray[50],
                          borderRadius: borderRadius.xl,
                        }}>
                          <button style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: borderRadius.full,
                            border: `2px solid ${task.current_value && task.current_value >= task.target_value ? colors.primary : colors.gray[300]}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: task.current_value && task.current_value >= task.target_value ? colors.primary : 'transparent',
                            color: 'white',
                            cursor: 'pointer',
                          }}>
                            {(task.current_value && task.current_value >= task.target_value) && (
                              <span className="material-symbols-outlined" style={{ fontSize: '14px', fontWeight: 'bold' }}>check</span>
                            )}
                          </button>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.sm, margin: 0, color: colors.text.primary }}>{task.title}</p>
                            {task.description && <p style={{ fontSize: typography.fontSize.xs, color: colors.gray[400], margin: 0 }}>{task.description}</p>}
                          </div>
                          <div style={{ fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.medium, color: colors.gray[400] }}>
                             {task.type === 'numeric' 
                                ? `${task.current_value || 0}/${task.target_value} ${task.unit || ''}`
                                : (task.current_value ? 'Completed' : 'Pending')
                             }
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: spacing[4] }}>
                        <p style={{ color: colors.gray[400], fontSize: typography.fontSize.sm }}>No specific tasks defined.</p>
                        {challenge.dailyAction && (
                            <div style={{
                              marginTop: spacing[2],
                              padding: spacing[3],
                              backgroundColor: colors.primaryAlpha(0.05),
                              borderRadius: borderRadius.xl,
                              color: colors.primary,
                              fontWeight: typography.fontWeight.medium,
                              fontSize: typography.fontSize.sm,
                            }}>
                                {challenge.dailyAction}
                            </div>
                        )}
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
