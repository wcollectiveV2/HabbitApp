import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { userService } from '../services';
import type { UserProfile, ChallengeTask } from '../services';
import { colors, spacing, borderRadius, typography, shadows, transitions } from '../theme/designSystem';

interface HomeViewProps {
  tasks: Task[];
  challengeTasks?: ChallengeTask[];
  profile?: UserProfile | null;
}

const HomeView: React.FC<HomeViewProps> = ({ tasks, challengeTasks = [], profile }) => {
  const [tip] = useState<string>("Small steps every day lead to big results along the way.");
  const [stats, setStats] = useState({
    streakCount: 0,
    totalPoints: 0,
    completedPercent: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      const completedTasks = tasks.filter(t => t.completed).length;
      const completedChallenges = challengeTasks.filter(t => t.isCompleted).length;
      const totalCompleted = completedTasks + completedChallenges;
      
      const totalDailyTasks = tasks.length;
      const totalChallengeTasks = challengeTasks.length;
      const grandTotal = (totalDailyTasks + totalChallengeTasks) || 1;
      
      const calculatedPercent = Math.round((totalCompleted / grandTotal) * 100);

      try {
        const userStats = await userService.getStats();
        setStats({
          streakCount: userStats.streakCount || profile?.streakCount || 0,
          totalPoints: userStats.totalPoints || profile?.totalPoints || 0,
          completedPercent: calculatedPercent
        });
      } catch (err) {
        setStats({
          streakCount: profile?.streakCount || 0,
          totalPoints: profile?.totalPoints || 0,
          completedPercent: calculatedPercent
        });
      }
    };
    fetchStats();
  }, [tasks, challengeTasks, profile]);

  const completedToday = tasks.filter(t => t.completed).length + challengeTasks.filter(t => t.isCompleted).length;

  return (
    <div style={{ paddingBottom: '100px' }} className="animate-fade-in">
      
      {/* Hero Card - Streak */}
      <div style={{
        background: colors.gradients.primary,
        borderRadius: borderRadius['3xl'],
        padding: spacing[6],
        color: colors.white,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: shadows.primaryLg,
        marginBottom: spacing[5],
      }}>
        {/* Decorative elements */}
        <div style={{
          position: 'absolute',
          top: '-30px',
          right: '-30px',
          width: '120px',
          height: '120px',
          borderRadius: borderRadius.full,
          background: colors.primaryAlpha(0.1),
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-20px',
          left: '-20px',
          width: '80px',
          height: '80px',
          borderRadius: borderRadius.full,
          background: 'rgba(0,0,0,0.1)',
        }} />
        
        <div style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing[5] }}>
            <div>
              <h2 style={{ fontSize: typography.fontSize['6xl'], fontWeight: typography.fontWeight.black, margin: 0, lineHeight: typography.lineHeight.tight }}>
                {stats.streakCount}
              </h2>
              <p style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.bold, textTransform: 'uppercase', opacity: 0.8, margin: `${spacing[1]} 0 0 0`, letterSpacing: typography.letterSpacing.wider }}>
                Day Streak
              </p>
            </div>
            <div style={{
              width: '56px',
              height: '56px',
              background: colors.primaryAlpha(0.2),
              borderRadius: borderRadius.xl,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px', color: colors.warningLight }}>
                local_fire_department
              </span>
            </div>
          </div>
          
          {/* Progress bar */}
          <div style={{
            background: 'rgba(0,0,0,0.2)',
            borderRadius: borderRadius.lg,
            padding: spacing[4],
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, textTransform: 'uppercase', opacity: 0.7, marginBottom: spacing[2] }}>
              <span>Daily Goal</span>
              <span>{stats.completedPercent}%</span>
            </div>
            <div style={{ height: '10px', background: colors.primaryAlpha(0.2), borderRadius: borderRadius.full, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${stats.completedPercent}%`,
                background: colors.gradients.sunset.replace('135deg', '90deg').replace('#FF6B6B', '#FDE047').replace('#FFE66D', '#FBBF24'),
                borderRadius: borderRadius.full,
                transition: transitions.slow,
                boxShadow: '0 0 10px rgba(253,224,71,0.5)',
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[3], marginBottom: spacing[5] }}>
        <div style={{
          background: colors.background.primary,
          borderRadius: borderRadius['2xl'],
          padding: spacing[5],
          textAlign: 'center',
          boxShadow: shadows.card,
          border: `1px solid ${colors.gray[100]}`,
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: borderRadius.full,
            background: colors.warningBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: `0 auto ${spacing[3]}`,
          }}>
            <span className="material-symbols-outlined" style={{ color: colors.warning, fontSize: '24px' }}>stars</span>
          </div>
          <div style={{ fontSize: typography.fontSize['4xl'], fontWeight: typography.fontWeight.extrabold, color: colors.text.primary }}>
            {stats.totalPoints >= 1000 ? `${(stats.totalPoints / 1000).toFixed(1)}k` : stats.totalPoints}
          </div>
          <div style={{ fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: typography.letterSpacing.wider, marginTop: spacing[1] }}>
            Total Points
          </div>
        </div>
        
        <div style={{
          background: colors.background.primary,
          borderRadius: borderRadius['2xl'],
          padding: spacing[5],
          textAlign: 'center',
          boxShadow: shadows.card,
          border: `1px solid ${colors.gray[100]}`,
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: borderRadius.full,
            background: colors.successBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: `0 auto ${spacing[3]}`,
          }}>
            <span className="material-symbols-outlined" style={{ color: colors.success, fontSize: '24px' }}>check_circle</span>
          </div>
          <div style={{ fontSize: typography.fontSize['4xl'], fontWeight: typography.fontWeight.extrabold, color: colors.text.primary }}>
            {completedToday}
          </div>
          <div style={{ fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: typography.letterSpacing.wider, marginTop: spacing[1] }}>
            Completed Today
          </div>
        </div>
      </div>

      {/* Tip Card */}
      <div style={{
        background: '#EFF6FF',
        borderRadius: borderRadius['2xl'],
        padding: spacing[5],
        display: 'flex',
        gap: spacing[4],
        alignItems: 'flex-start',
        border: '1px solid #DBEAFE',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          right: '-10px',
          top: '-10px',
          opacity: 0.1,
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '100px', color: '#3B82F6' }}>format_quote</span>
        </div>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: borderRadius.full,
          background: '#DBEAFE',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span className="material-symbols-outlined" style={{ color: '#3B82F6', fontSize: '20px' }}>auto_awesome</span>
        </div>
        <div style={{ position: 'relative', zIndex: 10 }}>
          <p style={{ fontSize: typography.fontSize.md, fontWeight: typography.fontWeight.medium, color: colors.text.secondary, fontStyle: 'italic', lineHeight: typography.lineHeight.normal, margin: 0 }}>
            "{tip}"
          </p>
          <p style={{ fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, color: '#3B82F6', textTransform: 'uppercase', marginTop: spacing[2], letterSpacing: typography.letterSpacing.wide }}>
            Daily Mindset
          </p>
        </div>
      </div>

    </div>
  );
};

export default HomeView;
