import React, { useState, useEffect, useCallback } from 'react';
import { protocolService, Protocol, ProtocolProgress, ProtocolElement } from '../services/protocolService';
import { colors, spacing, borderRadius, typography, shadows } from '../theme/designSystem';

interface ProtocolViewProps {
  onBack?: () => void;
}

// Shared styles
const sharedStyles = {
  container: {
    minHeight: '100vh',
    backgroundColor: colors.background.secondary,
    paddingBottom: spacing[24],
  },
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius['2xl'],
    boxShadow: shadows.sm,
    border: `1px solid ${colors.gray[100]}`,
  },
  btn: {
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};

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

  const inputStyles = {
    checkBtn: (completed: boolean) => ({
      width: '48px',
      height: '48px',
      borderRadius: borderRadius.xl,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: completed ? colors.success : colors.gray[100],
      color: completed ? 'white' : colors.gray[400],
      border: 'none',
      cursor: 'pointer',
      opacity: isLogging ? 0.5 : 1,
    }),
    numberInput: {
      width: '96px',
      padding: `${spacing[2]} ${spacing[3]}`,
      borderRadius: borderRadius.xl,
      textAlign: 'center' as const,
      border: `2px solid ${isCompleted ? colors.success : colors.gray[200]}`,
      backgroundColor: isCompleted ? colors.successBg : colors.background.primary,
      color: colors.text.primary,
      outline: 'none',
    },
    rangeBtn: (active: boolean) => ({
      width: '40px',
      height: '40px',
      borderRadius: borderRadius.xl,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      backgroundColor: active ? colors.primary : colors.gray[100],
      color: active ? 'white' : colors.text.secondary,
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
    saveBtn: {
      padding: `${spacing[2]} ${spacing[4]}`,
      backgroundColor: colors.primary,
      color: 'white',
      borderRadius: borderRadius.xl,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      border: 'none',
      cursor: 'pointer',
      opacity: isLogging ? 0.5 : 1,
    },
    textarea: {
      width: '100%',
      padding: spacing[4],
      borderRadius: borderRadius.xl,
      resize: 'none' as const,
      border: `2px solid ${isCompleted ? colors.success : colors.gray[200]}`,
      backgroundColor: isCompleted ? colors.successBg : colors.background.primary,
      color: colors.text.primary,
      outline: 'none',
    },
  };

  switch (element.type) {
    case 'check':
      return (
        <button
          onClick={() => handleLog({ completed: !element.completed })}
          disabled={isLogging || loading}
          style={inputStyles.checkBtn(element.completed)}
        >
          <span className="material-symbols-outlined">
            {element.completed ? 'check' : 'radio_button_unchecked'}
          </span>
        </button>
      );

    case 'number':
    case 'timer':
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={element.goal ? `Goal: ${element.goal}` : '0'}
            style={inputStyles.numberInput}
          />
          {element.unit && <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>{element.unit}</span>}
          <button
            onClick={() => handleLog({ value: Number(value) })}
            disabled={isLogging || loading}
            style={inputStyles.saveBtn}
          >
            {isLogging ? '...' : 'Save'}
          </button>
        </div>
      );

    case 'range':
      const min = element.minValue ?? 0;
      const max = element.maxValue ?? 10;
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], flexWrap: 'wrap' }}>
          {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((num) => (
            <button
              key={num}
              onClick={() => handleLog({ value: num })}
              disabled={isLogging || loading}
              style={inputStyles.rangeBtn(element.value === num)}
            >
              {num}
            </button>
          ))}
          {element.unit && <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, marginLeft: spacing[2] }}>{element.unit}</span>}
        </div>
      );

    case 'text':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2], width: '100%' }}>
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter your note..."
            rows={2}
            style={inputStyles.textarea}
          />
          <button
            onClick={() => handleLog({ text_value: value })}
            disabled={isLogging || loading || !value}
            style={{ ...inputStyles.saveBtn, alignSelf: 'flex-end', opacity: isLogging || loading || !value ? 0.5 : 1 }}
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
  const cardStyle = {
    width: '100%',
    padding: spacing[4],
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius['2xl'],
    boxShadow: shadows.sm,
    border: `1px solid ${colors.gray[100]}`,
    textAlign: 'left' as const,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  return (
    <button onClick={onClick} style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[3] }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: borderRadius.xl,
          backgroundColor: colors.primaryAlpha(0.1),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span className="material-symbols-outlined" style={{ color: colors.primary }}>
            {protocol.icon || 'checklist'}
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontWeight: typography.fontWeight.bold, color: colors.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{protocol.name}</h3>
          {protocol.description && (
            <p style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, marginTop: spacing[0.5], display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {protocol.description}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginTop: spacing[2], fontSize: typography.fontSize.xs, color: colors.gray[400] }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>task_alt</span>
              {protocol.elements.length} elements
            </span>
            {protocol.organizationName && (
              <span style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>business</span>
                {protocol.organizationName}
              </span>
            )}
          </div>
        </div>
        <span className="material-symbols-outlined" style={{ color: colors.gray[400] }}>chevron_right</span>
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
      await fetchProgress();
    } catch (err) {
      console.error('Failed to log element:', err);
    }
  };

  const detailStyles = {
    container: {
      minHeight: '100vh',
      backgroundColor: colors.background.secondary,
      paddingBottom: spacing[24],
    },
    header: {
      background: `linear-gradient(to bottom right, ${colors.primary}, #9333EA)`,
      color: 'white',
      padding: spacing[6],
      paddingBottom: spacing[24],
      position: 'relative' as const,
    },
    backBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
      color: 'rgba(255,255,255,0.8)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      marginBottom: spacing[4],
    },
    iconBox: {
      width: '64px',
      height: '64px',
      borderRadius: borderRadius['2xl'],
      backgroundColor: 'rgba(255,255,255,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    stat: {
      textAlign: 'center' as const,
    },
    contentCard: {
      backgroundColor: colors.background.primary,
      borderRadius: borderRadius['2xl'],
      boxShadow: shadows.lg,
      overflow: 'hidden',
    },
    toolbar: {
      padding: spacing[4],
      borderBottom: `1px solid ${colors.gray[100]}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    leaderboardBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[1],
      padding: `${spacing[1.5]} ${spacing[3]}`,
      backgroundColor: '#FEF3C7',
      color: '#B45309',
      borderRadius: borderRadius.lg,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      border: 'none',
      cursor: 'pointer',
    },
    progressBar: {
      padding: spacing[4],
      backgroundColor: colors.gray[50],
      borderBottom: `1px solid ${colors.gray[100]}`,
    },
    elementCard: {
      padding: spacing[4],
      borderBottom: `1px solid ${colors.gray[100]}`,
    },
    elementIcon: (completed: boolean) => ({
      width: '40px',
      height: '40px',
      borderRadius: borderRadius.lg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: completed ? colors.successBg : colors.gray[100],
      color: completed ? colors.success : colors.gray[400],
    }),
    pointsBadge: {
      padding: `${spacing[1]} ${spacing[2]}`,
      backgroundColor: colors.successBg,
      color: colors.success,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
      borderRadius: borderRadius.lg,
    },
  };

  return (
    <div style={detailStyles.container}>
      {/* Header */}
      <div style={detailStyles.header}>
        <button onClick={onBack} style={detailStyles.backBtn}>
          <span className="material-symbols-outlined">arrow_back</span>
          <span>Back</span>
        </button>
        
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[4] }}>
          <div style={detailStyles.iconBox}>
            <span className="material-symbols-outlined" style={{ fontSize: '30px' }}>
              {protocol.icon || 'checklist'}
            </span>
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, margin: 0 }}>{protocol.name}</h1>
            {protocol.description && (
              <p style={{ opacity: 0.7, marginTop: spacing[1] }}>{protocol.description}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        {progress?.stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: spacing[4], marginTop: spacing[6] }}>
            <div style={detailStyles.stat}>
              <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold }}>{progress.stats.totalPoints}</div>
              <div style={{ fontSize: typography.fontSize.xs, opacity: 0.6 }}>Total Points</div>
            </div>
            <div style={detailStyles.stat}>
              <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold }}>{progress.stats.currentStreak}</div>
              <div style={{ fontSize: typography.fontSize.xs, opacity: 0.6 }}>Day Streak</div>
            </div>
            <div style={detailStyles.stat}>
              <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold }}>{progress.stats.totalCompletions}</div>
              <div style={{ fontSize: typography.fontSize.xs, opacity: 0.6 }}>Completions</div>
            </div>
          </div>
        )}
      </div>

      {/* Content Card */}
      <div style={{ padding: `0 ${spacing[4]}`, marginTop: '-64px', position: 'relative', zIndex: 10 }}>
        <div style={detailStyles.contentCard}>
          {/* Date selector & Leaderboard */}
          <div style={detailStyles.toolbar}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
              <span className="material-symbols-outlined" style={{ color: colors.gray[400] }}>calendar_today</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ background: 'transparent', fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, border: 'none', color: colors.text.primary }}
              />
            </div>
            <button onClick={onShowLeaderboard} style={detailStyles.leaderboardBtn}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>leaderboard</span>
              Leaderboard
            </button>
          </div>

          {/* Today's Progress */}
          {progress && (
            <div style={detailStyles.progressBar}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[2] }}>
                <span style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.text.secondary }}>
                  Today's Progress
                </span>
                <span style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold, color: colors.primary }}>
                  +{progress.todayProgress.pointsEarned} pts
                </span>
              </div>
              <div style={{ height: '8px', backgroundColor: colors.gray[200], borderRadius: borderRadius.full, overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    background: `linear-gradient(to right, ${colors.primary}, #9333EA)`, 
                    borderRadius: borderRadius.full,
                    transition: 'width 0.5s ease',
                    width: `${progress.todayProgress.percentage}%`
                  }}
                />
              </div>
              <div style={{ marginTop: spacing[1], fontSize: typography.fontSize.xs, color: colors.text.secondary, textAlign: 'right' }}>
                {progress.todayProgress.completed}/{progress.todayProgress.total} completed
              </div>
            </div>
          )}

          {/* Elements */}
          <div>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ ...detailStyles.elementCard, opacity: 0.5 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[3] }}>
                    <div style={{ width: '48px', height: '48px', backgroundColor: colors.gray[200], borderRadius: borderRadius.xl }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: '16px', backgroundColor: colors.gray[200], borderRadius: borderRadius.md, width: '66%' }} />
                      <div style={{ height: '12px', backgroundColor: colors.gray[200], borderRadius: borderRadius.md, width: '50%', marginTop: spacing[2] }} />
                    </div>
                  </div>
                </div>
              ))
            ) : progress?.elements.map((element) => (
              <div key={element.id} style={detailStyles.elementCard}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[3], marginBottom: spacing[3] }}>
                  <div style={detailStyles.elementIcon(element.pointsEarned! > 0)}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                      {element.type === 'check' ? 'check_circle' : 
                       element.type === 'number' ? 'pin' :
                       element.type === 'range' ? 'tune' :
                       element.type === 'timer' ? 'timer' : 'edit_note'}
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontWeight: typography.fontWeight.medium, color: colors.text.primary, margin: 0 }}>
                      {element.title}
                      {element.isRequired && <span style={{ color: colors.error, marginLeft: spacing[1] }}>*</span>}
                    </h4>
                    {element.description && (
                      <p style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, marginTop: spacing[0.5] }}>
                        {element.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginTop: spacing[1], fontSize: typography.fontSize.xs, color: colors.gray[400] }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>star</span>
                        {element.points} pts
                      </span>
                      {element.goal && (
                        <span>• Goal: {element.goal} {element.unit || ''}</span>
                      )}
                    </div>
                  </div>
                  {element.pointsEarned! > 0 && (
                    <span style={detailStyles.pointsBadge}>+{element.pointsEarned}</span>
                  )}
                </div>
                <div style={{ paddingLeft: '52px' }}>
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
    if (rank === 1) return { backgroundColor: '#FBBF24', color: '#78350F' };
    if (rank === 2) return { backgroundColor: '#CBD5E1', color: '#334155' };
    if (rank === 3) return { backgroundColor: '#D97706', color: '#FEF3C7' };
    return { backgroundColor: colors.gray[100], color: colors.text.secondary };
  };

  const lbStyles = {
    container: {
      minHeight: '100vh',
      backgroundColor: colors.background.secondary,
      paddingBottom: spacing[24],
    },
    header: {
      background: 'linear-gradient(to bottom right, #FBBF24, #F97316)',
      color: 'white',
      padding: spacing[6],
    },
    backBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
      color: 'rgba(255,255,255,0.8)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      marginBottom: spacing[4],
    },
    periodBtn: (active: boolean) => ({
      padding: `${spacing[1.5]} ${spacing[4]}`,
      borderRadius: borderRadius.full,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      whiteSpace: 'nowrap' as const,
      backgroundColor: active ? 'white' : 'rgba(255,255,255,0.2)',
      color: active ? '#D97706' : 'white',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
    myRankCard: {
      margin: `${spacing[4]} ${spacing[4]} 0`,
      padding: spacing[4],
      backgroundColor: colors.primaryAlpha(0.1),
      borderRadius: borderRadius.xl,
      border: `1px solid ${colors.primaryAlpha(0.2)}`,
    },
    entryCard: (isCurrentUser: boolean) => ({
      padding: spacing[4],
      borderRadius: borderRadius.xl,
      backgroundColor: isCurrentUser ? colors.primaryAlpha(0.1) : colors.background.primary,
      border: isCurrentUser ? `2px solid ${colors.primary}` : 'none',
      marginBottom: spacing[2],
    }),
    rankBadge: (style: { backgroundColor: string; color: string }) => ({
      width: '40px',
      height: '40px',
      borderRadius: borderRadius.full,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: typography.fontWeight.bold,
      fontSize: typography.fontSize.sm,
      ...style,
    }),
    avatar: {
      width: '40px',
      height: '40px',
      borderRadius: borderRadius.full,
      objectFit: 'cover' as const,
    },
    avatarPlaceholder: {
      width: '40px',
      height: '40px',
      borderRadius: borderRadius.full,
      backgroundColor: colors.gray[200],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  };

  return (
    <div style={lbStyles.container}>
      {/* Header */}
      <div style={lbStyles.header}>
        <button onClick={onBack} style={lbStyles.backBtn}>
          <span className="material-symbols-outlined">arrow_back</span>
          <span>Back</span>
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
          <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>leaderboard</span>
          <div>
            <h1 style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, margin: 0 }}>{title}</h1>
            <p style={{ opacity: 0.7, margin: 0 }}>Leaderboard</p>
          </div>
        </div>

        {/* Period selector */}
        <div style={{ display: 'flex', gap: spacing[2], marginTop: spacing[4], overflowX: 'auto', paddingBottom: spacing[2] }}>
          {(['all', 'monthly', 'weekly', 'daily'] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)} style={lbStyles.periodBtn(period === p)}>
              {p === 'all' ? 'All Time' : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* My Rank */}
      {myRank && (
        <div style={lbStyles.myRankCard}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
              <div style={{ width: '40px', height: '40px', borderRadius: borderRadius.full, backgroundColor: colors.primary, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: typography.fontWeight.bold }}>
                #{myRank.rank}
              </div>
              <div>
                <div style={{ fontWeight: typography.fontWeight.medium, color: colors.text.primary }}>Your Rank</div>
                <div style={{ fontSize: typography.fontSize.xs, color: colors.text.secondary }}>(Hidden from others)</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: typography.fontWeight.bold, color: colors.primary }}>{myRank.totalPoints.toLocaleString()}</div>
              <div style={{ fontSize: typography.fontSize.xs, color: colors.text.secondary }}>points</div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard list */}
      <div style={{ padding: spacing[4] }}>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ padding: spacing[4], backgroundColor: colors.background.primary, borderRadius: borderRadius.xl, marginBottom: spacing[2], opacity: 0.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: colors.gray[200], borderRadius: borderRadius.full }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: '16px', backgroundColor: colors.gray[200], borderRadius: borderRadius.md, width: '33%' }} />
                </div>
                <div style={{ height: '20px', backgroundColor: colors.gray[200], borderRadius: borderRadius.md, width: '64px' }} />
              </div>
            </div>
          ))
        ) : leaderboard.length === 0 ? (
          <div style={{ textAlign: 'center', padding: `${spacing[12]} 0`, color: colors.text.secondary }}>
            <span className="material-symbols-outlined" style={{ fontSize: '36px', marginBottom: spacing[2], display: 'block' }}>emoji_events</span>
            <p>No rankings yet. Be the first!</p>
          </div>
        ) : (
          leaderboard.map((entry) => (
            <div key={entry.userId} style={lbStyles.entryCard(entry.isCurrentUser)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                <div style={lbStyles.rankBadge(getRankStyle(entry.rank))}>
                  {entry.rank <= 3 ? (
                    <span className="material-symbols-outlined">
                      {entry.rank === 1 ? 'emoji_events' : 'military_tech'}
                    </span>
                  ) : (
                    `#${entry.rank}`
                  )}
                </div>
                
                {entry.avatarUrl ? (
                  <img src={entry.avatarUrl} alt={entry.name} style={lbStyles.avatar} />
                ) : (
                  <div style={lbStyles.avatarPlaceholder}>
                    <span className="material-symbols-outlined" style={{ color: colors.gray[400] }}>person</span>
                  </div>
                )}
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: typography.fontWeight.medium, color: colors.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {entry.name}
                    {entry.isCurrentUser && (
                      <span style={{ marginLeft: spacing[2], padding: `${spacing[0.5]} ${spacing[2]}`, backgroundColor: colors.primary, color: 'white', fontSize: typography.fontSize.xs, borderRadius: borderRadius.full }}>
                        You
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: typography.fontSize.xs, color: colors.text.secondary }}>
                    {entry.activeDays} active days
                  </div>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: typography.fontWeight.bold, color: colors.text.primary }}>
                    {entry.totalPoints.toLocaleString()}
                  </div>
                  <div style={{ fontSize: typography.fontSize.xs, color: colors.text.secondary }}>points</div>
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

  const mainStyles = {
    container: {
      minHeight: '100vh',
      backgroundColor: colors.background.secondary,
      paddingBottom: spacing[24],
    },
    header: {
      backgroundColor: colors.background.primary,
      padding: spacing[6],
      boxShadow: shadows.sm,
    },
    backBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
      color: colors.text.secondary,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      marginBottom: spacing[4],
    },
    list: {
      padding: spacing[4],
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacing[3],
    },
    skeleton: {
      padding: spacing[4],
      backgroundColor: colors.background.primary,
      borderRadius: borderRadius['2xl'],
      opacity: 0.5,
    },
    emptyState: {
      textAlign: 'center' as const,
      padding: `${spacing[12]} 0`,
    },
  };

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
    <div style={mainStyles.container}>
      {/* Header */}
      <div style={mainStyles.header}>
        {onBack && (
          <button onClick={onBack} style={mainStyles.backBtn}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        )}
        <h1 style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.text.primary, margin: 0 }}>My Protocols</h1>
        <p style={{ color: colors.text.secondary, marginTop: spacing[1] }}>
          Complete daily actions to earn points
        </p>
      </div>

      {/* Protocol List */}
      <div style={mainStyles.list}>
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={mainStyles.skeleton}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[3] }}>
                <div style={{ width: '48px', height: '48px', backgroundColor: colors.gray[200], borderRadius: borderRadius.xl }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: '20px', backgroundColor: colors.gray[200], borderRadius: borderRadius.md, width: '50%' }} />
                  <div style={{ height: '16px', backgroundColor: colors.gray[200], borderRadius: borderRadius.md, width: '66%', marginTop: spacing[2] }} />
                </div>
              </div>
            </div>
          ))
        ) : protocols.length === 0 ? (
          <div style={mainStyles.emptyState}>
            <span className="material-symbols-outlined" style={{ fontSize: '60px', color: colors.gray[300], marginBottom: spacing[4], display: 'block' }}>
              checklist
            </span>
            <h3 style={{ fontWeight: typography.fontWeight.medium, color: colors.text.secondary }}>No protocols assigned</h3>
            <p style={{ fontSize: typography.fontSize.sm, color: colors.gray[400], marginTop: spacing[1] }}>
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
