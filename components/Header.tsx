
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-6 pt-4 pb-2 flex items-center justify-between">
      <h1 className="text-2xl font-extrabold text-primary tracking-tight">Active Challenges</h1>
      <div className="flex gap-2">
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 active:scale-90 transition-transform">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-primary/20 cursor-pointer active:scale-95 transition-transform">
          <img 
            alt="User" 
            className="w-full h-full object-cover" 
            src="https://picsum.photos/seed/user/200/200"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
