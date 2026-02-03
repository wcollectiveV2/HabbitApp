import React, { useState, useEffect } from 'react';
import { socialService } from '../services';
import { useAuth } from '../context/AuthContext';

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
      <div className="min-h-screen bg-slate-50 dark:bg-bg-dark">
        <div className="bg-white dark:bg-card-dark border-b border-slate-100 dark:border-slate-800 sticky top-0 z-10">
          <div className="px-4 py-4 flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
        </div>
        <div className="p-6 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
          <div className="mt-4 h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="mt-2 h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-bg-dark">
        <div className="bg-white dark:bg-card-dark border-b border-slate-100 dark:border-slate-800 sticky top-0 z-10">
          <div className="px-4 py-4 flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Profile</h1>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-4">
            {error.includes('private') ? 'lock' : 'person_off'}
          </span>
          <p className="text-slate-600 dark:text-slate-400 font-medium">{error}</p>
          <button
            onClick={onBack}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-full font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-bg-dark">
      {/* Header */}
      <div className="bg-white dark:bg-card-dark border-b border-slate-100 dark:border-slate-800 sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{profile.name}</h1>
          </div>
          {!isOwnProfile && (
            <div className="relative">
              <button
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="material-symbols-outlined">more_vert</span>
              </button>
              {showOptionsMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowOptionsMenu(false)} 
                  />
                  <div className="absolute right-0 top-12 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden z-20 min-w-[180px]">
                    <button
                      onClick={handleBlock}
                      className="w-full px-4 py-3 text-left text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3"
                    >
                      <span className="material-symbols-outlined text-red-500">
                        {profile.isBlocked ? 'person_add' : 'block'}
                      </span>
                      <span className={profile.isBlocked ? 'text-slate-900 dark:text-white' : 'text-red-500'}>
                        {profile.isBlocked ? 'Unblock User' : 'Block User'}
                      </span>
                    </button>
                    <button
                      onClick={handleReport}
                      className="w-full px-4 py-3 text-left text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3"
                    >
                      <span className="material-symbols-outlined text-amber-500">flag</span>
                      <span className="text-slate-900 dark:text-white">Report User</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Profile Content */}
      <div className="p-6 space-y-6">
        {/* Avatar & Name */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden">
            <img
              src={profile.avatarUrl || `https://i.pravatar.cc/200?u=${profile.id}`}
              alt={`${profile.name}'s avatar`}
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="mt-4 text-2xl font-black text-slate-900 dark:text-white">{profile.name}</h2>
          {profile.bio && (
            <p className="mt-1 text-slate-600 dark:text-slate-400 text-center max-w-[250px]">
              {profile.bio}
            </p>
          )}
        </div>

        {/* Follow Stats */}
        <div className="flex justify-center gap-8">
          <div className="text-center">
            <p className="text-xl font-bold text-slate-900 dark:text-white">{profile.followers}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-slate-900 dark:text-white">{profile.following}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Following</p>
          </div>
        </div>

        {/* Action Buttons */}
        {!isOwnProfile && !profile.isBlocked && (
          <div className="flex gap-3">
            <button
              onClick={handleFollowToggle}
              disabled={actionLoading}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                profile.isFollowing
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                  : 'bg-primary text-white'
              } ${actionLoading ? 'opacity-50' : ''}`}
            >
              {actionLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : profile.isFollowing ? (
                'Following'
              ) : profile.isFollowedBy ? (
                'Follow Back'
              ) : (
                'Follow'
              )}
            </button>
            <button
              className="px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl"
              onClick={() => {/* TODO: Implement message */}}
            >
              <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">chat</span>
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-card-dark p-4 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
            <span className="block text-2xl font-black text-orange-500">{profile.streakCount}</span>
            <span className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400">Streak</span>
          </div>
          <div className="bg-white dark:bg-card-dark p-4 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
            <span className="block text-2xl font-black text-primary">{profile.totalPoints.toLocaleString()}</span>
            <span className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400">Points</span>
          </div>
          <div className="bg-white dark:bg-card-dark p-4 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
            <span className="block text-2xl font-black text-emerald-500">{profile.challengeCount}</span>
            <span className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400">Challenges</span>
          </div>
        </div>

        {/* Mutual Info */}
        {profile.isFollowedBy && profile.isFollowing && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl flex items-center gap-3">
            <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">group</span>
            <span className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
              You follow each other
            </span>
          </div>
        )}

        {/* Blocked State */}
        {profile.isBlocked && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl flex items-center gap-3">
            <span className="material-symbols-outlined text-red-600 dark:text-red-400">block</span>
            <div>
              <span className="text-sm text-red-700 dark:text-red-300 font-medium block">
                You have blocked this user
              </span>
              <button
                onClick={handleBlock}
                disabled={isBlocking}
                className="text-sm text-red-600 dark:text-red-400 underline mt-1"
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
