import React, { useState } from 'react';
import { Aperture, Search } from 'lucide-react';
import { translations } from '../utils/translations';
import { Language } from '../types';

interface HeaderProps {
  onSearch: (query: string) => void;
  themeColor?: string;
  currentLanguage: Language;
}

export const Header: React.FC<HeaderProps> = ({ onSearch, themeColor = 'text-cyan-400', currentLanguage }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const t = translations[currentLanguage];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      onSearch(searchQuery);
      setSearchQuery('');
      // Optional: blur after search
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-void/80 backdrop-blur-xl hud-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo Section */}
        <div className="flex items-center gap-3 group cursor-pointer flex-shrink-0">
          <div className="relative">
            <div className={`absolute inset-0 blur-md rounded-full opacity-50 group-hover:opacity-100 transition-all bg-current ${themeColor.replace('text-', 'bg-')}/20`} />
            <Aperture className={`relative w-6 h-6 group-hover:rotate-180 transition-transform duration-700 ease-in-out ${themeColor}`} />
          </div>
          <span className="hidden sm:block text-xl font-bold font-display tracking-wider text-white group-hover:text-cyan-100 transition-colors">
            {t.modes.nexus}
          </span>
        </div>
        
        {/* Search Bar */}
        <div className="flex-1 max-w-xl mx-auto">
            <div className={`
                relative group flex items-center bg-slate-900/50 border rounded-lg transition-all duration-300
                ${isFocused 
                    ? `border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]` 
                    : 'border-white/10 hover:border-white/20'
                }
            `}>
                <div className="pl-3">
                    <Search className={`w-4 h-4 ${isFocused ? 'text-cyan-400' : 'text-slate-500'}`} />
                </div>
                <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={t.searchPlaceholder}
                    className="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-200 placeholder:text-slate-600 h-9 font-light"
                />
                <div className="hidden sm:flex pr-2 pointer-events-none">
                    <span className="text-[10px] text-slate-700 font-mono border border-slate-800 rounded px-1.5 py-0.5">{t.enter}</span>
                </div>
            </div>
        </div>
        
        {/* Status Indicator */}
        <div className="hidden md:flex items-center gap-6 flex-shrink-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-cyan-500/20 bg-cyan-950/10">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-widest opacity-80">Gemini v2.5 Flash</span>
            </div>
        </div>
      </div>
    </header>
  );
};