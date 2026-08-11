'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';

const N = 5;
const CLUES: Record<string, number> = { '0,0': 5, '1,0': 8, '3,4': 9, '4,4': 3 };

const PATCH_COLORS = ['#B1FA63', '#00E5FF', '#FF6B6B', '#FFD93D', '#C084FC', '#34D399', '#FB923C'];
const PATCH_TEXT_COLORS = ['#000', '#000', '#fff', '#000', '#fff', '#000', '#000'];

function k(r: number, c: number) { return `${r},${c}`; }

interface PatchPuzzleGameProps {
  onGameEnd: (stats: { attempted: number; correct: number; avgTime: number }) => void;
}

export default function PatchPuzzleGame({ onGameEnd }: PatchPuzzleGameProps) {
  const [owner, setOwner] = useState<number[][]>(() =>
    Array.from({ length: N }, () => Array(N).fill(-1))
  );
  const [patches, setPatches] = useState<string[][]>([]);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ r: number; c: number } | null>(null);
  const [message, setMessage] = useState('');
  const [solved, setSolved] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [started, setStarted] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startTimer = useCallback(() => {
    if (startTimeRef.current !== null) return;
    const now = Date.now();
    startTimeRef.current = now;
    setStarted(true);
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - now) / 1000));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const isRectangle = useCallback((cells: Set<string>) => {
    let minR = N, maxR = -1, minC = N, maxC = -1;
    cells.forEach(k => {
      const [r, c] = k.split(',').map(Number);
      minR = Math.min(minR, r); maxR = Math.max(maxR, r);
      minC = Math.min(minC, c); maxC = Math.max(maxC, c);
    });
    const w = maxC - minC + 1, h = maxR - minR + 1;
    if (w * h !== cells.size) return null;
    return { minR, maxR, minC, maxC, w, h };
  }, []);

  const selectRect = useCallback((r1: number, c1: number, r2: number, c2: number, currentOwner: number[][]) => {
    const newSel = new Set<string>();
    const minR = Math.min(r1, r2), maxR = Math.max(r1, r2);
    const minC = Math.min(c1, c2), maxC = Math.max(c1, c2);
    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        if (currentOwner[r][c] >= 0) continue;
        newSel.add(k(r, c));
      }
    }
    return newSel;
  }, []);

  const cellFromPoint = useCallback((x: number, y: number): { r: number; c: number } | null => {
    const el = document.elementFromPoint(x, y);
    if (!el) return null;
    const r = parseInt(el.getAttribute('data-r') ?? '-1');
    const c = parseInt(el.getAttribute('data-c') ?? '-1');
    if (r < 0 || c < 0) return null;
    return { r, c };
  }, []);

  const confirmSelection = useCallback((silent: boolean): boolean => {
    if (sel.size === 0) { if (!silent) setMessage('Select some cells first.'); return false; }
    const rect = isRectangle(sel);
    if (!rect) { if (!silent) { setMessage("That's not a rectangle."); setMistakes(m => m + 1); } return false; }

    let requiredSize: number | null = null;
    for (const kVal of sel) {
      if (CLUES[kVal] !== undefined) {
        if (requiredSize === null) requiredSize = CLUES[kVal];
        else if (requiredSize !== CLUES[kVal]) {
          if (!silent) { setMessage('Patch covers two different numbers.'); setMistakes(m => m + 1); }
          return false;
        }
      }
    }
    if (requiredSize !== null && requiredSize !== sel.size) {
      if (!silent) { setMessage(`Patch must be exactly ${requiredSize} cells.`); setMistakes(m => m + 1); }
      return false;
    }

    const pid = patches.length;
    const patchCells = [...sel];
    setPatches(prev => [...prev, patchCells]);
    setOwner(prev => {
      const newOwner = prev.map(r => [...r]);
      sel.forEach(kVal => {
        const [r, c] = kVal.split(',').map(Number);
        newOwner[r][c] = pid;
      });
      return newOwner;
    });
    setSel(new Set());
    setMessage('');
    return true;
  }, [sel, isRectangle, patches.length]);

  // Check win whenever owner changes
  useEffect(() => {
    if (solved) return;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (owner[r][c] < 0) return;
      }
    }
    // All cells claimed
    setSolved(true);
    stopTimer();
  }, [owner, solved, stopTimer]);

  const tryAutoConfirm = useCallback(() => {
    let touchesClue = false;
    for (const kVal of sel) {
      if (CLUES[kVal] !== undefined) { touchesClue = true; break; }
    }
    if (touchesClue) {
      confirmSelection(true);
    }
  }, [sel, confirmSelection]);

  const handlePointerDown = useCallback((r: number, c: number) => {
    if (solved) return;
    if (owner[r][c] >= 0) return;
    startTimer();
    setDragging(true);
    setDragStart({ r, c });
    setSel(selectRect(r, c, r, c, owner));
  }, [solved, owner, startTimer, selectRect]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging || !dragStart) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el) return;
    const r = parseInt(el.getAttribute('data-r') ?? '-1');
    const c = parseInt(el.getAttribute('data-c') ?? '-1');
    if (r < 0 || c < 0) return;
    setSel(selectRect(dragStart.r, dragStart.c, r, c, owner));
  }, [dragging, dragStart, owner, selectRect]);

  const handlePointerUp = useCallback(() => {
    if (!dragging) return;
    setDragging(false);
    setDragStart(null);
    tryAutoConfirm();
  }, [dragging, tryAutoConfirm]);

  const handleUndo = () => {
    if (patches.length === 0 || solved) return;
    const last = patches[patches.length - 1];
    setPatches(prev => prev.slice(0, -1));
    setOwner(prev => {
      const newOwner = prev.map(r => [...r]);
      last.forEach(kVal => {
        const [r, c] = kVal.split(',').map(Number);
        newOwner[r][c] = -1;
      });
      return newOwner;
    });
    setMessage('');
  };

  const handleReset = () => {
    stopTimer();
    setOwner(Array.from({ length: N }, () => Array(N).fill(-1)));
    setPatches([]);
    setSel(new Set());
    setDragging(false);
    setDragStart(null);
    setMessage('');
    setSolved(false);
    setMistakes(0);
    setElapsed(0);
    startTimeRef.current = null;
    setStarted(false);
  };

  const handleClear = () => {
    setSel(new Set());
    setMessage('');
  };

  const handleContinue = () => {
    onGameEnd({ attempted: 1, correct: 1, avgTime: elapsed });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col items-center px-3 sm:px-4 py-3 sm:py-4 select-none bg-[#050505] text-[#F5F5F7] overflow-y-auto no-scrollbar">
      <div className="text-center mb-3">
        <p className="text-[10px] font-mono text-gray-500 tracking-widest uppercase">ROUND 4</p>
        <h1 className="text-2xl font-display text-white tracking-tight uppercase">PATCHES</h1>
        <p className="text-xs text-gray-400 font-mono mt-1">Group the cells.<br />Match every number.</p>
      </div>

      <div className="flex gap-3 mb-3 text-xs font-mono">
        <div className="bg-[#111111] border border-gray-800 px-3 py-1.5 rounded-lg text-gray-300">
          {formatTime(elapsed)}
        </div>
      </div>

      <div
        ref={gridRef}
        className="rounded-xl border border-gray-800 overflow-hidden mb-4 w-full"
        style={{ touchAction: 'none', userSelect: 'none' }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={(e) => { if (dragging && e.buttons === 0) handlePointerUp(); }}
      >
        <div
          className="grid gap-[3px] p-[3px] bg-gray-900 w-full aspect-square"
          style={{
            gridTemplateColumns: `repeat(${N}, 1fr)`,
            gridTemplateRows: `repeat(${N}, 1fr)`,
          }}
        >
          {owner.map((row, r) =>
            row.map((pid, c) => {
              const isSelected = sel.has(k(r, c));
              const clue = CLUES[k(r, c)];
              const isOwned = pid >= 0;

              let bg = '#111111';
              let textColor = '#888';
              if (isOwned) {
                bg = PATCH_COLORS[pid % PATCH_COLORS.length];
                textColor = PATCH_TEXT_COLORS[pid % PATCH_TEXT_COLORS.length];
              } else if (isSelected) {
                bg = 'rgba(177, 250, 99, 0.25)';
                textColor = '#B1FA63';
              }

              return (
                <div
                  key={`${r}-${c}`}
                  data-r={r}
                  data-c={c}
                  className="flex items-center justify-center rounded-md font-bold cursor-pointer transition-colors duration-75 aspect-square"
                  style={{
                    background: bg,
                    color: textColor,
                    fontSize: 'clamp(0.75rem, 3vw, 1rem)',
                  }}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    handlePointerDown(r, c);
                  }}
                >
                  {clue ?? ''}
                </div>
              );
            })
          )}
        </div>
      </div>

      {message && (
        <div className="text-xs font-mono text-gray-400 mb-2 text-center">{message}</div>
      )}

      <div className="flex gap-3 mb-2">
        <button
          onClick={handleClear}
          className="bg-[#111111] border border-gray-700 text-gray-300 font-display text-sm tracking-wider uppercase px-5 py-2.5 rounded-lg hover:border-gray-600 active:scale-95 transition-all"
        >
          CLEAR
        </button>
        <button
          onClick={handleUndo}
          disabled={patches.length === 0 || solved}
          className="bg-[#111111] border border-gray-700 text-gray-300 font-display text-sm tracking-wider uppercase px-5 py-2.5 rounded-lg hover:border-gray-600 active:scale-95 transition-all disabled:opacity-40"
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
            {mistakes > 0 && (
              <p className="text-xs text-gray-500 font-mono mt-1">{mistakes} mistake{mistakes !== 1 ? 's' : ''}</p>
            )}
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
