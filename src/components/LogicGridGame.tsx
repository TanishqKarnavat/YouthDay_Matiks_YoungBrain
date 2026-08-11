'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';

const GRID_SIZE = 5;

interface Piece {
  id: string;
  width: number;
  height: number;
  label: string;
}

interface PlacedPiece {
  pieceId: string;
  row: number;
  col: number;
}

interface Cell {
  row: number;
  col: number;
}

const AVAILABLE_PIECES: Piece[] = [
  { id: 'p1', width: 1, height: 1, label: '1×1' },
  { id: 'p2', width: 2, height: 1, label: '2×1' },
  { id: 'p3', width: 3, height: 1, label: '3×1' },
];

const ROW_CLUES = [2, 3, 0, 1, 2];

interface LogicGridGameProps {
  onGameEnd: (stats: { attempted: number; correct: number; avgTime: number }) => void;
}

export default function LogicGridGame({ onGameEnd }: LogicGridGameProps) {
  const [grid, setGrid] = useState<(string | null)[][]>(
    Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null))
  );
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [hoverCell, setHoverCell] = useState<Cell | null>(null);
  const [placedPieces, setPlacedPieces] = useState<PlacedPiece[]>([]);
  const [dragging, setDragging] = useState<Piece | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [startTime] = useState(Date.now());

  const gridRef = useRef<HTMLDivElement>(null);

  const getCellsForPlacement = useCallback((piece: Piece, row: number, col: number): Cell[] => {
    const cells: Cell[] = [];
    for (let r = 0; r < piece.height; r++) {
      for (let c = 0; c < piece.width; c++) {
        cells.push({ row: row + r, col: col + c });
      }
    }
    return cells;
  }, []);

  const canPlace = useCallback((piece: Piece, row: number, col: number, currentGrid: (string | null)[][]): boolean => {
    const cells = getCellsForPlacement(piece, row, col);
    for (const cell of cells) {
      if (cell.row < 0 || cell.row >= GRID_SIZE || cell.col < 0 || cell.col >= GRID_SIZE) return false;
      if (currentGrid[cell.row][cell.col] !== null) return false;
    }
    return true;
  }, [getCellsForPlacement]);

  const placePiece = useCallback((piece: Piece, row: number, col: number) => {
    setGrid(prev => {
      const newGrid = prev.map(r => [...r]);
      const cells = getCellsForPlacement(piece, row, col);
      cells.forEach(c => { newGrid[c.row][c.col] = piece.id; });
      return newGrid;
    });
    setPlacedPieces(prev => [...prev, { pieceId: piece.id, row, col }]);
    setSelectedPiece(null);
    setHoverCell(null);
  }, [getCellsForPlacement]);

  const removePiece = useCallback((pieceId: string) => {
    setGrid(prev => prev.map(r => r.map(c => c === pieceId ? null : c)));
    setPlacedPieces(prev => prev.filter(p => p.pieceId !== pieceId));
  }, []);

  const isPlaced = (pieceId: string) => placedPieces.some(p => p.pieceId === pieceId);

  const getHoverCells = useCallback((): Cell[] => {
    if (!selectedPiece || !hoverCell) return [];
    return getCellsForPlacement(selectedPiece, hoverCell.row, hoverCell.col);
  }, [selectedPiece, hoverCell, getCellsForPlacement]);

  const hoverCells = getHoverCells();
  const canPlaceHere = selectedPiece && hoverCell
    ? canPlace(selectedPiece, hoverCell.row, hoverCell.col, grid)
    : false;

  const checkSolution = useCallback(() => {
    for (let row = 0; row < GRID_SIZE; row++) {
      let filled = 0;
      for (let col = 0; col < GRID_SIZE; col++) {
        if (grid[row][col] !== null) filled++;
      }
      if (filled !== ROW_CLUES[row]) return false;
    }
    return true;
  }, [grid]);

  useEffect(() => {
    if (placedPieces.length === AVAILABLE_PIECES.length && checkSolution()) {
      setIsComplete(true);
    }
  }, [placedPieces, checkSolution]);

  const handleContinue = () => {
    const elapsed = (Date.now() - startTime) / 1000;
    onGameEnd({ attempted: 1, correct: 1, avgTime: elapsed });
  };

  const handleGridClick = (row: number, col: number) => {
    if (isComplete) return;

    if (grid[row][col] !== null) {
      removePiece(grid[row][col]!);
      return;
    }

    if (selectedPiece) {
      if (canPlace(selectedPiece, row, col, grid)) {
        placePiece(selectedPiece, row, col);
      }
    }
  };

  const handleGridHover = (row: number, col: number) => {
    if (selectedPiece) setHoverCell({ row, col });
  };

  const handleGridLeave = () => {
    setHoverCell(null);
  };

  return (
    <div className="flex-1 flex flex-col items-center px-3 sm:px-4 py-3 sm:py-4 select-none bg-[#050505] text-[#F5F5F7] overflow-y-auto no-scrollbar">
      <div className="text-center mb-3">
        <p className="text-[10px] font-mono text-gray-500 tracking-widest uppercase">ROUND 3</p>
        <h1 className="text-2xl font-display text-white tracking-tight uppercase">LOGIC</h1>
        <p className="text-xs text-gray-400 font-mono mt-1">Place the pieces to match the clues.</p>
      </div>

      <div className="text-[10px] text-gray-600 font-mono mb-2 tracking-wide">
        Numbers show how many cells in each row must be filled
      </div>

      <div ref={gridRef} className="relative mb-4">
        <div className="flex">
          <div className="flex flex-col justify-around pr-2 mr-1">
            {ROW_CLUES.map((clue, i) => (
              <div key={i} className="flex items-center justify-center w-5 h-[52px]">
                <span className="text-sm font-mono font-bold text-[#B1FA63]">{clue}</span>
              </div>
            ))}
          </div>

          <div
            className="grid gap-[3px] p-[3px] rounded-lg border border-gray-800"
            style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 52px)`, gridTemplateRows: `repeat(${GRID_SIZE}, 52px)` }}
            onMouseLeave={handleGridLeave}
          >
            {grid.map((row, rowIdx) =>
              row.map((cell, colIdx) => {
                const isHovered = hoverCells.some(c => c.row === rowIdx && c.col === colIdx);
                const isFilled = cell !== null;

                return (
                  <div
                    key={`${rowIdx}-${colIdx}`}
                    className={`
                      relative rounded-md transition-all duration-100 cursor-pointer border
                      ${isFilled
                        ? 'bg-[#B1FA63]/20 border-[#B1FA63]/40'
                        : isHovered
                          ? canPlaceHere
                            ? 'bg-[#B1FA63]/10 border-[#B1FA63]/30'
                            : 'bg-red-500/10 border-red-500/30'
                          : 'bg-[#111111] border-gray-800/50 hover:border-gray-700'
                      }
                    `}
                    onClick={() => handleGridClick(rowIdx, colIdx)}
                    onMouseEnter={() => handleGridHover(rowIdx, colIdx)}
                  >
                    {isFilled && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-full rounded-md bg-[#B1FA63]/80" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="w-full max-w-[320px]">
        <p className="text-[10px] font-mono text-gray-500 tracking-widest uppercase text-center mb-2">PIECES</p>
        <div className="flex justify-center gap-3">
          {AVAILABLE_PIECES.map((piece) => {
            const placed = isPlaced(piece.id);
            const selected = selectedPiece?.id === piece.id;

            return (
              <button
                key={piece.id}
                onClick={() => {
                  if (placed) {
                    removePiece(piece.id);
                  } else {
                    setSelectedPiece(selected ? null : piece);
                  }
                }}
                className={`
                  flex items-center justify-center rounded-lg border-2 font-mono font-bold text-sm
                  transition-all duration-150
                  ${placed
                    ? 'bg-[#B1FA63]/20 border-[#B1FA63]/40 text-[#B1FA63]/50 cursor-default'
                    : selected
                      ? 'bg-[#B1FA63] border-[#B1FA63] text-black scale-105 shadow-lg shadow-[#B1FA63]/20'
                      : 'bg-[#111111] border-gray-700 text-gray-300 hover:border-[#B1FA63]/50 active:scale-95'
                  }
                `}
                style={{
                  width: `${piece.width * 52 + (piece.width - 1) * 3}px`,
                  height: `${piece.height * 52 + (piece.height - 1) * 3}px`,
                }}
                disabled={placed}
              >
                {piece.label}
              </button>
            );
          })}
        </div>
      </div>

      {isComplete && (
        <div className="fixed inset-0 bg-[#050505]/90 z-50 flex flex-col items-center justify-center gap-4">
          <div className="text-center">
            <h2 className="text-3xl font-display text-[#B1FA63] tracking-wider uppercase mb-2">PUZZLE COMPLETE</h2>
            <p className="text-sm text-gray-400 font-mono">All clues satisfied.</p>
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
