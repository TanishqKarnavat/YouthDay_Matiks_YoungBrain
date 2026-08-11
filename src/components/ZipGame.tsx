'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';

const N = 5;

interface CellData {
  checkpoint: number | null;
}

interface Pos {
  r: number;
  c: number;
}

function key(r: number, c: number) {
  return `${r},${c}`;
}

function neighbors(r: number, c: number): [number, number][] {
  const out: [number, number][] = [];
  if (r > 0) out.push([r - 1, c]);
  if (r < N - 1) out.push([r + 1, c]);
  if (c > 0) out.push([r, c - 1]);
  if (c < N - 1) out.push([r, c + 1]);
  return out;
}

function generateHamiltonianPath(): [number, number][] {
  const total = N * N;
  let attempts = 0;
  while (attempts < 400) {
    attempts++;
    const visited = new Set<string>();
    const order: [number, number][] = [];
    const startR = Math.floor(Math.random() * N);
    const startC = Math.floor(Math.random() * N);
    if (dfs(startR, startC, visited, order, total)) return order;
  }
  return [];
}

function dfs(r: number, c: number, visited: Set<string>, order: [number, number][], total: number): boolean {
  visited.add(key(r, c));
  order.push([r, c]);
  if (order.length === total) return true;
  const nbrs = neighbors(r, c);
  for (let i = nbrs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nbrs[i], nbrs[j]] = [nbrs[j], nbrs[i]];
  }
  nbrs.sort((a, b) => {
    const da = neighbors(a[0], a[1]).filter(([nr, nc]) => !visited.has(key(nr, nc))).length;
    const db = neighbors(b[0], b[1]).filter(([nr, nc]) => !visited.has(key(nr, nc))).length;
    return da - db;
  });
  for (const [nr, nc] of nbrs) {
    if (!visited.has(key(nr, nc))) {
      if (dfs(nr, nc, visited, order, total)) return true;
    }
  }
  visited.delete(key(r, c));
  order.pop();
  return false;
}

function buildPuzzle(): CellData[][] {
  const grid: CellData[][] = Array.from({ length: N }, () =>
    Array.from({ length: N }, () => ({ checkpoint: null }))
  );
  const order = generateHamiltonianPath();
  if (order.length === 0) return grid;

  const spacing = 3;
  let count = 0;
  for (let i = 0; i < N * N; i++) {
    if (i === 0 || i === N * N - 1 || i % spacing === 0) {
      const [r, c] = order[i];
      count++;
      grid[r][c].checkpoint = count;
    }
  }
  return grid;
}

interface ZipGameProps {
  onGameEnd: (stats: { attempted: number; correct: number; avgTime: number }) => void;
}

