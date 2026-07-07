import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useNotesStore from '../store/useNotesStore';

export default function Search() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const notes = useNotesStore((s) => s.notes);
  const loading = useNotesStore((s) => s.loading);
  const searchQuery = useNotesStore((s) => s.searchQuery);
  const setSearchQuery = useNotesStore((s) => s.setSearchQuery);
  const loadNotes = useNotesStore((s) => s.loadNotes);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (notes.length === 0 && !loadedRef.current) {
      loadedRef.current = true;
      loadNotes();
    }
    const t = setTimeout(() => inputRef.current?.focus(), 200);
    return () => {
      clearTimeout(t);
    };
  }, [notes.length, loadNotes]);

  const filtered = searchQuery.trim()
    ? notes.filter((n) => {
        const q = searchQuery.toLowerCase().trim();
        return (
          n.title?.toLowerCase().includes(q) ||
          n.body?.replace(/<[^>]*>/g, '').toLowerCase().includes(q) ||
          n.tags?.some((t) => t.toLowerCase().includes(q))
        );
      })
    : [];

  const getSnippet = (note) => {
    const text = (note.body || '').replace(/<[^>]*>/g, '');
    const q = searchQuery.toLowerCase().trim();
    if (!q || !text) return text.slice(0, 60);
    const idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return text.slice(0, 60);
    const start = Math.max(0, idx - 20);
    return '...' + text.slice(start, Math.min(start + 60, text.length)) + '...';
  };

  const formatDate = (d) => {
    if (!d) return '';
    try {
      return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch { return ''; }
  };

  const TYPE_ICONS = {
    text: '📝',
    todo: '✓',
    audio: '🎵',
    photo: '🖼',
    file: '📎',
  };

  return (
    <motion.div
      initial={{ y: 300, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 300, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="min-h-screen gradient-bg dark:gradient-bg-dark transition-colors duration-500"
    >
      <div className="max-w-lg mx-auto px-4 pt-6 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/home')}
            className="w-10 h-10 rounded-full glass flex items-center justify-center text-white shrink-0"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </motion.button>
          <div className="flex-1 glass rounded-pill flex items-center px-4 py-2.5 gap-3 shadow-glass">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/50 shrink-0">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={inputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your notes..."
              className="w-full bg-transparent text-white placeholder-white/40 outline-none font-body text-sm"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-white/40 hover:text-white text-sm shrink-0">✕</button>
            )}
          </div>
        </div>

        {loading && notes.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        ) : searchQuery.trim() && filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center mt-16 text-center">
            <div className="text-5xl mb-4 opacity-40">🔍</div>
            <p className="font-body text-white/50 text-base">No matching notes found</p>
          </motion.div>
        ) : filtered.length > 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-2 mt-2">
            {filtered.map((note, i) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => navigate(`/editor/${note.id}`)}
                className="glass rounded-card p-4 cursor-pointer hover:bg-white/40 transition-all shadow-glass"
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">{TYPE_ICONS[note.type] || '📝'}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-text-primary dark:text-white text-base truncate">
                      {note.title || 'Untitled'}
                    </h3>
                    <p className="font-body text-text-secondary dark:text-white/50 text-sm mt-0.5 line-clamp-1">
                      {getSnippet(note)}
                    </p>
                    <span className="text-[10px] text-text-secondary dark:text-white/30 mt-1 block">
                      {formatDate(note.updatedAt)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center mt-16 text-center">
            <div className="text-5xl mb-4 opacity-40">🔍</div>
            <p className="font-body text-white/50 text-base">Start typing to search your notes...</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
