
import React, { useState, useRef, useEffect } from 'react';
import { aiService } from '../services';
import { useAuth } from '../context/AuthContext';

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
        className="fixed bottom-28 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center z-40 active:scale-90 transition-transform"
      >
        <span className="material-symbols-outlined">smart_toy</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-background-dark flex flex-col animate-in slide-in-from-bottom duration-300">
          <header className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined">smart_toy</span>
              </div>
              <div>
                <h3 className="font-bold">Habit Coach</h3>
                <p className={`text-[10px] font-bold uppercase ${isTyping ? 'text-amber-500' : 'text-green-500'}`}>
                  {isTyping ? 'Thinking...' : 'Online'}
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center">
              <span className="material-symbols-outlined">close</span>
            </button>
          </header>

          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl">
              {error}
            </div>
          )}

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium ${
                  m.role === 'user' 
                  ? 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/20' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none flex gap-1">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
            
            {/* Suggested questions when no user messages yet */}
            {messages.length <= 1 && !isTyping && (
              <div className="space-y-2 pt-4">
                <p className="text-xs text-slate-400 font-medium">Try asking:</p>
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(q)}
                    className="block w-full text-left p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-background-dark">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask your coach anything..."
                className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl px-5 text-sm focus:ring-2 focus:ring-primary"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center disabled:opacity-50"
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
