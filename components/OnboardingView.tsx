import React, { useState } from 'react';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/designSystem';

interface OnboardingViewProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface OnboardingSlide {
  id: number;
  icon: string;
  title: string;
  description: string;
  iconColor: string;
  bgGradient: string;
}

const slides: OnboardingSlide[] = [
  {
    id: 1,
    icon: 'rocket_launch',
    title: 'Welcome to HabitPulse',
    description: 'Build better habits, achieve your goals, and track your progress with our gamified habit tracking app.',
    iconColor: colors.primary,
    bgGradient: `linear-gradient(135deg, ${colors.primary}33, #A855F733)`
  },
  {
    id: 2,
    icon: 'emoji_events',
    title: 'Join Challenges',
    description: 'Participate in daily challenges with others. Complete tasks, earn points, and climb the leaderboard.',
    iconColor: '#EAB308',
    bgGradient: 'linear-gradient(135deg, #EAB30833, #F9731633)'
  },
  {
    id: 3,
    icon: 'local_fire_department',
    title: 'Build Your Streak',
    description: 'Stay consistent and watch your streak grow. The longer your streak, the more rewards you unlock.',
    iconColor: '#F97316',
    bgGradient: 'linear-gradient(135deg, #F9731633, #EF444433)'
  },
  {
    id: 4,
    icon: 'groups',
    title: 'Connect & Compete',
    description: 'Join a community of like-minded people. Share your progress and motivate each other to succeed.',
    iconColor: '#22C55E',
    bgGradient: 'linear-gradient(135deg, #22C55E33, #14B8A633)'
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

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column' as const,
      backgroundColor: colors.background.primary,
    },
    skipBtnArea: {
      position: 'absolute' as const,
      top: spacing[4],
      right: spacing[4],
      zIndex: 10,
    },
    skipBtn: {
      padding: `${spacing[2]} ${spacing[4]}`,
      color: colors.gray[500],
      fontWeight: typography.fontWeight.medium,
      fontSize: typography.fontSize.sm,
      background: 'none',
      border: 'none',
      cursor: 'pointer',
    },
    mainContent: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing[8],
    },
    bgOverlay: {
      position: 'absolute' as const,
      inset: 0,
      background: slide.bgGradient,
      transition: 'all 0.5s ease',
      opacity: 0.5,
    },
    iconOuter: {
      position: 'relative' as const,
      width: '128px',
      height: '128px',
      marginBottom: spacing[8],
      borderRadius: borderRadius.full,
      background: slide.bgGradient,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconInner: {
      width: '96px',
      height: '96px',
      borderRadius: borderRadius.full,
      backgroundColor: colors.background.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: shadows.xl,
    },
    textArea: {
      position: 'relative' as const,
      textAlign: 'center' as const,
      maxWidth: '380px',
    },
    title: {
      fontSize: '30px',
      fontWeight: '900',
      marginBottom: spacing[4],
      color: colors.text.primary,
    },
    description: {
      color: colors.text.secondary,
      fontSize: typography.fontSize.lg,
      lineHeight: 1.6,
    },
    bottomNav: {
      padding: spacing[8],
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacing[6],
    },
    dotsRow: {
      display: 'flex',
      justifyContent: 'center',
      gap: spacing[2],
    },
    dot: (active: boolean) => ({
      height: '8px',
      width: active ? '32px' : '8px',
      borderRadius: borderRadius.full,
      backgroundColor: active ? colors.primary : colors.gray[300],
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    }),
    buttonsRow: {
      display: 'flex',
      gap: spacing[4],
    },
    backBtn: {
      flex: 1,
      padding: `${spacing[4]} ${spacing[6]}`,
      backgroundColor: colors.gray[100],
      color: colors.text.secondary,
      fontWeight: typography.fontWeight.bold,
      borderRadius: borderRadius['2xl'],
      border: 'none',
      cursor: 'pointer',
    },
    nextBtn: {
      flex: 1,
      padding: `${spacing[4]} ${spacing[6]}`,
      backgroundColor: colors.primary,
      color: 'white',
      fontWeight: typography.fontWeight.bold,
      borderRadius: borderRadius['2xl'],
      boxShadow: `0 4px 12px ${colors.primary}4D`,
      border: 'none',
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.container}>
      {/* Skip button */}
      <div style={styles.skipBtnArea}>
        <button onClick={onSkip} style={styles.skipBtn} aria-label="Skip onboarding">
          Skip
        </button>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Animated background */}
        <div style={styles.bgOverlay} aria-hidden="true" />

        {/* Icon */}
        <div style={styles.iconOuter} key={slide.id}>
          <div style={styles.iconInner}>
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: slide.iconColor }}>
              {slide.icon}
            </span>
          </div>
        </div>

        {/* Text Content */}
        <div style={styles.textArea} key={`text-${slide.id}`}>
          <h1 style={styles.title}>{slide.title}</h1>
          <p style={styles.description}>{slide.description}</p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div style={styles.bottomNav}>
        {/* Pagination Dots */}
        <div style={styles.dotsRow} role="tablist" aria-label="Onboarding slides">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              style={styles.dot(index === currentSlide)}
              role="tab"
              aria-selected={index === currentSlide}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div style={styles.buttonsRow}>
          {currentSlide > 0 && (
            <button onClick={handlePrevious} style={styles.backBtn}>
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            style={{ ...styles.nextBtn, width: currentSlide === 0 ? '100%' : undefined }}
          >
            {isLastSlide ? "Let's Get Started" : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingView;
