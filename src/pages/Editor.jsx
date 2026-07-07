import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useNotesStore from '../store/useNotesStore';
import { useAutoSave } from '../hooks/useAutoSave';
import { v4 as uuidv4 } from 'uuid';
import AIAssistPanel from '../components/ui/AIAssistPanel';
import DrawModal from '../components/ui/DrawModal';
import CameraModal from '../components/ui/CameraModal';

const RTL_CHARS = /[\u0590-\u05FF\u0600-\u06FF\u0700-\u074F\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

function detectDirection(text) {
  if (!text) return 'auto';
  const stripped = text.replace(/<[^>]*>/g, '');
  return RTL_CHARS.test(stripped) ? 'rtl' : 'ltr';
}

function AttachmentImage({ attachment }) {
  const [imgUrl, setImgUrl] = useState(null);
  const urlRef = useRef(null);

  useEffect(() => {
    let url = null;
    if (attachment?.data) {
      url = URL.createObjectURL(attachment.data);
      setImgUrl(url);
      urlRef.current = url;
    } else if (attachment?.url) {
      setImgUrl(attachment.url);
    }
    return () => {
      if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
    };
  }, [attachment]);

  if (!imgUrl) return null;
  return (
    <div
      className="w-20 h-20 rounded-xl bg-cover bg-center shadow-md border border-white/20"
      style={{ backgroundImage: `url(${imgUrl})` }}
    />
  );
}

function AudioPlayer({ attachment }) {
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const audioRef = useRef(null);
  const urlRef = useRef(null);

  useEffect(() => {
    let url = null;
    if (attachment?.data) {
      url = URL.createObjectURL(attachment.data);
      setAudioUrl(url);
      urlRef.current = url;
    } else if (attachment?.url) {
      setAudioUrl(attachment.url);
    }
    return () => {
      if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
    };
  }, [attachment]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a || !audioUrl) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  const formatTime = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e) => {
    const a = audioRef.current;
    if (!a || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    a.currentTime = pct * duration;
    setCurrent(pct * duration);
  };

  return (
    <div className="glass rounded-card p-3 w-full max-w-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center shrink-0 hover:bg-white/40 transition-colors"
        >
          {playing ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#1A1A2E">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
           </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#1A1A2E">
              <polygon points="5,3 19,12 5,21" />
           </svg>
          )}
       </button>
        <div className="flex-1 min-w-0">
          <p className="font-mono text-xs text-text-primary truncate">
            {attachment?.name || 'Voice Note'}
         </p>
          <div
            className="mt-1 h-1 rounded-full bg-white/30 relative cursor-pointer"
            onClick={handleSeek}
          >
            <div
              className="h-full rounded-full bg-text-primary/60 transition-all"
              style={{ width: duration ? `${(current / duration) * 100}%` : '0%' }}
            />
         </div>
          <div className="flex justify-between mt-0.5">
            <span className="text-[10px] text-text-primary/50 font-mono">{formatTime(current)}</span>
            <span className="text-[10px] text-text-primary/50 font-mono">{formatTime(duration)}</span>
         </div>
       </div>
     </div>
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onLoadedMetadata={() => {
            if (audioRef.current && isFinite(audioRef.current.duration)) setDuration(audioRef.current.duration);
          }}
          onTimeUpdate={() => {
            if (audioRef.current) setCurrent(audioRef.current.currentTime);
          }}
          onEnded={() => setPlaying(false)}
          onError={() => setDuration(0)}
        />
      )}
   </div>
  );
}

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const getNote = useNotesStore((s) => s.getNote);
  const updateNote = useNotesStore((s) => s.updateNote);
  const deleteNote = useNotesStore((s) => s.deleteNote);
  const duplicateNote = useNotesStore((s) => s.duplicateNote);
  const pinNote = useNotesStore((s) => s.pinNote);
  const [note, setNote] = useState(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [items, setItems] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showFormatBar, setShowFormatBar] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiSelectedText, setAiSelectedText] = useState('');
  const [drawOpen, setDrawOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [textDir, setTextDir] = useState('auto');
  const bodyRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const selectionRef = useRef(null);
  const mountRef = useRef(true);

  useEffect(() => {
    mountRef.current = true;
    return () => { mountRef.current = false; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setNote(null);
    setTitle('');
    setBody('');
    setItems([]);
    setInitialized(false);
    setNotFound(false);
    setMenuOpen(false);
    setShowFormatBar(false);
    selectionRef.current = null;

    (async () => {
      const n = await getNote(id);
      if (cancelled || !mountRef.current) return;
      if (n) {
        setNote(n);
        setTitle(n.title || '');
        setItems(n.items || []);
        setBody(n.body || '');
        setTextDir(detectDirection(n.body));
        setInitialized(true);
      } else {
        setNotFound(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, getNote]);

  useEffect(() => {
    if (initialized && bodyRef.current) {
      bodyRef.current.innerHTML = body || '';
    }
  }, [initialized]);

  const saveFn = useCallback(
    async (noteId, data) => {
      await updateNote(noteId, data);
    },
    [updateNote]
  );

  const editorData = useMemo(() => {
    if (!note) return null;
    return { title, body, items };
  }, [title, body, items, note]);

  const saved = useAutoSave(id, editorData, saveFn, 1500);

  const handleAIAssist = useCallback(() => {
    const sel = window.getSelection();
    const text = sel?.toString()?.trim();
    if (bodyRef.current && sel?.rangeCount) {
      selectionRef.current = sel.getRangeAt(0).cloneRange();
    }
    setAiSelectedText(text || '');
    setAiPanelOpen(true);
  }, []);

  const handleAIApply = useCallback((newText) => {
    if (!bodyRef.current) return;
    bodyRef.current.focus();
    if (selectionRef.current) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(selectionRef.current);
      selectionRef.current = null;
    }
    document.execCommand('insertText', false, newText);
    setBody(bodyRef.current.innerHTML);
  }, []);

  const handleFormat = useCallback((command, value = null) => {
    document.execCommand(command, false, value);
    if (bodyRef.current) {
      bodyRef.current.focus();
      setBody(bodyRef.current.innerHTML);
    }
  }, []);

  const handleBodyInput = useCallback(() => {
    if (bodyRef.current) {
      const html = bodyRef.current.innerHTML;
      setBody(html);
      setTextDir(detectDirection(html));
    }
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.metaKey || e.ctrlKey) {
      if (e.key === 'b') { e.preventDefault(); handleFormat('bold'); }
      if (e.key === 'i') { e.preventDefault(); handleFormat('italic'); }
    }
  }, [handleFormat]);

  const handleDelete = async () => {
    setMenuOpen(false);
    await deleteNote(id);
    navigate('/home', { replace: true });
  };

  const handleDuplicate = async () => {
    setMenuOpen(false);
    const copy = await duplicateNote(id);
    if (copy) navigate(`/editor/${copy.id}`, { replace: true });
  };

  const handlePin = async () => {
    setMenuOpen(false);
    await pinNote(id);
    navigate('/home', { replace: true });
  };

  const handleInsertImage = () => {
    const sel = window.getSelection();
    if (bodyRef.current && sel?.rangeCount) {
      selectionRef.current = sel.getRangeAt(0).cloneRange();
    }
    fileInputRef.current?.click();
  };

  const handleCameraImage = () => {
    setCameraOpen(true);
  };

  const insertImageInline = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const html = `<img src="${dataUrl}" alt="${file.name}" style="max-width:100%;border-radius:12px;margin:8px 0;" />`;
      if (bodyRef.current) {
        bodyRef.current.focus();
        if (selectionRef.current) {
          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(selectionRef.current);
          selectionRef.current = null;
        }
        document.execCommand('insertHTML', false, html);
        setBody(bodyRef.current.innerHTML);
      }
    };
    reader.onerror = () => {};
    reader.readAsDataURL(file);
  }, []);

  const handleCameraCaptureResult = useCallback((file) => {
    insertImageInline(file);
  }, [insertImageInline]);

  const handleInsertDrawing = useCallback((file) => {
    insertImageInline(file);
  }, [insertImageInline]);

  const addAttachmentAndUpdateNote = useCallback(async (file) => {
    if (!note || !mountRef.current) return;
    const attachment = { type: 'photo', data: file, name: file.name };
    const updatedAttachments = [...(note.attachments || []), attachment];
    await updateNote(id, { attachments: updatedAttachments });
    const updated = await getNote(id);
    if (updated && mountRef.current) setNote(updated);
  }, [note, id, updateNote, getNote]);

  const handleGalleryImage = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    insertImageInline(file);
    e.target.value = '';
  }, [insertImageInline]);

  const handleCameraCapture = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (note) {
      await addAttachmentAndUpdateNote(file);
    } else {
      insertImageInline(file);
    }
    e.target.value = '';
  }, [note, addAttachmentAndUpdateNote, insertImageInline]);

  const handleTitleChange = useCallback((e) => setTitle(e.target.value), []);

  const handleItemToggle = useCallback((itemId) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    );
  }, []);

  const handleAddItem = useCallback(() => {
    setItems((prev) => [...prev, { id: uuidv4(), text: '', checked: false }]);
  }, []);

  const handleItemTextChange = useCallback((itemId, text) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, text } : item))
    );
  }, []);

  const handleItemKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.target.value.trim()) handleAddItem();
    }
  }, [handleAddItem]);

  const doneCount = items.filter((i) => i.checked).length;

  if (notFound) {
    return (
      <div className="min-h-screen gradient-bg dark:gradient-bg-dark flex flex-col items-center justify-center gap-4 px-8 transition-colors duration-500">
        <div className="text-5xl opacity-50">📝</div>
        <p className="text-white/60 font-body text-center">Note not found</p>
        <button
          onClick={() => navigate('/home')}
          className="px-6 py-2 rounded-pill glass text-white text-sm"
        >
          Back to Notes
       </button>
     </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen gradient-bg dark:gradient-bg-dark flex items-center justify-center transition-colors duration-500">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
     </div>
    );
  }

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="min-h-screen gradient-bg dark:gradient-bg-dark transition-colors duration-500"
    >
      <div className="max-w-lg mx-auto px-4 pt-4 pb-32 relative">
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
          <div className="flex items-center gap-2">
            <AnimatePresence>
              {saved && (
                <motion.span
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-white/50 font-body"
                >
                  Saved
               </motion.span>
              )}
           </AnimatePresence>
            <div className="relative">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-10 h-10 rounded-full glass flex items-center justify-center text-white"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="12" cy="19" r="2" />
               </svg>
             </motion.button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    className="absolute right-0 top-12 glass rounded-card p-2 min-w-[140px] shadow-glass z-50"
                  >
                    <button
                      onClick={handlePin}
                      className="w-full text-left px-4 py-2 rounded-lg text-sm text-text-primary dark:text-white/70 hover:bg-white/10 transition-colors font-body"
                    >
                      {note.pinned ? 'Unpin' : 'Pin to Top'}
                   </button>
                    <button
                      onClick={() => { setMenuOpen(false); navigate(`/note/${note.id}`); }}
                      className="w-full text-left px-4 py-2 rounded-lg text-sm text-text-primary dark:text-white/70 hover:bg-white/10 transition-colors font-body"
                    >
                      View Note
                   </button>
                    <button
                      onClick={handleDuplicate}
                      className="w-full text-left px-4 py-2 rounded-lg text-sm text-text-primary dark:text-white/70 hover:bg-white/10 transition-colors font-body"
                    >
                      Duplicate
                   </button>
                    <button
                      onClick={handleDelete}
                      className="w-full text-left px-4 py-2 rounded-lg text-sm text-red-400 hover:bg-white/10 transition-colors font-body"
                    >
                      Delete Note
                   </button>
                 </motion.div>
                )}
             </AnimatePresence>
           </div>
         </div>
       </div>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-pill px-4 py-2 inline-flex items-center gap-3 mb-6 shadow-glass"
        >
          <button
            onClick={handleAIAssist}
            className="text-white/80 hover:text-white transition-colors text-sm"
            title="AI Assist"
          >
            ✳
         </button>
          <button
            onClick={handleCameraImage}
            className="text-white/80 hover:text-white transition-colors text-sm"
            title="Camera"
          >
            📷
         </button>
          <button
            onClick={handleInsertImage}
            className="text-white/80 hover:text-white transition-colors text-sm"
            title="Insert Image"
          >
            🖼
         </button>
          <button
            onClick={() => setDrawOpen(true)}
            className="text-white/80 hover:text-white transition-colors text-sm"
            title="Draw"
          >
            ✏️
          </button>
       </motion.div>

        <input
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled"
          dir="auto"
          className={`w-full bg-transparent ${
            note.type === 'todo' ? 'font-mono' : 'font-display'
          } font-bold text-3xl text-white placeholder-white/30 outline-none mb-4`}
          style={{ textShadow: '0 1px 4px rgba(0,0,0,0.1)' }}
        />

        <AnimatePresence>
          {showFormatBar && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass rounded-pill px-3 py-1.5 inline-flex items-center gap-1 mb-3 shadow-glass flex-wrap"
            >
              {[
                { label: 'B', cmd: 'bold', style: 'font-bold' },
                { label: 'I', cmd: 'italic', style: 'italic' },
                { label: 'H1', cmd: 'formatBlock', val: '<h1>', style: 'text-xs font-bold' },
                { label: 'H2', cmd: 'formatBlock', val: '<h2>', style: 'text-xs font-bold' },
              ].map((btn) => (
                <button
                  key={btn.cmd + (btn.val || '')}
                  onMouseDown={(e) => { e.preventDefault(); handleFormat(btn.cmd, btn.val); }}
                  className={`w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center text-sm text-white ${btn.style}`}
                >
                  {btn.label}
                </button>
              ))}
              <button onMouseDown={(e) => { e.preventDefault(); handleFormat('backColor', '#F5E642'); }} className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center text-sm text-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#F5E642"><path d="M11 2h2l4 20h-2l-1-5H8l-1 5H5L11 2zm1 3.5L9.5 15h5L12 5.5z" /></svg>
              </button>
              <button onMouseDown={(e) => { e.preventDefault(); handleFormat('insertUnorderedList'); }} className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center text-sm text-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><circle cx="4" cy="6" r="1" fill="currentColor" /><circle cx="4" cy="12" r="1" fill="currentColor" /><circle cx="4" cy="18" r="1" fill="currentColor" /></svg>
              </button>
              <button onMouseDown={(e) => { e.preventDefault(); handleFormat('insertOrderedList'); }} className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center text-sm text-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" /><text x="2" y="8" fontSize="8" fill="currentColor">1</text><text x="2" y="14" fontSize="8" fill="currentColor">2</text><text x="2" y="20" fontSize="8" fill="currentColor">3</text></svg>
              </button>
           </motion.div>
          )}
       </AnimatePresence>

          <div
            ref={bodyRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleBodyInput}
            onFocus={() => setShowFormatBar(true)}
            onBlur={() => setTimeout(() => setShowFormatBar(false), 200)}
            onKeyDown={handleKeyDown}
            dir={textDir}
            className="rich-text w-full min-h-[120px] font-body text-white/90 text-base leading-relaxed outline-none focus:outline-none"
            style={{ lineHeight: 1.7 }}
            data-placeholder="Tap here to continue…"
          />

        {note.type === 'todo' && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-1.5 flex-1 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full bg-white/60 rounded-full transition-all duration-300"
                  style={{ width: items.length ? `${(doneCount / items.length) * 100}%` : '0%' }}
                />
             </div>
              <span className="text-xs text-white/50 font-mono">
                {doneCount}/{items.length}
             </span>
           </div>
            <div className="flex flex-col gap-1.5">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 group"
                >
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => handleItemToggle(item.id)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      item.checked
                        ? 'bg-[#1A1A2E] dark:bg-white border-[#1A1A2E] dark:border-white'
                        : 'border-white/50'
                    }`}
                  >
                    {item.checked && (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                     </motion.svg>
                    )}
                 </motion.button>
                  <input
                    value={item.text}
                    onChange={(e) => handleItemTextChange(item.id, e.target.value)}
                    onKeyDown={handleItemKeyDown}
                    placeholder="New item..."
                    dir="auto"
                    className={`flex-1 bg-transparent text-white outline-none font-body text-sm py-1 ${
                      item.checked ? 'line-through opacity-50' : ''
                    }`}
                  />
               </motion.div>
              ))}
           </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAddItem}
              className="mt-2 flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors py-1"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
             </svg>
              <span className="text-sm font-body">Add item</span>
           </motion.button>
         </div>
        )}

        {note.attachments && note.attachments.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-3">
            {note.attachments.map((att, i) => {
              if (att.type === 'audio') return <AudioPlayer key={i} attachment={att} />;
              return <AttachmentImage key={i} attachment={att} />;
            })}
         </div>
        )}
     </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleGalleryImage} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleCameraCapture} />

      <AIAssistPanel
        open={aiPanelOpen}
        selectedText={aiSelectedText}
        onApply={handleAIApply}
        onClose={() => setAiPanelOpen(false)}
      />
      <CameraModal
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleCameraCaptureResult}
      />
      <DrawModal
        open={drawOpen}
        onClose={() => setDrawOpen(false)}
        onInsertDrawing={handleInsertDrawing}
      />
    </motion.div>
  );
}
