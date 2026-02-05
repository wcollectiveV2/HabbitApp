
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { userService, challengeService } from '../services';
import type { UserProfile } from '../services';
import Skeleton from './ui/Skeleton';
import { colors, spacing, borderRadius, shadows, typography } from '../theme/designSystem';
import { 
  ConfirmModal, 
  AvatarUpload, 
  ChangeEmailModal, 
  ChangePasswordModal, 
  DeleteAccountModal,
  ExportDataModal,
  BlockedUsersModal
} from './ui';

interface ProfileViewProps {
  profile?: UserProfile | null;
  onLogout?: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile: propProfile, onLogout }) => {
  const { user, profile: contextProfile, logout } = useAuth();
  const [stats, setStats] = useState({ totalRewards: 0, activeChallenges: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showSecuritySettings, setShowSecuritySettings] = useState(false);
  const [showAppearanceSettings, setShowAppearanceSettings] = useState(false);

  const profile = propProfile || contextProfile;

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const [userStats, challenges] = await Promise.all([
          userService.getStats(),
          challengeService.getActiveChallenges()
        ]);
        setStats({
          totalRewards: userStats.badges?.length || userStats.totalRewards || profile?.totalPoints || 0,
          activeChallenges: challenges.length || 0
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setStats({
          totalRewards: profile?.totalPoints || 0,
          activeChallenges: 0
        });
      }
      setIsLoading(false);
    };
    fetchStats();
  }, [profile]);

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
    onLogout?.();
  };

  const handleUpdateProfile = async (data: Partial<UserProfile>) => {
    try {
      await userService.updateProfile(data);
      setShowSettings(false);
      // Force reload to update context/profile
      window.location.reload(); 
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Failed to update profile');
    }
  };

  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);

  const settings = [
    { icon: 'person_outline', label: 'Edit Profile & Privacy', color: colors.blue[500], action: () => setShowSettings(true) },
    { icon: 'notifications_active', label: 'Notifications', color: colors.purple[500], action: () => setShowNotificationSettings(true) },
    { icon: 'dark_mode', label: 'Appearance', color: colors.orange[500], action: () => setShowAppearanceSettings(true) },
    { icon: 'security', label: 'Security & Account', color: colors.green[500], action: () => setShowSecuritySettings(true) },
    { icon: 'help_outline', label: 'Help Center', color: colors.gray[500], action: () => setShowHelpCenter(true) },
  ];

  if (showSettings && profile) {
    return (
      <EditProfileModal 
        profile={profile} 
        email={user?.email || ''}
        onClose={() => setShowSettings(false)} 
        onSave={handleUpdateProfile} 
      />
    );
  }

  if (showSecuritySettings && profile) {
    return (
      <SecuritySettingsModal 
        profile={profile}
        email={user?.email || ''}
        onClose={() => setShowSecuritySettings(false)}
        onLogout={handleLogout}
      />
    );
  }

  if (showAppearanceSettings) {
    return (
      <AppearanceSettingsModal 
        onClose={() => setShowAppearanceSettings(false)}
      />
    );
  }

  if (showNotificationSettings) {
    return (
      <NotificationSettingsModal 
        onClose={() => setShowNotificationSettings(false)}
      />
    );
  }

  if (showHelpCenter) {
    return (
      <HelpCenterModal 
        onClose={() => setShowHelpCenter(false)}
      />
    );
  }

  const displayName = profile?.name || user?.name || 'User';
  const displayBio = profile?.bio || 'Habit Builder';
  const avatarUrl = profile?.avatarUrl || profile?.avatar || user?.avatar || user?.image || `https://i.pravatar.cc/200?u=${user?.id || 'default'}`;

  // Styles using design system
  const styles = {
    container: {
      padding: `0 ${spacing[5]}`,
      paddingBottom: spacing[10],
    } as React.CSSProperties,
    profileSection: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      paddingTop: spacing[4],
    } as React.CSSProperties,
    avatarContainer: {
      position: 'relative' as const,
      marginBottom: spacing[4],
    } as React.CSSProperties,
    avatar: {
      width: '112px',
      height: '112px',
      borderRadius: borderRadius.full,
      border: `4px solid ${colors.white}`,
      boxShadow: shadows.xl,
      overflow: 'hidden',
    } as React.CSSProperties,
    editAvatarBtn: {
      position: 'absolute' as const,
      bottom: '4px',
      right: '0',
      width: '32px',
      height: '32px',
      backgroundColor: colors.primary,
      color: colors.white,
      borderRadius: borderRadius.full,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: `4px solid ${colors.white}`,
      boxShadow: shadows.lg,
      cursor: 'pointer',
    } as React.CSSProperties,
    name: {
      fontSize: typography.fontSize['3xl'],
      fontWeight: typography.fontWeight.black,
      color: colors.text.primary,
      margin: 0,
    } as React.CSSProperties,
    bio: {
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.medium,
      color: colors.text.secondary,
      margin: `${spacing[1]} 0 0 0`,
    } as React.CSSProperties,
    email: {
      fontSize: typography.fontSize.sm,
      color: colors.gray[500],
      margin: `${spacing[1]} 0 0 0`,
    } as React.CSSProperties,
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: spacing[4],
      marginTop: spacing[6],
    } as React.CSSProperties,
    statCard: {
      backgroundColor: colors.white,
      padding: spacing[4],
      borderRadius: borderRadius['3xl'],
      textAlign: 'center' as const,
      border: `1px solid ${colors.gray[100]}`,
      boxShadow: shadows.sm,
    } as React.CSSProperties,
    menuItem: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing[4],
      backgroundColor: colors.gray[50],
      borderRadius: borderRadius['2xl'],
      border: `1px solid ${colors.gray[100]}`,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    } as React.CSSProperties,
    logoutBtn: {
      width: '100%',
      padding: spacing[4],
      borderRadius: borderRadius['2xl'],
      backgroundColor: colors.errorBg,
      color: colors.error,
      fontWeight: typography.fontWeight.bold,
      fontSize: typography.fontSize.md,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing[2],
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    } as React.CSSProperties,
  };

  return (
    <div style={styles.container}>
      {/* Profile Header */}
      <div style={styles.profileSection}>
        <div style={styles.avatarContainer}>
          <div style={styles.avatar}>
            <img 
              src={avatarUrl} 
              alt={`${displayName}'s profile picture`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/user/200/200';
              }}
            />
          </div>
          <button 
            style={styles.editAvatarBtn}
            aria-label="Edit profile picture"
            onClick={() => setShowSettings(true)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }} aria-hidden="true">edit</span>
          </button>
        </div>
        <h2 style={styles.name}>{displayName}</h2>
        <p style={styles.bio}>{displayBio}</p>
        {user?.email && (
          <p style={styles.email}>{user.email}</p>
        )}
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid} role="region" aria-label="Profile statistics">
        {isLoading ? (
          <>
            <Skeleton variant="card" height="96px" />
            <Skeleton variant="card" height="96px" />
            <Skeleton variant="card" height="96px" />
          </>
        ) : (
          <>
            <div style={styles.statCard}>
              <span style={{ display: 'block', fontSize: typography.fontSize['3xl'], fontWeight: typography.fontWeight.black, color: '#F97316' }}>
                {profile?.streakCount || 0}
              </span>
              <span style={{ fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, textTransform: 'uppercase', color: colors.text.secondary }}>
                Day Streak
              </span>
            </div>
            <div style={styles.statCard}>
              <span style={{ display: 'block', fontSize: typography.fontSize['3xl'], fontWeight: typography.fontWeight.black, color: colors.primary }}>
                {(profile?.totalPoints || 0).toLocaleString()}
              </span>
              <span style={{ fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, textTransform: 'uppercase', color: colors.text.secondary }}>
                Points
              </span>
            </div>
            <div style={styles.statCard}>
              <span style={{ display: 'block', fontSize: typography.fontSize['3xl'], fontWeight: typography.fontWeight.black, color: colors.success }}>
                {stats.activeChallenges}
              </span>
              <span style={{ fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, textTransform: 'uppercase', color: colors.text.secondary }}>
                Challenges
              </span>
            </div>
          </>
        )}
      </div>

      {/* Settings Menu */}
      <nav style={{ marginTop: spacing[6], display: 'flex', flexDirection: 'column', gap: spacing[2] }} aria-label="Settings menu">
        {settings.map((item, i) => (
          <button 
            key={i} 
            onClick={item.action}
            style={styles.menuItem}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.gray[100];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.gray[50];
            }}
            aria-label={item.label}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
              <span className="material-symbols-outlined" style={{ color: item.color }} aria-hidden="true">{item.icon}</span>
              <span style={{ fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.md, color: colors.text.primary }}>{item.label}</span>
            </div>
            <span className="material-symbols-outlined" style={{ color: colors.gray[400] }} aria-hidden="true">chevron_right</span>
          </button>
        ))}
      </nav>

      {/* Logout Button */}
      <button 
        onClick={() => setShowLogoutConfirm(true)}
        style={styles.logoutBtn}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#FEE2E2';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = colors.errorBg;
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }} aria-hidden="true">logout</span>
        Log Out
      </button>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Log Out?"
        message="Are you sure you want to log out? You'll need to sign in again to access your account."
        confirmLabel="Log Out"
        cancelLabel="Cancel"
        confirmVariant="danger"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
};


