'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CalculatingScreenProps {
  onComplete: () => void;
}

const loadingTexts = [
  'Collating correctness indexes...',
  'Analyzing cognitive speed profiles...',
  'Matching patterns against youth stats...',
  'Determining Brain Age...'
];

export default function CalculatingScreen({ onComplete }: CalculatingScreenProps) {
  const [textIndex, setTextIndex] = useState(0);
  const [randomAge, setRandomAge] = useState(25);
  const onCompleteRef = useRef(onComplete);

  // Keep ref in sync with latest props
  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    // Cycle text every 400ms
    const textTimer = setInterval(() => {
      setTextIndex((prev) => (prev < loadingTexts.length - 1 ? prev + 1 : prev));
    }, 450);

    // Dynamic number counter effect
    const numberTimer = setInterval(() => {
      setRandomAge(Math.floor(Math.random() * 65) + 15);
    }, 60);

    // Finish screen
    const finishTimer = setTimeout(() => {
      onCompleteRef.current();
    }, 1800);

    return () => {
      clearInterval(textTimer);
      clearInterval(numberTimer);
      clearTimeout(finishTimer);
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col justify-between p-6 text-center select-none bg-[#050505] text-[#F5F5F7]">
      <div className="pt-8 flex flex-col items-center gap-2">
        <img src="/matiks-logo.svg" alt="Matiks" className="w-14 h-auto" />
        <span className="text-[10px] font-display tracking-[0.3em] text-[#B1FA63] uppercase">
          SHOWDOWN COMPLETE
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center">
        {/* Animated large ticker */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center border-4 border-dashed border-[#B1FA63]/20 rounded-full mb-6"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
            className="absolute inset-0 border-4 border-transparent border-t-[#B1FA63] rounded-full"
          />
          <span className="text-5xl font-black font-mono text-white">
            {randomAge}
          </span>
        </motion.div>

        <h2 className="text-xl font-bold tracking-tight text-white mb-2 uppercase">
          Calculating your brain age...
        </h2>

        {/* Loading text messages fade-in */}
        <div className="h-6 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={textIndex}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-xs text-gray-500 font-mono"
            >
              {loadingTexts[textIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <div className="pb-8">
        <span className="text-[10px] text-gray-700 font-mono">
          MATIKS AI COGNITIVE ASSESSOR v1.2
        </span>
      </div>
    </div>
  );
}
