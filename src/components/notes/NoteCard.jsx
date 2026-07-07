import { useRef, useCallback, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useNotesStore from '../../store/useNotesStore';

function AudioPlayerSnippet({ attachment }) {
  const [playing, setPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    let url = null;
    if (attachment?.data) {
      url = URL.createObjectURL(attachment.data);
      setAudioUrl(url);
    } else if (attachment?.url) {
      setAudioUrl(attachment.url);
      return;
    }
    return () => {
      if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
    };
  }, [attachment]);

  if (!audioUrl) return null;
  return (
    <div className="mt-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          const a = audioRef.current;
          if (!a) return;
          if (playing) { a.pause(); setPlaying(false); }
          else { a.play().then(() => setPlaying(true)).catch(() => {}); }
        }}
        className="w-8 h-8 rounded-full bg-white/30 flex items-center justify-center shrink-0 hover:bg-white/40 transition-colors"
      >
        {playing ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#1A1A2E"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#1A1A2E"><polygon points="5,3 19,12 5,21" /></svg>
        )}
      </button>
      <div className="flex-1 flex items-end gap-[2px] h-6">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="w-[3px] rounded-full bg-current opacity-40" style={{ height: `${4 + Math.sin(i * 1.5) * 8 + 4}px` }} />
        ))}
      </div>
      <audio ref={audioRef} src={audioUrl} onEnded={() => setPlaying(false)} className="hidden" />
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

const DARK_CARD_COLORS = {
  text: 'rgba(30,41,59,0.5)',
  todo: 'rgba(126,200,184,0.15)',
  audio: 'rgba(195,185,232,0.15)',
  photo: 'rgba(245,198,208,0.15)',
  file: 'rgba(245,239,184,0.15)',
};

const TYPE_LABELS = {
  text: 'Note',
  todo: 'To-Do',
  audio: 'Audio',
  photo: 'Photo',
  file: 'File',
};

function PhotoThumbs({ attachments }) {
  const urlsRef = useRef([]);

  useEffect(() => {
    const newUrls = attachments.slice(0, 3).map((att) => {
      if (att.data) return URL.createObjectURL(att.data);
      return att.url || '';
    });
    urlsRef.current.forEach((u) => { if (u?.startsWith('blob:')) URL.revokeObjectURL(u); });
    urlsRef.current = newUrls;
    return () => {
      newUrls.forEach((u) => { if (u?.startsWith('blob:')) URL.revokeObjectURL(u); });
    };
  }, [attachments]);

  if (!attachments?.length) return null;
  const urls = urlsRef.current;
  return (
    <div className="mt-2 flex -space-x-2">
      {urls.map((imgUrl, i) => (
        <div
          key={i}
          className="w-8 h-8 rounded-lg bg-cover bg-center border-2 border-white/30"
          style={{ backgroundImage: imgUrl ? `url(${imgUrl})` : 'none' }}
        />
      ))}
      {attachments.length > 3 && (
        <div className="w-8 h-8 rounded-lg glass flex items-center justify-center text-[10px] font-bold text-text-primary">
          +{attachments.length - 3}
        </div>
      )}
    </div>
  );
}

export default function NoteCard({ note, index = 0 }) {
  const navigate = useNavigate();
  const darkMode = useNotesStore((s) => s.darkMode);
  const multiSelect = useNotesStore((s) => s.multiSelect);
  const selectedNotes = useNotesStore((s) => s.selectedNotes);
  const toggleSelect = useNotesStore((s) => s.toggleSelect);
  const enableMultiSelect = useNotesStore((s) => s.enableMultiSelect);
  const pinNote = useNotesStore((s) => s.pinNote);
  const isSelected = selectedNotes.includes(note.id);
  const longPressTimer = useRef(null);

  const handleClick = () => {
    if (multiSelect) {
      toggleSelect(note.id);
    } else {
      navigate(`/editor/${note.id}`);
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    enableMultiSelect();
    toggleSelect(note.id);
  };

  const handleTouchStart = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      enableMultiSelect();
      toggleSelect(note.id);
    }, 500);
  }, [enableMultiSelect, toggleSelect, note.id]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handlePin = (e) => {
    e.stopPropagation();
    pinNote(note.id);
  };

  const color = darkMode
    ? DARK_CARD_COLORS[note.type] || DARK_CARD_COLORS.text
    : CARD_COLORS[note.type] || CARD_COLORS.text;

  const getPreview = () => {
    if (note.type === 'todo') {
      const done = note.items?.filter((i) => i.checked).length || 0;
      const total = note.items?.length || 0;
      return total > 0 ? `${done}/${total} done` : 'Empty list';
    }
    if (note.body) {
      const txt = note.body.replace(/<[^>]*>/g, '');
      return txt.slice(0, 60) + (txt.length > 60 ? '...' : '');
    }
    return 'Tap to edit...';
  };

  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: 'easeOut' }}
      layout
      className={`rounded-card shadow-glass dark:shadow-glass-lg relative overflow-hidden cursor-pointer select-none ${
        isSelected ? 'ring-2 ring-[#F5E642]' : ''
      }`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd}
      style={{
        background: color,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: isSelected ? '2px solid #F5E642' : '1px solid rgba(255,255,255,0.5)',
      }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {multiSelect && (
        <div className="absolute top-3 right-3 z-20">
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
              isSelected ? 'bg-[#F5E642] border-[#F5E642]' : 'border-white/60'
            }`}
          >
            {isSelected && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#1A1A2E">
                <path d="M20 6L9 17l-5-5" stroke="#1A1A2E" strokeWidth="3" fill="none" />
              </svg>
            )}
          </div>
        </div>
      )}
      <div className="p-4 pb-3 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[10px] uppercase tracking-wider opacity-60 dark:opacity-40">
            {TYPE_LABELS[note.type]}
          </span>
          <button onClick={handlePin} className="opacity-50 hover:opacity-100 transition-opacity">
            <svg
              width="14" height="14" viewBox="0 0 24 24"
              fill={note.pinned ? 'currentColor' : 'none'}
              stroke="currentColor" strokeWidth="2"
            >
              <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
            </svg>
          </button>
        </div>
        <h3
          className={`font-display font-bold text-lg leading-tight mb-1 dark:text-white ${
            note.type === 'todo' ? 'font-mono' : ''
          }`}
        >
          {note.title || 'Untitled'}
        </h3>
        <p className="text-xs opacity-60 dark:text-white/50 line-clamp-2">{getPreview()}</p>
        {note.type === 'todo' && note.items && note.items.length > 0 && (
          <div className="mt-2 flex gap-1">
            {note.items.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className={`w-2 h-2 rounded-full ${
                  item.checked
                    ? 'bg-[#1A1A2E] dark:bg-white'
                    : 'border border-[#1A1A2E] dark:border-white/40'
                }`}
              />
            ))}
            {note.items.length > 3 && (
              <span className="text-[10px] opacity-40 dark:opacity-30">+{note.items.length - 3}</span>
            )}
          </div>
        )}
        {note.type === 'photo' && <PhotoThumbs attachments={note.attachments} />}
        {note.type === 'audio' && <AudioPlayerSnippet attachment={note.attachments?.[0]} />}
      </div>
      <div className="px-4 pb-3 relative z-10">
        <span className="text-[10px] opacity-40 dark:text-white/30">{formatDate(note.updatedAt)}</span>
      </div>
    </motion.div>
  );
}
