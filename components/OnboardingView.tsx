import React, { useState } from 'react';

interface OnboardingViewProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface OnboardingSlide {
  id: number;
  icon: string;
  title: string;
  description: string;
  color: string;
  bgGradient: string;
}

const slides: OnboardingSlide[] = [
  {
    id: 1,
    icon: 'rocket_launch',
    title: 'Welcome to HabitPulse',
    description: 'Build better habits, achieve your goals, and track your progress with our gamified habit tracking app.',
    color: 'text-primary',
    bgGradient: 'from-primary/20 to-purple-500/20'
  },
  {
    id: 2,
    icon: 'emoji_events',
    title: 'Join Challenges',
    description: 'Participate in daily challenges with others. Complete tasks, earn points, and climb the leaderboard.',
    color: 'text-yellow-500',
    bgGradient: 'from-yellow-500/20 to-orange-500/20'
  },
  {
    id: 3,
    icon: 'local_fire_department',
    title: 'Build Your Streak',
    description: 'Stay consistent and watch your streak grow. The longer your streak, the more rewards you unlock.',
    color: 'text-orange-500',
    bgGradient: 'from-orange-500/20 to-red-500/20'
  },
  {
    id: 4,
    icon: 'groups',
    title: 'Connect & Compete',
    description: 'Join a community of like-minded people. Share your progress and motivate each other to succeed.',
    color: 'text-green-500',
    bgGradient: 'from-green-500/20 to-teal-500/20'
  }
];

const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete, onSkip }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slide = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      {/* Skip button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={onSkip}
          className="px-4 py-2 text-slate-500 font-medium text-sm hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          aria-label="Skip onboarding"
        >
          Skip
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Animated background */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br ${slide.bgGradient} transition-all duration-500 opacity-50`}
          aria-hidden="true"
        />

        {/* Icon */}
        <div 
          className={`relative w-32 h-32 mb-8 rounded-full bg-gradient-to-br ${slide.bgGradient} flex items-center justify-center animate-in zoom-in duration-500`}
          key={slide.id}
        >
          <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-xl">
            <span className={`material-symbols-outlined text-5xl ${slide.color}`}>
              {slide.icon}
            </span>
          </div>
        </div>

        {/* Text Content */}
        <div className="relative text-center max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500" key={`text-${slide.id}`}>
          <h1 className="text-3xl font-black mb-4 text-slate-900 dark:text-white">
            {slide.title}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
            {slide.description}
          </p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="p-8 space-y-6">
        {/* Pagination Dots */}
        <div className="flex justify-center gap-2" role="tablist" aria-label="Onboarding slides">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'w-8 bg-primary' 
                  : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
              }`}
              role="tab"
              aria-selected={index === currentSlide}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          {currentSlide > 0 && (
            <button
              onClick={handlePrevious}
              className="flex-1 px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            className={`flex-1 px-6 py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/30 transition-all active:scale-95 hover:bg-primary/90 ${
              currentSlide === 0 ? 'w-full' : ''
            }`}
          >
            {isLastSlide ? "Let's Get Started" : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingView;
