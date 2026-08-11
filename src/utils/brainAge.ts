// ============================================================
// BRAIN AGE SCORING SYSTEM
// All calibration constants in one place for easy tuning.
// ============================================================

// --- THROUGHPUT CONFIG (diminishing returns) ---
// Formula: 1 - e^(-correct / scale)
// Higher scale = more questions needed to reach same score
const THROUGHPUT = {
  math: { scale: 12 },       // 19 correct → ~0.79, 25 → ~0.88, 10 → ~0.57
  memory: { scale: 4.5 },    // level 5 → ~0.67, level 8 → ~0.83
  maze: { scale: 2.8 },      // 3 correct → ~0.66, 5 → ~0.83
};

// --- SPEED CONFIG (power curve) ---
// Formula: max(0, 1 - (avgTime / maxTime)^power)
// Higher power = steeper dropoff for slow times
const SPEED = {
  math: { maxTime: 8, power: 1.5 },   // 3s → 0.83, 5s → 0.62, 8s → 0
  memory: { maxTime: 6, power: 1.5 },  // 3s → 0.65, 4s → 0.48, 6s → 0
  maze: { maxTime: 14, power: 1.5 },   // 8s → 0.63, 10s → 0.48, 14s → 0
};

// --- PROGRESSION WEIGHTS ---
// Each game: accuracy 40%, throughput 30%, speed 15%, progression 15%
const WEIGHTS = {
  accuracy: 0.40,
  throughput: 0.30,
  speed: 0.15,
  progression: 0.15,
};

// --- OVERALL SCORE WEIGHTS ---
const GAME_WEIGHTS = {
  math: 0.40,
  memory: 0.35,
  maze: 0.25,
};

// --- BRAIN AGE MAPPING (nonlinear) ---
// Uses a piecewise curve: steeper for high scores, flatter for low
interface AgeBracket {
  minScore: number;
  maxScore: number;
  minAge: number;
  maxAge: number;
}

const AGE_CURVE: AgeBracket[] = [
  { minScore: 90, maxScore: 100, minAge: 14, maxAge: 17 },
  { minScore: 78, maxScore: 90,  minAge: 17, maxAge: 22 },
  { minScore: 65, maxScore: 78,  minAge: 22, maxAge: 28 },
  { minScore: 50, maxScore: 65,  minAge: 28, maxAge: 38 },
  { minScore: 35, maxScore: 50,  minAge: 38, maxAge: 52 },
  { minScore: 20, maxScore: 35,  minAge: 52, maxAge: 65 },
  { minScore: 0,  maxScore: 20,  minAge: 65, maxAge: 75 },
];

// ============================================================
// SCORING FUNCTIONS
// ============================================================

function diminishingReturns(correct: number, scale: number): number {
  return 1 - Math.exp(-correct / scale);
}

