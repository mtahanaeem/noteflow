import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function DrawingCanvas({ onSave, onBack }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawing = useRef(false);
  const [color, setColor] = useState('#1A1A2E');
  const [lineWidth, setLineWidth] = useState(3);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    const w = rect.width - 32;
    canvas.width = w;
    canvas.height = 350;
    canvas.style.width = `${w}px`;
    canvas.style.height = '350px';
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctxRef.current = ctx;
  }, []);

  const getPos = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  const startDraw = useCallback((e) => {
    e.preventDefault();
    drawing.current = true;
    const ctx = ctxRef.current;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }, [getPos]);

  const draw = useCallback((e) => {
    e.preventDefault();
    if (!drawing.current) return;
    const ctx = ctxRef.current;
    const pos = getPos(e);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }, [getPos, color, lineWidth]);

  const stopDraw = useCallback(() => {
    drawing.current = false;
  }, []);

  const clearCanvas = () => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (blob) onSave(blob);
    }, 'image/png');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass rounded-card p-4 shadow-glass-lg"
    >
      <div className="flex items-center justify-between mb-3">
        <button onClick={onBack} className="text-sm text-text-primary/60 hover:text-text-primary">
          ← Back
        </button>
        <h3 className="font-display font-bold text-text-primary text-sm">Drawing Canvas</h3>
        <div />
      </div>
      <div
        className="rounded-xl overflow-hidden mb-3 touch-none"
        style={{ border: '1px solid rgba(0,0,0,0.1)' }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
          className="cursor-crosshair"
          style={{ display: 'block' }}
        />
      </div>
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-1">
          {['#1A1A2E', '#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6'].map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full border-2 transition-all ${color === c ? 'border-text-primary scale-110' : 'border-transparent'}`}
              style={{ background: c }}
            />
          ))}
        </div>
        <div className="flex items-center gap-1">
          {[2, 4, 6, 8].map((w) => (
            <button
              key={w}
              onClick={() => setLineWidth(w)}
              className={`rounded-full transition-all ${lineWidth === w ? 'bg-text-primary' : 'bg-text-primary/30'}`}
              style={{ width: 8 + w, height: 8 + w }}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={clearCanvas} className="flex-1 py-2 rounded-pill bg-white/20 text-text-primary text-sm hover:bg-white/30 transition-all">
          Clear
        </button>
        <button onClick={saveCanvas} className="flex-1 py-2 rounded-pill bg-white/30 text-text-primary text-sm font-medium hover:bg-white/40 transition-all">
          Insert Drawing
        </button>
      </div>
    </motion.div>
  );
}

function HandwritingInput({ onSave, onBack }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    const w = rect.width - 32;
    canvas.width = w;
    canvas.height = 200;
    canvas.style.width = `${w}px`;
    canvas.style.height = '200px';
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#1A1A2E';
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctxRef.current = ctx;
  }, []);

  const getPos = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  const startDraw = useCallback((e) => {
    e.preventDefault();
    drawing.current = true;
    const ctx = ctxRef.current;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }, [getPos]);

  const draw = useCallback((e) => {
    e.preventDefault();
    if (!drawing.current) return;
    const ctx = ctxRef.current;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }, [getPos]);

  const stopDraw = useCallback(() => {
    drawing.current = false;
  }, []);

  const clearCanvas = () => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (blob) onSave(blob);
    }, 'image/png');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass rounded-card p-4 shadow-glass-lg"
    >
      <div className="flex items-center justify-between mb-3">
        <button onClick={onBack} className="text-sm text-text-primary/60 hover:text-text-primary">
          ← Back
        </button>
        <h3 className="font-display font-bold text-text-primary text-sm">Handwriting Input</h3>
        <div />
      </div>
      <div
        className="rounded-xl overflow-hidden mb-3 touch-none"
        style={{ border: '1px solid rgba(0,0,0,0.1)' }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
          className="cursor-crosshair"
          style={{ display: 'block' }}
        />
      </div>
      <div className="flex gap-2">
        <button onClick={clearCanvas} className="flex-1 py-2 rounded-pill bg-white/20 text-text-primary text-sm hover:bg-white/30 transition-all">
          Clear
        </button>
        <button onClick={saveCanvas} className="flex-1 py-2 rounded-pill bg-white/30 text-text-primary text-sm font-medium hover:bg-white/40 transition-all">
          Insert as Image
        </button>
      </div>
    </motion.div>
  );
}

export default function DrawModal({ open, onClose, onInsertDrawing }) {
  const [mode, setMode] = useState(null);

  const handleSave = (blob) => {
    const file = new File([blob], `drawing-${Date.now()}.png`, { type: 'image/png' });
    onInsertDrawing(file);
    setMode(null);
    onClose();
  };

  const handleBack = () => setMode(null);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => { setMode(null); onClose(); }} />
          {!mode ? (
            <motion.div
              initial={{ y: 100, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative w-full max-w-sm glass rounded-card p-5 shadow-glass-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-text-primary text-lg">Draw</h2>
                <button onClick={() => { setMode(null); onClose(); }} className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center text-text-primary/60">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setMode('draw')}
                  className="w-full py-4 px-4 rounded-xl bg-white/20 hover:bg-white/30 transition-all text-left"
                >
                  <span className="text-lg block mb-1">🎨</span>
                  <span className="font-display font-bold text-text-primary text-sm">Drawing Canvas</span>
                  <p className="text-xs text-text-primary/60 mt-0.5">Free draw with colors and brush sizes</p>
                </button>
                <button
                  onClick={() => setMode('handwriting')}
                  className="w-full py-4 px-4 rounded-xl bg-white/20 hover:bg-white/30 transition-all text-left"
                >
                  <span className="text-lg block mb-1">✍️</span>
                  <span className="font-display font-bold text-text-primary text-sm">Handwriting Input</span>
                  <p className="text-xs text-text-primary/60 mt-0.5">Write text by hand and insert as image</p>
                </button>
              </div>
            </motion.div>
          ) : mode === 'draw' ? (
            <div className="relative w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <DrawingCanvas onSave={handleSave} onBack={handleBack} />
            </div>
          ) : (
            <div className="relative w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <HandwritingInput onSave={handleSave} onBack={handleBack} />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
