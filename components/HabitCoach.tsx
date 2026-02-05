
import React, { useState, useRef, useEffect } from 'react';
import { aiService } from '../services';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography, borderRadius, shadows, zIndex } from '../theme/designSystem';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface HabitCoachProps {
  userName?: string;
}

const HabitCoach: React.FC<HabitCoachProps> = ({ userName }) => {
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const displayName = userName || profile?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'there';

  const styles = {
    fabBtn: {
      position: 'fixed' as const,
      bottom: '7rem',
      right: spacing[6],
      width: '56px',
      height: '56px',
      backgroundColor: colors.primary,
      color: 'white',
      borderRadius: borderRadius.full,
      boxShadow: shadows.lg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: zIndex.popover,
      border: 'none',
      cursor: 'pointer',
      transition: 'transform 0.2s ease',
    },
    container: {
      position: 'fixed' as const,
      inset: 0,
      zIndex: 100,
      backgroundColor: colors.background.primary,
      display: 'flex',
      flexDirection: 'column' as const,
    },
    header: {
      padding: spacing[6],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: `1px solid ${colors.gray[100]}`,
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[3],
    },
    avatarBox: {
      width: '40px',
      height: '40px',
      backgroundColor: `${colors.primary}15`,
      color: colors.primary,
      borderRadius: borderRadius.full,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeBtn: {
      width: '40px',
      height: '40px',
      borderRadius: borderRadius.full,
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: colors.text.primary,
    },
    errorBox: {
      margin: `0 ${spacing[6]}`,
      marginTop: spacing[4],
      padding: spacing[3],
      backgroundColor: `${colors.error}10`,
      color: colors.error,
      fontSize: typography.fontSize.sm,
      borderRadius: borderRadius.xl,
    },
    messagesArea: {
      flex: 1,
      overflowY: 'auto' as const,
      padding: spacing[6],
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacing[4],
    },
    userMessage: {
      maxWidth: '80%',
      padding: spacing[4],
      borderRadius: borderRadius.xl,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      backgroundColor: colors.primary,
      color: 'white',
      borderTopRightRadius: 0,
      boxShadow: `0 4px 12px ${colors.primary}33`,
    },
    aiMessage: {
      maxWidth: '80%',
      padding: spacing[4],
      borderRadius: borderRadius.xl,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      backgroundColor: colors.gray[100],
      color: colors.text.primary,
      borderTopLeftRadius: 0,
    },
    typingIndicator: {
      backgroundColor: colors.gray[100],
      padding: spacing[4],
      borderRadius: borderRadius.xl,
      borderTopLeftRadius: 0,
      display: 'flex',
      gap: spacing[1],
    },
    typingDot: {
      width: '6px',
      height: '6px',
      backgroundColor: colors.gray[400],
      borderRadius: borderRadius.full,
    },
    suggestionsArea: {
      paddingTop: spacing[4],
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacing[2],
    },
    suggestionBtn: {
      display: 'block',
      width: '100%',
      textAlign: 'left' as const,
      padding: spacing[3],
      backgroundColor: colors.gray[50],
      border: 'none',
      borderRadius: borderRadius.xl,
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      cursor: 'pointer',
      transition: 'background-color 0.2s ease',
    },
    inputArea: {
      padding: spacing[6],
      borderTop: `1px solid ${colors.gray[100]}`,
      backgroundColor: colors.background.primary,
    },
    inputRow: {
      display: 'flex',
      gap: spacing[2],
    },
    textInput: {
      flex: 1,
      backgroundColor: colors.gray[100],
      border: 'none',
      borderRadius: borderRadius.xl,
      padding: `${spacing[3]} ${spacing[5]}`,
      fontSize: typography.fontSize.sm,
      color: colors.text.primary,
      outline: 'none',
    },
    sendBtn: {
      width: '48px',
      height: '48px',
      backgroundColor: colors.primary,
      color: 'white',
      borderRadius: borderRadius.xl,
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  };

  // Initialize with greeting when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { role: 'model', text: `Hey ${displayName}! I'm Pulse, your AI habit coach. \n\n⚠️ **Note**: My brain is currently being upgraded! The full AI chat features will be available in the next update. For now, I can only offer basic encouragement.` }
      ]);
      // loadChatHistory(); // Disable history for now
    }
  }, [isOpen, displayName]);

  // Load previous chat history
  const loadChatHistory = async () => {
    // Disabled during maintenance
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setError(null);
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    // AI Service Temporarily Disabled
    // Artificial delay for realism
    await new Promise(resolve => setTimeout(resolve, 800));

    const comingSoonResponses = [
      "I'm currently undergoing maintenance to serve you better! Check back soon for full AI coaching.",
      "My AI systems are getting an upgrade. I'll be fully operational in the next release!",
      "I can't process complex queries just yet, but keep up the great work on your habits!",
      "Feature coming soon! Our team is hard at work making me smarter."
    ];
    
    const aiResponse = comingSoonResponses[Math.floor(Math.random() * comingSoonResponses.length)];
    
    setMessages(prev => [...prev, { role: 'model', text: aiResponse }]);
    setIsTyping(false);
  };

  const suggestedQuestions = [
    "How do I build better habits?",
    "Tips for morning routines?",
    "How to stay motivated?"
  ];

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        style={styles.fabBtn}
      >
        <span className="material-symbols-outlined">smart_toy</span>
      </button>

      {isOpen && (
        <div style={styles.container}>
          <header style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.avatarBox}>
                <span className="material-symbols-outlined">smart_toy</span>
              </div>
              <div>
                <h3 style={{ fontWeight: typography.fontWeight.bold, color: colors.text.primary, margin: 0 }}>Habit Coach</h3>
                <p style={{ 
                  fontSize: '10px', 
                  fontWeight: typography.fontWeight.bold, 
                  textTransform: 'uppercase' as const,
                  color: isTyping ? '#F59E0B' : '#22C55E',
                  margin: 0
                }}>
                  {isTyping ? 'Thinking...' : 'Online'}
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={styles.closeBtn}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </header>

          {error && (
            <div style={styles.errorBox}>
              {error}
            </div>
          )}

          <div ref={scrollRef} style={styles.messagesArea}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={m.role === 'user' ? styles.userMessage : styles.aiMessage}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={styles.typingIndicator}>
                  <div style={{ ...styles.typingDot, animation: 'bounce 1s infinite' }}></div>
                  <div style={{ ...styles.typingDot, animation: 'bounce 1s infinite 0.1s' }}></div>
                  <div style={{ ...styles.typingDot, animation: 'bounce 1s infinite 0.2s' }}></div>
                </div>
              </div>
            )}
            
            {/* Suggested questions when no user messages yet */}
            {messages.length <= 1 && !isTyping && (
              <div style={styles.suggestionsArea}>
                <p style={{ fontSize: typography.fontSize.xs, color: colors.gray[400], fontWeight: typography.fontWeight.medium, margin: 0 }}>Try asking:</p>
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(q)}
                    style={styles.suggestionBtn}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={styles.inputArea}>
            <div style={styles.inputRow}>
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask your coach anything..."
                style={styles.textInput}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                style={{ ...styles.sendBtn, opacity: (!input.trim() || isTyping) ? 0.5 : 1 }}
              >
                 <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HabitCoach;
