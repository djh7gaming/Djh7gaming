import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { ArrowRight, Sparkles, Mic, Paperclip, X, StopCircle } from 'lucide-react';
import { Attachment } from '../types';

interface ChatInputProps {
  onSend: (message: string, attachment?: Attachment) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading }) => {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [attachment, setAttachment] = useState<Attachment | undefined>(undefined);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (attachment?.previewUrl) {
        URL.revokeObjectURL(attachment.previewUrl);
      }
    };
  }, [attachment]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64String = reader.result as string;
          const base64Data = base64String.split(',')[1];
          
          setAttachment({
            previewUrl: URL.createObjectURL(audioBlob),
            base64: base64Data,
            mimeType: 'audio/wav'
          });
        };
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Extract base64 data part
        const base64Data = base64String.split(',')[1];
        
        setAttachment({
          file,
          previewUrl: URL.createObjectURL(file),
          base64: base64Data,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const clearAttachment = () => {
    setAttachment(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = () => {
    if ((input.trim() || attachment) && !isLoading) {
      onSend(input, attachment);
      setInput('');
      clearAttachment();
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [input]);

  const getAttachmentIcon = () => {
    if (!attachment) return null;
    if (attachment.mimeType.startsWith('image/')) return <img src={attachment.previewUrl} alt="Preview" className="h-full w-full object-cover" />;
    if (attachment.mimeType.startsWith('video/')) return <video src={attachment.previewUrl} className="h-full w-full object-cover" />;
    return <div className="flex items-center justify-center h-full bg-slate-800 text-xs font-mono">AUDIO</div>;
  };

  return (
    <div className="relative group w-full">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*,video/*,audio/*"
        className="hidden"
      />

      <div 
        className={`absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-violet-500 to-cyan-500 rounded-2xl opacity-0 transition-opacity duration-500 blur-lg ${isFocused ? 'opacity-30' : 'group-hover:opacity-10'}`} 
      />
      
      <div 
        className={`
          relative bg-slate-950/80 backdrop-blur-xl rounded-xl flex flex-col border transition-all duration-300
          ${isFocused ? 'border-cyan-500/40 shadow-[0_0_30px_-10px_rgba(6,182,212,0.15)]' : 'border-white/10'}
        `}
      >
        {/* Attachment Preview */}
        {attachment && (
          <div className="p-3 pb-0">
            <div className="relative inline-block group/preview">
              <div className="absolute inset-0 bg-cyan-500/20 blur-md rounded-lg group-hover/preview:opacity-100 opacity-50 transition-opacity" />
              <div className="relative h-20 w-32 rounded-lg border border-cyan-500/30 overflow-hidden bg-black">
                {getAttachmentIcon()}
              </div>
              <button 
                onClick={clearAttachment}
                className="absolute -top-2 -right-2 bg-slate-900 text-slate-400 hover:text-white rounded-full p-1 border border-white/10 hover:border-red-500/50 hover:bg-red-950/50 transition-colors shadow-lg"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-end p-2">
          <div className="pl-2 pb-3 flex gap-2">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-slate-500 hover:text-cyan-400 transition-colors p-1.5 rounded-lg hover:bg-cyan-950/30"
              title="Attach File"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <button 
              onClick={toggleRecording}
              className={`transition-colors p-1.5 rounded-lg hover:bg-cyan-950/30 ${isRecording ? 'text-red-400 animate-pulse bg-red-950/20' : 'text-slate-500 hover:text-cyan-400'}`}
              title="Record Audio"
            >
              {isRecording ? <StopCircle className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>
          
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={isRecording ? "Recording Audio..." : "Initialize search sequence..."}
            className="flex-1 bg-transparent border-0 focus:ring-0 text-slate-100 placeholder:text-slate-600 resize-none py-3 px-3 min-h-[48px] max-h-[200px] text-base leading-relaxed font-light font-sans"
            rows={1}
            disabled={isLoading}
          />

          <button
            onClick={handleSend}
            disabled={(!input.trim() && !attachment) || isLoading}
            className={`
              p-2.5 rounded-lg mb-0.5 transition-all duration-300 flex items-center justify-center
              ${(input.trim() || attachment) && !isLoading 
                ? 'bg-cyan-500 text-void hover:bg-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.5)] transform hover:-translate-y-0.5' 
                : 'bg-white/5 text-slate-600 cursor-not-allowed'}
            `}
          >
            {isLoading ? (
              <Sparkles className="w-5 h-5 animate-spin" />
            ) : (
              <ArrowRight className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
      
      <div className="flex justify-center items-center mt-3 gap-4 opacity-50 hover:opacity-80 transition-opacity">
        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-slate-700" />
        <span className="text-[10px] font-mono text-slate-500 tracking-[0.2em] uppercase flex items-center gap-2">
            AI-Powered Research <span className="w-1 h-1 rounded-full bg-cyan-500" /> Multimodal
        </span>
        <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-slate-700" />
      </div>
    </div>
  );
};
