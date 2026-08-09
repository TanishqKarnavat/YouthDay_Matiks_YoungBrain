'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAnalytics } from '../hooks/useAnalytics';
import { Brain, Hash, Navigation, ChevronRight } from 'lucide-react';

interface LandingScreenProps {
  onStart: () => void;
}

export default function LandingScreen({ onStart }: LandingScreenProps) {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    trackEvent('landing_view');
  }, [trackEvent]);

  const handleStart = () => {
    trackEvent('test_started');
    onStart();
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 text-center select-none game-container bg-[#050505] text-[#F5F5F7]">
      {/* Header */}
      <div className="pt-8 flex flex-col items-center gap-3">
        <motion.img
          src="/matiks-logo.png"
          alt="Matiks"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-16 h-8"
        />
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-[10px] font-black tracking-[0.3em] text-[#B1FA63] uppercase"
        >
          MATIKS
        </motion.div>
      </div>

      {/* Hero Title */}
      <div className="flex-1 flex flex-col justify-center max-w-xs mx-auto">
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5, type: 'spring', stiffness: 120 }}
          className="text-5xl sm:text-6xl font-black tracking-tighter leading-[0.9] mb-5 uppercase"
        >
          HOW YOUNG <br />
          <span className="text-[#B1FA63]">
            IS YOUR BRAIN?
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-gray-400 text-sm font-semibold leading-relaxed max-w-[260px] mx-auto"
        >
          60 seconds. 3 games. <br />
          Prove your brain is younger than you think.
        </motion.p>
      </div>

      {/* Middle CTA */}
      <div className="my-5">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          onClick={handleStart}
          className="w-full max-w-xs mx-auto py-4 px-6 bg-[#B1FA63] hover:bg-[#9EE555] text-black font-black rounded-full text-sm tracking-widest uppercase flex items-center justify-center gap-2 transition-all cursor-pointer animate-pulse-glow"
        >
          TEST YOUR BRAIN <ChevronRight className="w-5 h-5" />
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-gray-500 text-[11px] mt-3 font-mono"
        >
          THINKING IS A SPORT
        </motion.p>
      </div>

      {/* Rounds Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="w-full max-w-sm mx-auto bg-[#111111] border border-gray-800/80 rounded-2xl p-4 text-left space-y-3 mb-5"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#B1FA63]/10 flex items-center justify-center text-[#B1FA63]">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-200 tracking-wide uppercase">Memory</h3>
            <p className="text-[11px] text-gray-400">Remember. Rebuild.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-gray-800/40 pt-3">
          <div className="w-8 h-8 rounded-lg bg-[#8BD44A]/10 flex items-center justify-center text-[#8BD44A]">
            <Hash className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-200 tracking-wide uppercase">Mental Math</h3>
            <p className="text-[11px] text-gray-400">Think. Calculate. Move.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-gray-800/40 pt-3">
          <div className="w-8 h-8 rounded-lg bg-[#6BC93A]/10 flex items-center justify-center text-[#6BC93A]">
            <Navigation className="w-5 h-5 rotate-45" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-200 tracking-wide uppercase">Math Maze</h3>
            <p className="text-[11px] text-gray-400">Find the path. Hit the target.</p>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="pb-6">
        <p className="text-[10px] text-gray-600 font-mono tracking-wider">
          SCORE IS BASED ON SPEED + ACCURACY
        </p>
      </div>
    </div>
  );
}
