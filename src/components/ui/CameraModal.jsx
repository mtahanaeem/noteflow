import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CameraModal({ open, onClose, onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [step, setStep] = useState('loading');
  const [error, setError] = useState(null);
  const [captured, setCaptured] = useState(null);
  const facingRef = useRef('environment');

  useEffect(() => {
    if (!open) return;
    setStep('loading');
    setError(null);
    setCaptured(null);

    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingRef.current, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        setStep('camera');
      } catch {
        setError('Camera access denied. Opening file picker instead...');
        setStep('error');
        setTimeout(() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.capture = 'environment';
          input.onchange = (e) => {
            const file = e.target.files?.[0];
            if (file) onCapture(file);
            onClose();
          };
          input.click();
        }, 1500);
      }
    })();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [open, onCapture, onClose]);

  useEffect(() => {
    if (step === 'camera' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [step]);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');
    setCaptured(dataUrl);
    stopStream();
    setStep('captured');
  };

  const retake = () => {
    setCaptured(null);
    setStep('loading');
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingRef.current, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        streamRef.current = stream;
        setStep('camera');
      } catch {
        setError('Camera access denied');
        setStep('error');
      }
    })();
  };

  const acceptPhoto = () => {
    if (!captured) return;
    fetch(captured)
      .then((r) => r.blob())
      .then((blob) => {
        const file = new File([blob], `camera-${Date.now()}.png`, { type: 'image/png' });
        onCapture(file);
        onClose();
      });
  };

  const switchCamera = () => {
    facingRef.current = facingRef.current === 'environment' ? 'user' : 'environment';
    stopStream();
    setStep('loading');
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingRef.current, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        streamRef.current = stream;
        setStep('camera');
      } catch {
        setError('Camera access denied');
        setStep('error');
      }
    })();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-sm glass rounded-card overflow-hidden shadow-glass-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {step === 'loading' ? (
              <div className="p-8 text-center">
                <div className="w-10 h-10 border-2 border-text-primary/30 border-t-text-primary rounded-full animate-spin mx-auto mb-3" />
                <p className="text-text-primary text-sm">Requesting camera access...</p>
              </div>
            ) : step === 'error' ? (
              <div className="p-8 text-center">
                <p className="text-text-primary text-sm">{error}</p>
              </div>
            ) : step === 'camera' ? (
              <div>
                <div className="relative bg-black flex items-center justify-center" style={{ minHeight: 300 }}>
                  <video ref={videoRef} autoPlay playsInline muted className="w-full" style={{ display: 'block', maxHeight: 400 }} />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="absolute inset-0 border-[3px] border-white/30 rounded-[24px] m-6 pointer-events-none" />
                </div>
                <div className="flex items-center justify-center gap-6 p-4">
                  <button onClick={onClose} className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-text-primary hover:bg-white/30 transition-all">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                  <button onClick={takePhoto} className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                    <div className="w-14 h-14 rounded-full border-4 border-text-primary" />
                  </button>
                  <button onClick={switchCamera} className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-text-primary hover:bg-white/30 transition-all">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <img src={captured} alt="Captured" className="w-full" style={{ display: 'block' }} />
                <div className="flex gap-2 p-4">
                  <button onClick={retake} className="flex-1 py-2.5 rounded-pill bg-white/20 text-text-primary text-sm hover:bg-white/30 transition-all">
                    Retake
                  </button>
                  <button onClick={acceptPhoto} className="flex-1 py-2.5 rounded-pill bg-white/30 text-text-primary text-sm font-medium hover:bg-white/40 transition-all">
                    Use Photo
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
