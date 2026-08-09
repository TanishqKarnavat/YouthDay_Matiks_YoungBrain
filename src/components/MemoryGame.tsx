'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { memoryLevels, generateMemoryPattern, MemoryLevelConfig } from '../data/memoryQuestions';
import { useAnalytics } from '../hooks/useAnalytics';

interface MemoryGameProps {
  timeLeft: number;
  onGameEnd: (stats: MemoryStats) => void;
}

export interface MemoryStats {
  attempts: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  levelReached: number;
  avgTime: number;
}

type GameState = 'memorize' | 'input' | 'feedback';

export default function MemoryGame({ timeLeft, onGameEnd }: MemoryGameProps) {
  const { trackEvent } = useAnalytics();

  const [levelIndex, setLevelIndex] = useState(0);
  const [gameState, setGameState] = useState<GameState>('memorize');
  const [pattern, setPattern] = useState<number[]>([]);
  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
  const [feedbackType, setFeedbackType] = useState<'correct' | 'incorrect' | null>(null);

  const statsRef = useRef<MemoryStats>({ attempts: 0, correct: 0, incorrect: 0, accuracy: 0, levelReached: 1, avgTime: 0 });
  const [displayStats, setDisplayStats] = useState({ attempts: 0, correct: 0 });
  const levelStartTimeRef = useRef<number>(Date.now());
  const totalTimeRef = useRef<number>(0);

  const levelIndexRef = useRef(0);
  const onGameEndRef = useRef(onGameEnd);
  const memorizeTimerCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => { onGameEndRef.current = onGameEnd; });

  const currentLevel: MemoryLevelConfig = memoryLevels[Math.min(levelIndex, memoryLevels.length - 1)];

  useEffect(() => { levelIndexRef.current = levelIndex; }, [levelIndex]);

  const generateNewLevelPattern = (idx: number) => {
    if (memorizeTimerCleanupRef.current) memorizeTimerCleanupRef.current();
    const lvl = memoryLevels[Math.min(idx, memoryLevels.length - 1)];
    const newPattern = generateMemoryPattern(lvl.gridSize, lvl.highlightCount);
    setPattern(newPattern);
    setSelectedTiles([]);
    setGameState('memorize');
    setFeedbackType(null);
    const timer = setTimeout(() => setGameState('input'), lvl.displayMs);
    memorizeTimerCleanupRef.current = () => clearTimeout(timer);
  };

  useEffect(() => {
    trackEvent('memory_started');
    generateNewLevelPattern(0);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      const total = statsRef.current.attempts;
      statsRef.current.accuracy = total > 0 ? Math.round((statsRef.current.correct / total) * 100) : 0;
      statsRef.current.levelReached = levelIndexRef.current + 1;
      statsRef.current.avgTime = statsRef.current.correct > 0
        ? parseFloat((totalTimeRef.current / statsRef.current.correct).toFixed(2))
        : 0;
      trackEvent('memory_completed', statsRef.current);
      onGameEndRef.current(statsRef.current);
    }
  }, [timeLeft]);

  const handleTileClick = (index: number) => {
    if (gameState !== 'input') return;
    if (selectedTiles.includes(index)) {
      setSelectedTiles((prev) => prev.filter((i) => i !== index));
      return;
    }
    const nextSelection = [...selectedTiles, index];
    setSelectedTiles(nextSelection);
    if (nextSelection.length === currentLevel.highlightCount) {
      checkSelection(nextSelection);
    }
  };

  const checkSelection = (selection: number[]) => {
    setGameState('feedback');
    statsRef.current.attempts += 1;
    // eslint-disable-next-line react-hooks/purity
    const timeTaken = (Date.now() - levelStartTimeRef.current) / 1000;
    totalTimeRef.current += timeTaken;
    levelStartTimeRef.current = Date.now();
    const sortedPattern = [...pattern].sort((a, b) => a - b);
    const sortedSelection = [...selection].sort((a, b) => a - b);
    const isCorrect = sortedPattern.every((val, i) => val === sortedSelection[i]);

    if (isCorrect) {
      setFeedbackType('correct');
      statsRef.current.correct += 1;
      setDisplayStats({ attempts: statsRef.current.attempts, correct: statsRef.current.correct });
      setTimeout(() => {
        const nextLevel = levelIndexRef.current + 1;
        levelIndexRef.current = nextLevel;
        setLevelIndex(nextLevel);
        generateNewLevelPattern(nextLevel);
      }, 500);
    } else {
      setFeedbackType('incorrect');
      statsRef.current.incorrect += 1;
      setDisplayStats({ attempts: statsRef.current.attempts, correct: statsRef.current.correct });
      setTimeout(() => generateNewLevelPattern(levelIndexRef.current), 600);
    }
  };

  const gridSize = currentLevel.gridSize;
  const totalTiles = gridSize * gridSize;
  const liveAccuracy = displayStats.attempts > 0 ? Math.round((displayStats.correct / displayStats.attempts) * 100) : 100;
  const timerColor = timeLeft > 10 ? 'bg-[#B1FA63]' : timeLeft > 5 ? 'bg-[#8BD44A]' : 'bg-[#FF6666]';
  const timerTextColor = timeLeft > 10 ? 'text-gray-300' : timeLeft > 5 ? 'text-[#8BD44A]' : 'text-[#FF6666]';

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050505] text-white select-none">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#B1FA63] uppercase block">ROUND 1</span>
          <h2 className="text-lg font-black text-white tracking-tight uppercase">MEMORY</h2>
        </div>
        <div className="flex items-center gap-1.5 bg-[#111111] px-3 py-1.5 rounded-full">
          <div className={`w-2 h-2 rounded-full ${timerColor} animate-pulse`} />
          <span className={`text-xs font-mono ${timerTextColor}`}>
            00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
          </span>
        </div>
      </div>

      {/* Score + Accuracy */}
      <div className="flex items-center justify-center gap-4 pb-2">
        <span className="text-sm font-bold text-white">{displayStats.correct} correct</span>
        <span className="text-xs font-mono text-[#B1FA63]">{liveAccuracy}% accuracy</span>
      </div>

      {/* Feedback flash overlay */}
      {feedbackType === 'correct' && (
        <div className="absolute inset-0 bg-[#B1FA63]/10 pointer-events-none animate-flash-green z-10" />
      )}
      {feedbackType === 'incorrect' && (
        <div className="absolute inset-0 bg-[#FF6666]/10 pointer-events-none animate-flash-red z-10" />
      )}

      {/* Grid */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className={`grid gap-2 w-full max-w-[360px] aspect-square`} style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}>
          {Array.from({ length: totalTiles }).map((_, idx) => {
            const isPatternHighlighted = pattern.includes(idx);
            const isSelected = selectedTiles.includes(idx);

            let tileClass = 'bg-[#1A1A1A]';
            if (gameState === 'memorize' && isPatternHighlighted) {
              tileClass = 'bg-[#B1FA63]';
            } else if (gameState === 'input') {
              if (isSelected) tileClass = 'bg-[#B1FA63]/30 border border-[#B1FA63]';
            } else if (gameState === 'feedback') {
              const inPattern = pattern.includes(idx);
              const inSelection = selectedTiles.includes(idx);
              if (feedbackType === 'correct' && inPattern) {
                tileClass = 'bg-[#B1FA63]';
              } else if (feedbackType === 'incorrect') {
                if (inSelection && !inPattern) tileClass = 'bg-[#FF6666]';
                else if (inPattern && !inSelection) tileClass = 'bg-[#B1FA63]/40 border border-dashed border-[#B1FA63]';
                else if (inPattern && inSelection) tileClass = 'bg-[#B1FA63]/60';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleTileClick(idx)}
                className={`rounded-xl transition-all duration-150 ${tileClass}`}
              />
            );
          })}
        </div>
      </div>

      {/* Bottom spacer */}
      <div className="h-6" />
    </div>
  );
}
