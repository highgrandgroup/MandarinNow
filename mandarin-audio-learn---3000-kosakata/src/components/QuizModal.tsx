import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, Volume2, RotateCcw, Award, Sparkles, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MandarinWord, AppLanguage } from '../types';
import { speechService } from '../services/speechService';
import { getWordMeaning, UI_TRANSLATIONS } from '../services/translationService';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  words: MandarinWord[];
  speed: number;
  mandarinVoiceURI?: string;
  appLanguage: AppLanguage;
}

interface Question {
  targetWord: MandarinWord;
  options: MandarinWord[];
  type: 'hanzi_to_indo' | 'indo_to_hanzi' | 'audio_to_indo';
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  words,
  speed,
  mandarinVoiceURI,
  appLanguage,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const t = UI_TRANSLATIONS[appLanguage] || UI_TRANSLATIONS.id;

  // Generate quiz questions based on the active words pool
  const generateQuiz = () => {
    if (words.length === 0) return;

    // Shuffle words for target questions
    const shuffled = [...words].sort(() => 0.5 - Math.random());
    const generatedQuestions: Question[] = [];

    const types: Question['type'][] = ['hanzi_to_indo', 'audio_to_indo', 'indo_to_hanzi'];

    shuffled.forEach((target, index) => {
      // Pick 3 distractors from words or fallback
      const otherWords = words.filter((w) => w.id !== target.id);
      const shuffledOthers = [...otherWords].sort(() => 0.5 - Math.random()).slice(0, 3);
      
      const options = [target, ...shuffledOthers].sort(() => 0.5 - Math.random());
      const qType = types[index % types.length];

      generatedQuestions.push({
        targetWord: target,
        options,
        type: qType,
      });
    });

    setQuestions(generatedQuestions);
    setCurrentIdx(0);
    setSelectedAnswerId(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsFinished(false);
  };

  useEffect(() => {
    if (isOpen) {
      generateQuiz();
    }
  }, [isOpen, words]);

  // Auto-play audio when audio question appears
  useEffect(() => {
    if (isOpen && questions[currentIdx]?.type === 'audio_to_indo' && !isFinished) {
      setIsPlayingAudio(true);
      speechService.speakSingleWord(questions[currentIdx].targetWord, speed, mandarinVoiceURI).then(() => {
        setTimeout(() => setIsPlayingAudio(false), 600);
      });
    }
  }, [currentIdx, questions, isOpen]);

  if (!isOpen) return null;

  const currentQ = questions[currentIdx];

  const handleSelectOption = (optionWord: MandarinWord) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswerId(optionWord.id);
    setIsAnswerSubmitted(true);

    const isCorrect = optionWord.id === currentQ.targetWord.id;
    if (isCorrect) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedAnswerId(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsFinished(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  };

  const playAudioPrompt = async () => {
    if (currentQ) {
      setIsPlayingAudio(true);
      await speechService.speakSingleWord(currentQ.targetWord, speed, mandarinVoiceURI);
      setTimeout(() => setIsPlayingAudio(false), 600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900/90 border border-white/20 rounded-3xl max-w-xl w-full flex flex-col shadow-2xl backdrop-blur-2xl overflow-hidden text-white">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-white/15 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-400/20 border border-cyan-300/40 flex items-center justify-center text-cyan-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {t.quizTitle}
              </h3>
              <p className="text-xs text-cyan-100/70">
                {t.quizSubtitle} ({words.length} {t.wordsUnit})
              </p>
            </div>
          </div>
          <button
            id="btn-close-quiz"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer border border-white/15"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {!isFinished && currentQ ? (
            <div>
              {/* Progress bar */}
              <div className="flex items-center justify-between text-xs text-cyan-100/80 mb-2 font-mono">
                <span>{t.questionNum} {currentIdx + 1} / {questions.length}</span>
                <span className="text-cyan-300 font-bold">{t.score}: {score}</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-6">
                <div
                  className="h-full bg-cyan-400 shadow-sm transition-all duration-300"
                  style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                />
              </div>

              {/* Question Box */}
              <div className="p-6 rounded-3xl bg-black/30 backdrop-blur-md border border-white/15 text-center mb-6 shadow-inner">
                {currentQ.type === 'hanzi_to_indo' && (
                  <div>
                    <span className="text-xs text-cyan-100/70 uppercase tracking-wider font-semibold block mb-2">
                      {t.selectCorrectMeaning}:
                    </span>
                    <h2 className="text-4xl sm:text-5xl font-black text-white font-['Noto_Sans_SC'] tracking-wider mb-2 drop-shadow">
                      {currentQ.targetWord.hanzi}
                    </h2>
                    <span className="text-base font-mono font-bold text-cyan-300">
                      {currentQ.targetWord.pinyin}
                    </span>
                  </div>
                )}

                {currentQ.type === 'indo_to_hanzi' && (
                  <div>
                    <span className="text-xs text-cyan-100/70 uppercase tracking-wider font-semibold block mb-2">
                      {t.selectCorrectHanzi}:
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold text-cyan-200 mb-1">
                      "{getWordMeaning(currentQ.targetWord, appLanguage)}"
                    </h2>
                    <span className="text-xs text-white/70">
                      {t.category}: {currentQ.targetWord.category}
                    </span>
                  </div>
                )}

                {currentQ.type === 'audio_to_indo' && (
                  <div className="py-2">
                    <span className="text-xs text-cyan-100/70 uppercase tracking-wider font-semibold block mb-3">
                      {t.listenAndGuess}:
                    </span>
                    <button
                      id="btn-quiz-audio-play"
                      onClick={playAudioPrompt}
                      className={`mx-auto flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-black text-sm shadow-xl transition active:scale-95 cursor-pointer ${
                        isPlayingAudio
                          ? 'bg-cyan-300 text-slate-950 shadow-cyan-300/60 ring-4 ring-cyan-400/40 scale-105'
                          : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-cyan-950/40'
                      }`}
                    >
                      <Volume2 className={`w-5 h-5 ${isPlayingAudio ? 'animate-bounce' : 'animate-pulse'}`} />
                      <span>{isPlayingAudio ? 'Memutar Audio...' : t.replayAudio}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Option Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {currentQ.options.map((option, oIdx) => {
                  const isSelected = selectedAnswerId === option.id;
                  const isCorrect = option.id === currentQ.targetWord.id;
                  const meaning = getWordMeaning(option, appLanguage);

                  let btnStyle = 'bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/35 text-white';
                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-500/30 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400/50 font-bold';
                    } else if (isSelected) {
                      btnStyle = 'bg-rose-500/30 border-rose-400 text-rose-200 ring-2 ring-rose-400/50';
                    } else {
                      btnStyle = 'bg-white/5 border-white/10 text-white/40 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={option.id}
                      id={`btn-quiz-option-${oIdx}`}
                      onClick={() => handleSelectOption(option)}
                      disabled={isAnswerSubmitted}
                      className={`p-4 rounded-2xl border backdrop-blur-md transition-all text-left flex items-center justify-between cursor-pointer shadow-sm ${btnStyle}`}
                    >
                      <div>
                        {currentQ.type === 'indo_to_hanzi' ? (
                          <div>
                            <span className="text-xl font-bold font-['Noto_Sans_SC'] block text-white">
                              {option.hanzi}
                            </span>
                            <span className="text-xs font-mono text-cyan-300 font-bold">
                              {option.pinyin}
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span className="text-sm font-semibold block">
                              {meaning}
                            </span>
                            {currentQ.type === 'audio_to_indo' && isAnswerSubmitted && (
                              <span className="text-xs font-mono text-cyan-200">
                                {option.hanzi} ({option.pinyin})
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {isAnswerSubmitted && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
                      )}
                      {isAnswerSubmitted && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-300 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Next Question / Explanation Footer */}
              {isAnswerSubmitted && (
                <div className="flex justify-end animate-in fade-in">
                  <button
                    id="btn-quiz-next"
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-sm shadow-xl shadow-cyan-950/40 transition active:scale-95 cursor-pointer"
                  >
                    <span>{currentIdx < questions.length - 1 ? t.nextQuestion : t.seeResults}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Results Screen */
            <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-cyan-400/20 border border-cyan-300/40 flex items-center justify-center text-cyan-300 shadow-xl shadow-cyan-950/40">
                <Award className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  {t.quizCompleted} 🎉
                </h3>
                <p className="text-sm text-cyan-100/70">
                  {score} / {questions.length} {t.wordsUnit}
                </p>
              </div>

              {/* Score Grade */}
              <div className="p-5 rounded-3xl bg-black/30 backdrop-blur-md border border-white/15 max-w-xs mx-auto">
                <div className="text-4xl font-black font-mono text-cyan-300">
                  {Math.round((score / Math.max(1, questions.length)) * 100)}%
                </div>
                <div className="text-xs text-white/80 mt-1.5">
                  {score === questions.length ? '🌟 Perfect score!' : score >= questions.length * 0.7 ? '👍 Great job!' : '💪 Keep practicing audio repetition!'}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-center gap-3 pt-3">
                <button
                  id="btn-quiz-retry"
                  onClick={generateQuiz}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs transition cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-cyan-300" />
                  <span>{t.retryQuiz}</span>
                </button>
                <button
                  id="btn-quiz-finish-close"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs shadow-lg transition cursor-pointer"
                >
                  {t.finishQuiz}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

