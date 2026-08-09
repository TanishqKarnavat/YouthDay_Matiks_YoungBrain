export interface MemoryLevelConfig {
  level: number;
  gridSize: number;
  highlightCount: number;
  displayMs: number;
}

export const memoryLevels: MemoryLevelConfig[] = [
  { level: 1, gridSize: 4, highlightCount: 3, displayMs: 1200 },
  { level: 2, gridSize: 4, highlightCount: 4, displayMs: 1300 },
  { level: 3, gridSize: 4, highlightCount: 5, displayMs: 1400 },
  { level: 4, gridSize: 5, highlightCount: 5, displayMs: 1400 },
  { level: 5, gridSize: 5, highlightCount: 6, displayMs: 1500 },
  { level: 6, gridSize: 5, highlightCount: 7, displayMs: 1500 },
  { level: 7, gridSize: 6, highlightCount: 7, displayMs: 1600 },
  { level: 8, gridSize: 6, highlightCount: 8, displayMs: 1600 },
];

export function generateMemoryPattern(gridSize: number, highlightCount: number): number[] {
  const totalTiles = gridSize * gridSize;
  const indices: number[] = [];
  
  while (indices.length < Math.min(highlightCount, totalTiles)) {
    const rand = Math.floor(Math.random() * totalTiles);
    if (!indices.includes(rand)) {
      indices.push(rand);
    }
  }
  
  return indices;
}
