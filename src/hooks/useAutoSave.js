import { useEffect, useRef, useState } from 'react';

export function useAutoSave(noteId, data, saveFn, delay = 2000) {
  const [saved, setSaved] = useState(false);
  const timerRef = useRef(null);
  const hideTimerRef = useRef(null);
  const prevRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const stableStr = data ? `${noteId}|${JSON.stringify(data)}` : null;

  useEffect(() => {
    if (!stableStr) return;

    if (prevRef.current === null) {
      prevRef.current = stableStr;
      return;
    }

    if (stableStr === prevRef.current) return;
    prevRef.current = stableStr;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      if (!noteId || !data || !mountedRef.current) return;
      try {
        await saveFn(noteId, data);
      } catch {
        return;
      }
      if (mountedRef.current) {
        setSaved(true);
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        hideTimerRef.current = setTimeout(() => {
          if (mountedRef.current) setSaved(false);
        }, 2000);
      }
    }, delay);
  }, [stableStr, noteId, saveFn, delay, data]);

  return saved;
}
