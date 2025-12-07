import React, { useState } from 'react';
import { X, Star, Send, CheckCircle2 } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setRating(0);
        setComment('');
        onClose();
      }, 2000);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-fade-in" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/10 blur-[50px] rounded-full pointer-events-none" />

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-bold text-white tracking-wide">
              System Feedback
            </h2>
            <button 
              onClick={onClose}
              className="text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {isSubmitted ? (
            <div className="py-12 flex flex-col items-center text-center animate-fade-in">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Feedback Received</h3>
              <p className="text-slate-400">Thank you for helping improve Lumière.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-mono text-cyan-400 uppercase tracking-widest">Rate Experience</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star 
                        className={`w-8 h-8 ${
                          star <= (hoverRating || rating) 
                            ? 'fill-cyan-400 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' 
                            : 'text-slate-700'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-cyan-400 uppercase tracking-widest">Observations</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Describe your experience with the neural interface..."
                  className="w-full h-32 bg-slate-950/50 border border-white/10 rounded-lg p-3 text-slate-200 placeholder:text-slate-700 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all resize-none text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={rating === 0}
                className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-300 ${
                  rating === 0 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                }`}
              >
                <Send className="w-4 h-4" />
                Transmit Data
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};