import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useNotesStore from '../../store/useNotesStore';

export default function FloatingActionBar() {
  const navigate = useNavigate();
  const addNote = useNotesStore((s) => s.addNote);
  const activeFilter = useNotesStore((s) => s.activeFilter);
  const [creating, setCreating] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const filterToType = {
    'All Notes': 'text',
    'To-Do': 'todo',
    'Images': 'photo',
    'Audio': 'audio',
    'Files': 'file',
    'PDF': 'file',
  };

  const handleCreateNote = async () => {
    if (creating) return;
    setCreating(true);
    const type = filterToType[activeFilter] || 'text';
    const note = await addNote({ type });
    setCreating(false);
    if (note) navigate(`/editor/${note.id}`);
  };

  const handleMicClick = async () => {
    if (recording) {
      mediaRecorderRef.current?.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      setRecording(false);
      setRecordingTime(0);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/webm';
      const mr = new MediaRecorder(stream, { mimeType: mime });
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mime });
        const note = await addNote({
          type: 'audio',
          title: 'Voice Note',
          attachments: [{ type: 'audio', data: blob, name: 'Recording' }],
        });
        stream.getTracks().forEach((t) => t.stop());
        if (note) navigate(`/editor/${note.id}`);
      };
      mr.start();
      setRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch {
      // permission denied
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleFileImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isAudio = file.type.startsWith('audio/');
    const isImage = file.type.startsWith('image/');
    const note = await addNote({
      type: isAudio ? 'audio' : isImage ? 'photo' : 'file',
      title: file.name,
      attachments: [{ type: isAudio ? 'audio' : isImage ? 'photo' : 'file', data: file, name: file.name }],
    });
    if (note) navigate(`/editor/${note.id}`);
    e.target.value = '';
  };

  return (
    <>
      <AnimatePresence>
        {recording && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 glass rounded-pill px-5 py-2.5 shadow-glass-lg flex items-center gap-3"
          >
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse-record" />
            <span className="font-mono text-sm text-white">{formatTime(recordingTime)}</span>
            <div className="flex items-end gap-[2px] h-5">
              {Array.from({ length: 20 }, (_, i) => (
                <div
                  key={i}
                  className="w-[2px] rounded-full bg-white/70 waveform-bar"
                  style={{
                    height: `${4 + Math.random() * 16}px`,
                    animationDelay: `${i * 0.08}s`,
                  }}
                />
              ))}
            </div>
            <button
              onClick={handleMicClick}
              className="text-xs text-white/60 hover:text-white transition-colors font-mono"
            >
              STOP
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        initial={{ y: 80, scale: 0.8 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.5 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="glass rounded-pill px-3 py-2 flex items-center gap-2 shadow-glass">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleCreateNote}
            disabled={creating}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-md hover:shadow-lg transition-shadow disabled:opacity-50 ${
              recording ? 'bg-white/20 text-white' : 'bg-white text-[#1A1A2E]'
            }`}
          >
            {creating ? (
              <div className="w-5 h-5 border-2 border-[#1A1A2E]/30 border-t-[#1A1A2E] rounded-full animate-spin" />
            ) : (
              '+'
            )}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleMicClick}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${
              recording
                ? 'bg-red-500 text-white animate-pulse-record'
                : 'bg-white/20 backdrop-blur-md text-white hover:bg-white/30'
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleFileImport}
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-lg hover:bg-white/30"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </motion.button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx,.txt,audio/*" className="hidden" onChange={handleFileChange} />
      </motion.div>
    </>
  );
}
