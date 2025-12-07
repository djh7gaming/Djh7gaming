import React from 'react';
import { GroundingMetadata } from '../types';
import { Globe, ExternalLink, Database } from 'lucide-react';

interface SourceDisplayProps {
  metadata: GroundingMetadata;
}

export const SourceDisplay: React.FC<SourceDisplayProps> = ({ metadata }) => {
  const chunks = metadata.groundingChunks || [];
  
  // Filter chunks that have web sources and dedup by URI
  const sources = chunks
    .filter(c => c.web?.uri && c.web?.title)
    .reduce((acc, current) => {
      const x = acc.find(item => item.web?.uri === current.web?.uri);
      if (!x && current.web) {
        return acc.concat([current]);
      }
      return acc;
    }, [] as typeof chunks);

  if (sources.length === 0) return null;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-3 text-[10px] font-mono font-bold text-cyan-500/70 uppercase tracking-widest">
        <Database className="w-3 h-3" />
        <span>Referenced_Data_Points</span>
        <div className="h-[1px] flex-1 bg-cyan-500/10" />
      </div>
      <div className="flex flex-wrap gap-2">
        {sources.map((source, idx) => (
          <a
            key={idx}
            href={source.web?.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center gap-3 px-3 py-2 bg-slate-900/80 hover:bg-cyan-950/30 border border-white/5 hover:border-cyan-400/30 rounded backdrop-blur-md transition-all duration-300 overflow-hidden"
          >
            {/* Scan line effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent translate-x-[-100%] group-hover:animate-scan pointer-events-none" />
            
            <div className="flex-shrink-0 w-5 h-5 rounded-sm bg-slate-800 text-cyan-500/50 border border-white/5 flex items-center justify-center text-[10px] font-mono group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition-colors">
              {idx + 1}
            </div>
            <div className="flex flex-col max-w-[160px]">
              <span className="text-xs font-medium text-slate-300 truncate group-hover:text-cyan-100 transition-colors font-display">
                {source.web?.title}
              </span>
              <span className="text-[10px] text-slate-600 truncate group-hover:text-cyan-500/60 font-mono">
                {new URL(source.web!.uri).hostname.replace('www.', '')}
              </span>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 transition-colors ml-auto" />
          </a>
        ))}
      </div>
    </div>
  );
};