export default function ZipGame({ onGameEnd }: ZipGameProps) {
  const [grid] = useState<CellData[][]>(() => buildPuzzle());
  const [path, setPath] = useState<Pos[]>([]);
  const [visitedSet, setVisitedSet] = useState<Set<string>>(new Set());
  const [nextCheckpoint, setNextCheckpoint] = useState(1);
  const [solved, setSolved] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [checkpointsTotal, setCheckpointsTotal] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let total = 0;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (grid[r][c].checkpoint) total++;
      }
    }
    setCheckpointsTotal(total);
  }, [grid]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startTimer = useCallback(() => {
    if (startTimeRef.current !== null) return;
    const now = Date.now();
    startTimeRef.current = now;
    setStartTime(now);
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - now) / 1000));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const flashMessage = useCallback((text: string, bad: boolean) => {
    setMessage(text);
    setIsError(bad);
    setTimeout(() => {
      setMessage('');
      setIsError(false);
    }, 1400);
  }, []);

  const recomputeNextCheckpoint = useCallback((currentPath: Pos[], currentGrid: CellData[][]) => {
    let maxCp = 0;
    for (const p of currentPath) {
      const cp = currentGrid[p.r][p.c].checkpoint;
      if (cp) maxCp = Math.max(maxCp, cp);
    }
    return maxCp + 1;
  }, []);

  const renderState = useCallback(() => {
    const newVisited = new Set<string>();
    for (const p of path) {
      newVisited.add(key(p.r, p.c));
    }
    setVisitedSet(newVisited);
  }, [path]);

  const trimPathTo = useCallback((idx: number) => {
    setPath(prev => {
      const removed = prev.slice(idx + 1);
      const newSet = new Set(visitedSet);
      for (const p of removed) {
        newSet.delete(key(p.r, p.c));
      }
      setVisitedSet(newSet);
      const newPath = prev.slice(0, idx + 1);
      setNextCheckpoint(recomputeNextCheckpoint(newPath, grid));
      return newPath;
    });
  }, [visitedSet, grid, recomputeNextCheckpoint]);

  const tryExtend = useCallback((r: number, c: number) => {
    setPath(prev => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      const isAdj = Math.abs(last.r - r) + Math.abs(last.c - c) === 1;
      if (!isAdj) return prev;
      if (visitedSet.has(key(r, c))) return prev;

      const cp = grid[r][c].checkpoint;
      if (cp && cp !== nextCheckpoint) {
        flashMessage(`Reach checkpoint ${nextCheckpoint} before ${cp}`, true);
        return prev;
      }

      const newPath = [...prev, { r, c }];
      const newVisited = new Set(visitedSet);
      newVisited.add(key(r, c));
      setVisitedSet(newVisited);
      if (cp) setNextCheckpoint(cp + 1);

      if (newPath.length === N * N) {
        setSolved(true);
        setDragging(false);
        stopTimer();
      }

      return newPath;
    });
  }, [visitedSet, grid, nextCheckpoint, flashMessage, stopTimer]);

  const onCellDown = useCallback((r: number, c: number) => {
    if (solved) return;
    if (path.length === 0) {
      if (grid[r][c].checkpoint === 1) {
        const newPath = [{ r, c }];
        const newVisited = new Set<string>();
        newVisited.add(key(r, c));
        setPath(newPath);
        setVisitedSet(newVisited);
        setNextCheckpoint(2);
        setDragging(true);
        startTimer();
      } else {
        flashMessage('Start from cell 1', true);
      }
      return;
    }
    const last = path[path.length - 1];
    if (r === last.r && c === last.c) {
      setDragging(true);
      return;
    }
    const idx = path.findIndex(p => p.r === r && p.c === c);
    if (idx !== -1) {
      trimPathTo(idx);
      setDragging(true);
      return;
    }
    setDragging(true);
    tryExtend(r, c);
  }, [solved, path, grid, startTimer, flashMessage, trimPathTo, tryExtend]);

  const onCellEnter = useCallback((r: number, c: number) => {
    if (solved || path.length === 0 || !dragging) return;
    const last = path[path.length - 1];
    if (r === last.r && c === last.c) return;
    const idx = path.findIndex(p => p.r === r && p.c === c);
    if (idx !== -1) {
      trimPathTo(idx);
      return;
    }
    tryExtend(r, c);
  }, [solved, path, dragging, trimPathTo, tryExtend]);

  const handleUndo = () => {
    if (path.length === 0 || solved) return;
    trimPathTo(path.length - 2);
  };

  const handleReset = () => {
    stopTimer();
    setPath([]);
    setVisitedSet(new Set());
    setNextCheckpoint(1);
    setSolved(false);
    setDragging(false);
    setElapsed(0);
    startTimeRef.current = null;
    setStartTime(null);
    setMessage('');
    setIsError(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const handleContinue = () => {
    onGameEnd({ attempted: 1, correct: 1, avgTime: elapsed });
  };

  return (
    <div className="flex-1 flex flex-col items-center px-3 sm:px-4 py-3 sm:py-4 select-none bg-[#050505] text-[#F5F5F7] overflow-y-auto no-scrollbar">
      <div className="text-center mb-3">
        <p className="text-[10px] font-mono text-gray-500 tracking-widest uppercase">ROUND 2</p>
        <h1 className="text-2xl font-display text-white tracking-tight uppercase">ZIP</h1>
        <p className="text-xs text-gray-400 font-mono mt-1">Connect the numbers in order.<br />Fill every cell.</p>
      </div>

      <div className="flex gap-3 mb-3 text-xs font-mono">
        <div className="bg-[#111111] border border-gray-800 px-3 py-1.5 rounded-lg text-gray-300">
          {formatTime(elapsed)}
        </div>
        <div className="bg-[#111111] border border-gray-800 px-3 py-1.5 rounded-lg text-gray-300">
          {path.length}/{N * N} cells
        </div>
      </div>

      <div
        ref={gridRef}
        className="rounded-xl border border-gray-800 overflow-hidden mb-4 w-full"
        style={{ touchAction: 'none', userSelect: 'none' }}
      >
        <div
          className="grid w-full aspect-square"
          style={{
            gridTemplateColumns: `repeat(${N}, 1fr)`,
            gridTemplateRows: `repeat(${N}, 1fr)`,
          }}
          onMouseUp={() => setDragging(false)}
          onMouseLeave={() => setDragging(false)}
          onTouchEnd={() => setDragging(false)}
          onTouchMove={(e) => {
            if (!dragging) return;
            e.preventDefault();
            const touch = e.touches[0];
            const el = document.elementFromPoint(touch.clientX, touch.clientY);
            if (el) {
              const r = parseInt(el.getAttribute('data-r') ?? '-1');
              const c = parseInt(el.getAttribute('data-c') ?? '-1');
              if (r >= 0 && c >= 0) onCellEnter(r, c);
            }
          }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const isFilled = visitedSet.has(key(r, c));
              const cp = cell.checkpoint;
              const isStart = cp === 1;
              const isNextTarget = cp === nextCheckpoint && !isFilled;

              let bg = '#111111';
              if (isFilled) bg = 'rgba(177, 250, 99, 0.15)';

              return (
                <div
                  key={`${r}-${c}`}
                  data-r={r}
                  data-c={c}
                  className="relative flex items-center justify-center border border-gray-800/60 aspect-square"
                  style={{
                    background: bg,
                    cursor: 'pointer',
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onCellDown(r, c);
                  }}
                  onMouseEnter={() => onCellEnter(r, c)}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    onCellDown(r, c);
                  }}
                >
                  {cp && (
                    <div
                      className="relative z-10 flex items-center justify-center rounded-full font-bold w-[60%] h-[60%]"
                      style={{
                        background: isFilled ? '#B1FA63' : isNextTarget ? '#B1FA63' : '#222',
                        color: isFilled ? '#000' : '#fff',
                        fontSize: 'clamp(0.65rem, 2.5vw, 0.9rem)',
                        boxShadow: isNextTarget ? '0 0 0 3px rgba(177, 250, 99, 0.3)' : 'none',
                      }}
                    >
                      {cp}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {message && (
        <div className={`text-xs font-mono mb-2 ${isError ? 'text-red-400' : 'text-[#B1FA63]'}`}>
          {message}
        </div>
      )}

      <div className="flex gap-3 mb-3">
        <button
          onClick={handleUndo}
          className="bg-[#111111] border border-gray-700 text-gray-300 font-display text-sm tracking-wider uppercase px-5 py-2.5 rounded-lg hover:border-gray-600 active:scale-95 transition-all"
        >
          UNDO
        </button>
        <button
          onClick={handleReset}
          className="bg-[#111111] border border-gray-700 text-gray-300 font-display text-sm tracking-wider uppercase px-5 py-2.5 rounded-lg hover:border-gray-600 active:scale-95 transition-all"
        >
          RESET
        </button>
      </div>

      {solved && (
        <div className="fixed inset-0 bg-[#050505]/90 z-50 flex flex-col items-center justify-center gap-4">
          <div className="text-center">
            <h2 className="text-3xl font-display text-[#B1FA63] tracking-wider uppercase mb-2">PUZZLE COMPLETE</h2>
            <p className="text-sm text-gray-400 font-mono">Solved in {formatTime(elapsed)}</p>
          </div>
          <button
            onClick={handleContinue}
            className="w-full max-w-[280px] bg-[#B1FA63] text-black font-display text-xl font-bold tracking-wider uppercase py-4 rounded-xl"
          >
            CONTINUE
          </button>
        </div>
      )}
    </div>
  );
}
