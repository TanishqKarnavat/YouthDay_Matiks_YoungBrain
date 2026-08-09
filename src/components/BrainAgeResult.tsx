'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAnalytics } from '../hooks/useAnalytics';
import ShareCard from './ShareCard';
import ShareButtons from './ShareButtons';
import { MemoryStats } from './MemoryGame';
import { MathStats } from './MentalMathGame';
import { MazeStats } from './MathMazeGame';
import { User } from 'lucide-react';

interface BrainAgeResultProps {
  memoryStats: MemoryStats;
  mathStats: MathStats;
  mazeStats: MazeStats;
}

interface CategoryDetail {
  name: string;
  description: string;
  slogan: string;
}

export default function BrainAgeResult({ memoryStats, mathStats, mazeStats }: BrainAgeResultProps) {
  const { trackEvent } = useAnalytics();
  const [actualAge, setActualAge] = useState<string>('');
  const [cardDataUrl, setCardDataUrl] = useState<string | null>(null);

  useEffect(() => {
    trackEvent('result_viewed');
  }, [trackEvent]);

  // --- Per-game scoring (0-100 each) ---
  // Each game: accuracy (40%) + speed (30%) + progression (30%)

  const speedBonus = (avgTime: number, threshold: number) => {
    if (avgTime <= 0) return 0;
    return Math.min(1, Math.max(0, 1 - (avgTime / threshold)));
  };

  // MEMORY: accuracy + speed + level reached
  const memoryAccuracy = memoryStats.attempts > 0 ? memoryStats.correct / memoryStats.attempts : 0;
  const memorySpeed = speedBonus(memoryStats.avgTime ?? 3, 3);
  const memoryProgress = Math.min(1, (memoryStats.levelReached ?? 1) / 8);
  const memoryScore = Math.round((memoryAccuracy * 0.4 + memorySpeed * 0.3 + memoryProgress * 0.3) * 100);

  // MENTAL MATH: accuracy + speed + correct count
  const mathAccuracy = mathStats.attempts > 0 ? mathStats.correct / mathStats.attempts : 0;
  const mathSpeed = speedBonus(mathStats.avgTime ?? 5, 5);
  const mathProgress = Math.min(1, mathStats.correct / 5);
  const mathScore = Math.round((mathAccuracy * 0.4 + mathSpeed * 0.3 + mathProgress * 0.3) * 100);

  // MAZE: accuracy + speed + mazes solved
  const mazeAccuracy = mazeStats.attempts > 0 ? mazeStats.correct / mazeStats.attempts : 0;
  const mazeSpeed = speedBonus(mazeStats.avgTime ?? 8, 8);
  const mazeProgress = Math.min(1, mazeStats.correct / 3);
  const mazeScore = Math.round((mazeAccuracy * 0.4 + mazeSpeed * 0.3 + mazeProgress * 0.3) * 100);

  // OVERALL: weighted average (memory 35%, math 35%, maze 30%)
  const overallScore = Math.round(memoryScore * 0.35 + mathScore * 0.35 + mazeScore * 0.30);

  // BRAIN AGE: 100% → 16, 0% → 75
  const brainAge = Math.max(16, Math.min(75, Math.round(75 - overallScore * 0.59)));

  // Determine categories
  const getCategoryDetail = (age: number): CategoryDetail => {
    if (age <= 18) {
      return {
        name: 'BABY BRAIN',
        description: 'Your brain is running on pure raw power. Zero lag.',
        slogan: "Your brain hasn't discovered taxes yet."
      };
    }
    if (age <= 26) {
      return {
        name: 'CERTIFIED YOUNG',
        description: 'Your brain is running on new-gen software.',
        slogan: 'Sleek, fast, and optimized.'
      };
    }
    if (age <= 39) {
      return {
        name: 'STILL GOT IT',
        description: 'Mostly functional and responsive.',
        slogan: 'Still got it. Mostly.'
      };
    }
    if (age <= 55) {
      return {
        name: 'PREMATURE UNCLE',
        description: 'A bit sluggish, but still online.',
        slogan: 'Please update your system software.'
      };
    }
    return {
      name: 'UNCLE MODE',
      description: 'Classic legacy hardware. Needs rebooting.',
      slogan: 'Uncle mode activated. Call your nephew.'
    };
  };

  const category = getCategoryDetail(brainAge);

  return (
    <div className="flex-1 flex flex-col justify-between p-6 select-none bg-[#050505] text-[#F5F5F7] overflow-y-auto no-scrollbar max-h-screen">
      {/* Top Title */}
      <div className="text-center pt-2 mb-4 flex flex-col items-center gap-2">
        <img src="/matiks-logo.png" alt="Matiks" className="w-14 h-7" />
        <span className="text-[10px] font-black tracking-[0.3em] text-[#B1FA63] uppercase block">
          WORLD YOUTH DAY
        </span>
        <h1 className="text-sm font-black tracking-wider uppercase text-white">
          HOW YOUNG IS YOUR BRAIN?
        </h1>
      </div>

      {/* Main Results Board */}
      <div className="space-y-6 flex-1 flex flex-col items-center">
        {/* Brain Age Circle Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100, delay: 0.1 }}
          className="relative w-36 h-36 flex flex-col items-center justify-center bg-[#111111] rounded-full border-4 border-[#B1FA63]"
        >
          <span className="text-[10px] font-mono font-bold text-gray-500 tracking-wider">
            BRAIN AGE
          </span>
          <span className="text-5xl font-black text-white font-mono leading-none my-1">
            {brainAge}
          </span>
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
            MATIKS SCORE
          </span>
        </motion.div>

        {/* Category Header */}
        <div className="text-center space-y-1">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-black text-[#B1FA63] tracking-tight uppercase"
          >
            {category.name}
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 text-xs font-semibold max-w-[240px] mx-auto leading-relaxed"
          >
            {category.description}
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-[#8BD44A] text-xs font-mono font-medium italic pt-1"
          >
            &ldquo;{category.slogan}&rdquo;
          </motion.p>
        </div>

        {/* Dynamic Age Comparison */}
        <div className="w-full max-w-[280px] bg-[#111111] border border-gray-800/60 rounded-xl p-3 flex items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-[11px] font-mono text-gray-400">Actual Age:</span>
          </div>
          <input
            type="number"
            value={actualAge}
            onChange={(e) => setActualAge(e.target.value)}
            placeholder="Type your age"
            className="w-20 bg-[#1A1A1A] border border-gray-800 rounded px-2 py-1 text-right text-xs font-mono font-bold text-white outline-none focus:border-[#B1FA63] transition-all"
          />
        </div>

        {/* Actual vs Brain Age comparison display */}
        {actualAge && (
          <div className="text-xs font-mono text-gray-400 text-center">
            {parseInt(actualAge) > brainAge ? (
              <span>Your brain is <strong className="text-[#B1FA63]">{parseInt(actualAge) - brainAge} years younger</strong> than you!</span>
            ) : parseInt(actualAge) < brainAge ? (
              <span>Your brain is <strong className="text-[#FF6666]">{brainAge - parseInt(actualAge)} years older</strong> than you!</span>
            ) : (
              <span>Your brain is exactly matches your age! Perfectly balanced.</span>
            )}
          </div>
        )}

        {/* Dimension Breakdown Metrics */}
        <div className="w-full max-w-[280px] space-y-3.5">
          <h3 className="text-[10px] font-mono font-bold text-gray-500 tracking-wider uppercase border-b border-gray-800 pb-1.5">
            Cognitive Dimension Scores
          </h3>

          {/* Memory Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-gray-200">
              <span>MEMORY</span>
              <span className="text-[#B1FA63] font-mono">{memoryScore}%</span>
            </div>
            <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${memoryScore}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                className="h-full bg-[#B1FA63]"
              />
            </div>
          </div>

          {/* Math Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-gray-200">
              <span>MENTAL MATH</span>
              <span className="text-[#8BD44A] font-mono">{mathScore}%</span>
            </div>
            <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${mathScore}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.45 }}
                className="h-full bg-[#8BD44A]"
              />
            </div>
          </div>

          {/* Maze Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-gray-200">
              <span>MATH MAZE</span>
              <span className="text-[#6BC93A] font-mono">{mazeScore}%</span>
            </div>
            <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${mazeScore}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.6 }}
                className="h-full bg-[#6BC93A]"
              />
            </div>
          </div>
        </div>

        {/* Share Card Preview Title */}
        <div className="w-full max-w-[280px] pt-4">
          <h3 className="text-[10px] font-mono font-bold text-gray-500 tracking-wider uppercase border-b border-gray-800 pb-1.5 mb-3 text-left">
            Shareable Card Preview
          </h3>
          <div className="flex justify-center">
            <ShareCard
              brainAge={brainAge}
              category={category.name}
              description={category.description}
              scores={{
                memory: memoryScore,
                math: mathScore,
                maze: mazeScore
              }}
              onCardGenerated={setCardDataUrl}
            />
          </div>
        </div>

        {/* Share Action Buttons */}
        <div className="w-full pt-2">
          <ShareButtons
            cardDataUrl={cardDataUrl}
            brainAge={brainAge}
            category={category.name}
          />
        </div>

        {/* Matiks CTA */}
        <a
          href="https://matiks.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full max-w-[280px] text-center group"
        >
          <p className="text-[11px] text-gray-400 font-semibold mb-1">
            Want to make your brain sharper?
          </p>
          <p className="text-[10px] text-gray-500 font-mono mb-2">
            Matiks turns screen time into smart time.
          </p>
          <span className="text-xs font-black text-[#B1FA63] uppercase tracking-wider group-hover:underline">
            Explore Matiks →
          </span>
        </a>
      </div>

      {/* Powered By Footer */}
      <div className="text-center pt-4 pb-2 border-t border-gray-800/40 flex flex-col items-center gap-1">
        <img src="/matiks-logo.png" alt="Matiks" className="w-10 h-5" />
        <span className="text-[9px] font-black text-[#B1FA63] uppercase tracking-[0.2em] block">
          WORLD YOUTH DAY 2026
        </span>
      </div>
    </div>
  );
}
