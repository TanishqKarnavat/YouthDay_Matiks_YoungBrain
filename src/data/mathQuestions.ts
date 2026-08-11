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

// Pattern: 1-digit chain, 1-digit chain, division, 1-digit chain, multiplication, 1-digit chain, division, 2-digit chain
export const mockMathChains: MathChain[] = [
  // 1-digit addition/subtraction chains
  { id: 'c1', startValue: 8, difficulty: 'easy', operations: [{ operator: '+', value: 5 }, { operator: '-', value: 2 }], answer: 11 },
  { id: 'c2', startValue: 9, difficulty: 'easy', operations: [{ operator: '+', value: 4 }, { operator: '+', value: 3 }], answer: 16 },
  // Division
  { id: 'd1', startValue: 24, difficulty: 'easy', operations: [{ operator: '÷', value: 4 }], answer: 6 },
  // 1-digit chain
  { id: 'c3', startValue: 7, difficulty: 'easy', operations: [{ operator: '+', value: 6 }, { operator: '-', value: 3 }], answer: 10 },
  // Multiplication
  { id: 'm1', startValue: 6, difficulty: 'easy', operations: [{ operator: '×', value: 4 }], answer: 24 },
  // 1-digit chain
  { id: 'c4', startValue: 5, difficulty: 'easy', operations: [{ operator: '+', value: 7 }, { operator: '+', value: 2 }], answer: 14 },
  // Division
  { id: 'd2', startValue: 36, difficulty: 'easy', operations: [{ operator: '÷', value: 6 }], answer: 6 },
  // 2-digit chain (less frequent)
  { id: 'c5', startValue: 15, difficulty: 'easy', operations: [{ operator: '+', value: 12 }, { operator: '-', value: 8 }], answer: 19 },
  // 1-digit chain
  { id: 'c6', startValue: 6, difficulty: 'easy', operations: [{ operator: '+', value: 8 }, { operator: '-', value: 4 }], answer: 10 },
  // Multiplication
  { id: 'm2', startValue: 7, difficulty: 'easy', operations: [{ operator: '×', value: 3 }], answer: 21 },
  // 1-digit chain
  { id: 'c7', startValue: 9, difficulty: 'easy', operations: [{ operator: '-', value: 3 }, { operator: '+', value: 5 }], answer: 11 },
  // Division
  { id: 'd3', startValue: 48, difficulty: 'easy', operations: [{ operator: '÷', value: 8 }], answer: 6 },
  // 1-digit chain
  { id: 'c8', startValue: 4, difficulty: 'easy', operations: [{ operator: '+', value: 9 }, { operator: '+', value: 3 }], answer: 16 },
  // 2-digit chain
  { id: 'c9', startValue: 20, difficulty: 'easy', operations: [{ operator: '-', value: 11 }, { operator: '+', value: 7 }], answer: 16 },
  // 1-digit chain
  { id: 'c10', startValue: 8, difficulty: 'easy', operations: [{ operator: '+', value: 3 }, { operator: '-', value: 5 }], answer: 6 },
  // Multiplication
  { id: 'm3', startValue: 5, difficulty: 'easy', operations: [{ operator: '×', value: 6 }], answer: 30 },
  // 1-digit chain
  { id: 'c11', startValue: 7, difficulty: 'easy', operations: [{ operator: '+', value: 4 }, { operator: '+', value: 2 }], answer: 13 },
  // Division
  { id: 'd4', startValue: 56, difficulty: 'easy', operations: [{ operator: '÷', value: 7 }], answer: 8 },
];

export function generateDynamicMathChain(difficultyScore: number): MathChain {
  const patternIndex = difficultyScore % 8;

  // Pattern: 0=1digit, 1=1digit, 2=div, 3=1digit, 4=mul, 5=1digit, 6=div, 7=2digit
  if (patternIndex === 2 || patternIndex === 6) {
    return genDivision();
  } else if (patternIndex === 4) {
    return genMultiplication();
  } else if (patternIndex === 7) {
    return gen2DigitChain();
  } else {
    return gen1DigitChain();
  }
}

function gen1DigitChain(): MathChain {
  const start = Math.floor(Math.random() * 8) + 2;
  const ops: MathOperation[] = [];
  let val = start;
  const opCount = Math.random() > 0.5 ? 3 : 2;

  for (let i = 0; i < opCount; i++) {
    const isAdd = Math.random() > 0.4;
    if (isAdd) {
      const v = Math.floor(Math.random() * 7) + 1;
      val += v;
      ops.push({ operator: '+', value: v });
    } else {
      const maxSub = Math.min(8, val - 1);
      const v = maxSub < 1 ? 1 : Math.floor(Math.random() * maxSub) + 1;
      val -= v;
      ops.push({ operator: '-', value: v });
    }
  }

  const answer = computeChain(start, ops);
  if (answer < 0) return gen1DigitChain();

  return {
    id: `dyn_1d_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    startValue: start,
    operations: ops,
    answer,
    difficulty: 'easy',
  };
}

function gen2DigitChain(): MathChain {
  const start = Math.floor(Math.random() * 15) + 10;
  const ops: MathOperation[] = [];
  let val = start;

  for (let i = 0; i < 2; i++) {
    const isAdd = Math.random() > 0.4;
    if (isAdd) {
      const v = Math.floor(Math.random() * 12) + 3;
      val += v;
      ops.push({ operator: '+', value: v });
    } else {
      const maxSub = Math.min(15, val - 1);
      const v = maxSub < 1 ? 1 : Math.floor(Math.random() * maxSub) + 1;
      val -= v;
      ops.push({ operator: '-', value: v });
    }
  }

  const answer = computeChain(start, ops);
  if (answer < 0) return gen2DigitChain();

  return {
    id: `dyn_2d_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    startValue: start,
    operations: ops,
    answer,
    difficulty: 'easy',
  };
}

function genMultiplication(): MathChain {
  const a = Math.floor(Math.random() * 8) + 2;
  const b = Math.floor(Math.random() * 8) + 2;
  return {
    id: `dyn_mul_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    startValue: a,
    operations: [{ operator: '×', value: b }],
    answer: a * b,
    difficulty: 'easy',
  };
}

function genDivision(): MathChain {
  const b = Math.floor(Math.random() * 7) + 2;
  const answer = Math.floor(Math.random() * 9) + 2;
  const a = b * answer;
  return {
    id: `dyn_div_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    startValue: a,
    operations: [{ operator: '÷', value: b }],
    answer,
    difficulty: 'easy',
  };
}
