'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAnalytics } from '../hooks/useAnalytics';
import ShareCard from './ShareCard';
import ShareButtons from './ShareButtons';
import { MemoryStats } from './MemoryGame';
import { RememberReasonStats } from './RememberReasonGame';
import {
  calculateMemoryScore,
  calculateRememberReasonScore,
  calculateZipScore,
  calculatePatchScore,
  calculateOverallScore,
  getBrainAge,
  getBrainAgeCategory,
  getBrainAgeMessage,
  logScoringDebug,
} from '../utils/brainAge';

interface BrainAgeResultProps {
  memoryStats: MemoryStats;
  rememberReasonStats: RememberReasonStats;
  zipStats: { attempted: number; correct: number; avgTime: number };
  patchStats: { attempted: number; correct: number; avgTime: number };
}

export default function BrainAgeResult({ memoryStats, rememberReasonStats, zipStats, patchStats }: BrainAgeResultProps) {
  const { trackEvent } = useAnalytics();
  const [cardDataUrl, setCardDataUrl] = useState<string | null>(null);

  useEffect(() => {
    trackEvent('result_viewed');
  }, [trackEvent]);

  const memResult = calculateMemoryScore(
    memoryStats.attempts,
    memoryStats.correct,
    memoryStats.levelReached ?? 1,
    memoryStats.avgTime ?? 3,
  );

  const rrResult = calculateRememberReasonScore(
    rememberReasonStats.attempted,
    rememberReasonStats.correct,
    rememberReasonStats.avgTime,
  );

  const zipResult = calculateZipScore(
    zipStats.attempted,
    zipStats.correct,
    zipStats.avgTime,
  );

  const patchResult = calculatePatchScore(
    patchStats.attempted,
    patchStats.correct,
    patchStats.avgTime,
  );

  const overallScore = calculateOverallScore(memResult.final, rrResult.final, zipResult.final, patchResult.final);
  const brainAge = getBrainAge(overallScore);
  const category = getBrainAgeCategory(brainAge);
  const brainAgeMessage = getBrainAgeMessage(brainAge);

  useEffect(() => {
    logScoringDebug(
      { attempts: memoryStats.attempts, correct: memoryStats.correct, levelReached: memoryStats.levelReached ?? 1, avgTime: memoryStats.avgTime ?? 3 },
      { attempted: rememberReasonStats.attempted, correct: rememberReasonStats.correct, avgTime: rememberReasonStats.avgTime },
      { attempted: zipStats.attempted, correct: zipStats.correct, avgTime: zipStats.avgTime },
      { attempted: patchStats.attempted, correct: patchStats.correct, avgTime: patchStats.avgTime },
    );
  }, []);

  return (
    <div className="flex-1 flex flex-col p-5 select-none bg-[#050505] text-[#F5F5F7] overflow-y-auto no-scrollbar">
      <div className="text-center pt-2 mb-3 flex flex-col items-center gap-1">
        <img src="/matiks-logo.svg" alt="Matiks" className="w-14 h-auto" />
        <h1 className="text-xs font-display tracking-wider uppercase text-white">HOW YOUNG IS YOUR BRAIN?</h1>
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, delay: 0.1 }}
        className="relative w-28 h-28 flex flex-col items-center justify-center bg-[#111111] rounded-full border-4 border-[#B1FA63] mx-auto mb-3"
      >
        <span className="text-[9px] font-mono font-bold text-gray-500 tracking-wider">BRAIN AGE</span>
        <span className="text-4xl font-display text-white font-mono leading-none my-0.5">{brainAge}</span>
      </motion.div>

      <div className="text-center mb-3">
        <div className="text-lg font-display text-[#B1FA63] tracking-tight uppercase">{category.name}</div>
      </div>

      <div className="w-full max-w-[260px] mx-auto space-y-2 mb-4">
        <div className="space-y-0.5">
          <div className="flex justify-between text-[11px] font-bold text-gray-200">
            <span>MEMORY</span>
            <span className="text-[#B1FA63] font-mono">{memoryStats.correct} solved</span>
          </div>
          <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${memResult.final}%` }} transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }} className="h-full bg-[#B1FA63]" />
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="flex justify-between text-[11px] font-bold text-gray-200">
            <span>REASONING</span>
            <span className="text-[#B1FA63] font-mono">{rememberReasonStats.correct} correct</span>
          </div>
          <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${rrResult.final}%` }} transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }} className="h-full bg-[#B1FA63]" />
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="flex justify-between text-[11px] font-bold text-gray-200">
            <span>ZIP</span>
            <span className="text-[#B1FA63] font-mono">{zipResult.final}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${zipResult.final}%` }} transition={{ duration: 0.8, ease: 'easeOut', delay: 0.7 }} className="h-full bg-[#B1FA63]" />
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="flex justify-between text-[11px] font-bold text-gray-200">
            <span>PATCHES</span>
            <span className="text-[#B1FA63] font-mono">{patchResult.final}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${patchResult.final}%` }} transition={{ duration: 0.8, ease: 'easeOut', delay: 0.9 }} className="h-full bg-[#B1FA63]" />
          </div>
        </div>
      </div>

      <div className="sr-only">
        <ShareCard
          brainAge={brainAge}
          category={category.name}
          description={category.description}
          scores={{ memory: memResult.final, reasoning: rrResult.final, zip: zipResult.final, patches: patchResult.final }}
          onCardGenerated={setCardDataUrl}
        />
      </div>

      <div className="mb-4">
        <ShareButtons cardDataUrl={cardDataUrl} brainAge={brainAge} message={brainAgeMessage} />
      </div>

      <a href="https://matiks.com" target="_blank" rel="noopener noreferrer" className="text-center group mb-3 bg-[#111111] border border-gray-800/60 rounded-xl p-4">
        <p className="text-sm text-white font-bold mb-1">Want to make your brain sharper?</p>
        <span className="text-xs font-black text-[#B1FA63] uppercase tracking-wider group-hover:underline">Explore Matiks →</span>
      </a>

      <div className="text-center pt-2 border-t border-gray-800/40">
        <p className="text-[9px] text-gray-600 font-mono mb-1">powered by</p>
        <img src="/matiks-logo.svg" alt="Matiks" className="w-10 h-auto mx-auto" />
      </div>

      <div className="mt-8 mb-4 text-center">
        <div className="w-12 h-px bg-gray-800/50 mx-auto mb-5" />
        <svg className="w-3.5 h-3.5 mx-auto mb-2 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <p className="text-[9px] font-mono tracking-[0.2em] text-gray-600 uppercase mb-2">Just for fun</p>
        <p className="text-[11px] text-gray-600 font-mono leading-relaxed max-w-[260px] mx-auto">
          &ldquo;This is a playful estimate based on your performance in this test. It isn&rsquo;t a scientific measure of intelligence or brain age.&rdquo;
        </p>
      </div>
    </div>
  );
}
