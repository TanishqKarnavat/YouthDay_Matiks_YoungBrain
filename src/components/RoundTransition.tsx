'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface RoundTransitionProps {
  roundName: string;
  subtitle: string;
  colorClass: string;
  onComplete: () => void;
}

export default function RoundTransition({ roundName, subtitle, colorClass, onComplete }: RoundTransitionProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 1400);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-6 text-center select-none game-container bg-[#050505] text-[#F5F5F7]">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        transition={{ duration: 0.3, type: 'spring', stiffness: 150 }}
        className="space-y-4 max-w-xs"
      >
        <div className="text-[10px] font-black tracking-[0.3em] uppercase text-[#B1FA63]">
          ROUND COMPLETE
        </div>
        
        <h2 className="text-3xl font-extrabold tracking-tight uppercase leading-none text-white">
          {roundName}
        </h2>
        
        <p className="text-gray-400 text-sm font-medium italic mt-2">
          {subtitle}
        </p>

        {/* Loading track/bar */}
        <div className="w-24 h-1 bg-gray-900 rounded-full mx-auto overflow-hidden mt-6">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="h-full bg-[#B1FA63]"
          />
        </div>
      </motion.div>
    </div>
  );
}
