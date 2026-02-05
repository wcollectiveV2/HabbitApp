import React, { useState, useEffect } from 'react';
import { socialService } from '../services';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography, borderRadius, shadows, zIndex } from '../theme/designSystem';

interface UserProfile {
  id: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  streakCount: number;
  totalPoints: number;
  challengeCount: number;
  isFollowing: boolean;
  isFollowedBy: boolean;
  followers: number;
  following: number;
  isBlocked?: boolean;
  privacyProfileVisibility?: 'public' | 'friends' | 'private';
}

interface UserProfileViewProps {
  userId: string;
  onBack: () => void;
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: colors.gray[50],
  },
  header: {
    backgroundColor: colors.background.primary,
    borderBottom: `1px solid ${colors.gray[100]}`,
    position: 'sticky' as const,
    top: 0,
    zIndex: zIndex.sticky,
    padding: spacing[4],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
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
  content: {
    padding: spacing[6],
    display: 'flex',
    flexDirection: 'column' as const,
    gap: spacing[6],
  },
  avatarContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  avatar: {
    width: '96px',
    height: '96px',
    borderRadius: borderRadius.full,
    border: `4px solid ${colors.background.primary}`,
    boxShadow: shadows.xl,
    overflow: 'hidden',
  },
  followStatsRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: spacing[8],
  },
  followStat: {
    textAlign: 'center' as const,
  },
  actionsRow: {
    display: 'flex',
    gap: spacing[3],
  },
  followBtn: (isFollowing: boolean, isLoading: boolean) => ({
    flex: 1,
    padding: spacing[3],
    borderRadius: borderRadius.xl,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.sm,
    border: 'none',
    cursor: 'pointer',
    backgroundColor: isFollowing ? colors.gray[100] : colors.primary,
    color: isFollowing ? colors.text.primary : 'white',
    opacity: isLoading ? 0.5 : 1,
  }),
  chatBtn: {
    padding: `${spacing[3]} ${spacing[4]}`,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.xl,
    border: 'none',
    cursor: 'pointer',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: spacing[3],
  },
  statCard: {
    backgroundColor: colors.background.primary,
    padding: spacing[4],
    borderRadius: borderRadius['2xl'],
    textAlign: 'center' as const,
    border: `1px solid ${colors.gray[100]}`,
  },
  infoBox: (color: string) => ({
    backgroundColor: `${color}15`,
    padding: spacing[4],
    borderRadius: borderRadius.xl,
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
  }),
  menuOverlay: {
    position: 'fixed' as const,
    inset: 0,
    zIndex: 10,
  },
  menuDropdown: {
    position: 'absolute' as const,
    right: 0,
    top: '48px',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    boxShadow: shadows.lg,
    border: `1px solid ${colors.gray[100]}`,
    overflow: 'hidden',
    zIndex: 20,
    minWidth: '180px',
  },
  menuItem: {
    width: '100%',
    padding: `${spacing[3]} ${spacing[4]}`,
    textAlign: 'left' as const,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    display: 'flex',
    alignItems: 'center',
    gap: spacing[3],
    border: 'none',
    background: 'none',
    cursor: 'pointer',
  },
};

