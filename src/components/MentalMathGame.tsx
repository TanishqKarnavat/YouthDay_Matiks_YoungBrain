'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockMathChains, generateDynamicMathChain, MathChain } from '../data/mathQuestions';
import { useAnalytics } from '../hooks/useAnalytics';
import { Delete } from 'lucide-react';

interface MentalMathGameProps {
  timeLeft: number;
  onGameEnd: (stats: MathStats) => void;
}

export interface MathStats {
  attempts: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  avgTime: number;
}

export default function MentalMathGame({ timeLeft, onGameEnd }: MentalMathGameProps) {
  const { trackEvent } = useAnalytics();

  const [currentChain, setCurrentChain] = useState<MathChain | null>(null);
  const [inputVal, setInputVal] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [isShake, setIsShake] = useState(false);
  const [chainIndex, setChainIndex] = useState(0);

  const statsRef = useRef<MathStats>({ attempts: 0, correct: 0, incorrect: 0, accuracy: 0, avgTime: 0 });
  const [displayStats, setDisplayStats] = useState({ correct: 0, attempts: 0 });
  const questionStartTimeRef = useRef<number>(0);
  const totalResponseTimeRef = useRef<number>(0);
  const onGameEndRef = useRef(onGameEnd);

  useEffect(() => { onGameEndRef.current = onGameEnd; });

  const loadChain = (idx: number) => {
    let chain: MathChain;
    if (idx < mockMathChains.length) {
      chain = mockMathChains[idx];
    } else {
      chain = generateDynamicMathChain(idx - mockMathChains.length + 3);
    }
    setCurrentChain(chain);
    setInputVal('');
    setFeedback(null);
    questionStartTimeRef.current = Date.now();
  };

  useEffect(() => {
    trackEvent('math_started');
    loadChain(0);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      const total = statsRef.current.attempts;
      statsRef.current.accuracy = total > 0 ? Math.round((statsRef.current.correct / total) * 100) : 0;
      statsRef.current.avgTime = statsRef.current.correct > 0
        ? parseFloat((totalResponseTimeRef.current / statsRef.current.correct).toFixed(2))
        : 0;
      trackEvent('math_completed', statsRef.current);
      onGameEndRef.current(statsRef.current);
    }
  }, [timeLeft]);

  const handleKeyPress = (char: string) => {
    if (feedback !== null) return;
    if (char === '-') {
      setInputVal((prev) => {
        if (prev.startsWith('-')) return prev.slice(1);
        return '-' + prev;
      });
    } else {
      if (inputVal.replace('-', '').length >= 4) return;
      setInputVal((prev) => prev + char);
    }
  };

  const handleBackspace = () => {
    if (feedback !== null) return;
    setInputVal((prev) => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (!currentChain || inputVal === '' || inputVal === '-' || feedback !== null) return;
    const numericAnswer = parseInt(inputVal);
    const isCorrect = numericAnswer === currentChain.answer;
    statsRef.current.attempts += 1;
    // eslint-disable-next-line react-hooks/purity
    const timeTaken = (Date.now() - questionStartTimeRef.current) / 1000;

    if (isCorrect) {
      setFeedback('correct');
      statsRef.current.correct += 1;
      totalResponseTimeRef.current += timeTaken;
      setDisplayStats({ correct: statsRef.current.correct, attempts: statsRef.current.attempts });
      setTimeout(() => {
        const nextIdx = chainIndex + 1;
        setChainIndex(nextIdx);
        loadChain(nextIdx);
      }, 300);
    } else {
      setFeedback('incorrect');
      statsRef.current.incorrect += 1;
      setDisplayStats({ correct: statsRef.current.correct, attempts: statsRef.current.attempts });
      setIsShake(true);
      setTimeout(() => {
        setIsShake(false);
        const nextIdx = chainIndex + 1;
        setChainIndex(nextIdx);
        loadChain(nextIdx);
      }, 400);
    }
  };

  // Debounced auto-submit: waits 400ms after last keystroke
  const autoSubmitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current);

    if (inputVal !== '' && inputVal !== '-' && feedback === null && currentChain) {
      autoSubmitTimerRef.current = setTimeout(() => {
        handleSubmit();
      }, 400);
    }

    return () => {
      if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current);
    };
  }, [inputVal, feedback, currentChain]);

  // Physical keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (feedback !== null) return;
      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === '-') {
        handleKeyPress('-');
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Enter') {
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [feedback, inputVal, currentChain, chainIndex]);

  if (!currentChain) return null;

  const liveAccuracy = displayStats.attempts > 0 ? Math.round((displayStats.correct / displayStats.attempts) * 100) : 100;
  const timerColor = timeLeft > 10 ? 'bg-[#B1FA63]' : timeLeft > 5 ? 'bg-[#8BD44A]' : 'bg-[#FF6666]';
  const timerTextColor = timeLeft > 10 ? 'text-gray-300' : timeLeft > 5 ? 'text-[#8BD44A]' : 'text-[#FF6666]';

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050505] text-white select-none">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-2 pb-1">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#B1FA63] uppercase block">ROUND 2</span>
          <h2 className="text-lg font-black text-white tracking-tight uppercase">MENTAL MATH</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#B1FA63]">{liveAccuracy}%</span>
          <div className="flex items-center gap-1.5 bg-[#111111] px-3 py-1.5 rounded-full">
            <div className={`w-2 h-2 rounded-full ${timerColor} animate-pulse`} />
            <span className={`text-xs font-mono ${timerTextColor}`}>
              00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
            </span>
          </div>
        </div>
      </div>

      {/* Calculator tape */}
      <div className="flex flex-col items-center justify-center px-4 py-1">
        <motion.div
          key={currentChain.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`space-y-0 text-center ${isShake ? 'animate-shake' : ''}`}
        >
          {/* Start value */}
          <div className="text-2xl font-bold text-white">{currentChain.startValue}</div>
          {/* Operations */}
          {currentChain.operations.map((op, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="text-xl font-bold"
            >
              <span className="text-gray-500 mr-1">{op.operator}</span>
              <span className="text-white">{op.value}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Input area */}
      <div className="px-4 pb-1">
        <div
          className={`w-full h-10 rounded-xl border flex items-center justify-center text-base font-bold transition-all duration-150 ${
            feedback === 'correct'
              ? 'border-[#B1FA63] text-[#B1FA63] bg-[#B1FA63]/10 animate-pop-in'
              : feedback === 'incorrect'
                ? 'border-[#FF6666] text-[#FF6666] bg-[#FF6666]/10 animate-shake'
                : 'border-gray-700 text-gray-400 bg-[#111111]'
          }`}
        >
          {inputVal === '' ? 'Enter answer' : inputVal}
        </div>
      </div>

      {/* Keypad */}
      <div className="px-4 pb-3">
        <div className="grid grid-cols-3 gap-1.5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="py-2 bg-[#111111] hover:bg-[#1A1A1A] text-white font-bold text-base rounded-xl border border-gray-700/40 cursor-pointer active:bg-gray-700"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handleKeyPress('-')}
            className="py-2 bg-[#111111] text-white font-bold text-base rounded-xl border border-gray-700/40 cursor-pointer"
          >
            .
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className="py-2 bg-[#111111] text-white font-bold text-base rounded-xl border border-gray-700/40 cursor-pointer"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="py-2 bg-[#111111] text-gray-400 rounded-xl border border-gray-700/40 flex items-center justify-center cursor-pointer"
          >
            <Delete className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
