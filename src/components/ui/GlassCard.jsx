import { motion } from 'framer-motion';

export default function GlassCard({
  children,
  className = '',
  color = 'rgba(255,255,255,0.3)',
  delay = 0,
  onClick,
  style,
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className={`rounded-card shadow-glass dark:shadow-glass-lg relative overflow-hidden ${className}`}
      onClick={onClick}
      style={{
        background: color,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.5)',
        ...style,
      }}
      {...props}
    >
      <div className="dark:absolute dark:inset-0 dark:bg-slate-900/40 dark:rounded-card" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
