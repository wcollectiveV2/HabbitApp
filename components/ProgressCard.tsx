
import React from 'react';
import { Challenge } from '../types';

interface ProgressCardProps {
  challenge: Challenge;
  onClick?: () => void;
  currentIndex?: number;
  totalCount?: number;
  onQuickLog?: () => void;
}

const ProgressCard: React.FC<ProgressCardProps> = ({ 
  challenge, 
  onClick, 
  currentIndex = 0, 
  totalCount = 1,
  onQuickLog 
}) => {
  const isDark = challenge.theme === 'dark';
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (challenge.progress / 100) * circumference;

  const cardStyle: React.CSSProperties = {
    minWidth: '280px',
    padding: '20px',
    borderRadius: '24px',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    background: isDark 
      ? 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)' 
      : 'linear-gradient(135deg, #5D5FEF 0%, #8B5CF6 100%)',
    color: '#FFFFFF',
    boxShadow: isDark 
      ? '0 10px 40px rgba(15,23,42,0.4)' 
      : '0 10px 40px rgba(93,95,239,0.4)',
  };

  return (
    <div 
      onClick={onClick}
      style={cardStyle}
      role="article"
      aria-label={`Challenge: ${challenge.title}, ${challenge.progress}% complete`}
    >
      {/* Decorative circles */}
      <div style={{
        position: 'absolute',
        top: '-30px',
        right: '-30px',
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-20px',
        left: '-20px',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)',
      }} />

      <div style={{ position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 700, 
              lineHeight: 1.3,
              margin: 0,
              marginBottom: '4px',
            }}>
              {challenge.title}
            </h3>
            <p style={{ 
              fontSize: '13px', 
              opacity: 0.8,
              margin: 0,
              fontWeight: 500,
            }}>
              {challenge.timeLeft}
            </p>
          </div>
          
          {/* Progress circle */}
          <div style={{ position: 'relative', width: '64px', height: '64px' }}>
            <svg width="64" height="64" style={{ transform: 'rotate(-90deg)' }}>
              <circle 
                cx="32" cy="32" r={radius}
                fill="transparent" 
                stroke="rgba(255,255,255,0.2)" 
                strokeWidth="5" 
              />
              <circle 
                cx="32" cy="32" r={radius}
                fill="transparent" 
                stroke="#FFFFFF" 
                strokeWidth="5" 
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>
            <span style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 800,
            }}>
              {challenge.progress}%
            </span>
          </div>
        </div>
        
        <div style={{ 
          marginTop: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex' }}>
              {challenge.participants.slice(0, 3).map((p, i) => (
                <img 
                  key={i}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    border: '2px solid',
                    borderColor: isDark ? '#1E293B' : '#5D5FEF',
                    marginLeft: i > 0 ? '-8px' : 0,
                    objectFit: 'cover',
                  }}
                  src={p}
                  alt=""
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://i.pravatar.cc/50?u=${i}`;
                  }}
                />
              ))}
              {challenge.extraParticipants > 0 && (
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: '2px solid',
                  borderColor: isDark ? '#1E293B' : '#5D5FEF',
                  marginLeft: '-8px',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '9px',
                  fontWeight: 700,
                }}>
                  +{challenge.extraParticipants}
                </div>
              )}
            </div>
            <span style={{ 
              fontSize: '10px', 
              fontWeight: 700, 
              textTransform: 'uppercase',
              opacity: 0.8,
              letterSpacing: '0.5px',
            }}>
              {challenge.joinedText}
            </span>
          </div>
        </div>

        {/* Pagination dots */}
        {totalCount > 1 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '6px', 
            marginTop: '16px' 
          }}>
            {Array.from({ length: totalCount }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === currentIndex ? '16px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  background: i === currentIndex ? '#FFFFFF' : 'rgba(255,255,255,0.3)',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressCard;
