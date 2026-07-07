import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useNotesStore from '../store/useNotesStore';

export default function NoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const getNote = useNotesStore((s) => s.getNote);
  const addNote = useNotesStore((s) => s.addNote);
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const n = await getNote(id);
      if (!cancelled) {
        setNote(n);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, getNote]);

  const formatDate = (d) => {
    if (!d) return '';
    try {
      const date = new Date(d);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch { return ''; }
  };

  const handleCreateNew = async () => {
    const n = await addNote({ type: 'text' });
    if (n) navigate(`/editor/${n.id}`, { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg dark:gradient-bg-dark flex items-center justify-center transition-colors duration-500">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen gradient-bg dark:gradient-bg-dark flex flex-col items-center justify-center gap-4 px-8 transition-colors duration-500">
        <div className="text-5xl opacity-50">📝</div>
        <p className="text-white/60 font-body text-center">Note not found</p>
        <button onClick={() => navigate('/home')} className="px-6 py-2 rounded-pill glass text-white text-sm">Back to Notes</button>
      </div>
    );
  }

  const CARD_COLORS = {
    text: 'rgba(255,255,255,0.35)',
    todo: 'rgba(126,200,184,0.3)',
    audio: 'rgba(195,185,232,0.3)',
    photo: 'rgba(245,198,208,0.3)',
    file: 'rgba(245,239,184,0.3)',
  };

  const cardColor = CARD_COLORS[note.type] || CARD_COLORS.text;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen gradient-bg dark:gradient-bg-dark transition-colors duration-500"
    >
      <div className="max-w-lg mx-auto px-4 pt-6 pb-24">
        <div className="flex items-center justify-between mb-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/home')}
            className="w-10 h-10 rounded-full glass flex items-center justify-center text-white"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(`/editor/${note.id}`)}
            className="w-10 h-10 rounded-full glass flex items-center justify-center text-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            </svg>
          </motion.button>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-card shadow-glass p-6 relative overflow-hidden"
          style={{
            background: cardColor,
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.5)',
          }}
        >
          <div className="relative z-10">
            <p className="font-mono text-[10px] uppercase tracking-wider opacity-50 mb-2">
              {note.type === 'todo' ? 'To-Do' : note.type === 'audio' ? 'Audio Note' : note.type === 'photo' ? 'Photo Note' : note.type === 'file' ? 'File' : 'Note'}
            </p>

            <h1 dir="auto" className={`font-display font-bold text-2xl text-text-primary dark:text-white mb-2 ${note.type === 'todo' ? 'font-mono' : ''}`}>
              {note.title || 'Untitled'}
            </h1>

            <p className="text-xs text-text-secondary dark:text-white/40 mb-4 font-body">{formatDate(note.updatedAt)}</p>

            {note.type === 'todo' && note.items && note.items.length > 0 && (
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-1.5 flex-1 rounded-full bg-text-primary/10 overflow-hidden">
                    <div className="h-full bg-text-primary/40 rounded-full" style={{ width: `${(note.items.filter(i => i.checked).length / note.items.length) * 100}%` }} />
                  </div>
                  <span className="text-xs text-text-secondary dark:text-white/50 font-mono">{note.items.filter(i => i.checked).length}/{note.items.length}</span>
                </div>
                {note.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${item.checked ? 'bg-text-primary border-text-primary dark:bg-white dark:border-white' : 'border-text-primary/40'}`}>
                      {item.checked && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>}
                    </div>
                    <span dir="auto" className={`text-sm text-text-primary dark:text-white ${item.checked ? 'line-through opacity-50' : ''}`}>{item.text}</span>
                  </div>
                ))}
              </div>
            )}

            {note.body && (
              <div
                dir="auto"
                className="font-body text-sm text-text-primary dark:text-white/80 leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: note.body }}
              />
            )}

            {note.attachments && note.attachments.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {note.attachments.map((att, i) => {
                  if (att.type === 'audio') {
                    return (
                      <div key={i} className="text-xs text-text-secondary dark:text-white/50 bg-white/20 rounded-lg px-3 py-2 flex items-center gap-2">
                        <span>🎵</span>
                        <span>{att.name || 'Audio'}</span>
                      </div>
                    );
                  }
                  return (
                    <div key={i} className="w-16 h-16 rounded-xl bg-cover bg-center border border-white/30 shadow-sm"
                      style={{ backgroundImage: att.url ? `url(${att.url})` : 'none' }} />
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleCreateNew}
          className="mt-6 w-full py-3 rounded-pill glass text-text-primary dark:text-white/70 text-sm font-medium hover:bg-white/40 transition-all shadow-glass"
        >
          + Create new note
        </motion.button>
      </div>
    </motion.div>
  );
}
