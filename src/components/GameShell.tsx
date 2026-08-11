'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingScreen from './LandingScreen';
import Countdown from './Countdown';
import CalculatingScreen from './CalculatingScreen';
import MemoryGame, { MemoryStats } from './MemoryGame';
import RememberReasonGame, { RememberReasonStats } from './RememberReasonGame';
import LogicGridGame from './LogicGridGame';
import ZipGame from './ZipGame';
import PatchPuzzleGame from './PatchPuzzleGame';
import BrainAgeResult from './BrainAgeResult';
import { useAnalytics } from '../hooks/useAnalytics';

type RoundState =
  | 'landing'
  | 'countdown'
  | 'memory-instructions'
  | 'memory'
  | 'remember-reason'
  | 'zip'
  | 'patch'
  | 'calculating'
  | 'result';

export default function GameShell() {
  const { trackEvent } = useAnalytics();
  const [round, setRound] = useState<RoundState>('landing');
  const [timeLeft, setTimeLeft] = useState<number>(15);
  const [showTimesUp, setShowTimesUp] = useState<boolean>(false);
  const [memoryStats, setMemoryStats] = useState<MemoryStats | null>(null);
  const [rememberReasonStats, setRememberReasonStats] = useState<RememberReasonStats | null>(null);
  const [logicGridStats, setLogicGridStats] = useState<{ attempted: number; correct: number; avgTime: number } | null>(null);
  const [zipStats, setZipStats] = useState<{ attempted: number; correct: number; avgTime: number } | null>(null);
  const [patchStats, setPatchStats] = useState<{ attempted: number; correct: number; avgTime: number } | null>(null);
  const [showDebug, setShowDebug] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const isGameplayRound = round === 'memory';
    
    if (isGameplayRound && !showTimesUp) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [round, showTimesUp]);

  useEffect(() => {
    if (timeLeft === 0 && round === 'memory') {
      const showTimeout = setTimeout(() => setShowTimesUp(true), 50);

      const hideTimeout = setTimeout(() => {
        setShowTimesUp(false);
        setTimeLeft(15);
        setRound('zip');
      }, 1050);

      return () => {
        clearTimeout(showTimeout);
        clearTimeout(hideTimeout);
      };
    }
  }, [timeLeft, round]);

  const handleStartShowdown = () => {
    setRound('countdown');
  };

  const handleCountdownComplete = () => {
    setRound('memory-instructions');
  };

  const handleMemoryInstructionsComplete = () => {
    setTimeLeft(15);
    setRound('memory');
  };

  const handleMemoryComplete = (stats: MemoryStats) => {
    setMemoryStats(stats);
  };

  const handleRememberReasonComplete = (stats: RememberReasonStats) => {
    setRememberReasonStats(stats);
    setRound('patch');
  };

  const handleLogicGridComplete = (stats: { attempted: number; correct: number; avgTime: number }) => {
    setLogicGridStats(stats);
    setRound('zip');
  };

  const handleZipComplete = (stats: { attempted: number; correct: number; avgTime: number }) => {
    setZipStats(stats);
    setRound('remember-reason');
  };

  const handlePatchComplete = (stats: { attempted: number; correct: number; avgTime: number }) => {
    setPatchStats(stats);
    setRound('calculating');
  };

  const handleCalculatingComplete = () => {
    trackEvent('test_completed');
    setRound('result');
  };

  return (
    <>
    <div className="relative w-full h-full bg-[#050505] md:shadow-[0_0_50px_rgba(0,0,0,0.8)] md:border md:border-gray-900 md:rounded-[36px] md:max-w-[390px] md:max-h-[844px] flex flex-col justify-between overflow-y-auto">
      <AnimatePresence>
        {showTimesUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="absolute inset-0 bg-[#050505]/95 z-50 flex items-center justify-center select-none"
          >
            <motion.h2
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="text-4xl font-display text-[#FF6666] tracking-wider uppercase"
            >
              Time&apos;s Up!
            </motion.h2>
          </motion.div>
        )}
      </AnimatePresence>

      {round === 'landing' && <LandingScreen onStart={handleStartShowdown} />}
      {round === 'countdown' && <Countdown onComplete={handleCountdownComplete} />}
      {round === 'memory-instructions' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center select-none">
          <h1 className="text-3xl font-display text-white tracking-tight uppercase mb-4">MEMORY TILES</h1>
          <p className="text-sm text-gray-400 font-mono leading-relaxed mb-8 max-w-[280px]">
            Remember the highlighted tiles. They'll disappear. Recreate the pattern from memory.
          </p>
          <button
            onClick={handleMemoryInstructionsComplete}
            className="w-full max-w-[280px] bg-[#B1FA63] text-black font-display text-xl font-bold tracking-wider uppercase py-4 rounded-xl"
          >
            I'M READY
          </button>
        </div>
      )}
      {round === 'memory' && (
        <MemoryGame timeLeft={timeLeft} onGameEnd={handleMemoryComplete} />
      )}
      {round === 'remember-reason' && (
        <RememberReasonGame onGameEnd={handleRememberReasonComplete} />
      )}
      {round === 'zip' && (
        <ZipGame onGameEnd={handleZipComplete} />
      )}
      {round === 'patch' && (
        <PatchPuzzleGame onGameEnd={handlePatchComplete} />
      )}
      {round === 'calculating' && (
        <CalculatingScreen onComplete={handleCalculatingComplete} />
      )}
      {round === 'result' && (
        <BrainAgeResult
          memoryStats={memoryStats || { attempts: 0, correct: 0, incorrect: 0, accuracy: 0, levelReached: 1, avgTime: 0 }}
          rememberReasonStats={rememberReasonStats || { attempted: 0, correct: 0, avgTime: 0 }}
          zipStats={zipStats || { attempted: 0, correct: 0, avgTime: 0 }}
          patchStats={patchStats || { attempted: 0, correct: 0, avgTime: 0 }}
        />
      )}
      </div>
      {/* Debug Panel */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 text-gray-500 text-xs font-mono flex items-center justify-center hover:bg-gray-700"
        >
          D
        </button>
        {showDebug && (
          <div className="absolute bottom-10 right-0 bg-[#111111] border border-gray-800 rounded-lg p-2 min-w-[140px] shadow-xl">
            <p className="text-[9px] font-mono text-gray-600 mb-1 px-1">JUMP TO:</p>
            {(['landing', 'memory-instructions', 'memory', 'remember-reason', 'zip', 'patch', 'calculating', 'result'] as RoundState[]).map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRound(r);
                  setShowDebug(false);
                }}
                className={`block w-full text-left px-2 py-1 text-xs font-mono rounded ${
                  round === r ? 'bg-[#B1FA63]/20 text-[#B1FA63]' : 'text-gray-400 hover:bg-gray-800'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
