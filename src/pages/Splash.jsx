import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';

export default function Splash() {
  const navigate = useNavigate();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    if (localStorage.getItem('noteflow-seen-splash') === 'true') {
      ran.current = true;
      navigate('/home', { replace: true });
      return;
    }
    ran.current = true;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [navigate]);

  const handleGetStarted = () => {
    localStorage.setItem('noteflow-seen-splash', 'true');
    navigate('/home');
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gradient-bg">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="flex flex-col items-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="text-7xl mb-4 select-none"
          style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))' }}
        >
          ✳
        </motion.div>
        <h1
          className="font-mono text-3xl tracking-[0.2em] text-white mb-2"
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
        >
          NOTES
        </h1>
        <p className="font-body text-white/70 text-sm mb-12">
          Your sleek, minimal notes app
        </p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGetStarted}
          className="px-10 py-3.5 rounded-pill glass text-white font-body font-medium text-base shadow-glass hover:bg-white/40 transition-all"
        >
          Get Started →
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 text-white/30 text-xs font-mono tracking-wider"
      >
        NOTEFLOW
      </motion.div>
    </div>
  );
}
