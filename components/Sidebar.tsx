import React, { useState } from 'react';
import { AppMode, ChatSession, Language } from '../types';
import { translations } from '../utils/translations';
import { 
  Globe, 
  Code2, 
  GraduationCap, 
  Palette, 
  MessageCircleHeart,
  Aperture,
  MessageSquarePlus,
  LogIn,
  UserPlus,
  Plus,
  MessageSquare,
  Trash2,
  History,
  BarChart3,
  BrainCircuit,
  BookOpen,
  Languages,
  ChevronDown,
  Film
} from 'lucide-react';

interface SidebarProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onNewChat: () => void;
  onLoadSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string, e: React.MouseEvent) => void;
  onOpenFeedback: () => void;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentMode, 
  onModeChange, 
  sessions, 
  currentSessionId,
  onNewChat,
  onLoadSession,
  onDeleteSession,
  onOpenFeedback,
  currentLanguage,
  onLanguageChange
}) => {
  const t = translations[currentLanguage];

  const modes: { id: AppMode; icon: React.ElementType; label: string; desc: string }[] = [
    { id: 'nexus', icon: Globe, label: t.modes.nexus, desc: t.modeDesc.nexus },
    { id: 'coach', icon: BrainCircuit, label: t.modes.coach, desc: t.modeDesc.coach },
    { id: 'motion', icon: Film, label: t.modes.motion, desc: t.modeDesc.motion },
    { id: 'polyglot', icon: Languages, label: t.modes.polyglot, desc: t.modeDesc.polyglot },
    { id: 'lexicon', icon: BookOpen, label: t.modes.lexicon, desc: t.modeDesc.lexicon },
    { id: 'coder', icon: Code2, label: t.modes.coder, desc: t.modeDesc.coder },
    { id: 'scholar', icon: GraduationCap, label: t.modes.scholar, desc: t.modeDesc.scholar },
    { id: 'studio', icon: Palette, label: t.modes.studio, desc: t.modeDesc.studio },
    { id: 'analyst', icon: BarChart3, label: t.modes.analyst, desc: t.modeDesc.analyst },
    { id: 'human', icon: MessageCircleHeart, label: t.modes.human, desc: t.modeDesc.human },
  ];

  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const getModeStyles = (modeId: AppMode) => {
    switch(modeId) {
      case 'coder': return {
        activeBg: 'bg-emerald-950/30',
        activeText: 'text-emerald-100',
        activeIcon: 'text-emerald-400',
        hoverText: 'group-hover:text-emerald-400',
        bar: 'bg-emerald-500',
        shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.8)]',
        border: 'border-emerald-500/20'
      };
      case 'scholar': return {
        activeBg: 'bg-amber-950/30',
        activeText: 'text-amber-100',
        activeIcon: 'text-amber-400',
        hoverText: 'group-hover:text-amber-400',
        bar: 'bg-amber-500',
        shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.8)]',
        border: 'border-amber-500/20'
      };
      case 'studio': return {
        activeBg: 'bg-fuchsia-950/30',
        activeText: 'text-fuchsia-100',
        activeIcon: 'text-fuchsia-400',
        hoverText: 'group-hover:text-fuchsia-400',
        bar: 'bg-fuchsia-500',
        shadow: 'shadow-[0_0_15px_rgba(217,70,239,0.8)]',
        border: 'border-fuchsia-500/20'
      };
      case 'analyst': return {
        activeBg: 'bg-indigo-950/30',
        activeText: 'text-indigo-100',
        activeIcon: 'text-indigo-400',
        hoverText: 'group-hover:text-indigo-400',
        bar: 'bg-indigo-500',
        shadow: 'shadow-[0_0_15px_rgba(99,102,241,0.8)]',
        border: 'border-indigo-500/20'
      };
      case 'human': return {
        activeBg: 'bg-rose-950/30',
        activeText: 'text-rose-100',
        activeIcon: 'text-rose-400',
        hoverText: 'group-hover:text-rose-400',
        bar: 'bg-rose-500',
        shadow: 'shadow-[0_0_15px_rgba(244,63,94,0.8)]',
        border: 'border-rose-500/20'
      };
      case 'coach': return {
        activeBg: 'bg-orange-950/30',
        activeText: 'text-orange-100',
        activeIcon: 'text-orange-400',
        hoverText: 'group-hover:text-orange-400',
        bar: 'bg-orange-500',
        shadow: 'shadow-[0_0_15px_rgba(251,146,60,0.8)]',
        border: 'border-orange-500/20'
      };
      case 'lexicon': return {
        activeBg: 'bg-teal-950/30',
        activeText: 'text-teal-100',
        activeIcon: 'text-teal-400',
        hoverText: 'group-hover:text-teal-400',
        bar: 'bg-teal-500',
        shadow: 'shadow-[0_0_15px_rgba(45,212,191,0.8)]',
        border: 'border-teal-500/20'
      };
      case 'polyglot': return {
        activeBg: 'bg-lime-950/30',
        activeText: 'text-lime-100',
        activeIcon: 'text-lime-400',
        hoverText: 'group-hover:text-lime-400',
        bar: 'bg-lime-500',
        shadow: 'shadow-[0_0_15px_rgba(132,204,22,0.8)]',
        border: 'border-lime-500/20'
      };
      case 'motion': return {
        activeBg: 'bg-red-950/30',
        activeText: 'text-red-100',
        activeIcon: 'text-red-400',
        hoverText: 'group-hover:text-red-400',
        bar: 'bg-red-500',
        shadow: 'shadow-[0_0_15px_rgba(239,68,68,0.8)]',
        border: 'border-red-500/20'
      };
      default: return {
        activeBg: 'bg-cyan-950/30',
        activeText: 'text-cyan-100',
        activeIcon: 'text-cyan-400',
        hoverText: 'group-hover:text-cyan-400',
        bar: 'bg-cyan-500',
        shadow: 'shadow-[0_0_15px_rgba(6,182,212,0.8)]',
        border: 'border-cyan-500/20'
      };
    }
  };

  const currentStyles = getModeStyles(currentMode);

  return (
    <div className="w-20 md:w-64 flex-shrink-0 bg-slate-950/80 backdrop-blur-xl border-r border-white/5 flex flex-col z-30 transition-colors duration-500">
      <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-white/5 gap-3">
        <Aperture className={`w-8 h-8 animate-spin-slow transition-colors duration-500 ${currentStyles.activeIcon}`} />
        <span className="hidden md:block text-xl font-bold font-display tracking-wider text-white">
          {t.modes.nexus}
        </span>
      </div>

      <div className="p-3">
        <button 
          onClick={onNewChat}
          className={`
            w-full flex items-center justify-center gap-2 py-3 rounded-lg transition-all duration-300 group relative overflow-hidden border border-white/10
            ${currentStyles.activeBg} hover:brightness-110
          `}
        >
          <Plus className={`w-5 h-5 ${currentStyles.activeIcon}`} />
          <span className={`hidden md:block font-medium ${currentStyles.activeText}`}>{t.newChat}</span>
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:animate-scan`} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="px-4 mb-2 mt-2 hidden md:block">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{t.selectModule}</p>
        </div>
        
        <div className="flex flex-col gap-1 mb-6">
          {modes.map((mode) => {
            const styles = getModeStyles(mode.id);
            const isActive = currentMode === mode.id;

            return (
              <button
                key={mode.id}
                onClick={() => onModeChange(mode.id)}
                className={`
                  relative group flex items-center px-4 py-3 md:px-6 mx-2 md:mx-0 rounded-xl md:rounded-none transition-all duration-300
                  ${isActive ? styles.activeBg + ' ' + styles.activeText : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}
                `}
              >
                {isActive && (
                  <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-r hidden md:block ${styles.bar} ${styles.shadow}`} />
                )}
                <mode.icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110 ' + styles.activeIcon : styles.hoverText}`} />
                <div className="hidden md:flex flex-col items-start ml-4 overflow-hidden">
                  <span className={`font-display text-sm font-medium tracking-wide ${isActive ? 'text-white' : ''}`}>
                    {mode.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Recent History Section */}
        {sessions.length > 0 && (
          <div className="border-t border-white/5 pt-4">
             <div className="px-4 mb-3 hidden md:flex items-center gap-2 text-slate-500">
              <History className="w-3 h-3" />
              <p className="text-[10px] font-mono uppercase tracking-widest">{t.recent}</p>
            </div>
            <div className="flex flex-col gap-1">
              {sessions.map((session) => (
                <div 
                  key={session.id}
                  className={`
                    group flex items-center justify-between px-4 py-2 mx-2 rounded-lg transition-colors cursor-pointer
                    ${currentSessionId === session.id ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}
                  `}
                  onClick={() => onLoadSession(session.id)}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <MessageSquare className={`w-4 h-4 flex-shrink-0 ${currentSessionId === session.id ? 'text-cyan-400' : 'text-slate-600'}`} />
                    <span className="hidden md:block text-xs truncate font-light">
                      {session.title || "New Conversation"}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => onDeleteSession(session.id, e)}
                    className="hidden md:block p-1 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-white/5 space-y-2 relative">
        {/* Language Selector */}
        <div className="relative">
          <button 
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors group"
          >
            <Globe className="w-4 h-4 group-hover:text-cyan-400 transition-colors" />
            <span className="hidden md:block text-xs font-medium uppercase">{currentLanguage}</span>
            <ChevronDown className={`w-3 h-3 ml-auto transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isLangMenuOpen && (
            <div className="absolute bottom-full left-0 w-full mb-2 bg-slate-900 border border-white/10 rounded-lg overflow-hidden shadow-xl animate-fade-in z-50">
              {[
                { code: 'en', label: 'English' },
                { code: 'es', label: 'Español' },
                { code: 'fr', label: 'Français' },
                { code: 'hi', label: 'Hindi' },
                { code: 'zh', label: 'Chinese' }
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onLanguageChange(lang.code as Language);
                    setIsLangMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs hover:bg-white/10 ${currentLanguage === lang.code ? 'text-cyan-400 bg-white/5' : 'text-slate-400'}`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button 
          onClick={onOpenFeedback}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors group"
        >
            <MessageSquarePlus className="w-4 h-4 group-hover:text-cyan-400 transition-colors" />
            <span className="hidden md:block text-xs font-medium">{t.feedback}</span>
        </button>
        
        <div className="flex gap-2">
             <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors border border-white/5">
                <LogIn className="w-4 h-4" />
                <span className="hidden md:block text-xs font-medium">{t.login}</span>
            </button>
            <button className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-slate-900 font-bold transition-colors shadow-lg shadow-cyan-500/20 ${currentStyles.bar} hover:brightness-110`}>
                <UserPlus className="w-4 h-4" />
                <span className="hidden md:block text-xs">{t.signup}</span>
            </button>
        </div>
      </div>
    </div>
  );
};