function speedCurve(avgTime: number, maxTime: number, power: number): number {
  if (avgTime <= 0) return 1;
  return Math.max(0, 1 - Math.pow(avgTime / maxTime, power));
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

// --- MEMORY ---
export function calculateMemoryScore(
  attempts: number,
  correct: number,
  levelReached: number,
  avgTime: number,
): {
  accuracy: number;
  throughput: number;
  speed: number;
  progression: number;
  final: number;
} {
  const accuracy = attempts > 0 ? correct / attempts : 0;
  const throughput = diminishingReturns(levelReached, THROUGHPUT.memory.scale);
  const speed = speedCurve(avgTime, SPEED.memory.maxTime, SPEED.memory.power);
  // Progression: higher levels are harder, give bonus
  const progression = clamp(levelReached / 8, 0, 1);

  const final = Math.round(
    (accuracy * WEIGHTS.accuracy +
      throughput * WEIGHTS.throughput +
      speed * WEIGHTS.speed +
      progression * WEIGHTS.progression) * 100
  );

  return { accuracy, throughput, speed, progression, final };
}

// --- MENTAL MATH ---
export function calculateMathScore(
  attempts: number,
  correct: number,
  avgTime: number,
): {
  accuracy: number;
  throughput: number;
  speed: number;
  final: number;
} {
  const accuracy = attempts > 0 ? correct / attempts : 0;
  const throughput = diminishingReturns(correct, THROUGHPUT.math.scale);
  const speed = speedCurve(avgTime, SPEED.math.maxTime, SPEED.math.power);

  const final = Math.round(
    (accuracy * WEIGHTS.accuracy +
      throughput * WEIGHTS.throughput +
      speed * WEIGHTS.speed) * 100
  );

  return { accuracy, throughput, speed, final };
}

// --- MATH MAZE ---
export function calculateMazeScore(
  attempts: number,
  correct: number,
  avgTime: number,
): {
  accuracy: number;
  throughput: number;
  speed: number;
  final: number;
} {
  const accuracy = attempts > 0 ? correct / attempts : 0;
  const throughput = diminishingReturns(correct, THROUGHPUT.maze.scale);
  const speed = speedCurve(avgTime, SPEED.maze.maxTime, SPEED.maze.power);

  const final = Math.round(
    (accuracy * WEIGHTS.accuracy +
      throughput * WEIGHTS.throughput +
      speed * WEIGHTS.speed) * 100
  );

  return { accuracy, throughput, speed, final };
}

// --- REMEMBER + REASON ---
export function calculateRememberReasonScore(
  attempted: number,
  correct: number,
  avgTime: number,
): {
  accuracy: number;
  throughput: number;
  speed: number;
  final: number;
} {
  const accuracy = attempted > 0 ? correct / attempted : 0;
  const throughput = diminishingReturns(correct, 1);
  const speed = speedCurve(avgTime, 15, 1.5);

  const final = Math.round(
    (accuracy * WEIGHTS.accuracy +
      throughput * WEIGHTS.throughput +
      speed * WEIGHTS.speed) * 100
  );

  return { accuracy, throughput, speed, final };
}

// --- ZIP ---
export function calculateZipScore(
  attempted: number,
  correct: number,
  avgTime: number,
): {
  accuracy: number;
  throughput: number;
  speed: number;
  final: number;
} {
  const accuracy = attempted > 0 ? correct / attempted : 0;
  const throughput = diminishingReturns(correct, 1);
  const speed = speedCurve(avgTime, 120, 1.5);

  const final = Math.round(
    (accuracy * WEIGHTS.accuracy +
      throughput * WEIGHTS.throughput +
      speed * WEIGHTS.speed) * 100
  );

  return { accuracy, throughput, speed, final };
}

// --- PATCH ---
export function calculatePatchScore(
  attempted: number,
  correct: number,
  avgTime: number,
): {
  accuracy: number;
  throughput: number;
  speed: number;
  final: number;
} {
  const accuracy = attempted > 0 ? correct / attempted : 0;
  const throughput = diminishingReturns(correct, 1);
  const speed = speedCurve(avgTime, 120, 1.5);

  const final = Math.round(
    (accuracy * WEIGHTS.accuracy +
      throughput * WEIGHTS.throughput +
      speed * WEIGHTS.speed) * 100
  );

  return { accuracy, throughput, speed, final };
}

// --- OVERALL ---
export function calculateOverallScore(
  memoryScore: number,
  rememberReasonScore: number,
  zipScore: number,
  patchScore: number,
): number {
  return Math.round(memoryScore * 0.25 + rememberReasonScore * 0.25 + zipScore * 0.25 + patchScore * 0.25);
}

// --- BRAIN AGE ---
export function getBrainAge(overallScore: number): number {
  for (const bracket of AGE_CURVE) {
    if (overallScore >= bracket.minScore && overallScore <= bracket.maxScore) {
      const t = (overallScore - bracket.minScore) / (bracket.maxScore - bracket.minScore);
      // Interpolate: higher score → lower age (minAge is the younger end)
      return Math.round(bracket.maxAge - t * (bracket.maxAge - bracket.minAge));
    }
  }
  return 75;
}

export function getBrainAgeMessage(age: number): string {
  if (age <= 16) return "I think my brain is younger than me 💀";
  if (age <= 19) return "I have a sharp brain.";
  if (age <= 22) return "I think my brain is ahead of my age.";
  if (age <= 25) return "I think my brain is in its prime. 🔥";
  if (age <= 28) return "My brain is still younger than I expected.";
  if (age <= 32) return "I think I'm slowly becoming an uncle. 💀";
  if (age <= 36) return "I think my brain is starting to show its age. 💀";
  if (age <= 40) return "I think my brain just entered its uncle era. 💀";
  return "I think my brain has seen better days. 💀";
}

export function getBrainAgeCategory(age: number): {
  name: string;
  description: string;
  slogan: string;
} {
  if (age <= 16) return { name: 'BABY BRAIN', description: 'Your brain is running on pure raw power. Zero lag.', slogan: getBrainAgeMessage(age) };
  if (age <= 19) return { name: 'SHARP BRAIN', description: 'Your brain is running on new-gen software.', slogan: getBrainAgeMessage(age) };
  if (age <= 22) return { name: 'AHEAD OF AGE', description: 'Your brain is ahead of the curve.', slogan: getBrainAgeMessage(age) };
  if (age <= 25) return { name: 'IN ITS PRIME', description: 'Your brain is at its peak performance.', slogan: getBrainAgeMessage(age) };
  if (age <= 28) return { name: 'YOUNG EXPECTED', description: 'Still young, still fast.', slogan: getBrainAgeMessage(age) };
  if (age <= 32) return { name: 'UNCLE VIBES', description: 'A bit sluggish, but still online.', slogan: getBrainAgeMessage(age) };
  if (age <= 36) return { name: 'SHOWING AGE', description: 'Starting to feel the years.', slogan: getBrainAgeMessage(age) };
  if (age <= 40) return { name: 'UNCLE ERA', description: 'Classic legacy hardware.', slogan: getBrainAgeMessage(age) };
  return { name: 'BETTER DAYS', description: 'Needs a serious reboot.', slogan: getBrainAgeMessage(age) };
}

// --- DEBUG LOGGING ---
export function logScoringDebug(
  memoryStats: { attempts: number; correct: number; levelReached: number; avgTime: number },
  rememberReasonStats?: { attempted: number; correct: number; avgTime: number },
  zipStats?: { attempted: number; correct: number; avgTime: number },
  patchStats?: { attempted: number; correct: number; avgTime: number },
) {
  const mem = calculateMemoryScore(memoryStats.attempts, memoryStats.correct, memoryStats.levelReached, memoryStats.avgTime);
  
  let rrScore = 0;
  if (rememberReasonStats) {
    const rr = calculateRememberReasonScore(rememberReasonStats.attempted, rememberReasonStats.correct, rememberReasonStats.avgTime);
    rrScore = rr.final;
  }

  let zipScore = 0;
  if (zipStats) {
    const z = calculateZipScore(zipStats.attempted, zipStats.correct, zipStats.avgTime);
    zipScore = z.final;
  }

  let patchScore = 0;
  if (patchStats) {
    const p = calculatePatchScore(patchStats.attempted, patchStats.correct, patchStats.avgTime);
    patchScore = p.final;
  }
  
  const overall = calculateOverallScore(mem.final, rrScore, zipScore, patchScore);
  const age = getBrainAge(overall);

  console.log('=== BRAIN AGE SCORING DEBUG ===');
  console.log('--- MEMORY ---');
  console.log(`  attempted: ${memoryStats.attempts}, correct: ${memoryStats.correct}, levelReached: ${memoryStats.levelReached}`);
  console.log(`  accuracy: ${(mem.accuracy * 100).toFixed(1)}%, throughput: ${(mem.throughput * 100).toFixed(1)}%, speed: ${(mem.speed * 100).toFixed(1)}%, progression: ${(mem.progression * 100).toFixed(1)}%`);
  console.log(`  final game score: ${mem.final}`);
  if (rememberReasonStats) {
    console.log('--- REMEMBER + REASON ---');
    console.log(`  attempted: ${rememberReasonStats.attempted}, correct: ${rememberReasonStats.correct}`);
    console.log(`  final game score: ${rrScore}`);
  }
  if (zipStats) {
    console.log('--- ZIP ---');
    console.log(`  attempted: ${zipStats.attempted}, correct: ${zipStats.correct}`);
    console.log(`  final game score: ${zipScore}`);
  }
  if (patchStats) {
    console.log('--- PATCH ---');
    console.log(`  attempted: ${patchStats.attempted}, correct: ${patchStats.correct}`);
    console.log(`  final game score: ${patchScore}`);
  }
  console.log(`  Overall Brain Score: ${overall}`);
  console.log(`  Brain Age: ${age}`);
  console.log('===============================');

  return { mem, overall, age };
}