const UserProfileView: React.FC<UserProfileViewProps> = ({ userId, onBack }) => {
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await socialService.getUserProfile(userId);
      setProfile(data);
    } catch (err: any) {
      console.error('Failed to fetch profile:', err);
      if (err.message?.includes('private')) {
        setError('This profile is private');
      } else if (err.message?.includes('blocked')) {
        setError('You cannot view this profile');
      } else {
        setError('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!profile || actionLoading) return;
    setActionLoading(true);
    try {
      if (profile.isFollowing) {
        await socialService.unfollowUser(userId);
        setProfile({ ...profile, isFollowing: false, followers: profile.followers - 1 });
      } else {
        await socialService.followUser(userId);
        setProfile({ ...profile, isFollowing: true, followers: profile.followers + 1 });
      }
    } catch (err) {
      console.error('Failed to toggle follow:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlock = async () => {
    if (!profile || isBlocking) return;
    setIsBlocking(true);
    try {
      if (profile.isBlocked) {
        await socialService.unblockUser(userId);
        setProfile({ ...profile, isBlocked: false });
      } else {
        await socialService.blockUser(userId, 'Blocked by user');
        setProfile({ ...profile, isBlocked: true, isFollowing: false });
      }
    } catch (err) {
      console.error('Failed to toggle block:', err);
    } finally {
      setIsBlocking(false);
      setShowOptionsMenu(false);
    }
  };

  const handleReport = () => {
    // TODO: Implement report functionality
    alert('Report functionality coming soon');
    setShowOptionsMenu(false);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.header, justifyContent: 'flex-start' }}>
          <button onClick={onBack} style={styles.backBtn}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div style={{ height: '24px', width: '128px', backgroundColor: colors.gray[200], borderRadius: borderRadius.md }} />
        </div>
        <div style={{ ...styles.content, alignItems: 'center' }}>
          <div style={{ ...styles.avatar, backgroundColor: colors.gray[200] }} />
          <div style={{ marginTop: spacing[4], height: '24px', width: '128px', backgroundColor: colors.gray[200], borderRadius: borderRadius.md }} />
          <div style={{ marginTop: spacing[2], height: '16px', width: '192px', backgroundColor: colors.gray[200], borderRadius: borderRadius.md }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.header, justifyContent: 'flex-start' }}>
          <button onClick={onBack} style={styles.backBtn}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.text.primary, margin: 0 }}>Profile</h1>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: spacing[12], textAlign: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: colors.gray[300], marginBottom: spacing[4] }}>
            {error.includes('private') ? 'lock' : 'person_off'}
          </span>
          <p style={{ color: colors.text.secondary, fontWeight: typography.fontWeight.medium }}>{error}</p>
          <button
            onClick={onBack}
            style={{
              marginTop: spacing[4],
              padding: `${spacing[2]} ${spacing[6]}`,
              backgroundColor: colors.primary,
              color: 'white',
              borderRadius: borderRadius.full,
              fontWeight: typography.fontWeight.medium,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button onClick={onBack} style={styles.backBtn}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.text.primary, margin: 0 }}>{profile.name}</h1>
        </div>
        {!isOwnProfile && (
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowOptionsMenu(!showOptionsMenu)} style={styles.backBtn}>
              <span className="material-symbols-outlined">more_vert</span>
            </button>
            {showOptionsMenu && (
              <>
                <div style={styles.menuOverlay} onClick={() => setShowOptionsMenu(false)} />
                <div style={styles.menuDropdown}>
                  <button onClick={handleBlock} style={styles.menuItem}>
                    <span className="material-symbols-outlined" style={{ color: colors.error }}>
                      {profile.isBlocked ? 'person_add' : 'block'}
                    </span>
                    <span style={{ color: profile.isBlocked ? colors.text.primary : colors.error }}>
                      {profile.isBlocked ? 'Unblock User' : 'Block User'}
                    </span>
                  </button>
                  <button onClick={handleReport} style={styles.menuItem}>
                    <span className="material-symbols-outlined" style={{ color: '#F59E0B' }}>flag</span>
                    <span style={{ color: colors.text.primary }}>Report User</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Profile Content */}
      <div style={styles.content}>
        {/* Avatar & Name */}
        <div style={styles.avatarContainer}>
          <div style={styles.avatar}>
            <img
              src={profile.avatarUrl || `https://i.pravatar.cc/200?u=${profile.id}`}
              alt={`${profile.name}'s avatar`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <h2 style={{ marginTop: spacing[4], fontSize: typography.fontSize['2xl'], fontWeight: '900', color: colors.text.primary }}>{profile.name}</h2>
          {profile.bio && (
            <p style={{ marginTop: spacing[1], color: colors.text.secondary, textAlign: 'center', maxWidth: '250px' }}>
              {profile.bio}
            </p>
          )}
        </div>

        {/* Follow Stats */}
        <div style={styles.followStatsRow}>
          <div style={styles.followStat}>
            <p style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.text.primary, margin: 0 }}>{profile.followers}</p>
            <p style={{ fontSize: typography.fontSize.sm, color: colors.gray[500], margin: 0 }}>Followers</p>
          </div>
          <div style={styles.followStat}>
            <p style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.text.primary, margin: 0 }}>{profile.following}</p>
            <p style={{ fontSize: typography.fontSize.sm, color: colors.gray[500], margin: 0 }}>Following</p>
          </div>
        </div>

        {/* Action Buttons */}
        {!isOwnProfile && !profile.isBlocked && (
          <div style={styles.actionsRow}>
            <button
              onClick={handleFollowToggle}
              disabled={actionLoading}
              style={styles.followBtn(profile.isFollowing, actionLoading)}
            >
              {actionLoading ? (
                <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%' }} />
              ) : profile.isFollowing ? (
                'Following'
              ) : profile.isFollowedBy ? (
                'Follow Back'
              ) : (
                'Follow'
              )}
            </button>
            <button style={styles.chatBtn} onClick={() => {/* TODO: Implement message */}}>
              <span className="material-symbols-outlined" style={{ color: colors.text.secondary }}>chat</span>
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span style={{ display: 'block', fontSize: typography.fontSize['2xl'], fontWeight: '900', color: '#F97316' }}>{profile.streakCount}</span>
            <span style={{ fontSize: '10px', fontWeight: typography.fontWeight.bold, textTransform: 'uppercase', color: colors.text.secondary }}>Streak</span>
          </div>
          <div style={styles.statCard}>
            <span style={{ display: 'block', fontSize: typography.fontSize['2xl'], fontWeight: '900', color: colors.primary }}>{profile.totalPoints.toLocaleString()}</span>
            <span style={{ fontSize: '10px', fontWeight: typography.fontWeight.bold, textTransform: 'uppercase', color: colors.text.secondary }}>Points</span>
          </div>
          <div style={styles.statCard}>
            <span style={{ display: 'block', fontSize: typography.fontSize['2xl'], fontWeight: '900', color: '#10B981' }}>{profile.challengeCount}</span>
            <span style={{ fontSize: '10px', fontWeight: typography.fontWeight.bold, textTransform: 'uppercase', color: colors.text.secondary }}>Challenges</span>
          </div>
        </div>

        {/* Mutual Info */}
        {profile.isFollowedBy && profile.isFollowing && (
          <div style={styles.infoBox('#10B981')}>
            <span className="material-symbols-outlined" style={{ color: '#10B981' }}>group</span>
            <span style={{ fontSize: typography.fontSize.sm, color: '#047857', fontWeight: typography.fontWeight.medium }}>
              You follow each other
            </span>
          </div>
        )}

        {/* Blocked State */}
        {profile.isBlocked && (
          <div style={styles.infoBox(colors.error)}>
            <span className="material-symbols-outlined" style={{ color: colors.error }}>block</span>
            <div>
              <span style={{ fontSize: typography.fontSize.sm, color: colors.error, fontWeight: typography.fontWeight.medium, display: 'block' }}>
                You have blocked this user
              </span>
              <button
                onClick={handleBlock}
                disabled={isBlocking}
                style={{ fontSize: typography.fontSize.sm, color: colors.error, textDecoration: 'underline', marginTop: spacing[1], background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Unblock
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileView;
