
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService, challengeService } from '../services';
import type { UserProfile } from '../services';

interface ProfileViewProps {
  profile?: UserProfile | null;
  onLogout?: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile: propProfile, onLogout }) => {
  const { user, profile: contextProfile, logout } = useAuth();
  const [stats, setStats] = useState({ totalRewards: 0, activeChallenges: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

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

  const settings = [
    { icon: 'person_outline', label: 'Edit Profile & Privacy', color: 'text-blue-500', action: () => setShowSettings(true) },
    { icon: 'notifications_active', label: 'Notifications', color: 'text-purple-500', action: () => {} },
    { icon: 'dark_mode', label: 'Appearance', color: 'text-orange-500', action: () => {} },
    { icon: 'security', label: 'Security', color: 'text-green-500', action: () => {} },
    { icon: 'help_outline', label: 'Help Center', color: 'text-slate-500', action: () => {} },
  ];

  if (showSettings && profile) {
    return (
      <EditProfileModal 
        profile={profile} 
        onClose={() => setShowSettings(false)} 
        onSave={handleUpdateProfile} 
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
              alt="Profile" 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/user/200/200';
              }}
            />
          </div>
          <button className="absolute bottom-4 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg">
            <span className="material-symbols-outlined text-sm">edit</span>
          </button>
        </div>
        <h2 className="text-2xl font-black">{displayName}</h2>
        <p className="text-slate-400 font-medium text-sm">{displayBio}</p>
        {user?.email && (
          <p className="text-slate-300 text-xs mt-1">{user.email}</p>
        )}
      </div>

      <div className={`grid grid-cols-3 gap-4 ${isLoading ? 'animate-pulse opacity-70' : ''}`}>
        <div className="bg-white dark:bg-card-dark p-4 rounded-3xl text-center border border-slate-100 dark:border-slate-800">
          <span className="block text-2xl font-black text-orange-500">{profile?.streakCount || 0}</span>
          <span className="text-[10px] font-bold uppercase text-slate-400">Day Streak</span>
        </div>
        <div className="bg-white dark:bg-card-dark p-4 rounded-3xl text-center border border-slate-100 dark:border-slate-800">
          <span className="block text-2xl font-black text-primary">{(profile?.totalPoints || 0).toLocaleString()}</span>
          <span className="text-[10px] font-bold uppercase text-slate-400">Points</span>
        </div>
        <div className="bg-white dark:bg-card-dark p-4 rounded-3xl text-center border border-slate-100 dark:border-slate-800">
          <span className="block text-2xl font-black text-green-500">{stats.activeChallenges}</span>
          <span className="text-[10px] font-bold uppercase text-slate-400">Challenges</span>
        </div>
      </div>

      <div className="space-y-2">
        {settings.map((item, i) => (
          <button 
            key={i} 
            onClick={item.action}
            className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <span className={`material-symbols-outlined ${item.color}`}>{item.icon}</span>
              <span className="font-bold text-sm">{item.label}</span>
            </div>
            <span className="material-symbols-outlined text-slate-300">chevron_right</span>
          </button>
        ))}
      </div>

      <button 
        onClick={handleLogout}
        className="w-full p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 text-red-500 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
      >
        <span className="material-symbols-outlined text-sm">logout</span>
        Log Out
      </button>
    </div>
  );
};


const EditProfileModal = ({ profile, onClose, onSave }: { profile: UserProfile, onClose: () => void, onSave: (data: Partial<UserProfile>) => Promise<void> }) => {
  const [formData, setFormData] = useState({
    name: profile.name,
    bio: profile.bio || '',
    privacyPublicLeaderboard: profile.privacyPublicLeaderboard || 'visible',
    privacyChallengeLeaderboard: profile.privacyChallengeLeaderboard || 'visible'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSave(formData);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col animate-in slide-in-from-bottom-10">
      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
        <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="font-bold text-lg">Edit Profile</h2>
        <button 
          onClick={handleSubmit} 
          disabled={loading}
          className="text-primary font-bold text-sm disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
