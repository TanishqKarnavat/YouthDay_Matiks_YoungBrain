'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { questions, GameQuestion, RememberReasonQuestion, ScenarioMemoryQuestion, SpellingCheckQuestion } from '../data/rememberReasonQuestions';
import { useAnalytics } from '../hooks/useAnalytics';

export interface RememberReasonStats {
  attempted: number;
  correct: number;
  avgTime: number;
}

interface RememberReasonGameProps {
  onGameEnd: (stats: RememberReasonStats) => void;
}

type GameState = 'memorize' | 'reading' | 'question' | 'feedback';

export default function RememberReasonGame({ onGameEnd }: RememberReasonGameProps) {
  const { trackEvent } = useAnalytics();

  const [currentIndex, setCurrentIndex] = useState(0);
  const question: GameQuestion = questions[currentIndex];
  const isLogic = question.type === 'logic-reasoning';
  const isScenario = question.type === 'scenario-memory';
  const isSpelling = question.type === 'spelling-check';
  const initialGameState: GameState = isLogic ? 'question' : isScenario ? 'reading' : isSpelling ? 'question' : 'memorize';
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  const statsRef = useRef<RememberReasonStats>({ attempted: 0, correct: 0, avgTime: 0 });
  const questionStartTimeRef = useRef<number>(Date.now());
  const totalTimeRef = useRef<number>(0);
  const onGameEndRef = useRef(onGameEnd);

  useEffect(() => { onGameEndRef.current = onGameEnd; });

  useEffect(() => {
    trackEvent('remember_reason_started');
    questionStartTimeRef.current = Date.now();
  }, []);

  const goToNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setSelectedAnswer(null);
      setIsCorrect(false);
      const nextQ = questions[nextIndex];
      const nextGameState = nextQ.type === 'logic-reasoning' ? 'question' : nextQ.type === 'scenario-memory' ? 'reading' : nextQ.type === 'spelling-check' ? 'question' : 'memorize';
      setGameState(nextGameState);
      questionStartTimeRef.current = Date.now();
    } else {
      statsRef.current.avgTime = statsRef.current.attempted > 0
        ? parseFloat((totalTimeRef.current / statsRef.current.attempted).toFixed(2))
        : 0;
      trackEvent('remember_reason_completed', statsRef.current);
      onGameEndRef.current(statsRef.current);
    }
  }, [currentIndex, trackEvent]);

  const handleAnswer = useCallback((answer: string) => {
    if (gameState !== 'question') return;

    setSelectedAnswer(answer);
    const correct = answer === question.correctAnswer;
    setIsCorrect(correct);
    setGameState('feedback');

    const timeTaken = (Date.now() - questionStartTimeRef.current) / 1000;
    totalTimeRef.current += timeTaken;

    statsRef.current.attempted += 1;
    if (correct) statsRef.current.correct += 1;

    setTimeout(() => goToNext(), 1200);
  }, [gameState, question, goToNext]);

  const roundLabel = isLogic ? 'LOGIC + REASON' : isScenario ? 'SCENARIO MEMORY' : isSpelling ? 'SPELLING CHECK' : 'REMEMBER + REASON';
  const questionHeading = isLogic ? 'SOLVE FROM LOGIC' : isSpelling ? 'SPELLING CHECK' : 'REASON FROM MEMORY';

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050505] text-white select-none">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#B1FA63] uppercase block">ROUND 3</span>
          <h2 className="text-lg font-display text-white tracking-tight uppercase">{roundLabel}</h2>
        </div>
        <div className="flex items-center gap-1.5 bg-[#111111] px-3 py-1.5 rounded-full">
          <span className="text-xs font-mono text-gray-400">
            {currentIndex + 1}/{questions.length}
          </span>
        </div>
      </div>

      {/* Feedback flash */}
      <AnimatePresence>
        {gameState === 'feedback' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 pointer-events-none z-10 ${
              isCorrect ? 'bg-[#00E5FF]/10' : 'bg-[#FF6666]/10'
            }`}
          />
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex-1 flex flex-col px-4 overflow-y-auto no-scrollbar">
        <AnimatePresence mode="wait">
          {gameState === 'memorize' && (
            <motion.div
              key="memorize"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col"
            >
              <div className="text-center mb-4 pt-2">
                <h3 className="text-xl font-display text-white tracking-tight uppercase mb-1">MEET THE GROUP</h3>
                <p className="text-[11px] text-gray-500 font-mono">Remember these 4 people.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mx-auto w-full">
                {(question as RememberReasonQuestion).people.map((person, i) => (
                  <motion.div
                    key={person.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-[#B1FA63] rounded-xl px-4 py-4 flex flex-col"
                  >
                    <span className="text-[24px] font-display font-bold text-black tracking-wide uppercase leading-none text-center mb-3">{person.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: person.color }} />
                      <span className="text-[12px] font-mono font-semibold text-black uppercase">COLOR: {person.color}</span>
                    </div>
                    <div className="w-full h-px bg-black/15 my-2" />
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] flex-shrink-0">{person.location === 'Café' ? '☕' : person.location === 'Park' ? '🌳' : '📖'}</span>
                      <span className="text-[12px] font-mono font-semibold text-black uppercase">PLACE: {person.location}</span>
                    </div>
                    <div className="w-full h-px bg-black/15 my-2" />
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] flex-shrink-0">📅</span>
                      <span className="text-[12px] font-mono font-semibold text-black uppercase">AGE: {person.age}</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 pb-4">
                <button
                  onClick={() => {
                    questionStartTimeRef.current = Date.now();
                    setGameState('question');
                  }}
                  className="w-full bg-[#B1FA63] text-black font-display text-xl font-bold tracking-wider uppercase py-4 rounded-xl"
                >
                  I'M READY
                </button>
              </div>
            </motion.div>
          )}

          {gameState === 'reading' && (
            <motion.div
              key="reading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col"
            >
              <div className="text-center mb-5 pt-2">
                <h3 className="text-xl font-display text-[#B1FA63] tracking-tight uppercase mb-1">REMEMBER THIS</h3>
                <p className="text-[11px] text-gray-500 font-mono">Read carefully. You'll be asked about it next.</p>
              </div>

              <div className="bg-[#B1FA63] rounded-xl p-5 mb-6">
                <p className="text-[15px] text-black font-mono leading-relaxed">
                  {(question as ScenarioMemoryQuestion).scenario}
                </p>
              </div>

              <div className="mt-4 pb-4">
                <button
                  onClick={() => {
                    questionStartTimeRef.current = Date.now();
                    setGameState('question');
                  }}
                  className="w-full bg-[#B1FA63] text-black font-display text-xl font-bold tracking-wider uppercase py-4 rounded-xl"
                >
                  I'M READY
                </button>
              </div>
            </motion.div>
          )}

          {gameState === 'question' && isSpelling && (
            <motion.div
              key="spelling"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col pt-2"
            >
              <div className="bg-[#B1FA63] rounded-xl p-4 mb-4">
                <p className="text-[14px] text-black font-mono leading-relaxed">
                  {(question as SpellingCheckQuestion).sentence}
                </p>
              </div>

              <div className="text-center mb-4">
                <h3 className="text-lg font-display text-white tracking-tight uppercase">{(question as SpellingCheckQuestion).question}</h3>
              </div>

              <div className="space-y-2 pb-16">
                {question.options.map((option, i) => (
                  <motion.button
                    key={option}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => handleAnswer(option)}
                    className="w-full bg-[#111111] border border-gray-800/60 rounded-xl p-3.5 text-left hover:border-[#B1FA63]/40 transition-colors"
                  >
                    <span className="text-sm font-bold text-white tracking-wider">
                      <span className="text-[#B1FA63] mr-2">{String.fromCharCode(65 + i)}.</span>
                      {option}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {gameState === 'question' && !isSpelling && (
            <motion.div
              key="question"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col pt-2"
            >
              <div className="text-center mb-4">
                <h3 className="text-xl font-display text-[#B1FA63] tracking-tight uppercase mb-1">{questionHeading}</h3>
              </div>

              <div className="bg-[#B1FA63] rounded-xl p-5 mb-5">
                <p className="text-[15px] text-black font-mono leading-relaxed whitespace-pre-line">
                  {question.question}
                </p>
              </div>

              <div className="space-y-2 pb-16">
                {question.options.map((option, i) => (
                  <motion.button
                    key={option}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => handleAnswer(option)}
                    className="w-full bg-[#111111] border border-gray-800/60 rounded-xl p-3.5 text-left hover:border-[#B1FA63]/40 transition-colors"
                  >
                    <span className="text-sm font-bold text-white tracking-wider">
                      <span className="text-[#B1FA63] mr-2">{String.fromCharCode(65 + i)}.</span>
                      {option}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {gameState === 'feedback' && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  isCorrect ? 'bg-[#00E5FF]/20' : 'bg-[#FF6666]/20'
                }`}
              >
                <span className={`text-3xl ${isCorrect ? 'text-[#00E5FF]' : 'text-[#FF6666]'}`}>
                  {isCorrect ? '✓' : '✗'}
                </span>
              </motion.div>
              <p className="text-sm text-gray-400 font-mono text-center px-4 leading-relaxed">
                {question.reason}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
