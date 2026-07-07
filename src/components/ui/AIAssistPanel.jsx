import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { askAI } from '../../services/ai';

const ACTIONS = [
  { id: 'expand', label: 'Expand', icon: '⊕' },
  { id: 'summarize', label: 'Summarize', icon: '∑' },
  { id: 'rephrase', label: 'Rephrase', icon: '↻' },
  { id: 'continue', label: 'Continue', icon: '→' },
];

export default function AIAssistPanel({ open, selectedText, onApply, onClose }) {
  const [action, setAction] = useState('expand');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customInstruction, setCustomInstruction] = useState('');

  const handleGenerate = async () => {
    if (!selectedText?.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const reply = await askAI(selectedText, action, customInstruction);
      setResult(reply);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    }
    setLoading(false);
  };

  const handleApply = () => {
    if (result) onApply(result);
    handleClose();
  };

  const handleClose = () => {
    setResult(null);
    setError(null);
    setAction('expand');
    setCustomInstruction('');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={handleClose} />

          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-md glass rounded-card p-5 shadow-glass-lg max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-text-primary text-lg flex items-center gap-2">
                ✳ AI Assist
              </h2>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center text-text-primary/60"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            {selectedText ? (
              <div className="mb-3 p-3 rounded-xl bg-white/20 text-sm text-text-primary leading-relaxed max-h-24 overflow-y-auto border border-white/10">
                {selectedText}
              </div>
            ) : (
              <div className="mb-3 p-3 rounded-xl bg-white/20 text-sm text-text-secondary text-center border border-white/10">
                Select some text in your note first
              </div>
            )}

            <div className="flex gap-2 mb-4 flex-wrap">
              {ACTIONS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAction(a.id)}
                  className={`px-3 py-1.5 rounded-pill text-xs font-medium transition-all ${
                    action === a.id
                      ? 'bg-[#F5E642] text-[#1A1A2E]'
                      : 'bg-white/20 text-text-primary hover:bg-white/30'
                  }`}
                >
                  {a.icon} {a.label}
                </button>
              ))}
            </div>

            <textarea
              value={customInstruction}
              onChange={(e) => setCustomInstruction(e.target.value)}
              placeholder="Custom instructions (tone, style, length, etc.)"
              rows={2}
              className="w-full bg-white/20 rounded-xl p-3 text-sm text-text-primary placeholder-white/30 outline-none border border-white/10 resize-none mb-3"
            />

            <button
              onClick={handleGenerate}
              disabled={loading || !selectedText?.trim()}
              className="w-full py-2.5 rounded-pill bg-white/30 text-text-primary font-medium text-sm hover:bg-white/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed mb-3"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-text-primary/30 border-t-text-primary rounded-full animate-spin" />
                  Generating...
                </span>
              ) : (
                `Generate ${action}`
              )}
            </button>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 rounded-xl bg-red-400/20 text-red-700 dark:text-red-300 text-xs mb-3 border border-red-400/20"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 rounded-xl bg-white/20 border border-white/10 mb-3"
                >
                  <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">{result}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {result && (
              <div className="flex gap-2">
                <button
                  onClick={handleApply}
                  className="flex-1 py-2.5 rounded-pill bg-white/30 text-text-primary font-medium text-sm hover:bg-white/40 transition-all"
                >
                  Apply
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 py-2.5 rounded-pill bg-white/10 text-text-secondary text-sm hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
