import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { ChatInput } from './components/ChatInput';
import { MessageList } from './components/MessageList';
import { Sidebar } from './components/Sidebar';
import { FeedbackModal } from './components/FeedbackModal';
import { CoachScanner } from './components/CoachScanner';
import { streamGeminiResponse, generateChatTitle } from './services/geminiService';
import { Message, ChatState, AppMode, Attachment, ChatSession, Language } from './types';
import { Command, Cpu, Languages, ArrowRight, Film } from 'lucide-react';
import { translations } from './utils/translations';

export default function App() {
  const [mode, setMode] = useState<AppMode>('nexus');
  
  // Initialize sessions from localStorage
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('lumiere_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Rehydrate Date objects from ISO strings
        return parsed.map((session: any) => ({
          ...session,
          timestamp: new Date(session.timestamp),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
      }
    } catch (error) {
      console.error("Failed to load sessions from storage:", error);
    }
    return [];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

  // Persist sessions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('lumiere_sessions', JSON.stringify(sessions));
  }, [sessions]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.messages]);

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setMode('nexus'); // Default to nexus or keep current? Usually explicit new chat resets.
    setState({
      messages: [],
      isLoading: false,
      error: null
    });
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      handleNewChat();
    }
  };

  const handleLoadSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMode(session.mode);
      setState({
        messages: session.messages,
        isLoading: false,
        error: null
      });
    }
  };

  const handleModeChange = (newMode: AppMode) => {
    // Always force a fresh session when switching modes to ensure clean context.
    // This solves the issue of "why is it not opening a new chat".
    setCurrentSessionId(null);
    setState({
        messages: [],
        isLoading: false,
        error: null
    });
    setMode(newMode);
  };

  const handleSendMessage = async (content: string, attachment?: Attachment, modeOverride?: AppMode) => {
    if (!content.trim() && !attachment) return;

    const activeMode = modeOverride || mode;
    
    if (modeOverride && modeOverride !== mode) {
      setMode(modeOverride);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      attachment: attachment
    };

    let activeSessionId = currentSessionId;
    let newSessionCreated = false;

    if (!activeSessionId) {
      activeSessionId = Date.now().toString();
      setCurrentSessionId(activeSessionId);
      newSessionCreated = true;
    }

    setState((prev) => {
      const newMessages = [...prev.messages, userMessage];
      return {
        ...prev,
        messages: newMessages,
        isLoading: true,
        error: null,
      };
    });

    setSessions(prev => {
      if (newSessionCreated) {
        return [{
          id: activeSessionId!,
          title: "New Session...", 
          messages: [userMessage],
          timestamp: new Date(),
          mode: activeMode
        }, ...prev];
      } else {
        return prev.map(s => s.id === activeSessionId ? {
          ...s,
          messages: [...s.messages, userMessage],
          timestamp: new Date()
        } : s);
      }
    });

    if (newSessionCreated) {
        generateChatTitle(content).then(title => {
            setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, title } : s));
        });
    }

    try {
      const aiMessageId = (Date.now() + 1).toString();
      const initialAiMessage: Message = {
        id: aiMessageId,
        role: 'model',
        content: '',
        timestamp: new Date(),
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, initialAiMessage],
      }));

      const historyForService = [...state.messages, userMessage];

      await streamGeminiResponse(
        historyForService,
        activeMode, 
        (chunkText, groundingMetadata, generatedAttachment) => {
          setState((prev) => {
            const newMessages = [...prev.messages];
            const lastMessageIndex = newMessages.findIndex((m) => m.id === aiMessageId);
            
            if (lastMessageIndex !== -1) {
              const currentContent = newMessages[lastMessageIndex].content;
              newMessages[lastMessageIndex] = {
                ...newMessages[lastMessageIndex],
                content: currentContent + chunkText,
                groundingMetadata: groundingMetadata || newMessages[lastMessageIndex].groundingMetadata,
                attachment: generatedAttachment || newMessages[lastMessageIndex].attachment
              };
            }
            return { ...prev, messages: newMessages };
          });

          setSessions(prev => prev.map(s => {
            if (s.id === activeSessionId) {
              const msgs = [...s.messages];
              const aiMsgIndex = msgs.findIndex(m => m.id === aiMessageId);
              
              if (aiMsgIndex === -1) {
                 msgs.push({
                   ...initialAiMessage,
                   content: chunkText,
                   groundingMetadata,
                   attachment: generatedAttachment
                 });
              } else {
                msgs[aiMsgIndex] = {
                   ...msgs[aiMsgIndex],
                   content: msgs[aiMsgIndex].content + chunkText,
                   groundingMetadata: groundingMetadata || msgs[aiMsgIndex].groundingMetadata,
                   attachment: generatedAttachment || msgs[aiMsgIndex].attachment
                };
              }
              return { ...s, messages: msgs };
            }
            return s;
          }));
        },
        language // Pass current interface language
      );
    } catch (error) {
      console.error("Error sending message:", error);
      setState((prev) => ({
        ...prev,
        error: "CONNECTION INTERRUPTED. RE-ESTABLISHING LINK...",
      }));
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleHeaderSearch = (query: string) => {
    handleSendMessage(query, undefined, 'nexus');
  };

  const getThemeColors = (m: AppMode) => {
    switch(m) {
      case 'coder': return {
        glow1: 'bg-emerald-500/10',
        glow2: 'bg-green-500/10',
        icon: 'text-emerald-400',
        bgIcon: 'bg-emerald-500/20',
        dot: 'bg-emerald-500',
        border: 'border-emerald-500/20'
      };
      case 'scholar': return {
        glow1: 'bg-amber-500/10',
        glow2: 'bg-orange-500/10',
        icon: 'text-amber-400',
        bgIcon: 'bg-amber-500/20',
        dot: 'bg-amber-500',
        border: 'border-amber-500/20'
      };
      case 'studio': return {
        glow1: 'bg-fuchsia-500/10',
        glow2: 'bg-pink-500/10',
        icon: 'text-fuchsia-400',
        bgIcon: 'bg-fuchsia-500/20',
        dot: 'bg-fuchsia-500',
        border: 'border-fuchsia-500/20'
      };
      case 'analyst': return {
        glow1: 'bg-indigo-500/10',
        glow2: 'bg-blue-500/10',
        icon: 'text-indigo-400',
        bgIcon: 'bg-indigo-500/20',
        dot: 'bg-indigo-500',
        border: 'border-indigo-500/20'
      };
      case 'coach': return {
        glow1: 'bg-orange-500/10',
        glow2: 'bg-amber-500/10',
        icon: 'text-orange-400',
        bgIcon: 'bg-orange-500/20',
        dot: 'bg-orange-500',
        border: 'border-orange-500/20'
      };
      case 'lexicon': return {
        glow1: 'bg-teal-500/10',
        glow2: 'bg-cyan-500/10',
        icon: 'text-teal-400',
        bgIcon: 'bg-teal-500/20',
        dot: 'bg-teal-500',
        border: 'border-teal-500/20'
      };
      case 'polyglot': return {
        glow1: 'bg-lime-500/10',
        glow2: 'bg-green-500/10',
        icon: 'text-lime-400',
        bgIcon: 'bg-lime-500/20',
        dot: 'bg-lime-500',
        border: 'border-lime-500/20'
      };
      case 'motion': return {
        glow1: 'bg-red-500/10',
        glow2: 'bg-rose-500/10',
        icon: 'text-red-400',
        bgIcon: 'bg-red-500/20',
        dot: 'bg-red-500',
        border: 'border-red-500/20'
      };
      case 'human': return {
        glow1: 'bg-rose-500/10',
        glow2: 'bg-red-500/10',
        icon: 'text-rose-400',
        bgIcon: 'bg-rose-500/20',
        dot: 'bg-rose-500',
        border: 'border-rose-500/20'
      };
      default: return { // nexus
        glow1: 'bg-cyan-500/10',
        glow2: 'bg-violet-500/10',
        icon: 'text-cyan-400',
        bgIcon: 'bg-cyan-500/20',
        dot: 'bg-cyan-500',
        border: 'border-cyan-500/20'
      };
    }
  };

  const getPlaceholder = (m: AppMode) => {
    switch(m) {
      case 'nexus': return t.searchPlaceholder;
      case 'coder': return "Describe the functionality or code you need...";
      case 'motion': return "Describe a video to generate (e.g., 'A cyberpunk city in rain')...";
      case 'polyglot': return "Type 'Start' or ask for a specific language lesson...";
      case 'coach': return "How are you feeling right now? (I'll adapt the lesson)...";
      case 'analyst': return "Paste data or ask for a trend analysis...";
      case 'studio': return "Describe an image or design concept...";
      case 'lexicon': return "Enter a word or concept to define...";
      case 'scholar': return "What topic would you like to master today?";
      case 'human': return "Chat with me like a friend...";
      default: return "Message Lumière...";
    }
  };

  const theme = getThemeColors(mode);

  return (
    <div className="flex h-screen bg-void text-slate-200 overflow-hidden relative font-sans selection:bg-cyan-500/30 selection:text-cyan-50">
      <div className="absolute inset-0 bg-grid pointer-events-none z-0" />
      
      <div className={`absolute top-[-20%] left-[20%] w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none animate-pulse-glow transition-colors duration-1000 ${theme.glow1}`} />
      <div className={`absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none transition-colors duration-1000 ${theme.glow2}`} />

      <Sidebar 
        currentMode={mode} 
        onModeChange={handleModeChange}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onNewChat={handleNewChat}
        onLoadSession={handleLoadSession}
        onDeleteSession={handleDeleteSession}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
        currentLanguage={language}
        onLanguageChange={setLanguage}
      />

      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <Header onSearch={handleHeaderSearch} themeColor={theme.icon} currentLanguage={language} />

        <main className="flex-1 overflow-hidden flex flex-col relative w-full">
          {state.messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in scroll-smooth overflow-y-auto">
              
              <div className="relative mb-8 group">
                <div className={`absolute inset-0 blur-xl rounded-full transition-all duration-500 ${theme.bgIcon}`} />
                <div className="relative w-24 h-24 bg-slate-900/80 border border-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-2xl ring-1 ring-white/10">
                  {mode === 'polyglot' ? (
                      <Languages className={`w-10 h-10 animate-pulse transition-colors duration-500 ${theme.icon}`} />
                  ) : mode === 'motion' ? (
                      <Film className={`w-10 h-10 animate-pulse transition-colors duration-500 ${theme.icon}`} />
                  ) : (
                      <Command className={`w-10 h-10 animate-pulse transition-colors duration-500 ${theme.icon}`} />
                  )}
                </div>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-200 to-slate-500 mb-6 tracking-tight uppercase">
                {t.modes[mode]}
              </h1>
              
              <div className="flex items-center justify-center gap-2 text-slate-500/60 text-sm font-mono uppercase tracking-widest mb-4">
                <span className={`w-2 h-2 rounded-full animate-pulse transition-colors duration-500 ${theme.dot}`} />
                {t.welcome.moduleActive}
                <span className={`w-2 h-2 rounded-full animate-pulse transition-colors duration-500 ${theme.dot}`} />
              </div>

              <p className="text-slate-400 text-lg max-w-lg leading-relaxed font-light mb-8">
                {t.welcome[mode]}
              </p>

              {mode === 'coach' && (
                <CoachScanner onScanComplete={(attachment) => {
                    handleSendMessage("Analyze my facial expression to determine my current mood and energy level. Then, based on this mood, generate a structured learning plan or timetable for the next hour.", attachment);
                }} />
              )}

              {mode === 'polyglot' && (
                <div className="flex flex-wrap justify-center gap-3 max-w-3xl animate-slide-up">
                    {[
                        { label: t.polyglotActions.spanish, prompt: "I want to learn Spanish. Start lesson 1." },
                        { label: t.polyglotActions.french, prompt: "I want to learn French. Start lesson 1." },
                        { label: t.polyglotActions.german, prompt: "I want to learn German. Start lesson 1." },
                        { label: t.polyglotActions.japanese, prompt: "I want to learn Japanese. Start lesson 1." },
                        { label: t.polyglotActions.mandarin, prompt: "I want to learn Mandarin Chinese. Start lesson 1." },
                        { label: t.polyglotActions.italian, prompt: "I want to learn Italian. Start lesson 1." },
                        { label: t.polyglotActions.portuguese, prompt: "I want to learn Portuguese. Start lesson 1." },
                        { label: t.polyglotActions.korean, prompt: "I want to learn Korean. Start lesson 1." },
                        { label: t.polyglotActions.russian, prompt: "I want to learn Russian. Start lesson 1." },
                        { label: t.polyglotActions.arabic, prompt: "I want to learn Arabic. Start lesson 1." },
                    ].map((action, i) => (
                        <button
                            key={i}
                            onClick={() => handleSendMessage(action.prompt)}
                            className="flex items-center gap-2 px-5 py-3 bg-slate-900/50 border border-lime-500/20 hover:border-lime-500/50 hover:bg-lime-950/30 rounded-full transition-all text-sm text-slate-300 hover:text-white"
                        >
                            <span>{action.label}</span>
                            <ArrowRight className="w-4 h-4 text-lime-400" />
                        </button>
                    ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
              <div className="max-w-4xl mx-auto w-full">
                <MessageList messages={state.messages} />
                {state.isLoading && (
                  <div className="flex justify-start mb-6 px-4 animate-fade-in">
                    <div className={`flex items-center space-x-3 px-4 py-3 bg-slate-900/50 border rounded-lg backdrop-blur-sm ${theme.border}`}>
                      <Cpu className={`w-4 h-4 animate-spin transition-colors duration-500 ${theme.icon}`} />
                      <span className={`font-mono text-xs animate-pulse tracking-widest transition-colors duration-500 ${theme.icon}`}>
                        {mode === 'coder' ? 'COMPILING...' : 'PROCESSING...'}
                      </span>
                    </div>
                  </div>
                )}
                {state.error && (
                  <div className="flex items-center justify-center my-4">
                    <div className="text-red-400 font-mono text-xs border border-red-900/50 bg-red-950/30 px-4 py-2 rounded uppercase tracking-widest">
                      ⚠ {state.error}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            </div>
          )}
        </main>

        <div className="p-4 z-20">
          <div className="max-w-4xl mx-auto">
            <ChatInput 
              onSend={(msg, att) => handleSendMessage(msg, att)} 
              isLoading={state.isLoading} 
              placeholder={getPlaceholder(mode)}
            />
          </div>
        </div>
      </div>

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </div>
  );
}