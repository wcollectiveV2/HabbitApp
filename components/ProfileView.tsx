
import React from 'react';

interface ProfileViewProps {
  onLogout?: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ onLogout }) => {
  const settings = [
    { icon: 'person_outline', label: 'Edit Profile', color: 'text-blue-500' },
    { icon: 'notifications_active', label: 'Notifications', color: 'text-purple-500' },
    { icon: 'dark_mode', label: 'Appearance', color: 'text-orange-500' },
    { icon: 'security', label: 'Privacy & Security', color: 'text-green-500' },
    { icon: 'help_outline', label: 'Help Center', color: 'text-slate-500' },
  ];

  return (
    <div className="px-6 space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="w-28 h-28 rounded-full border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden mb-4">
            <img src="https://picsum.photos/seed/user/200/200" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <button className="absolute bottom-4 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg">
            <span className="material-symbols-outlined text-sm">edit</span>
          </button>
        </div>
        <h2 className="text-2xl font-black">Alex Rivera</h2>
        <p className="text-slate-400 font-medium text-sm">Fitness Enthusiast & Water Lover</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-card-dark p-4 rounded-3xl text-center border border-slate-100 dark:border-slate-800">
          <span className="block text-2xl font-black text-primary">24</span>
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Rewards</span>
        </div>
        <div className="bg-white dark:bg-card-dark p-4 rounded-3xl text-center border border-slate-100 dark:border-slate-800">
          <span className="block text-2xl font-black text-primary">5</span>
          <span className="text-[10px] font-bold uppercase text-slate-400">Challenges</span>
        </div>
      </div>

      <div className="space-y-2">
        {settings.map((item, i) => (
          <button 
            key={i} 
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
        onClick={onLogout}
        className="w-full p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 text-red-500 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
      >
        <span className="material-symbols-outlined text-sm">logout</span>
        Log Out
      </button>
    </div>
  );
};

export default ProfileView;
