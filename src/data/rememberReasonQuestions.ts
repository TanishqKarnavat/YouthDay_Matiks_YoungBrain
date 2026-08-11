export interface Person {
  name: string;
  color: string;
  location: string;
  age: number;
}

export interface RememberReasonQuestion {
  type: 'remember-reason';
  id: string;
  memoryTime: number;
  people: Person[];
  question: string;
  options: string[];
  correctAnswer: string;
  reason: string;
}

export interface LogicReasoningQuestion {
  type: 'logic-reasoning';
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  reason: string;
}

export interface ScenarioMemoryQuestion {
  type: 'scenario-memory';
  id: string;
  scenario: string;
  question: string;
  options: string[];
  correctAnswer: string;
  reason: string;
}

export interface SpellingCheckQuestion {
  type: 'spelling-check';
  id: string;
  sentence: string;
  question: string;
  options: string[];
  correctAnswer: string;
  reason: string;
}

export type GameQuestion = RememberReasonQuestion | LogicReasoningQuestion | ScenarioMemoryQuestion | SpellingCheckQuestion;

export const questions: GameQuestion[] = [
  {
    type: 'remember-reason',
    id: 'cafe-age',
    memoryTime: 8,
    people: [
      { name: 'ALEX', color: 'Blue', location: 'Café', age: 24 },
      { name: 'MAYA', color: 'Red', location: 'Park', age: 31 },
      { name: 'RAVI', color: 'Green', location: 'Library', age: 27 },
      { name: 'ZARA', color: 'Yellow', location: 'Café', age: 22 },
    ],
    question: 'The youngest person who was at the Café was wearing what colour?',
    options: ['BLUE', 'RED', 'GREEN', 'YELLOW'],
    correctAnswer: 'YELLOW',
    reason: 'The two people at the Café are Alex (24) and Zara (22). Zara is younger, and Zara\'s colour is Yellow.',
  },
  {
    type: 'logic-reasoning',
    id: 'book-arrangement',
    question: 'Seven books — P, Q, R, S, T, U and V — are arranged on a shelf.\n\nP is somewhere before Q.\nR is immediately before S.\nT is not next to V.\nQ is immediately before U.\n\nWhich of the following could be the arrangement?',
    options: ['P Q U R S T V', 'R S P Q U V T', 'P R S Q U T V', 'V P Q U T R S'],
    correctAnswer: 'P R S Q U T V',
    reason: 'Option C (P R S Q U T V) satisfies all rules: P before Q, R immediately before S, T not next to V, Q immediately before U.',
  },
];
