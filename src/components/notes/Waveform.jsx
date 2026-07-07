import { useMemo } from 'react';

export default function Waveform({ bars = 30, seed = 0, color = 'currentColor' }) {
  // Deterministic pseudo-random based on seed so the waveform is stable
  // across re-renders for the same note.
  const heights = useMemo(() => {
    const out = [];
    let s = (seed * 9301 + 49297) % 233280;
    for (let i = 0; i < bars; i++) {
      s = (s * 9301 + 49297) % 233280;
      const r = s / 233280;
      out.push(20 + r * 80);
    }
    return out;
  }, [bars, seed]);

  return (
    <div className="flex items-end gap-[2px] h-8">
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full opacity-60"
          style={{ height: `${h}%`, backgroundColor: color }}
        />
      ))}
  </div>
  );
}
