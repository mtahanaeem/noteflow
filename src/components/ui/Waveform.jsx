export default function Waveform({ animated = false, bars = 32, className = '' }) {
  const heights = Array.from({ length: bars }, () => Math.floor(Math.random() * 20) + 4);

  return (
    <div className={`flex items-end gap-[2px] h-10 ${className}`}>
      {heights.map((h, i) => (
        <div
          key={i}
          className={`w-[3px] rounded-full bg-current ${
            animated ? 'waveform-bar' : ''
          }`}
          style={{
            height: `${h}px`,
            opacity: 0.4 + (i / bars) * 0.6,
            animationDelay: animated ? `${i * 0.05}s` : '0s',
            backgroundColor: 'currentColor',
          }}
        />
      ))}
    </div>
  );
}
