import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import Dexie from 'dexie';

let db;
let dbPromise = null;

async function initDB() {
  // Try version 3 for clean schema (migrates from ++id or &id automatically)
  const tryOpen = async (version) => {
    const d = new Dexie('NoteFlowDB');
    d.version(version).stores({
      notes: '&id, type, title, pinned, createdAt, updatedAt, tags',
    });
    await d.open();
    return d;
  };

  try {
    return await tryOpen(3);
  } catch (e) {
    // Only delete DB on schema/version conflict — NOT on transient errors
    if (e.name === 'VersionError' || e.name === 'SchemaError' || e.message?.includes('version')) {
      try { await (new Dexie('NoteFlowDB')).delete(); } catch {}
      return await tryOpen(3);
    }
    // For any other error (quota, permissions, etc.) — throw so caller knows
    console.error('IndexedDB failed to open:', e);
    throw e;
  }
}

async function getDB() {
  if (db?.isOpen()) return db;
  if (!dbPromise) {
    dbPromise = initDB().then(
      (d) => { db = d; return d; },
      (err) => { dbPromise = null; throw err; }
    );
  }
  return await dbPromise;
}

// Warm-start DB
getDB();

const initialDark = localStorage.getItem('noteflow-dark') === 'true';
if (initialDark) document.documentElement.classList.add('dark');

const useNotesStore = create((set, get) => ({
  notes: [],
  loading: true,
  darkMode: initialDark,
  selectedNotes: [],
  multiSelect: false,
  searchQuery: '',
  activeFilter: 'All Notes',

  setActiveFilter: (filter) => set({ activeFilter: filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  toggleDarkMode: () => {
    const next = !get().darkMode;
    localStorage.setItem('noteflow-dark', next);
    set({ darkMode: next });
    document.documentElement.classList.toggle('dark', next);
  },

  loadNotes: async () => {
    try {
      const d = await getDB();
      const all = await d.notes.orderBy('updatedAt').reverse().toArray();
      const sorted = [
        ...all.filter((n) => n.pinned),
        ...all.filter((n) => !n.pinned),
      ];
      set({ notes: sorted, loading: false });
    } catch (e) {
      console.error('Failed to load notes:', e);
      set({ loading: false });
    }
  },

  getNote: async (id) => {
    try {
      const d = await getDB();
      return await d.notes.get(id);
    } catch { return null; }
  },

  addNote: async (note = {}) => {
    const now = new Date();
    const newNote = {
      id: uuidv4(),
      type: note.type || 'text',
      title: note.title || '',
      body: note.body || '',
      items: note.items || [],
      attachments: note.attachments || [],
      color: note.color || '#FFFFFF',
      pinned: false,
      createdAt: now,
      updatedAt: now,
      tags: note.tags || [],
    };
    try {
      const d = await getDB();
      await d.notes.add(newNote);
      await get().loadNotes();
      return newNote;
    } catch (e) {
      console.error('Failed to add note:', e);
      return null;
    }
  },

  updateNote: async (id, updates) => {
    try {
      const d = await getDB();
      const existing = await d.notes.get(id);
      if (!existing) return;
      await d.notes.put({ ...existing, ...updates, updatedAt: new Date() });
      await get().loadNotes();
    } catch (e) {
      console.error('Failed to update note:', e);
    }
  },

  deleteNote: async (id) => {
    try {
      const d = await getDB();
      await d.notes.delete(id);
      await get().loadNotes();
    } catch (e) {
      console.error('Failed to delete note:', e);
    }
  },

  deleteSelected: async () => {
    const { selectedNotes } = get();
    try {
      const d = await getDB();
      for (const id of selectedNotes) {
        await d.notes.delete(id);
      }
      set({ selectedNotes: [], multiSelect: false });
      await get().loadNotes();
    } catch (e) {
      console.error('Failed to delete selected:', e);
    }
  },

  pinNote: async (id) => {
    try {
      const d = await getDB();
      const existing = await d.notes.get(id);
      if (existing) {
        await d.notes.put({ ...existing, pinned: !existing.pinned, updatedAt: new Date() });
      }
      await get().loadNotes();
    } catch (e) {
      console.error('Failed to pin note:', e);
    }
  },

  duplicateNote: async (id) => {
    try {
      const d = await getDB();
      const existing = await d.notes.get(id);
      if (!existing) return null;
      const now = new Date();
      const copy = { ...existing, id: uuidv4(), title: existing.title + ' (copy)', createdAt: now, updatedAt: now };
      await d.notes.add(copy);
      await get().loadNotes();
      return copy;
    } catch (e) {
      console.error('Failed to duplicate note:', e);
      return null;
    }
  },

  toggleSelect: (id) => {
    const { selectedNotes } = get();
    set({
      selectedNotes: selectedNotes.includes(id)
        ? selectedNotes.filter((n) => n !== id)
        : [...selectedNotes, id],
    });
  },

  clearSelection: () => set({ selectedNotes: [], multiSelect: false }),
  enableMultiSelect: () => set({ multiSelect: true }),

  getFilteredNotes: () => {
    const { notes, activeFilter, searchQuery } = get();
    let filtered = searchQuery
      ? notes.filter((n) => {
          const q = searchQuery.toLowerCase();
          return (
            n.title?.toLowerCase().includes(q) ||
            (n.body || '').toLowerCase().includes(q) ||
            n.tags?.some((t) => t.toLowerCase().includes(q))
          );
        })
      : notes;
    switch (activeFilter) {
      case 'To-Do': return filtered.filter((n) => n.type === 'todo');
      case 'Images': return filtered.filter((n) => n.type === 'photo');
      case 'Audio': return filtered.filter((n) => n.type === 'audio');
      case 'Files': case 'PDF': return filtered.filter((n) => n.type === 'file');
      default: return filtered;
    }
  },
}));

export default useNotesStore;
