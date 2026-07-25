import React, { useState, useEffect } from 'react';
import { Quiz } from '../types';
import { Swords, Shield, Heart, Sparkles, CheckCircle2, XCircle, Trophy, RefreshCw, X, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../utils/soundEffects';

interface BossQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz?: Quiz;
  topic: string;
  subjectName: string;
  onFetchQuiz: () => Promise<void>;
  isLoading: boolean;
  onQuizPassed: (xpEarned: number, scorePercentage: number) => void;
}

export const BossQuizModal: React.FC<BossQuizModalProps> = ({
  isOpen,
  onClose,
  quiz,
  topic,
  subjectName,
  onFetchQuiz,
  isLoading,
  onQuizPassed,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const [playerHp, setPlayerHp] = useState(100);
  const [bossHp, setBossHp] = useState(100);
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  useEffect(() => {
    if (isOpen && !quiz && !isLoading) {
      onFetchQuiz();
    }
  }, [isOpen, quiz, isLoading]);

  useEffect(() => {
    if (quiz) {
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setScore(0);
      setPlayerHp(100);
      setBossHp(100);
      setIsQuizFinished(false);
    }
  }, [quiz]);

  if (!isOpen) return null;

  const currentQuestion = quiz?.questions[currentQuestionIndex];
  const damagePerQuestion = quiz ? Math.ceil(100 / quiz.questions.length) : 25;

  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted) return;
    soundFx.playSystemBeep();
    setSelectedOption(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || !currentQuestion) return;

    setIsAnswerSubmitted(true);
    const isCorrect = selectedOption === currentQuestion.correctAnswerIndex;

    if (isCorrect) {
      soundFx.playQuestComplete();
      setScore((prev) => prev + 1);
      setBossHp((prev) => Math.max(0, prev - damagePerQuestion));
    } else {
      soundFx.playErrorSound();
      setPlayerHp((prev) => Math.max(0, prev - 25));
    }
  };

  const handleNextQuestion = () => {
    if (!quiz) return;

    if (currentQuestionIndex + 1 < quiz.questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      // Quiz Finished
      setIsQuizFinished(true);
      const finalScorePercentage = Math.round((score / quiz.questions.length) * 100);

      if (finalScorePercentage >= 60) {
        soundFx.playBossDefeated();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        onQuizPassed(quiz.xpReward, finalScorePercentage);
      } else {
        soundFx.playErrorSound();
      }
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setPlayerHp(100);
    setBossHp(100);
    setIsQuizFinished(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-zinc-900 border-2 border-rose-600/70 rounded-2xl shadow-2xl shadow-rose-950/80 p-6 text-zinc-100 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-600/50 text-rose-400">
              <Swords className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-mono tracking-widest text-rose-400 uppercase font-semibold">
                [DUNGEON BOSS BATTLE]
              </div>
              <h2 className="text-xl font-bold font-mono text-zinc-100">
                {quiz?.bossName || `Floor Boss: ${topic}`}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading && (
          <div className="py-16 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-rose-400 animate-spin mx-auto" />
            <div className="text-sm font-mono text-rose-300 font-bold">
              Awakening Floor Boss & Constructing Quiz Dungeon...
            </div>
          </div>
        )}

        {!isLoading && quiz && !isQuizFinished && currentQuestion && (
          <div className="mt-5 space-y-6">
            
            {/* Battle HP Bars */}
            <div className="grid grid-cols-2 gap-4 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
              
              {/* Player HP */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-cyan-400 font-bold flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" /> PLAYER HP
                  </span>
                  <span className="text-zinc-300">{playerHp}/100</span>
                </div>
                <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden border border-cyan-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-600 to-blue-400 transition-all duration-300"
                    style={{ width: `${playerHp}%` }}
                  />
                </div>
              </div>

              {/* Boss HP */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-rose-400 font-bold flex items-center gap-1">
                    <Swords className="w-3.5 h-3.5" /> BOSS HP
                  </span>
                  <span className="text-zinc-300">{bossHp}/100</span>
                </div>
                <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden border border-rose-800">
                  <div
                    className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-300"
                    style={{ width: `${bossHp}%` }}
                  />
                </div>
              </div>

            </div>

            {/* Question Card */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
                <span>QUESTION {currentQuestionIndex + 1} OF {quiz.questions.length}</span>
                <span className="text-amber-400 font-bold">+{quiz.xpReward} XP REWARD</span>
              </div>

              <h3 className="text-base font-bold font-mono text-zinc-100 bg-zinc-950 p-4 rounded-xl border border-zinc-800 leading-snug">
                {currentQuestion.question}
              </h3>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQuestion.options.map((option, idx) => {
                  let optionStyle = 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-200';

                  if (isAnswerSubmitted) {
                    if (idx === currentQuestion.correctAnswerIndex) {
                      optionStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold';
                    } else if (idx === selectedOption) {
                      optionStyle = 'bg-rose-950/80 border-rose-500 text-rose-200 font-bold';
                    } else {
                      optionStyle = 'bg-zinc-950/40 border-zinc-900 text-zinc-600';
                    }
                  } else if (selectedOption === idx) {
                    optionStyle = 'bg-rose-950/60 border-rose-500 text-rose-200 font-bold';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswerSubmitted}
                      className={`w-full p-3.5 rounded-xl border text-left text-xs font-mono transition-all flex items-center justify-between cursor-pointer ${optionStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 font-bold text-zinc-400">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{option}</span>
                      </div>

                      {isAnswerSubmitted && idx === currentQuestion.correctAnswerIndex && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      )}
                      {isAnswerSubmitted && idx === selectedOption && idx !== currentQuestion.correctAnswerIndex && (
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Box */}
              {isAnswerSubmitted && (
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1 text-xs">
                  <div className="font-mono font-bold text-cyan-400 uppercase">
                    [SYSTEM EXPLANATION]
                  </div>
                  <p className="text-zinc-300 font-sans leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}
            </div>

            {/* Submit or Next Button */}
            <div className="pt-2">
              {!isAnswerSubmitted ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={selectedOption === null}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-zinc-100 font-mono font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-rose-950/50 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  <Swords className="w-4 h-4" />
                  <span>ATTACK BOSS WITH ANSWER</span>
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-zinc-950 font-mono font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-cyan-500/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{currentQuestionIndex + 1 === quiz.questions.length ? 'VIEW DUNGEON RESULTS' : 'NEXT QUESTION'}</span>
                </button>
              )}
            </div>

          </div>
        )}

        {/* Quiz Finished Victory / Defeat Screen */}
        {!isLoading && isQuizFinished && (
          <div className="py-8 text-center space-y-6">
            <div className="inline-flex p-4 rounded-2xl bg-amber-950/60 border border-amber-600/50 text-amber-400 shadow-xl shadow-amber-950/50">
              <Trophy className="w-12 h-12 animate-bounce" />
            </div>

            <div className="space-y-2">
              <div className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
                [DUNGEON CLEAR RESULTS]
              </div>
              <h3 className="text-2xl font-black font-mono text-zinc-100">
                {score >= Math.ceil(quiz!.questions.length * 0.6) ? 'DUNGEON CLEARED! BOSS DEFEATED' : 'DUNGEON FAILED! BOSS RECOVERED'}
              </h3>
              <p className="text-xs font-mono text-zinc-400">
                You scored <strong className="text-cyan-400">{score}/{quiz!.questions.length}</strong> ({Math.round((score / quiz!.questions.length) * 100)}%)
              </p>
            </div>

            {score >= Math.ceil(quiz!.questions.length * 0.6) ? (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-600/50 text-emerald-300 text-xs font-mono space-y-1 max-w-md mx-auto">
                <div className="font-bold text-sm text-emerald-400 flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>+{quiz!.xpReward} XP GAINED</span>
                </div>
                <div>Your daily hunter streak is protected & extended! 🔥</div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-600/50 text-rose-300 text-xs font-mono max-w-md mx-auto">
                Review your Grimoire notes and retry to clear the floor boss!
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleRestartQuiz}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Dungeon</span>
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-mono font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-cyan-500/30 cursor-pointer"
              >
                Return to Quest Log
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
