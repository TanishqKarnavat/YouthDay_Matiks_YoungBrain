export interface MazeNode {
  type: 'number' | 'operator';
  value: string;
}

export interface MathMaze {
  id: string;
  grid: MazeNode[][];
  target: number;
  startPos: [number, number];
  difficulty: 'easy' | 'medium' | 'hard';
}

export const mockMathMazes: MathMaze[] = [
  {
    id: 'maze_e1',
    difficulty: 'easy',
    target: 8,
    startPos: [0, 0],
    grid: [
      [{ type: 'number', value: '2' }, { type: 'operator', value: '+' }, { type: 'number', value: '4' }],
      [{ type: 'operator', value: '×' }, { type: 'number', value: '3' }, { type: 'operator', value: '-' }],
      [{ type: 'number', value: '1' }, { type: 'operator', value: '+' }, { type: 'number', value: '3' }],
    ],
  },
  {
    id: 'maze_e2',
    difficulty: 'easy',
    target: 12,
    startPos: [0, 0],
    grid: [
      [{ type: 'number', value: '4' }, { type: 'operator', value: '+' }, { type: 'number', value: '3' }],
      [{ type: 'operator', value: '-' }, { type: 'number', value: '2' }, { type: 'operator', value: '+' }],
      [{ type: 'number', value: '5' }, { type: 'operator', value: '×' }, { type: 'number', value: '2' }],
    ],
  },
  {
    id: 'maze_e3',
    difficulty: 'easy',
    target: 10,
    startPos: [0, 0],
    grid: [
      [{ type: 'number', value: '5' }, { type: 'operator', value: '+' }, { type: 'number', value: '4' }],
      [{ type: 'operator', value: '×' }, { type: 'number', value: '2' }, { type: 'operator', value: '-' }],
      [{ type: 'number', value: '1' }, { type: 'operator', value: '+' }, { type: 'number', value: '5' }],
    ],
  },
  {
    id: 'maze_m1',
    difficulty: 'medium',
    target: 20,
    startPos: [0, 0],
    grid: [
      [{ type: 'number', value: '2' }, { type: 'operator', value: '×' }, { type: 'number', value: '5' }],
      [{ type: 'operator', value: '+' }, { type: 'number', value: '3' }, { type: 'operator', value: '×' }],
      [{ type: 'number', value: '2' }, { type: 'operator', value: '+' }, { type: 'number', value: '2' }],
    ],
  },
];

function computeMazePath(grid: MazeNode[][], path: [number, number][]): number {
  if (path.length === 0) return 0;
  let val = parseInt(grid[path[0][0]][path[0][1]].value);
  for (let i = 1; i < path.length; i += 2) {
    const opCoord = path[i];
    if (!opCoord) break;
    const op = grid[opCoord[0]][opCoord[1]].value;
    const numCoord = path[i + 1];
    if (!numCoord) break;
    const num = parseInt(grid[numCoord[0]][numCoord[1]].value);
    if (op === '+') val += num;
    else if (op === '-') val -= num;
    else if (op === '×') val *= num;
    else if (op === '÷' && num !== 0) val = Math.floor(val / num);
  }
  return val;
}

function computeMazePathWithCheck(grid: MazeNode[][], path: [number, number][]): { result: number; valid: boolean } {
  if (path.length === 0) return { result: 0, valid: false };
  let val = parseInt(grid[path[0][0]][path[0][1]].value);
  for (let i = 1; i < path.length; i += 2) {
    const opCoord = path[i];
    if (!opCoord) break;
    const op = grid[opCoord[0]][opCoord[1]].value;
    const numCoord = path[i + 1];
    if (!numCoord) break;
    const num = parseInt(grid[numCoord[0]][numCoord[1]].value);
    if (op === '+') val += num;
    else if (op === '-') val -= num;
    else if (op === '×') val *= num;
    else if (op === '÷' && num !== 0) val = Math.floor(val / num);
    if (val < 0) return { result: val, valid: false };
  }
  return { result: val, valid: true };
}

export function generateRandomMaze(difficulty: 'easy' | 'medium' | 'hard'): MathMaze {
  for (let attempt = 0; attempt < 10; attempt++) {
    const result = tryGenerateMaze(difficulty);
    if (result !== null) return result;
  }
  return mockMathMazes[0];
}

function findPathToEnd(
  size: number,
  start: [number, number],
  end: [number, number],
  pathLength: number,
): [number, number][] | null {
  const results: [number, number][][] = [];
  const visited = new Set<string>();
  visited.add(`${start[0]},${start[1]}`);

  function dfs(curr: [number, number], depth: number, currentPath: [number, number][]) {
    if (results.length >= 20) return;
    if (depth === pathLength) {
      if (curr[0] === end[0] && curr[1] === end[1]) {
        results.push([...currentPath]);
      }
      return;
    }
    const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    for (const d of dirs) {
      const nr = curr[0] + d[0];
      const nc = curr[1] + d[1];
      if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
      const key = `${nr},${nc}`;
      if (visited.has(key)) continue;
      visited.add(key);
      currentPath.push([nr, nc]);
      dfs([nr, nc], depth + 1, currentPath);
      currentPath.pop();
      visited.delete(key);
    }
  }

  dfs(start, 1, [start]);
  if (results.length === 0) return null;
  return results[Math.floor(Math.random() * results.length)];
}

function tryGenerateMaze(difficulty: 'easy' | 'medium' | 'hard'): MathMaze | null {
  const size = 3;
  const numbers = ['2', '3', '4', '5', '6', '7', '8'];
  const operators: string[] = ['+', '-', '×'];

  const pathLength = 5;
  const path = findPathToEnd(size, [0, 0], [size - 1, size - 1], pathLength);
  if (!path) return null;

  const grid: MazeNode[][] = [];
  for (let r = 0; r < size; r++) {
    grid[r] = [];
    for (let c = 0; c < size; c++) {
      if ((r + c) % 2 === 0) {
        grid[r][c] = { type: 'number', value: numbers[Math.floor(Math.random() * numbers.length)] };
      } else {
        grid[r][c] = { type: 'operator', value: operators[Math.floor(Math.random() * operators.length)] };
      }
    }
  }

  for (let i = 0; i < path.length; i++) {
    const [r, c] = path[i];
    if (i % 2 === 0) {
      grid[r][c] = { type: 'number', value: numbers[Math.floor(Math.random() * numbers.length)] };
    } else {
      grid[r][c] = { type: 'operator', value: operators[Math.floor(Math.random() * operators.length)] };
    }
  }

  const { result: target, valid } = computeMazePathWithCheck(grid, path);
  if (!valid || target < 0 || target > 100 || isNaN(target)) return null;

  return {
    id: `dyn_maze_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    grid,
    target,
    startPos: [0, 0],
    difficulty,
  };
}
