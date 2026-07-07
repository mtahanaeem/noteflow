import { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import useNotesStore from '../store/useNotesStore';
import NoteCard from '../components/notes/NoteCard';
import FloatingActionBar from '../components/ui/FloatingActionBar';
import PillButton from '../components/ui/PillButton';

const FILTERS = ['All Notes', 'To-Do', 'Images', 'Audio', 'Files', 'PDF'];

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const notes = useNotesStore((s) => s.notes);
  const loading = useNotesStore((s) => s.loading);
  const activeFilter = useNotesStore((s) => s.activeFilter);
  const multiSelect = useNotesStore((s) => s.multiSelect);
  const selectedNotes = useNotesStore((s) => s.selectedNotes);
  const setActiveFilter = useNotesStore((s) => s.setActiveFilter);
  const toggleDarkMode = useNotesStore((s) => s.toggleDarkMode);
  const darkMode = useNotesStore((s) => s.darkMode);
  const loadNotes = useNotesStore((s) => s.loadNotes);
  const deleteSelected = useNotesStore((s) => s.deleteSelected);
  const clearSelection = useNotesStore((s) => s.clearSelection);
  const setSearchQuery = useNotesStore((s) => s.setSearchQuery);

  useEffect(() => {
    loadNotes();
    setSearchQuery('');
  }, [location.pathname, loadNotes, setSearchQuery]);

  const filteredNotes = useMemo(() => {
    let f = notes;
    switch (activeFilter) {
      case 'To-Do': f = f.filter((n) => n.type === 'todo'); break;
      case 'Images': f = f.filter((n) => n.type === 'photo'); break;
      case 'Audio': f = f.filter((n) => n.type === 'audio'); break;
      case 'Files': case 'PDF': f = f.filter((n) => n.type === 'file'); break;
    }
    return f;
  }, [notes, activeFilter]);

  return (
    <div className="min-h-screen gradient-bg dark:gradient-bg-dark transition-colors duration-500">
      <div className="max-w-lg mx-auto px-4 pt-safe pb-28 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between pt-6 pb-2"
        >
          <div className="flex items-center gap-2">
            <span className="text-white text-xl drop-shadow-sm">✳</span>
            <h1 className="font-display font-bold text-3xl text-white drop-shadow-sm">
              Your Notes
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleDarkMode}
              className="w-9 h-9 rounded-full glass flex items-center justify-center text-white/80 hover:text-white transition-colors"
              aria-label="Toggle dark mode">
              {darkMode ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <button onClick={() => navigate('/search')}
              className="w-9 h-9 rounded-full glass flex items-center justify-center text-white/80 hover:text-white transition-colors"
              aria-label="Search notes">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>
        </motion.div>

        {/* Multi-select bar */}
        <AnimatePresence>
          {multiSelect && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-3">
              <div className="glass rounded-card p-3 flex items-center justify-between">
                <span className="text-sm font-body text-text-primary dark:text-white">{selectedNotes.length} selected</span>
                <div className="flex gap-2">
                  <button onClick={deleteSelected} className="px-4 py-1.5 rounded-pill bg-red-400/40 text-white text-sm font-medium">Delete</button>
                  <button onClick={clearSelection} className="px-4 py-1.5 rounded-pill glass text-sm">Cancel</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter pills */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="flex gap-2 overflow-x-auto no-scrollbar pb-3 -mx-4 px-4">
          {FILTERS.map((f) => (
            <PillButton key={f} active={activeFilter === f} onClick={() => setActiveFilter(f)}>{f}</PillButton>
          ))}
        </motion.div>

        {/* Notes grid or empty state */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        ) : filteredNotes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center justify-center mt-16 px-8 text-center"
          >
            <div className="text-6xl mb-4 opacity-30">✳</div>
            {activeFilter === 'All Notes' ? (
              <p className="font-body text-text-primary/80 text-lg">
                Tap <span className="font-bold text-text-primary">+</span> to create your first note
              </p>
            ) : (
              <>
                <p className="font-body text-text-primary/80 text-lg mb-2">
                  No <span className="font-semibold text-text-primary">{activeFilter.toLowerCase()}</span> notes yet
                </p>
                <button onClick={() => setActiveFilter('All Notes')}
                  className="mt-2 px-5 py-2 rounded-pill glass text-text-primary text-sm font-medium hover:bg-white/40 transition-all">
                  Show All Notes
                </button>
              </>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mt-1">
            <AnimatePresence>
              {filteredNotes.map((note, i) => (
                <NoteCard key={note.id} note={note} index={i} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <FloatingActionBar />
    </div>
  );
}
