
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { userService, challengeService } from '../services';
import type { UserProfile } from '../services';
import Skeleton from './ui/Skeleton';
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
    { icon: 'person_outline', label: 'Edit Profile & Privacy', color: 'text-blue-500', action: () => setShowSettings(true) },
    { icon: 'notifications_active', label: 'Notifications', color: 'text-purple-500', action: () => setShowNotificationSettings(true) },
    { icon: 'dark_mode', label: 'Appearance', color: 'text-orange-500', action: () => setShowAppearanceSettings(true) },
    { icon: 'security', label: 'Security & Account', color: 'text-green-500', action: () => setShowSecuritySettings(true) },
    { icon: 'help_outline', label: 'Help Center', color: 'text-slate-500', action: () => setShowHelpCenter(true) },
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

  return (
    <div className="px-6 space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="w-28 h-28 rounded-full border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden mb-4">
            <img 
              src={avatarUrl} 
              alt={`${displayName}'s profile picture`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/user/200/200';
              }}
            />
          </div>
          <button 
            className="absolute bottom-4 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Edit profile picture"
            onClick={() => setShowSettings(true)}
          >
            <span className="material-symbols-outlined text-sm" aria-hidden="true">edit</span>
          </button>
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">{displayName}</h2>
        {/* Fixed contrast: text-slate-400 -> text-slate-600 */}
        <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">{displayBio}</p>
        {user?.email && (
          <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">{user.email}</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4" role="region" aria-label="Profile statistics">
        {isLoading ? (
          <>
            <Skeleton variant="card" className="h-24" />
            <Skeleton variant="card" className="h-24" />
            <Skeleton variant="card" className="h-24" />
          </>
        ) : (
          <>
            <div className="bg-white dark:bg-card-dark p-4 rounded-3xl text-center border border-slate-100 dark:border-slate-800">
              <span className="block text-2xl font-black text-orange-500">{profile?.streakCount || 0}</span>
              {/* Fixed contrast */}
              <span className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400">Day Streak</span>
            </div>
            <div className="bg-white dark:bg-card-dark p-4 rounded-3xl text-center border border-slate-100 dark:border-slate-800">
              <span className="block text-2xl font-black text-primary">{(profile?.totalPoints || 0).toLocaleString()}</span>
              <span className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400">Points</span>
            </div>
            <div className="bg-white dark:bg-card-dark p-4 rounded-3xl text-center border border-slate-100 dark:border-slate-800">
              <span className="block text-2xl font-black text-green-500">{stats.activeChallenges}</span>
              <span className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400">Challenges</span>
            </div>
          </>
        )}
      </div>

      <nav className="space-y-2" aria-label="Settings menu">
        {settings.map((item, i) => (
          <button 
            key={i} 
            onClick={item.action}
            className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
            aria-label={item.label}
          >
            <div className="flex items-center gap-4">
              <span className={`material-symbols-outlined ${item.color}`} aria-hidden="true">{item.icon}</span>
              <span className="font-bold text-sm text-slate-900 dark:text-white">{item.label}</span>
            </div>
            {/* Right chevron for better tappable indication */}
            <span className="material-symbols-outlined text-slate-400" aria-hidden="true">chevron_right</span>
          </button>
        ))}
      </nav>

      <button 
        onClick={() => setShowLogoutConfirm(true)}
        className="w-full p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 text-red-500 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        <span className="material-symbols-outlined text-sm" aria-hidden="true">logout</span>
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

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col animate-in slide-in-from-bottom-10">
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
        <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="font-bold text-lg">Edit Profile</h2>
        <button 
          onClick={() => handleSubmit()} 
          disabled={loading}
          className="text-primary font-bold text-sm disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Avatar Upload Section */}
        <div className="flex flex-col items-center py-4">
          <AvatarUpload 
            currentUrl={formData.avatarUrl}
            userName={formData.name}
            onUpload={handleAvatarUpload}
          />
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-bold text-slate-500 mb-1 block">Display Name</span>
            <input 
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 font-semibold focus:ring-2 focus:ring-primary outline-none"
            />
          </label>
          
          <label className="block">
            <span className="text-sm font-bold text-slate-500 mb-1 block">Bio</span>
            <textarea 
              value={formData.bio}
              onChange={e => setFormData({...formData, bio: e.target.value})}
              className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 font-medium focus:ring-2 focus:ring-primary outline-none min-h-[100px]"
              placeholder="Tell us about yourself..."
            />
          </label>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
          <h3 className="font-black text-lg">Privacy Settings</h3>
          
          <div className="space-y-4">
            {/* Profile Visibility */}
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl">
              <label className="block mb-2 text-sm font-bold">Profile Visibility</label>
              <select 
                value={formData.privacyProfileVisibility}
                onChange={e => setFormData({...formData, privacyProfileVisibility: e.target.value as any})}
                className="w-full bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <option value="public">Public (Anyone can view)</option>
                <option value="friends">Friends Only</option>
                <option value="private">Private (Only me)</option>
              </select>
              <p className="text-xs text-slate-400 mt-2">Who can see your profile and activity.</p>
            </div>

            {/* Activity Feed Privacy */}
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl">
              <label className="block mb-2 text-sm font-bold">Activity Feed</label>
              <select 
                value={formData.privacyActivityFeed}
                onChange={e => setFormData({...formData, privacyActivityFeed: e.target.value as any})}
                className="w-full bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <option value="public">Public (Show in global feed)</option>
                <option value="friends">Friends Only</option>
                <option value="private">Private (Don't show)</option>
              </select>
              <p className="text-xs text-slate-400 mt-2">Controls who sees your activity in the feed.</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl">
              <label className="block mb-2 text-sm font-bold">Public Leaderboard</label>
              <select 
                value={formData.privacyPublicLeaderboard}
                onChange={e => setFormData({...formData, privacyPublicLeaderboard: e.target.value as any})}
                className="w-full bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <option value="visible">Visible (Everyone sees you)</option>
                <option value="anonymous">Anonymous (Hidden name/avatar)</option>
                <option value="hidden">Hidden (Not on leaderboard)</option>
              </select>
              <p className="text-xs text-slate-400 mt-2">Controls your appearance on the global leaderboard.</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl">
              <label className="block mb-2 text-sm font-bold">Challenge Leaderboards</label>
              <select 
                value={formData.privacyChallengeLeaderboard}
                onChange={e => setFormData({...formData, privacyChallengeLeaderboard: e.target.value as any})}
                className="w-full bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <option value="visible">Visible</option>
                <option value="anonymous">Anonymous inside challenges</option>
                <option value="hidden">Completely Hidden</option>
              </select>
              <p className="text-xs text-slate-400 mt-2">Controls how you appear in challenge rankings.</p>
            </div>

            {/* Blocked Users */}
            <button
              onClick={() => setShowBlockedUsers(true)}
              className="w-full bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-red-500">block</span>
                <span className="font-bold">Blocked Users</span>
              </div>
              <span className="material-symbols-outlined text-slate-400">chevron_right</span>
            </button>
          </div>
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

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col animate-in slide-in-from-bottom-10">
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
        <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="font-bold text-lg">Security & Account</h2>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Change Email */}
        <button
          onClick={() => setShowChangeEmail(true)}
          className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-blue-500">mail</span>
            <div className="text-left">
              <span className="font-bold block">Change Email</span>
              <span className="text-sm text-slate-500">{email}</span>
            </div>
          </div>
          <span className="material-symbols-outlined text-slate-400">chevron_right</span>
        </button>

        {/* Change Password */}
        <button
          onClick={() => setShowChangePassword(true)}
          className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-green-500">lock</span>
            <span className="font-bold">Change Password</span>
          </div>
          <span className="material-symbols-outlined text-slate-400">chevron_right</span>
        </button>

        {/* Export Data */}
        <button
          onClick={() => setShowExportData(true)}
          className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-purple-500">download</span>
            <div className="text-left">
              <span className="font-bold block">Export Your Data</span>
              <span className="text-sm text-slate-500">Download your personal data (GDPR)</span>
            </div>
          </div>
          <span className="material-symbols-outlined text-slate-400">chevron_right</span>
        </button>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
          <h3 className="font-bold text-red-500 mb-4">Danger Zone</h3>
          
          {/* Delete Account */}
          <button
            onClick={() => setShowDeleteAccount(true)}
            className="w-full p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-red-500">delete_forever</span>
              <div className="text-left">
                <span className="font-bold text-red-500 block">Delete Account</span>
                <span className="text-sm text-red-400">Permanently delete your account and data</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-red-400">chevron_right</span>
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

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col animate-in slide-in-from-bottom-10">
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
        <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="font-bold text-lg text-slate-900 dark:text-white">Appearance</h2>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <h3 className="font-bold text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
            Theme
          </h3>
          <div className="space-y-3">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all ${
                  theme === option.value
                    ? 'bg-primary/10 border-2 border-primary'
                    : 'bg-slate-50 dark:bg-slate-900 border-2 border-transparent'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    option.value === 'light' 
                      ? 'bg-amber-100 text-amber-600' 
                      : option.value === 'dark'
                      ? 'bg-slate-700 text-slate-300'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  }`}>
                    <span className="material-symbols-outlined text-2xl">{option.icon}</span>
                  </div>
                  <div className="text-left">
                    <span className="font-bold block text-slate-900 dark:text-white">{option.label}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{option.description}</span>
                  </div>
                </div>
                {theme === option.value && (
                  <span className="material-symbols-outlined text-primary">check_circle</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div>
          <h3 className="font-bold text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
            Preview
          </h3>
          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">check_circle</span>
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Sample Task</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Daily habit example</p>
              </div>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-primary rounded-full" />
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold">
                Completed
              </span>
              <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full text-xs font-bold">
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

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col animate-in slide-in-from-bottom-10">
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
        <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="font-bold text-lg">Notifications</h2>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="text-primary font-bold text-sm disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {toggleItems.map(item => (
          <div 
            key={item.key}
            className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl"
          >
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-primary">{item.icon}</span>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{item.label}</p>
                <p className="text-xs text-slate-500">{item.description}</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle(item.key as keyof typeof settings)}
              className={`w-12 h-7 rounded-full transition-colors relative ${
                settings[item.key as keyof typeof settings] ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span 
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  settings[item.key as keyof typeof settings] ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}

        {/* Reminder Time */}
        {settings.dailyReminder && (
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
            <label className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary">schedule</span>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Reminder Time</p>
                  <p className="text-xs text-slate-500">When to send daily reminders</p>
                </div>
              </div>
              <input
                type="time"
                value={settings.reminderTime}
                onChange={e => setSettings(prev => ({ ...prev, reminderTime: e.target.value }))}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-medium"
              />
            </label>
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

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col animate-in slide-in-from-bottom-10">
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
        <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="font-bold text-lg">Help Center</h2>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Help Topics */}
        <div>
          <h3 className="font-bold text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
            Help Topics
          </h3>
          <div className="space-y-2">
            {helpTopics.map((topic, index) => (
              <button
                key={index}
                className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center gap-4 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">{topic.icon}</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-slate-900 dark:text-white">{topic.title}</p>
                  <p className="text-xs text-slate-500">{topic.description}</p>
                </div>
                <span className="material-symbols-outlined text-slate-400">chevron_right</span>
              </button>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-bold text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
            Contact Us
          </h3>
          <div className="space-y-2">
            <button
              onClick={handleContactSupport}
              className="w-full p-4 bg-primary/10 rounded-2xl flex items-center gap-4"
            >
              <span className="material-symbols-outlined text-primary">support_agent</span>
              <div className="flex-1 text-left">
                <p className="font-bold text-primary">Contact Support</p>
                <p className="text-xs text-slate-500">Get help from our team</p>
              </div>
            </button>
            <button
              onClick={handleFeedback}
              className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center gap-4"
            >
              <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">feedback</span>
              <div className="flex-1 text-left">
                <p className="font-bold text-slate-900 dark:text-white">Send Feedback</p>
                <p className="text-xs text-slate-500">Help us improve the app</p>
              </div>
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="text-center pt-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-sm text-slate-500">HabitPulse v1.0.0</p>
          <p className="text-xs text-slate-400 mt-1">Made with ❤️ for habit builders</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
