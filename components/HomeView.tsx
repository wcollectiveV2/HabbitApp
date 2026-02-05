import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import { userService } from '../services';
import type { UserProfile } from '../services';

interface HomeViewProps {
  tasks: Task[];
  profile?: UserProfile | null;
}

const HomeView: React.FC<HomeViewProps> = ({ tasks, profile }) => {
  const [tip] = useState<string>("Small steps every day lead to big results along the way.");
  const [stats, setStats] = useState({
    streakCount: 0,
    totalPoints: 0,
    completedPercent: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userStats = await userService.getStats();
        const completed = tasks.filter(t => t.completed).length;
        const total = tasks.length || 1;
        setStats({
          streakCount: userStats.streakCount || profile?.streakCount || 0,
          totalPoints: userStats.totalPoints || profile?.totalPoints || 0,
          completedPercent: Math.round((completed / total) * 100)
        });
      } catch (err) {
        const completed = tasks.filter(t => t.completed).length;
        const total = tasks.length || 1;
        setStats({
          streakCount: profile?.streakCount || 0,
          totalPoints: profile?.totalPoints || 0,
          completedPercent: Math.round((completed / total) * 100)
        });
      }
    };
    fetchStats();
  }, [tasks, profile]);

  const completedToday = tasks.filter(t => t.completed).length;

  return (
    <div style={{ paddingBottom: '100px' }} className="animate-fade-in">
      
      {/* Hero Card - Streak */}
      <div style={{
        background: 'linear-gradient(135deg, #5D5FEF 0%, #8B5CF6 100%)',
        borderRadius: '24px',
        padding: '24px',
        color: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(93,95,239,0.3)',
        marginBottom: '20px',
      }}>
        {/* Decorative elements */}
        <div style={{
          position: 'absolute',
          top: '-30px',
          right: '-30px',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-20px',
          left: '-20px',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.1)',
        }} />
        
        <div style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '48px', fontWeight: 900, margin: 0, lineHeight: 1 }}>
                {stats.streakCount}
              </h2>
              <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', opacity: 0.8, margin: '4px 0 0 0', letterSpacing: '1px' }}>
                Day Streak
              </p>
            </div>
            <div style={{
              width: '56px',
              height: '56px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#FDE047' }}>
                local_fire_department
              </span>
            </div>
          </div>
          
          {/* Progress bar */}
          <div style={{
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '12px',
            padding: '16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', opacity: 0.7, marginBottom: '8px' }}>
              <span>Daily Goal</span>
              <span>{stats.completedPercent}%</span>
            </div>
            <div style={{ height: '10px', background: 'rgba(255,255,255,0.2)', borderRadius: '5px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${stats.completedPercent}%`,
                background: 'linear-gradient(90deg, #FDE047 0%, #FBBF24 100%)',
                borderRadius: '5px',
                transition: 'width 1s ease-out',
                boxShadow: '0 0 10px rgba(253,224,71,0.5)',
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          padding: '20px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          border: '1px solid #F1F5F9',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#FEF3C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
          }}>
            <span className="material-symbols-outlined" style={{ color: '#F59E0B', fontSize: '24px' }}>stars</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#1E293B' }}>
            {stats.totalPoints >= 1000 ? `${(stats.totalPoints / 1000).toFixed(1)}k` : stats.totalPoints}
          </div>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>
            Total Points
          </div>
        </div>
        
        <div style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          padding: '20px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          border: '1px solid #F1F5F9',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#D1FAE5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
          }}>
            <span className="material-symbols-outlined" style={{ color: '#10B981', fontSize: '24px' }}>check_circle</span>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#1E293B' }}>
            {completedToday}
          </div>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>
            Completed Today
          </div>
        </div>
      </div>

      {/* Tip Card */}
      <div style={{
        background: '#EFF6FF',
        borderRadius: '20px',
        padding: '20px',
        display: 'flex',
        gap: '16px',
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
          borderRadius: '50%',
          background: '#DBEAFE',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span className="material-symbols-outlined" style={{ color: '#3B82F6', fontSize: '20px' }}>auto_awesome</span>
        </div>
        <div style={{ position: 'relative', zIndex: 10 }}>
          <p style={{ fontSize: '14px', fontWeight: 500, color: '#475569', fontStyle: 'italic', lineHeight: 1.5, margin: 0 }}>
            "{tip}"
          </p>
          <p style={{ fontSize: '10px', fontWeight: 700, color: '#3B82F6', textTransform: 'uppercase', marginTop: '8px', letterSpacing: '0.5px' }}>
            Daily Mindset
          </p>
        </div>
      </div>

    </div>
  );
};

export default HomeView;
