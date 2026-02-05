import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-fade-in">
      <div className="mb-6 relative">
        <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-6xl text-primary animate-pulse">
                explore_off
            </span>
        </div>
      </div>
      
      <h2 className="text-2xl font-bold mb-3 text-slate-800 dark:text-white">
        Page Not Found
      </h2>
      
      <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
        Oops! The page you are looking for seems to have wandered off into the unknown.
      </p>
      
      <button
        onClick={() => navigate('/')}
        className="btn btn-primary px-8 py-3 rounded-xl flex items-center gap-2"
      >
        <span className="material-symbols-outlined">home</span>
        Back to Home
      </button>
    </div>
  );
};

export default NotFoundView;
