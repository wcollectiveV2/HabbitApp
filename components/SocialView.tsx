
import React from 'react';
import { MOCK_LEADERBOARD, MOCK_FEED } from '../constants';

const SocialView: React.FC = () => {
  return (
    <div className="px-6 space-y-8 animate-in slide-in-from-right-4 duration-500">
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Leaderboard</h2>
          <button className="text-primary text-xs font-bold uppercase tracking-widest">Global</button>
        </div>
        
        <div className="bg-white dark:bg-card-dark rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm divide-y divide-slate-50 dark:divide-slate-800 overflow-hidden">
          {MOCK_LEADERBOARD.map((user) => (
            <div key={user.rank} className={`p-4 flex items-center justify-between ${user.isCurrentUser ? 'bg-primary/5' : ''}`}>
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 flex items-center justify-center font-black text-sm rounded-full ${
                  user.rank === 1 ? 'bg-yellow-400 text-white' : 
                  user.rank === 2 ? 'bg-slate-300 text-slate-600' :
                  user.rank === 3 ? 'bg-orange-300 text-white' : 'text-slate-400'
                }`}>
                  {user.rank}
                </div>
                <img src={user.avatar} className="w-10 h-10 rounded-full bg-slate-100" alt={user.name} />
                <div>
                  <h4 className="font-bold text-sm">{user.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{user.points} Points</p>
                </div>
              </div>
              {user.isCurrentUser && (
                <span className="bg-primary/20 text-primary text-[8px] font-black px-2 py-1 rounded-full uppercase">You</span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {MOCK_FEED.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/50">
              <img src={item.userAvatar} className="w-10 h-10 rounded-full" alt="" />
              <div>
                <p className="text-sm leading-snug">
                  <span className="font-bold">{item.userName}</span>{' '}
                  <span className="text-slate-500">{item.action}</span>{' '}
                  <span className="font-semibold text-primary">{item.target}</span>
                </p>
                <span className="text-[10px] text-slate-400 font-medium">{item.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default SocialView;
