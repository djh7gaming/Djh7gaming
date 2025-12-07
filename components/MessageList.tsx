import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { User, Sparkles, Volume2, Play } from 'lucide-react';
import { SourceDisplay } from './SourceDisplay';

interface MessageListProps {
  messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  
  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const renderAttachment = (msg: Message) => {
    if (!msg.attachment) return null;
    const { mimeType, previewUrl, isGenerated } = msg.attachment;

    if (mimeType.startsWith('image/')) {
        return (
            <div className="mb-4 rounded-lg overflow-hidden border border-white/10 relative group max-w-sm">
                <img src={previewUrl} alt="Attachment" className="max-h-64 w-auto object-cover" />
                {isGenerated && <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur text-[10px] font-mono rounded text-cyan-400 border border-cyan-500/30">GENERATED</div>}
            </div>
        );
    }
    if (mimeType.startsWith('video/')) {
        return (
            <div className="mb-4 rounded-lg overflow-hidden border border-white/10 relative group max-w-md shadow-2xl">
                 <video controls src={previewUrl} className="w-full h-auto rounded-lg" />
                 {isGenerated && <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur text-[10px] font-mono rounded text-red-400 border border-red-500/30 animate-pulse">VEO_RENDER</div>}
            </div>
        );
    }
    if (mimeType.startsWith('audio/')) {
        return (
            <div className="mb-4 rounded-lg border border-white/10 bg-slate-900/50 p-3 flex items-center gap-3 w-64">
                <div className="w-8 h-8 rounded-full bg-cyan-900/30 flex items-center justify-center">
                    <Play className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="flex-1">
                     <audio controls src={previewUrl} className="w-full h-8" />
                </div>
            </div>
        );
    }
    return null;
  };

  return (
    <div className="flex flex-col space-y-8 pb-4">
      {messages.map((msg) => (
        <div 
          key={msg.id} 
          className={`flex gap-4 md:gap-6 animate-slide-up ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          {msg.role === 'model' && (
            <div className="flex-shrink-0 w-8 h-8 rounded bg-cyan-950/30 border border-cyan-500/20 flex items-center justify-center mt-1 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
          )}

          <div className={`flex flex-col max-w-[90%] md:max-w-3xl w-full ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            {/* Message Header/Label */}
            <div className="flex items-center gap-2 mb-1.5 opacity-70">
                <span className={`text-[10px] font-mono uppercase tracking-widest ${msg.role === 'user' ? 'text-violet-400' : 'text-cyan-400'}`}>
                    {msg.role === 'user' ? 'User_Input' : 'System_Response'}
                </span>
                <span className="text-[10px] text-slate-600 font-mono">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                </span>
                {msg.role === 'model' && (
                  <button 
                    onClick={() => handleSpeak(msg.content)}
                    className="ml-2 opacity-50 hover:opacity-100 transition-opacity text-cyan-400 hover:text-cyan-300"
                    title="Read Aloud"
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>
                )}
            </div>

            <div 
              className={`
                relative px-6 py-4 rounded-sm text-[15px] leading-relaxed border backdrop-blur-sm w-full
                ${msg.role === 'user' 
                  ? 'bg-violet-900/10 border-violet-500/20 text-violet-50 rounded-tr-2xl rounded-bl-2xl max-w-fit' 
                  : 'bg-slate-900/40 border-cyan-500/10 text-slate-200 rounded-tl-2xl rounded-br-2xl shadow-[0_4px_20px_rgba(0,0,0,0.2)]'}
              `}
            >
              {renderAttachment(msg)}

              {msg.role === 'user' ? (
                <div className="font-light whitespace-pre-wrap">{msg.content}</div>
              ) : (
                <div className="prose prose-invert prose-p:font-light prose-headings:font-display prose-headings:text-cyan-100 prose-a:text-cyan-400 prose-strong:text-white prose-code:text-emerald-300 prose-code:font-mono prose-pre:bg-[#050b14] prose-pre:border prose-pre:border-emerald-500/20 prose-pre:shadow-[0_0_15px_rgba(16,185,129,0.05)] max-w-none">
                  <ReactMarkdown>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}
              
              {/* Decorative corner accents */}
              <div className={`absolute top-0 ${msg.role === 'user' ? 'right-0 border-r border-t border-violet-500/30' : 'left-0 border-l border-t border-cyan-500/30'} w-3 h-3`} />
              <div className={`absolute bottom-0 ${msg.role === 'user' ? 'left-0 border-l border-b border-violet-500/30' : 'right-0 border-r border-b border-cyan-500/30'} w-3 h-3`} />
            </div>

            {msg.role === 'model' && msg.groundingMetadata && (
              <div className="mt-4 w-full pl-2 border-l-2 border-cyan-500/10">
                <SourceDisplay metadata={msg.groundingMetadata} />
              </div>
            )}
          </div>

          {msg.role === 'user' && (
            <div className="flex-shrink-0 w-8 h-8 rounded bg-violet-950/30 border border-violet-500/20 flex items-center justify-center mt-1">
              <User className="w-4 h-4 text-violet-400" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};