'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CountdownProps {
  onComplete: () => void;
}

const steps = ['READY?', '3', '2', '1', 'GO!'];

export default function Countdown({ onComplete }: CountdownProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex >= steps.length) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, currentIndex === 0 ? 1000 : currentIndex === steps.length - 1 ? 800 : 1000);

    return () => clearTimeout(timer);
  }, [currentIndex, onComplete]);

  if (currentIndex >= steps.length) {
    return null;
  }

  const currentText = steps[currentIndex];
  const isNumber = !isNaN(Number(currentText));

  return (
    <div className="flex-1 flex items-center justify-center bg-[#050505] text-[#F5F5F7]">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.8, filter: 'blur(10px)' }}
          transition={{ 
            duration: 0.35,
            ease: [0.34, 1.56, 0.64, 1] // satisfying elastic pop
          }}
          className="select-none font-extrabold text-center"
        >
          {isNumber ? (
            <span className="text-[20vw] sm:text-[120px] leading-none text-white tracking-tight drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              {currentText}
            </span>
          ) : (
            <span className={`text-4xl sm:text-5xl md:text-5xl font-display uppercase tracking-widest ${
              currentText === 'GO!' 
                ? 'text-[#B1FA63] text-[14vw] sm:text-[80px]' 
                : 'text-white'
            }`}>
              {currentText}
            </span>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