const EditProfileModal = ({ profile, email, onClose, onSave }: { 
  profile: UserProfile, 
  email: string,
  onClose: () => void, 
  onSave: (data: Partial<UserProfile>) => Promise<void> 
}) => {
  const [formData, setFormData] = useState({
    name: profile.name,
    bio: profile.bio || '',
    avatarUrl: profile.avatarUrl || profile.avatar || '',
    privacyPublicLeaderboard: profile.privacyPublicLeaderboard || 'visible',
    privacyChallengeLeaderboard: profile.privacyChallengeLeaderboard || 'visible',
    privacyProfileVisibility: 'public' as 'public' | 'friends' | 'private',
    privacyActivityFeed: 'public' as 'public' | 'friends' | 'private',
  });
  const [loading, setLoading] = useState(false);
  const [showBlockedUsers, setShowBlockedUsers] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    await onSave(formData);
    setLoading(false);
  };

  const handleAvatarUpload = (url: string) => {
    setFormData({ ...formData, avatarUrl: url });
  };

  const modalStyles = {
    container: {
      position: 'fixed' as const,
      inset: 0,
      zIndex: 50,
      backgroundColor: colors.background.primary,
      display: 'flex',
      flexDirection: 'column' as const,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing[4],
      borderBottom: `1px solid ${colors.gray[100]}`,
    },
    backBtn: {
      padding: spacing[2],
      marginLeft: `-${spacing[2]}`,
      borderRadius: borderRadius.full,
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      color: colors.text.primary,
    },
    saveBtn: {
      color: colors.primary,
      fontWeight: typography.fontWeight.bold,
      fontSize: typography.fontSize.md,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
    },
    content: {
      flex: 1,
      overflowY: 'auto' as const,
      padding: spacing[6],
    },
    inputGroup: {
      marginBottom: spacing[4],
    },
    label: {
      display: 'block',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      color: colors.text.secondary,
      marginBottom: spacing[1],
    },
    input: {
      width: '100%',
      backgroundColor: colors.gray[50],
      border: `1px solid ${colors.gray[100]}`,
      borderRadius: borderRadius['2xl'],
      padding: spacing[4],
      fontWeight: typography.fontWeight.semibold,
      fontSize: typography.fontSize.md,
      outline: 'none',
      color: colors.text.primary,
    },
    settingCard: {
      backgroundColor: colors.gray[50],
      padding: spacing[4],
      borderRadius: borderRadius['2xl'],
      border: `1px solid ${colors.gray[100]}`,
      marginBottom: spacing[4],
    },
    select: {
      width: '100%',
      backgroundColor: colors.white,
      padding: spacing[3],
      borderRadius: borderRadius.xl,
      border: `1px solid ${colors.gray[200]}`,
      fontSize: typography.fontSize.md,
      color: colors.text.primary,
    },
    menuBtn: {
      width: '100%',
      backgroundColor: colors.gray[50],
      padding: spacing[4],
      borderRadius: borderRadius['2xl'],
      border: `1px solid ${colors.gray[100]}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
    },
  };

  return (
    <div style={modalStyles.container}>
      <div style={modalStyles.header}>
        <button onClick={onClose} style={modalStyles.backBtn}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 style={{ fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.xl, color: colors.text.primary }}>Edit Profile</h2>
        <button 
          onClick={() => handleSubmit()} 
          disabled={loading}
          style={{ ...modalStyles.saveBtn, opacity: loading ? 0.5 : 1 }}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div style={modalStyles.content}>
        {/* Avatar Upload Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: spacing[4], paddingBottom: spacing[6] }}>
          <AvatarUpload 
            currentUrl={formData.avatarUrl}
            userName={formData.name}
            onUpload={handleAvatarUpload}
          />
        </div>

        <div style={modalStyles.inputGroup}>
          <span style={modalStyles.label}>Display Name</span>
          <input 
            type="text" 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            style={modalStyles.input}
          />
        </div>
        
        <div style={modalStyles.inputGroup}>
          <span style={modalStyles.label}>Bio</span>
          <textarea 
            value={formData.bio}
            onChange={e => setFormData({...formData, bio: e.target.value})}
            style={{ ...modalStyles.input, minHeight: '100px', resize: 'vertical' }}
            placeholder="Tell us about yourself..."
          />
        </div>

        <div style={{ borderTop: `1px solid ${colors.gray[100]}`, paddingTop: spacing[6], marginTop: spacing[4] }}>
          <h3 style={{ fontWeight: typography.fontWeight.black, fontSize: typography.fontSize.xl, color: colors.text.primary, marginBottom: spacing[4] }}>Privacy Settings</h3>
          
          {/* Profile Visibility */}
          <div style={modalStyles.settingCard}>
            <label style={{ ...modalStyles.label, marginBottom: spacing[2] }}>Profile Visibility</label>
            <select 
              value={formData.privacyProfileVisibility}
              onChange={e => setFormData({...formData, privacyProfileVisibility: e.target.value as any})}
              style={modalStyles.select}
            >
              <option value="public">Public (Anyone can view)</option>
              <option value="friends">Friends Only</option>
              <option value="private">Private (Only me)</option>
            </select>
            <p style={{ fontSize: typography.fontSize.sm, color: colors.gray[400], marginTop: spacing[2] }}>Who can see your profile and activity.</p>
          </div>

          {/* Activity Feed Privacy */}
          <div style={modalStyles.settingCard}>
            <label style={{ ...modalStyles.label, marginBottom: spacing[2] }}>Activity Feed</label>
            <select 
              value={formData.privacyActivityFeed}
              onChange={e => setFormData({...formData, privacyActivityFeed: e.target.value as any})}
              style={modalStyles.select}
            >
              <option value="public">Public (Show in global feed)</option>
              <option value="friends">Friends Only</option>
              <option value="private">Private (Don't show)</option>
            </select>
            <p style={{ fontSize: typography.fontSize.sm, color: colors.gray[400], marginTop: spacing[2] }}>Controls who sees your activity in the feed.</p>
          </div>

          <div style={modalStyles.settingCard}>
            <label style={{ ...modalStyles.label, marginBottom: spacing[2] }}>Public Leaderboard</label>
            <select 
              value={formData.privacyPublicLeaderboard}
              onChange={e => setFormData({...formData, privacyPublicLeaderboard: e.target.value as any})}
              style={modalStyles.select}
            >
              <option value="visible">Visible (Everyone sees you)</option>
              <option value="anonymous">Anonymous (Hidden name/avatar)</option>
              <option value="hidden">Hidden (Not on leaderboard)</option>
            </select>
            <p style={{ fontSize: typography.fontSize.sm, color: colors.gray[400], marginTop: spacing[2] }}>Controls your appearance on the global leaderboard.</p>
          </div>

          <div style={modalStyles.settingCard}>
            <label style={{ ...modalStyles.label, marginBottom: spacing[2] }}>Challenge Leaderboards</label>
            <select 
              value={formData.privacyChallengeLeaderboard}
              onChange={e => setFormData({...formData, privacyChallengeLeaderboard: e.target.value as any})}
              style={modalStyles.select}
            >
              <option value="visible">Visible</option>
              <option value="anonymous">Anonymous inside challenges</option>
              <option value="hidden">Completely Hidden</option>
            </select>
            <p style={{ fontSize: typography.fontSize.sm, color: colors.gray[400], marginTop: spacing[2] }}>Controls how you appear in challenge rankings.</p>
          </div>

          {/* Blocked Users */}
          <button
            onClick={() => setShowBlockedUsers(true)}
            style={modalStyles.menuBtn}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
              <span className="material-symbols-outlined" style={{ color: colors.error }}>block</span>
              <span style={{ fontWeight: typography.fontWeight.bold, color: colors.text.primary }}>Blocked Users</span>
            </div>
            <span className="material-symbols-outlined" style={{ color: colors.gray[400] }}>chevron_right</span>
          </button>
        </div>
      </div>

      {showBlockedUsers && (
        <BlockedUsersModal onClose={() => setShowBlockedUsers(false)} />
      )}
    </div>
  );
};

// Security Settings Modal
const SecuritySettingsModal = ({ profile, email, onClose, onLogout }: { 
  profile: UserProfile, 
  email: string,
  onClose: () => void,
  onLogout: () => void
}) => {
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showExportData, setShowExportData] = useState(false);

  const handleChangeEmail = async (newEmail: string) => {
    await userService.changeEmail(newEmail, '');
    window.location.reload();
  };

  const handleChangePassword = async (oldPassword: string, newPassword: string) => {
    await userService.changePassword(oldPassword, newPassword);
    alert('Password changed successfully');
  };

  const handleDeleteAccount = async () => {
    await userService.deleteAccount('');
    onLogout();
  };

  const modalStyles = {
    container: {
      position: 'fixed' as const,
      inset: 0,
      zIndex: 50,
      backgroundColor: colors.background.primary,
      display: 'flex',
      flexDirection: 'column' as const,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing[4],
      borderBottom: `1px solid ${colors.gray[100]}`,
    },
    backBtn: {
      padding: spacing[2],
      marginLeft: `-${spacing[2]}`,
      borderRadius: borderRadius.full,
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      color: colors.text.primary,
    },
    content: {
      flex: 1,
      overflowY: 'auto' as const,
      padding: spacing[6],
    },
    menuBtn: {
      width: '100%',
      padding: spacing[4],
      backgroundColor: colors.gray[50],
      borderRadius: borderRadius['2xl'],
      border: `1px solid ${colors.gray[100]}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
      marginBottom: spacing[3],
    },
    dangerBtn: {
      width: '100%',
      padding: spacing[4],
      backgroundColor: colors.errorBg,
      borderRadius: borderRadius['2xl'],
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
    },
  };

  return (
    <div style={modalStyles.container}>
      <div style={modalStyles.header}>
        <button onClick={onClose} style={modalStyles.backBtn}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 style={{ fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.xl, color: colors.text.primary }}>Security & Account</h2>
        <div style={{ width: '40px' }} />
      </div>

      <div style={modalStyles.content}>
        {/* Change Email */}
        <button onClick={() => setShowChangeEmail(true)} style={modalStyles.menuBtn}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
            <span className="material-symbols-outlined" style={{ color: '#3B82F6' }}>mail</span>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontWeight: typography.fontWeight.bold, display: 'block', color: colors.text.primary }}>Change Email</span>
              <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>{email}</span>
            </div>
          </div>
          <span className="material-symbols-outlined" style={{ color: colors.gray[400] }}>chevron_right</span>
        </button>

        {/* Change Password */}
        <button onClick={() => setShowChangePassword(true)} style={modalStyles.menuBtn}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
            <span className="material-symbols-outlined" style={{ color: colors.success }}>lock</span>
            <span style={{ fontWeight: typography.fontWeight.bold, color: colors.text.primary }}>Change Password</span>
          </div>
          <span className="material-symbols-outlined" style={{ color: colors.gray[400] }}>chevron_right</span>
        </button>

        {/* Export Data */}
        <button onClick={() => setShowExportData(true)} style={modalStyles.menuBtn}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
            <span className="material-symbols-outlined" style={{ color: '#8B5CF6' }}>download</span>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontWeight: typography.fontWeight.bold, display: 'block', color: colors.text.primary }}>Export Your Data</span>
              <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>Download your personal data (GDPR)</span>
            </div>
          </div>
          <span className="material-symbols-outlined" style={{ color: colors.gray[400] }}>chevron_right</span>
        </button>

        <div style={{ borderTop: `1px solid ${colors.gray[100]}`, paddingTop: spacing[4], marginTop: spacing[4] }}>
          <h3 style={{ fontWeight: typography.fontWeight.bold, color: colors.error, marginBottom: spacing[4] }}>Danger Zone</h3>
          
          {/* Delete Account */}
          <button onClick={() => setShowDeleteAccount(true)} style={modalStyles.dangerBtn}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
              <span className="material-symbols-outlined" style={{ color: colors.error }}>delete_forever</span>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontWeight: typography.fontWeight.bold, color: colors.error, display: 'block' }}>Delete Account</span>
                <span style={{ fontSize: typography.fontSize.sm, color: colors.errorLight }}>Permanently delete your account and data</span>
              </div>
            </div>
            <span className="material-symbols-outlined" style={{ color: colors.errorLight }}>chevron_right</span>
          </button>
        </div>
      </div>

      {showChangeEmail && (
        <ChangeEmailModal 
          currentEmail={email}
          onClose={() => setShowChangeEmail(false)}
          onSave={handleChangeEmail}
        />
      )}

      {showChangePassword && (
        <ChangePasswordModal 
          onClose={() => setShowChangePassword(false)}
          onSave={handleChangePassword}
        />
      )}

      {showDeleteAccount && (
        <DeleteAccountModal 
          onClose={() => setShowDeleteAccount(false)}
          onDelete={handleDeleteAccount}
        />
      )}

      {showExportData && (
        <ExportDataModal onClose={() => setShowExportData(false)} />
      )}
    </div>
  );
};

