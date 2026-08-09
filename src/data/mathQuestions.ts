export interface MathOperation {
  operator: '+' | '-' | '×' | '÷';
  value: number;
}

export interface MathChain {
  id: string;
  startValue: number;
  operations: MathOperation[];
  answer: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

function computeChain(start: number, ops: MathOperation[]): number {
  let val = start;
  for (const op of ops) {
    if (op.operator === '+') val += op.value;
    else if (op.operator === '-') val -= op.value;
    else if (op.operator === '×') val *= op.value;
    else if (op.operator === '÷' && op.value !== 0) val = Math.floor(val / op.value);
  }
  return val;
}

export const mockMathChains: MathChain[] = [
  {
    id: 'c1', startValue: 10, difficulty: 'easy',
    operations: [
      { operator: '+', value: 5 },
      { operator: '-', value: 3 },
    ],
    answer: 12,
  },
  {
    id: 'c2', startValue: 20, difficulty: 'easy',
    operations: [
      { operator: '+', value: 8 },
      { operator: '-', value: 5 },
    ],
    answer: 23,
  },
  {
    id: 'c3', startValue: 15, difficulty: 'easy',
    operations: [
      { operator: '-', value: 7 },
      { operator: '+', value: 4 },
    ],
    answer: 12,
  },
  {
    id: 'c4', startValue: 30, difficulty: 'easy',
    operations: [
      { operator: '+', value: 12 },
      { operator: '-', value: 8 },
      { operator: '+', value: 5 },
    ],
    answer: 39,
  },
  {
    id: 'c5', startValue: 25, difficulty: 'easy',
    operations: [
      { operator: '-', value: 10 },
      { operator: '+', value: 6 },
      { operator: '-', value: 3 },
    ],
    answer: 18,
  },
  {
    id: 'c6', startValue: 50, difficulty: 'easy',
    operations: [
      { operator: '-', value: 15 },
      { operator: '+', value: 10 },
    ],
    answer: 45,
  },
  {
    id: 'c7', startValue: 100, difficulty: 'easy',
    operations: [
      { operator: '-', value: 25 },
      { operator: '+', value: 15 },
      { operator: '-', value: 10 },
    ],
    answer: 80,
  },
  {
    id: 'c8', startValue: 40, difficulty: 'easy',
    operations: [
      { operator: '+', value: 20 },
      { operator: '-', value: 5 },
    ],
    answer: 55,
  },
];

export function generateDynamicMathChain(difficultyScore: number): MathChain {
  let difficulty: 'easy' | 'medium' | 'hard' = 'easy';
  let opCount = 2;
  let maxVal = 30;

  if (difficultyScore <= 3) {
    difficulty = 'easy';
    opCount = 2;
    maxVal = 20;
  } else if (difficultyScore <= 7) {
    difficulty = 'easy';
    opCount = 3;
    maxVal = 30;
  } else {
    difficulty = 'easy';
    opCount = 3;
    maxVal = 40;
  }

  const startValue = Math.floor(Math.random() * 30) + 10;
  const ops: MathOperation[] = [];
  const operatorPool: MathOperation['operator'][] = ['+', '-', '+', '-'];

  for (let i = 0; i < opCount; i++) {
    const op = operatorPool[Math.floor(Math.random() * operatorPool.length)];
    const value = Math.floor(Math.random() * maxVal) + 5;
    ops.push({ operator: op, value });
  }

  return {
    id: `dyn_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    startValue,
    operations: ops,
    answer: computeChain(startValue, ops),
    difficulty,
  };
}
