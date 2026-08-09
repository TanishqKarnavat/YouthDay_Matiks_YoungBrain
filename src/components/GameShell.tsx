'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingScreen from './LandingScreen';
import Countdown from './Countdown';
import RoundTransition from './RoundTransition';
import CalculatingScreen from './CalculatingScreen';
import MemoryGame, { MemoryStats } from './MemoryGame';
import MentalMathGame, { MathStats } from './MentalMathGame';
import MathMazeGame, { MazeStats } from './MathMazeGame';
import BrainAgeResult from './BrainAgeResult';
import { useAnalytics } from '../hooks/useAnalytics';

type RoundState =
  | 'landing'
  | 'countdown'
  | 'memory'
  | 'transition1'
  | 'math'
  | 'transition2'
  | 'maze'
  | 'calculating'
  | 'result';

export default function GameShell() {
  const { trackEvent } = useAnalytics();
  // Navigation / game phases
  const [round, setRound] = useState<RoundState>('landing');
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [showTimesUp, setShowTimesUp] = useState<boolean>(false);

  // Stats repositories
  const [memoryStats, setMemoryStats] = useState<MemoryStats | null>(null);
  const [mathStats, setMathStats] = useState<MathStats | null>(null);
  const [mazeStats, setMazeStats] = useState<MazeStats | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Centralized Timer tick logic for active gameplay rounds
  useEffect(() => {
    const isGameplayRound = round === 'memory' || round === 'math' || round === 'maze';
    
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

  // Handle round timeout AFTER timeLeft hits 0 (separate from timer to avoid anti-pattern)
  useEffect(() => {
    if (timeLeft === 0 && (round === 'memory' || round === 'math' || round === 'maze')) {
      // Defer to allow child games' useEffect([timeLeft]) to fire first and capture stats
      const showTimeout = setTimeout(() => setShowTimesUp(true), 50);

      const hideTimeout = setTimeout(() => {
        setShowTimesUp(false);
        setTimeLeft(20);
        setRound((current) => {
          if (current === 'memory') return 'transition1';
          if (current === 'math') return 'transition2';
          if (current === 'maze') return 'calculating';
          return current;
        });
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
    setTimeLeft(20);
    setRound('memory');
  };

  // Game callbacks to capture statistics
  const handleMemoryComplete = (stats: MemoryStats) => {
    setMemoryStats(stats);
  };

  const handleMathComplete = (stats: MathStats) => {
    setMathStats(stats);
  };

  const handleMazeComplete = (stats: MazeStats) => {
    setMazeStats(stats);
  };

  const handleCalculatingComplete = () => {
    trackEvent('test_completed');
    setRound('result');
  };

  return (
    <div className="relative w-full max-w-[390px] h-full max-h-[844px] overflow-hidden bg-[#050505] shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-gray-900 md:rounded-[36px] flex flex-col justify-between">
      {/* TIME'S UP Overlay */}
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
              className="text-4xl font-black text-[#FF6666] tracking-wider uppercase"
            >
              Time&apos;s Up!
            </motion.h2>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen Routing */}
      {round === 'landing' && <LandingScreen onStart={handleStartShowdown} />}

      {round === 'countdown' && <Countdown onComplete={handleCountdownComplete} />}

      {round === 'memory' && (
        <MemoryGame timeLeft={timeLeft} onGameEnd={handleMemoryComplete} />
      )}

      {round === 'transition1' && (
        <RoundTransition
          roundName="Memory Complete"
          subtitle="Nice. Now let's test your numbers."
          colorClass="text-[#00E5FF]"
          onComplete={() => {
            setTimeLeft(20);
            setRound('math');
          }}
        />
      )}

      {round === 'math' && (
        <MentalMathGame timeLeft={timeLeft} onGameEnd={handleMathComplete} />
      )}

      {round === 'transition2' && (
        <RoundTransition
          roundName="Math Complete"
          subtitle="Sleek. Can you find the target path?"
          colorClass="text-[#2979FF]"
          onComplete={() => {
            setTimeLeft(20);
            setRound('maze');
          }}
        />
      )}

      {round === 'maze' && (
        <MathMazeGame timeLeft={timeLeft} onGameEnd={handleMazeComplete} />
      )}

      {round === 'calculating' && (
        <CalculatingScreen onComplete={handleCalculatingComplete} />
      )}

      {round === 'result' && (
        <BrainAgeResult
          memoryStats={memoryStats || { attempts: 0, correct: 0, incorrect: 0, accuracy: 0, levelReached: 1, avgTime: 0 }}
          mathStats={mathStats || { attempts: 0, correct: 0, incorrect: 0, accuracy: 0, avgTime: 0 }}
          mazeStats={mazeStats || { attempts: 0, correct: 0, accuracy: 0, avgTime: 0 }}
        />
      )}
    </div>
  );
}
