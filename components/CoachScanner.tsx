import React, { useRef, useState, useEffect } from 'react';
import { Camera, ScanFace, X, BrainCircuit, RefreshCw } from 'lucide-react';
import { Attachment } from '../types';

interface CoachScannerProps {
  onScanComplete: (attachment: Attachment) => void;
}

export const CoachScanner: React.FC<CoachScannerProps> = ({ onScanComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreamActive(true);
      }
    } catch (err) {
      console.error("Camera Error:", err);
      setError("Camera access denied or unavailable.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreamActive(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      setIsScanning(true);
      
      // Simulate scan delay for effect
      setTimeout(() => {
        const context = canvasRef.current!.getContext('2d');
        if (context && videoRef.current) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            context.drawImage(videoRef.current, 0, 0);
            
            const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
            const base64Data = dataUrl.split(',')[1];

            // Convert dataURL to File object for consistency with Attachment type
            fetch(dataUrl)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], "bio-scan.jpg", { type: "image/jpeg" });
                
                const attachment: Attachment = {
                    file: file,
                    previewUrl: dataUrl,
                    base64: base64Data,
                    mimeType: "image/jpeg"
                };
                
                onScanComplete(attachment);
                stopCamera();
                setIsScanning(false);
            });
        }
      }, 1500);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera(); // Cleanup on unmount
    };
  }, []);

  if (!isStreamActive) {
    return (
      <div className="flex flex-col items-center justify-center p-6 border border-orange-500/20 bg-orange-950/10 rounded-2xl max-w-md mx-auto mt-8 backdrop-blur-sm animate-fade-in">
        <div className="relative mb-6">
            <div className="absolute inset-0 bg-orange-500/30 blur-xl rounded-full animate-pulse" />
            <div className="relative w-16 h-16 bg-slate-900 border border-orange-500/50 rounded-xl flex items-center justify-center">
                <BrainCircuit className="w-8 h-8 text-orange-400" />
            </div>
        </div>
        
        <h3 className="text-xl font-display font-bold text-white mb-2">Initialize Bio-Metric Scan</h3>
        <p className="text-slate-400 text-center text-sm mb-6 max-w-xs">
          Zenith Coach needs to analyze your facial micro-expressions to determine your energy levels and generate an optimized lesson plan.
        </p>
        
        {error ? (
          <div className="text-red-400 text-xs bg-red-950/30 px-3 py-2 rounded mb-4 border border-red-500/30">
            {error}
          </div>
        ) : (
          <button 
            onClick={startCamera}
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] font-medium text-sm group"
          >
            <Camera className="w-4 h-4" />
            Activate Sensor Array
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative max-w-md mx-auto mt-6 rounded-2xl overflow-hidden border border-orange-500/30 shadow-2xl animate-fade-in">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className={`w-full h-auto bg-black ${isScanning ? 'opacity-50' : 'opacity-100'}`}
      />
      <canvas ref={canvasRef} className="hidden" />
      
      {/* HUD Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 left-4 border-l-2 border-t-2 border-orange-400 w-8 h-8" />
        <div className="absolute top-4 right-4 border-r-2 border-t-2 border-orange-400 w-8 h-8" />
        <div className="absolute bottom-4 left-4 border-l-2 border-b-2 border-orange-400 w-8 h-8" />
        <div className="absolute bottom-4 right-4 border-r-2 border-b-2 border-orange-400 w-8 h-8" />
        
        {/* Scanning Animation Line */}
        {isStreamActive && !isScanning && (
             <div className="absolute top-0 left-0 w-full h-1 bg-orange-400/50 shadow-[0_0_15px_rgba(249,115,22,1)] animate-scan opacity-50" />
        )}
        
        {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                <div className="flex flex-col items-center">
                    <RefreshCw className="w-10 h-10 text-orange-400 animate-spin" />
                    <span className="mt-4 text-orange-200 font-mono text-xs tracking-widest uppercase">Analyzing Neural State...</span>
                </div>
            </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent flex justify-center gap-4">
        <button 
          onClick={stopCamera}
          className="p-3 rounded-full bg-slate-800/80 text-white hover:bg-red-900/80 transition-colors backdrop-blur-md"
        >
          <X className="w-5 h-5" />
        </button>
        <button 
          onClick={captureImage}
          disabled={isScanning}
          className="px-6 py-3 rounded-full bg-orange-600/90 hover:bg-orange-500 text-white font-medium flex items-center gap-2 backdrop-blur-md shadow-[0_0_20px_rgba(249,115,22,0.4)]"
        >
          <ScanFace className="w-5 h-5" />
          <span>Analyze Mood</span>
        </button>
      </div>
    </div>
  );
};