// Appearance Settings Modal
const AppearanceSettingsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { theme, setTheme } = useTheme();

  const themeOptions: { value: 'light' | 'dark' | 'system'; label: string; icon: string; description: string }[] = [
    { value: 'light', label: 'Light', icon: 'light_mode', description: 'Always use light theme' },
    { value: 'dark', label: 'Dark', icon: 'dark_mode', description: 'Always use dark theme' },
    { value: 'system', label: 'System', icon: 'settings_suggest', description: 'Follow system preference' },
  ];

  const modalStyles = {
    container: {
      position: 'fixed' as const,
      inset: 0,
      zIndex: 50,
      backgroundColor: colors.background.primary,
      display: 'flex',
      flexDirection: 'column' as const,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing[4],
      borderBottom: `1px solid ${colors.gray[100]}`,
    },
    backBtn: {
      padding: spacing[2],
      marginLeft: `-${spacing[2]}`,
      borderRadius: borderRadius.full,
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      color: colors.text.primary,
    },
    content: {
      flex: 1,
      overflowY: 'auto' as const,
      padding: spacing[6],
    },
    sectionTitle: {
      fontWeight: typography.fontWeight.bold,
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
      marginBottom: spacing[4],
    },
    themeOption: (active: boolean) => ({
      width: '100%',
      padding: spacing[4],
      borderRadius: borderRadius['2xl'],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: active ? colors.primaryAlpha(0.05) : colors.gray[50],
      border: active ? `2px solid ${colors.primary}` : `1px solid ${colors.gray[100]}`,
      cursor: 'pointer',
      marginBottom: spacing[3],
      transition: 'all 0.2s ease',
    } as React.CSSProperties),
    iconBox: (type: string) => ({
      width: '48px',
      height: '48px',
      borderRadius: borderRadius.xl,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: type === 'light' ? '#FEF3C7' : type === 'dark' ? colors.gray[700] : '#DBEAFE',
      color: type === 'light' ? '#D97706' : type === 'dark' ? colors.gray[300] : '#3B82F6',
    } as React.CSSProperties),
    previewCard: {
      backgroundColor: colors.gray[50],
      borderRadius: borderRadius['2xl'],
      padding: spacing[4],
      border: `1px solid ${colors.gray[100]}`,
    },
  };

  return (
    <div style={modalStyles.container}>
      <div style={modalStyles.header}>
        <button onClick={onClose} style={modalStyles.backBtn}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 style={{ fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.xl, color: colors.text.primary }}>Appearance</h2>
        <div style={{ width: '40px' }} />
      </div>

      <div style={modalStyles.content}>
        <div>
          <h3 style={modalStyles.sectionTitle}>Theme</h3>
          {themeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTheme(option.value)}
              style={modalStyles.themeOption(theme === option.value)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
                <div style={modalStyles.iconBox(option.value)}>
                  <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{option.icon}</span>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <span style={{ fontWeight: typography.fontWeight.bold, display: 'block', color: colors.text.primary }}>{option.label}</span>
                  <span style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>{option.description}</span>
                </div>
              </div>
              {theme === option.value && (
                <span className="material-symbols-outlined" style={{ color: colors.primary }}>check_circle</span>
              )}
            </button>
          ))}
        </div>

        {/* Preview */}
        <div style={{ marginTop: spacing[6] }}>
          <h3 style={modalStyles.sectionTitle}>Preview</h3>
          <div style={modalStyles.previewCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3], marginBottom: spacing[3] }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: colors.primaryAlpha(0.1), borderRadius: borderRadius.xl, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ color: colors.primary }}>check_circle</span>
              </div>
              <div>
                <p style={{ fontWeight: typography.fontWeight.bold, color: colors.text.primary, margin: 0 }}>Sample Task</p>
                <p style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, margin: 0 }}>Daily habit example</p>
              </div>
            </div>
            <div style={{ height: '8px', backgroundColor: colors.gray[200], borderRadius: borderRadius.full, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '75%', backgroundColor: colors.primary, borderRadius: borderRadius.full }} />
            </div>
            <div style={{ display: 'flex', gap: spacing[2], marginTop: spacing[3] }}>
              <span style={{ padding: `${spacing[1]} ${spacing[3]}`, backgroundColor: colors.successBg, color: colors.success, borderRadius: borderRadius.full, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold }}>
                Completed
              </span>
              <span style={{ padding: `${spacing[1]} ${spacing[3]}`, backgroundColor: colors.warningBg, color: colors.warning, borderRadius: borderRadius.full, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold }}>
                In Progress
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Notification Settings Modal
const NotificationSettingsModal = ({ onClose }: { onClose: () => void }) => {
  const [settings, setSettings] = useState({
    pushEnabled: true,
    emailEnabled: true,
    dailyReminder: true,
    challengeUpdates: true,
    socialActivity: true,
    achievements: true,
    reminderTime: '09:00',
  });
  const [loading, setLoading] = useState(false);

  const handleToggle = (key: keyof typeof settings) => {
    if (typeof settings[key] === 'boolean') {
      setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await userService.updateNotificationSettings(settings);
      onClose();
    } catch (err) {
      console.error('Failed to save notification settings:', err);
      alert('Failed to save settings');
    }
    setLoading(false);
  };

  const toggleItems = [
    { key: 'pushEnabled', icon: 'notifications_active', label: 'Push Notifications', description: 'Receive notifications on your device' },
    { key: 'emailEnabled', icon: 'email', label: 'Email Notifications', description: 'Get updates via email' },
    { key: 'dailyReminder', icon: 'alarm', label: 'Daily Reminders', description: 'Remind me to complete my habits' },
    { key: 'challengeUpdates', icon: 'emoji_events', label: 'Challenge Updates', description: 'Updates about your active challenges' },
    { key: 'socialActivity', icon: 'people', label: 'Social Activity', description: 'When friends follow or interact' },
    { key: 'achievements', icon: 'military_tech', label: 'Achievements', description: 'When you earn badges or milestones' },
  ];

  const modalStyles = {
    container: {
      position: 'fixed' as const,
      inset: 0,
      zIndex: 50,
      backgroundColor: colors.background.primary,
      display: 'flex',
      flexDirection: 'column' as const,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing[4],
      borderBottom: `1px solid ${colors.gray[100]}`,
    },
    backBtn: {
      padding: spacing[2],
      marginLeft: `-${spacing[2]}`,
      borderRadius: borderRadius.full,
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      color: colors.text.primary,
    },
    saveBtn: {
      color: colors.primary,
      fontWeight: typography.fontWeight.bold,
      fontSize: typography.fontSize.md,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
    },
    content: {
      flex: 1,
      overflowY: 'auto' as const,
      padding: spacing[6],
    },
    toggleRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing[4],
      backgroundColor: colors.gray[50],
      borderRadius: borderRadius['2xl'],
      border: `1px solid ${colors.gray[100]}`,
      marginBottom: spacing[3],
    },
    toggle: (active: boolean) => ({
      width: '48px',
      height: '28px',
      borderRadius: borderRadius.full,
      backgroundColor: active ? colors.primary : colors.gray[300],
      position: 'relative' as const,
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
      border: 'none',
    } as React.CSSProperties),
    toggleKnob: (active: boolean) => ({
      position: 'absolute' as const,
      top: '4px',
      left: active ? '24px' : '4px',
      width: '20px',
      height: '20px',
      backgroundColor: colors.white,
      borderRadius: borderRadius.full,
      boxShadow: shadows.sm,
      transition: 'left 0.2s ease',
    } as React.CSSProperties),
  };

  return (
    <div style={modalStyles.container}>
      <div style={modalStyles.header}>
        <button onClick={onClose} style={modalStyles.backBtn}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 style={{ fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.xl, color: colors.text.primary }}>Notifications</h2>
        <button onClick={handleSave} disabled={loading} style={{ ...modalStyles.saveBtn, opacity: loading ? 0.5 : 1 }}>
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div style={modalStyles.content}>
        {toggleItems.map(item => (
          <div key={item.key} style={modalStyles.toggleRow}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
              <span className="material-symbols-outlined" style={{ color: colors.primary }}>{item.icon}</span>
              <div>
                <p style={{ fontWeight: typography.fontWeight.bold, color: colors.text.primary, margin: 0 }}>{item.label}</p>
                <p style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, margin: 0 }}>{item.description}</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle(item.key as keyof typeof settings)}
              style={modalStyles.toggle(settings[item.key as keyof typeof settings] as boolean)}
            >
              <span style={modalStyles.toggleKnob(settings[item.key as keyof typeof settings] as boolean)} />
            </button>
          </div>
        ))}

        {/* Reminder Time */}
        {settings.dailyReminder && (
          <div style={modalStyles.toggleRow}>
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
              <span className="material-symbols-outlined" style={{ color: colors.primary }}>schedule</span>
              <div>
                <p style={{ fontWeight: typography.fontWeight.bold, color: colors.text.primary, margin: 0 }}>Reminder Time</p>
                <p style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, margin: 0 }}>When to send daily reminders</p>
              </div>
            </div>
            <input
              type="time"
              value={settings.reminderTime}
              onChange={e => setSettings(prev => ({ ...prev, reminderTime: e.target.value }))}
              style={{
                backgroundColor: colors.white,
                border: `1px solid ${colors.gray[200]}`,
                borderRadius: borderRadius.xl,
                padding: `${spacing[2]} ${spacing[3]}`,
                fontWeight: typography.fontWeight.medium,
                color: colors.text.primary,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Help Center Modal
const HelpCenterModal = ({ onClose }: { onClose: () => void }) => {
  const helpTopics = [
    { icon: 'help', title: 'Getting Started', description: 'Learn how to use HabitPulse' },
    { icon: 'emoji_events', title: 'Challenges', description: 'How challenges work' },
    { icon: 'checklist', title: 'Habits & Tasks', description: 'Managing your daily habits' },
    { icon: 'leaderboard', title: 'Leaderboards', description: 'Compete with others' },
    { icon: 'shield', title: 'Privacy & Security', description: 'Your data protection' },
    { icon: 'bug_report', title: 'Report a Bug', description: 'Help us improve' },
  ];

  const handleContactSupport = () => {
    window.open('mailto:support@habitpulse.com?subject=Support%20Request', '_blank');
  };

  const handleFeedback = () => {
    window.open('mailto:feedback@habitpulse.com?subject=Feedback', '_blank');
  };

  const modalStyles = {
    container: {
      position: 'fixed' as const,
      inset: 0,
      zIndex: 50,
      backgroundColor: colors.background.primary,
      display: 'flex',
      flexDirection: 'column' as const,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing[4],
      borderBottom: `1px solid ${colors.gray[100]}`,
    },
    backBtn: {
      padding: spacing[2],
      marginLeft: `-${spacing[2]}`,
      borderRadius: borderRadius.full,
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      color: colors.text.primary,
    },
    content: {
      flex: 1,
      overflowY: 'auto' as const,
      padding: spacing[6],
    },
    sectionTitle: {
      fontWeight: typography.fontWeight.bold,
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
      marginBottom: spacing[4],
    },
    topicBtn: {
      width: '100%',
      padding: spacing[4],
      backgroundColor: colors.gray[50],
      borderRadius: borderRadius['2xl'],
      border: `1px solid ${colors.gray[100]}`,
      display: 'flex',
      alignItems: 'center',
      gap: spacing[4],
      cursor: 'pointer',
      marginBottom: spacing[2],
      transition: 'background-color 0.2s ease',
    },
    iconBox: {
      width: '40px',
      height: '40px',
      backgroundColor: colors.primaryAlpha(0.1),
      borderRadius: borderRadius.xl,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    contactBtn: {
      width: '100%',
      padding: spacing[4],
      backgroundColor: colors.primaryAlpha(0.1),
      borderRadius: borderRadius['2xl'],
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: spacing[4],
      cursor: 'pointer',
      marginBottom: spacing[2],
    },
    feedbackBtn: {
      width: '100%',
      padding: spacing[4],
      backgroundColor: colors.gray[50],
      borderRadius: borderRadius['2xl'],
      border: `1px solid ${colors.gray[100]}`,
      display: 'flex',
      alignItems: 'center',
      gap: spacing[4],
      cursor: 'pointer',
    },
  };

  return (
    <div style={modalStyles.container}>
      <div style={modalStyles.header}>
        <button onClick={onClose} style={modalStyles.backBtn}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 style={{ fontWeight: typography.fontWeight.bold, fontSize: typography.fontSize.xl, color: colors.text.primary }}>Help Center</h2>
        <div style={{ width: '40px' }} />
      </div>

      <div style={modalStyles.content}>
        {/* Help Topics */}
        <div style={{ marginBottom: spacing[6] }}>
          <h3 style={modalStyles.sectionTitle}>Help Topics</h3>
          {helpTopics.map((topic, index) => (
            <button key={index} style={modalStyles.topicBtn}>
              <div style={modalStyles.iconBox}>
                <span className="material-symbols-outlined" style={{ color: colors.primary }}>{topic.icon}</span>
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <p style={{ fontWeight: typography.fontWeight.bold, color: colors.text.primary, margin: 0 }}>{topic.title}</p>
                <p style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, margin: 0 }}>{topic.description}</p>
              </div>
              <span className="material-symbols-outlined" style={{ color: colors.gray[400] }}>chevron_right</span>
            </button>
          ))}
        </div>

        {/* Contact */}
        <div style={{ marginBottom: spacing[6] }}>
          <h3 style={modalStyles.sectionTitle}>Contact Us</h3>
          <button onClick={handleContactSupport} style={modalStyles.contactBtn}>
            <span className="material-symbols-outlined" style={{ color: colors.primary }}>support_agent</span>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <p style={{ fontWeight: typography.fontWeight.bold, color: colors.primary, margin: 0 }}>Contact Support</p>
              <p style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, margin: 0 }}>Get help from our team</p>
            </div>
          </button>
          <button onClick={handleFeedback} style={modalStyles.feedbackBtn}>
            <span className="material-symbols-outlined" style={{ color: colors.gray[600] }}>feedback</span>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <p style={{ fontWeight: typography.fontWeight.bold, color: colors.text.primary, margin: 0 }}>Send Feedback</p>
              <p style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, margin: 0 }}>Help us improve the app</p>
            </div>
          </button>
        </div>

        {/* App Info */}
        <div style={{ textAlign: 'center', paddingTop: spacing[4], borderTop: `1px solid ${colors.gray[100]}` }}>
          <p style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, margin: 0 }}>HabitPulse v1.0.0</p>
          <p style={{ fontSize: typography.fontSize.xs, color: colors.gray[400], marginTop: spacing[1] }}>Made with ❤️ for habit builders</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
