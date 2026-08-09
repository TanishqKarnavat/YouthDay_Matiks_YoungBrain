'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { mockMathMazes, generateRandomMaze, MathMaze, MazeNode } from '../data/mathMazes';
import { useAnalytics } from '../hooks/useAnalytics';
import { RotateCcw, X } from 'lucide-react';

interface MathMazeGameProps {
  timeLeft: number;
  onGameEnd: (stats: MazeStats) => void;
}

export interface MazeStats {
  attempts: number;
  correct: number;
  accuracy: number;
  avgTime: number;
}

type Coord = [number, number];

export default function MathMazeGame({ timeLeft, onGameEnd }: MathMazeGameProps) {
  const { trackEvent } = useAnalytics();

  const [mazeIndex, setMazeIndex] = useState(0);
  const [currentMaze, setCurrentMaze] = useState<MathMaze | null>(null);
  const [path, setPath] = useState<Coord[]>([]);
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [feedback, setFeedback] = useState<'success' | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const statsRef = useRef<MazeStats>({ attempts: 0, correct: 0, accuracy: 0, avgTime: 0 });
  const [displayStats, setDisplayStats] = useState({ correct: 0, attempts: 0 });
  const mazeStartTimeRef = useRef<number>(0);
  const totalTimeRef = useRef<number>(0);
  const onGameEndRef = useRef(onGameEnd);

  useEffect(() => { onGameEndRef.current = onGameEnd; });

  const loadMaze = (idx: number) => {
    let maze: MathMaze;
    if (idx < mockMathMazes.length) {
      maze = mockMathMazes[idx];
    } else {
      const diff = idx - mockMathMazes.length;
      const difficulty = diff < 2 ? 'easy' : diff < 4 ? 'medium' : 'hard';
      maze = generateRandomMaze(difficulty);
    }
    setCurrentMaze(maze);
    setPath([maze.startPos]);
    setCurrentValue(parseInt(maze.grid[maze.startPos[0]][maze.startPos[1]].value));
    setFeedback(null);
    setIsDrawing(false);
    mazeStartTimeRef.current = Date.now();
  };

  useEffect(() => {
    trackEvent('maze_started');
    loadMaze(0);
  }, []);

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDrawing(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      const total = statsRef.current.attempts;
      statsRef.current.accuracy = total > 0 ? Math.round((statsRef.current.correct / total) * 100) : 0;
      statsRef.current.avgTime = statsRef.current.correct > 0
        ? parseFloat((totalTimeRef.current / statsRef.current.correct).toFixed(2))
        : 0;
      trackEvent('maze_completed', statsRef.current);
      onGameEndRef.current(statsRef.current);
    }
  }, [timeLeft]);

  const isAdjacent = (c1: Coord, c2: Coord): boolean => {
    const rDiff = Math.abs(c1[0] - c2[0]);
    const cDiff = Math.abs(c1[1] - c2[1]);
    return (rDiff === 1 && cDiff === 0) || (rDiff === 0 && cDiff === 1);
  };

  const evaluatePath = (currentPath: Coord[], grid: MazeNode[][]): number => {
    if (currentPath.length === 0) return 0;
    let val = parseInt(grid[currentPath[0][0]][currentPath[0][1]].value);
    for (let i = 1; i < currentPath.length; i += 2) {
      const opCoord = currentPath[i];
      if (!opCoord) break;
      const op = grid[opCoord[0]][opCoord[1]].value;
      const numCoord = currentPath[i + 1];
      if (!numCoord) break;
      const num = parseInt(grid[numCoord[0]][numCoord[1]].value);
      if (op === '+') val += num;
      else if (op === '-') val -= num;
      else if (op === '×') val *= num;
      else if (op === '÷' && num !== 0) val = Math.floor(val / num);
    }
    return val;
  };

  const checkTarget = (newPath: Coord[], val: number) => {
    if (!currentMaze) return;
    const last = newPath[newPath.length - 1];
    const gridSize = currentMaze.grid.length;
    const isEndPosition = last[0] === gridSize - 1 && last[1] === gridSize - 1;
    if (!isEndPosition) return;

    statsRef.current.attempts += 1;
    if (val === currentMaze.target) {
      setFeedback('success');
      setIsDrawing(false);
      statsRef.current.correct += 1;
      // eslint-disable-next-line react-hooks/purity
      const timeTaken = (Date.now() - mazeStartTimeRef.current) / 1000;
      totalTimeRef.current += timeTaken;
      setDisplayStats({ correct: statsRef.current.correct, attempts: statsRef.current.attempts });
      setTimeout(() => {
        const nextIdx = mazeIndex + 1;
        setMazeIndex(nextIdx);
        loadMaze(nextIdx);
      }, 500);
    }
  };

  const startDrawing = (row: number, col: number) => {
    if (!currentMaze || feedback === 'success') return;
    const idx = path.findIndex((c) => c[0] === row && c[1] === col);
    if (idx !== -1) {
      const newPath = path.slice(0, idx + 1);
      setPath(newPath);
      const val = evaluatePath(newPath, currentMaze.grid);
      setCurrentValue(val);
      setIsDrawing(true);
      checkTarget(newPath, val);
    } else if (isAdjacent(path[path.length - 1], [row, col])) {
      const newPath = [...path, [row, col] as Coord];
      setPath(newPath);
      const val = evaluatePath(newPath, currentMaze.grid);
      setCurrentValue(val);
      setIsDrawing(true);
      checkTarget(newPath, val);
    } else if (row === currentMaze.startPos[0] && col === currentMaze.startPos[1]) {
      const newPath = [currentMaze.startPos];
      setPath(newPath);
      const val = parseInt(currentMaze.grid[row][col].value);
      setCurrentValue(val);
      setIsDrawing(true);
      checkTarget(newPath, val);
    }
  };

  const handleNodeTransition = (row: number, col: number) => {
    if (!currentMaze || feedback === 'success') return;
    const lastNode = path[path.length - 1];
    if (lastNode[0] === row && lastNode[1] === col) return;
    if (path.length > 1) {
      const secondToLast = path[path.length - 2];
      if (secondToLast[0] === row && secondToLast[1] === col) {
        const newPath = path.slice(0, -1);
        setPath(newPath);
        setCurrentValue(evaluatePath(newPath, currentMaze.grid));
        return;
      }
    }
    if (path.some((c) => c[0] === row && c[1] === col)) return;
    if (isAdjacent(lastNode, [row, col])) {
      const newPath = [...path, [row, col] as Coord];
      setPath(newPath);
      const val = evaluatePath(newPath, currentMaze.grid);
      setCurrentValue(val);
      checkTarget(newPath, val);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!currentMaze || feedback === 'success') return;
    const touch = e.touches[0];
    if (!touch) return;
    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!elem) return;
    const rowAttr = elem.getAttribute('data-row');
    const colAttr = elem.getAttribute('data-col');
    if (rowAttr !== null && colAttr !== null) startDrawing(parseInt(rowAttr), parseInt(colAttr));
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDrawing || !currentMaze || feedback === 'success') return;
    const touch = e.touches[0];
    if (!touch) return;
    if (e.cancelable) e.preventDefault();
    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!elem) return;
    const rowAttr = elem.getAttribute('data-row');
    const colAttr = elem.getAttribute('data-col');
    if (rowAttr !== null && colAttr !== null) handleNodeTransition(parseInt(rowAttr), parseInt(colAttr));
  };

  const handleUndo = () => {
    if (path.length <= 1 || feedback === 'success' || !currentMaze) return;
    const newPath = path.slice(0, -1);
    setPath(newPath);
    setCurrentValue(evaluatePath(newPath, currentMaze.grid));
    setIsDrawing(false);
  };

  const handleReset = () => {
    if (!currentMaze || feedback === 'success') return;
    setPath([currentMaze.startPos]);
    setCurrentValue(parseInt(currentMaze.grid[currentMaze.startPos[0]][currentMaze.startPos[1]].value));
    setIsDrawing(false);
  };

  if (!currentMaze) return null;

  const liveAccuracy = displayStats.attempts > 0 ? Math.round((displayStats.correct / displayStats.attempts) * 100) : 100;
  const timerColor = timeLeft > 10 ? 'bg-[#B1FA63]' : timeLeft > 5 ? 'bg-[#8BD44A]' : 'bg-[#FF6666]';
  const timerTextColor = timeLeft > 10 ? 'text-gray-300' : timeLeft > 5 ? 'text-[#8BD44A]' : 'text-[#FF6666]';

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050505] text-white select-none relative">
      {/* Success flash overlay */}
      {feedback === 'success' && (
        <div className="absolute inset-0 bg-[#FFD600]/15 pointer-events-none animate-flash-green z-10" />
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#B1FA63] uppercase block">ROUND 3</span>
          <h2 className="text-lg font-black text-white tracking-tight uppercase">MATH MAZE</h2>
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

      {/* Target Goal */}
      <div className="text-center py-2">
        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">TARGET GOAL</span>
        <div className="text-5xl font-black text-[#FFD600] mt-1">{currentMaze.target}</div>
      </div>

      {/* Grid with START/END labels */}
      <div className="flex-1 flex items-center justify-center px-4 relative">
        <div className="relative">
          {/* START label */}
          <div className="absolute -top-5 left-2 z-10">
            <span className="text-[10px] font-mono font-bold text-white bg-[#111111] px-2 py-0.5 rounded border border-gray-700">START</span>
          </div>
          {/* END label */}
          <div className="absolute -bottom-5 right-2 z-10">
            <span className="text-[10px] font-mono font-bold text-[#FFD600] bg-[#111111] px-2 py-0.5 rounded border border-[#FFD600]/30">END</span>
          </div>

          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => setIsDrawing(false)}
            className="grid grid-cols-3 gap-3 w-[240px] aspect-square p-2"
            style={{ touchAction: 'none' }}
          >
            {currentMaze.grid.map((rowArr, rIdx) =>
              rowArr.map((node, cIdx) => {
                const inPathIdx = path.findIndex((c) => c[0] === rIdx && c[1] === cIdx);
                const isInPath = inPathIdx !== -1;
                const isLastInPath = inPathIdx === path.length - 1;

                let nodeClass = 'bg-[#1A1A1A] text-white border-[#333333]';
                if (isInPath) {
                  nodeClass = isLastInPath
                    ? 'bg-[#FFD600] text-black border-[#FFD600]'
                    : 'bg-[#FFD600]/80 text-black border-[#FFD600]/80';
                } else if (node.type === 'operator') {
                  nodeClass = 'bg-[#1A1A1A] text-white/80 border-[#333333]';
                }

                return (
                  <button
                    key={`${rIdx}-${cIdx}`}
                    data-row={rIdx}
                    data-col={cIdx}
                    onMouseDown={() => startDrawing(rIdx, cIdx)}
                    onMouseEnter={() => isDrawing && handleNodeTransition(rIdx, cIdx)}
                    className={`w-full aspect-square rounded-full flex items-center justify-center border-2 text-base font-bold transition-all duration-150 cursor-pointer select-none ${nodeClass}`}
                  >
                    {node.value}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="flex justify-center gap-4 pb-6">
        <button
          onClick={handleUndo}
          disabled={path.length <= 1 || feedback === 'success'}
          className="w-12 h-12 rounded-xl bg-[#1a1d24] border border-gray-700 flex items-center justify-center text-gray-400 disabled:opacity-40 cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        <button
          onClick={handleReset}
          disabled={path.length <= 1 || feedback === 'success'}
          className="px-5 h-12 rounded-xl bg-[#1a1d24] border border-gray-700 flex items-center justify-center gap-2 text-gray-400 disabled:opacity-40 cursor-pointer"
        >
          <X className="w-4 h-4" />
          <span className="text-xs font-bold">CLEAR</span>
        </button>
        <button
          onClick={handleUndo}
          disabled={path.length <= 1 || feedback === 'success'}
          className="w-12 h-12 rounded-xl bg-[#1a1d24] border border-gray-700 flex items-center justify-center text-gray-400 disabled:opacity-40 cursor-pointer"
        >
          <RotateCcw className="w-5 h-5 -scale-x-100" />
        </button>
      </div>
    </div>
  );
}
