'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnalytics } from '../hooks/useAnalytics';
import { ChevronRight, X } from 'lucide-react';

interface LandingScreenProps {
  onStart: () => void;
}

const ROUNDS = [
  { num: 1, name: 'MEMORY', desc: 'Remember the pattern' },
  { num: 2, name: 'ZIP', desc: 'Connect numbers in order' },
  { num: 3, name: 'REASON', desc: 'Answer from memory' },
  { num: 4, name: 'PATCHES', desc: 'Group the cells' },
];

function BrainAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.8 }}
      className="relative w-24 h-24"
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="brainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B1FA63" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#B1FA63" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        {/* Brain shape - left hemisphere */}
        <motion.path
          d="M50 20 C35 20, 20 30, 20 45 C20 55, 25 60, 30 65 C28 70, 30 80, 40 85 C45 87, 48 85, 50 80"
          fill="none"
          stroke="url(#brainGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 0.8, ease: "easeInOut" }}
        />
        {/* Brain shape - right hemisphere */}
        <motion.path
          d="M50 20 C65 20, 80 30, 80 45 C80 55, 75 60, 70 65 C72 70, 70 80, 60 85 C55 87, 52 85, 50 80"
          fill="none"
          stroke="url(#brainGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 1, ease: "easeInOut" }}
        />
        {/* Center line */}
        <motion.path
          d="M50 20 L50 80"
          fill="none"
          stroke="url(#brainGrad)"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 1.2, ease: "easeInOut" }}
        />
        {/* Folds - left */}
        <motion.path
          d="M35 35 C40 40, 42 45, 38 50"
          fill="none"
          stroke="url(#brainGrad)"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 1.4, ease: "easeInOut" }}
        />
        <motion.path
          d="M30 50 C38 52, 40 58, 35 62"
          fill="none"
          stroke="url(#brainGrad)"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 1.6, ease: "easeInOut" }}
        />
        {/* Folds - right */}
        <motion.path
          d="M65 35 C60 40, 58 45, 62 50"
          fill="none"
          stroke="url(#brainGrad)"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 1.5, ease: "easeInOut" }}
        />
        <motion.path
          d="M70 50 C62 52, 60 58, 65 62"
          fill="none"
          stroke="url(#brainGrad)"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 1.7, ease: "easeInOut" }}
        />
        {/* Pulse glow */}
        <motion.circle
          cx="50"
          cy="50"
          r="35"
          fill="none"
          stroke="#B1FA63"
          strokeWidth="0.5"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 0.3, 0], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </motion.div>
  );
}

export default function LandingScreen({ onStart }: LandingScreenProps) {
  const { trackEvent } = useAnalytics();
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    trackEvent('landing_view');
  }, [trackEvent]);

  const handleStart = () => {
    trackEvent('test_started');
    onStart();
  };

  return (
    <div className="relative flex flex-col items-center justify-between h-full p-5 text-center select-none bg-[#050505] text-[#F5F5F7] overflow-hidden">
      {/* Top spacer */}
      <div className="flex-none h-12" />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex-none"
      >
        <img src="/matiks-logo.svg" alt="Matiks" className="w-16 h-auto" />
      </motion.div>

      {/* Center content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-2">
        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5, type: 'spring', stiffness: 120 }}
          className="text-4xl sm:text-5xl font-display tracking-tighter leading-[0.9] uppercase"
        >
          HOW YOUNG <br />
          <span className="text-[#B1FA63]">IS YOUR BRAIN?</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-gray-400 text-sm font-semibold leading-relaxed mt-2"
        >
          Think your brain is young? Prove it.
        </motion.p>

        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          onClick={handleStart}
          className="mt-6 w-full max-w-xs mx-auto py-4 px-6 bg-[#B1FA63] hover:bg-[#9EE555] text-black font-black rounded-full text-base tracking-widest uppercase flex items-center justify-center gap-2 transition-all cursor-pointer animate-pulse-glow"
        >
          TEST YOUR BRAIN <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Brain animation */}
      <div className="flex-none pb-8">
        <BrainAnimation />
      </div>

      {/* How it works - bottom right */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        onClick={() => setShowInfo(true)}
        className="absolute bottom-5 right-5 text-[#B1FA63] text-[11px] font-mono tracking-wider uppercase opacity-60 hover:opacity-100 transition-opacity"
      >
        How it works →
      </motion.button>

      {/* How it works overlay */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#050505]/95 z-50 flex flex-col p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display text-[#B1FA63] tracking-wider uppercase">How it works</h2>
              <button onClick={() => setShowInfo(false)} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 flex flex-col gap-4">
              {ROUNDS.map((round, i) => (
                <motion.div
                  key={round.num}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-7 h-7 rounded-full bg-[#B1FA63]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-mono font-bold text-[#B1FA63]">{round.num}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white tracking-wide uppercase">{round.name}</p>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{round.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <p className="text-[10px] text-gray-600 font-mono text-center mt-4">
              4 rounds · ~60 seconds · get the lowest brain age
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
