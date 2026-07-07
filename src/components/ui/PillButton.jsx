import { motion } from 'framer-motion';

export default function PillButton({ children, active, onClick, className = '' }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`whitespace-nowrap px-5 py-2 rounded-pill font-body text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-[#F5E642] text-[#1A1A2E] shadow-md'
          : 'glass text-text-primary dark:text-white/80 hover:bg-white/40'
      } ${className}`}
    >
      {children}
    </motion.button>
  );
}
