import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Sparkles,
  Layers,
  Repeat,
  PlusCircle,
  RotateCcw,
  Volume2,
  BookOpen,
  Music,
  Bookmark,
  CheckCircle2,
  Filter,
  EyeOff,
  Eye,
  Info,
  Flame,
  Lightbulb,
  ListRestart,
  Globe,
} from 'lucide-react';

import {
  MandarinWord,
  AudioSettings,
  PlaybackState,
  PlaybackHideMode,
  CumulativeSession,
  AppLanguage,
  ProficiencyLevel,
  StudyDirection,
} from './types';

import {
  getCumulativeBatchByProficiency,
  getTotalVocabCount,
  getTotalVocabCountByProficiency,
  getAllVocabulary,
  getWordsByProficiency,
  VOCABULARY_CATEGORIES,
} from './data/mandarinVocab';

import { speechService, SpeechCallbackProps } from './services/speechService';
import { UI_TRANSLATIONS, getTranslatedMeaning, getTranslatedCategory } from './services/translationService';
import { Header } from './components/Header';
import { ProficiencyLevelSelector } from './components/ProficiencyLevelSelector';
import { WordCard } from './components/WordCard';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { ToneGuideModal } from './components/ToneGuideModal';
import { QuizModal } from './components/QuizModal';
import { VocabCatalogModal } from './components/VocabCatalogModal';
import { SettingsModal } from './components/SettingsModal';
import { DEFAULT_TIERED_SETTINGS, getWordRepetitions, isWordOlderTier } from './services/repetitionHelper';

const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  speedRate: 0.75, // Pelan dan jelas (default ramah pemula)
  repetitionCount: 5, // 5x pengulangan per kata
  pauseBetweenRepsMs: 700,
  pauseBetweenWordsMs: 1200,
  playOrder: 'mandarin_then_indo',
  autoAdvanceCumulative: false,
  tieredRepetition: DEFAULT_TIERED_SETTINGS,
};

const BATCH_SIZE = 5; // 5 kosakata per kelompok

function shuffleWords(words: MandarinWord[]): MandarinWord[] {
  const copy = [...words];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function App() {
  // --- State: App Language (id = Indonesian, ms = Malay, en = English, zh = Chinese) ---
  const [appLanguage, setAppLanguage] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem('mandarin_app_language');
    if (saved === 'id' || saved === 'ms' || saved === 'en' || saved === 'zh') {
      return saved as AppLanguage;
    }
    return 'id';
  });

  // --- State: Study Direction ('zh_to_id': Belajar Mandarin | 'id_to_zh': Belajar Bahasa Indonesia / 学印尼语) ---
  const [studyDirection, setStudyDirection] = useState<StudyDirection>(() => {
    const saved = localStorage.getItem('mandarin_study_direction');
    if (saved === 'zh_to_id' || saved === 'id_to_zh') {
      return saved as StudyDirection;
    }
    return 'zh_to_id';
  });

  // --- State: Cumulative Learning Session & Proficiency Level ---
  const [session, setSession] = useState<CumulativeSession>(() => {
    const saved = localStorage.getItem('mandarin_app_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          proficiencyLevel: parsed.proficiencyLevel || 'basic',
          startIndex: parsed.startIndex || 0,
          batchCount: parsed.batchCount || 1,
          batchSize: BATCH_SIZE,
          totalLearnedWords: parsed.totalLearnedWords || 5,
          completedBatches: parsed.completedBatches || [],
        };
      } catch (e) {
        // ignore
      }
    }
    return {
      proficiencyLevel: 'basic',
      startIndex: 0,
      batchCount: 1, // Start with 1 batch = 5 words
      batchSize: BATCH_SIZE,
      totalLearnedWords: 5,
      completedBatches: [],
    };
  });

  // --- State: Random Mode (Acak Kosakata) ---
  const [isRandomMode, setIsRandomMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('mandarin_is_random_mode');
    return saved === 'true';
  });

  // Shuffled pool of words for current level
  const [randomPool, setRandomPool] = useState<MandarinWord[]>(() => {
    return shuffleWords(getWordsByProficiency('basic'));
  });

  // --- State: Loop Playback (Putar Ulang Terus-menerus) ---
  const [isLoopMode, setIsLoopMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('mandarin_is_loop_mode');
    return saved === 'true';
  });

  // --- State: Audio & Playback Settings ---
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(() => {
    const saved = localStorage.getItem('mandarin_audio_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_AUDIO_SETTINGS,
          ...parsed,
          tieredRepetition: {
            ...DEFAULT_TIERED_SETTINGS,
            ...(parsed.tieredRepetition || {}),
          },
        };
      } catch (e) {
        // ignore
      }
    }
    return DEFAULT_AUDIO_SETTINGS;
  });

  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    isPaused: false,
    currentWordIndex: 0,
    currentRepetition: 1,
    currentSpeechPhase: 'idle',
    activeWord: null,
  });

  // --- State: Hide Words (Blind Recall Mode) ---
  const [hideMode, setHideMode] = useState<PlaybackHideMode>('none');

  // --- State: Bookmarks / Favorites ---
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('mandarin_bookmarked_ids');
    if (saved) {
      try {
        return new Set(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
    return new Set<number>();
  });

  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);

  // --- State: Modals ---
  const [isToneGuideOpen, setIsToneGuideOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Live translations
  const t = UI_TRANSLATIONS[appLanguage] || UI_TRANSLATIONS.id;

  // Refs for keeping live settings accessible inside speech service callbacks
  const liveSettingsRef = useRef(audioSettings);
  liveSettingsRef.current = audioSettings;

  const liveLangRef = useRef(appLanguage);
  liveLangRef.current = appLanguage;

  const liveDirectionRef = useRef(studyDirection);
  liveDirectionRef.current = studyDirection;

  const isLoopModeRef = useRef(isLoopMode);
  isLoopModeRef.current = isLoopMode;

  const loopTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Stats calculation for the proficiency tiers & individual HSK levels
  const proficiencyStats = useMemo(() => {
    return {
      basic: getTotalVocabCountByProficiency('basic'),
      numbers_shopping: getTotalVocabCountByProficiency('numbers_shopping'),
      intermediate: getTotalVocabCountByProficiency('intermediate'),
      advanced: getTotalVocabCountByProficiency('advanced'),
      hsk1: getTotalVocabCountByProficiency('hsk1'),
      hsk2: getTotalVocabCountByProficiency('hsk2'),
      hsk3: getTotalVocabCountByProficiency('hsk3'),
      hsk4: getTotalVocabCountByProficiency('hsk4'),
      hsk5: getTotalVocabCountByProficiency('hsk5'),
      hsk6: getTotalVocabCountByProficiency('hsk6'),
      total: getTotalVocabCount(),
    };
  }, []);

  const totalPoolWords = useMemo(() => {
    return getTotalVocabCountByProficiency(session.proficiencyLevel);
  }, [session.proficiencyLevel]);

  // Compute active words based on cumulative session or random pool
  const activeWords: MandarinWord[] = useMemo(() => {
    if (isRandomMode) {
      const neededCount = Math.min(randomPool.length, session.batchCount * session.batchSize);
      return randomPool.slice(0, neededCount);
    }
    return getCumulativeBatchByProficiency(
      session.proficiencyLevel,
      session.startIndex,
      session.batchCount,
      session.batchSize
    );
  }, [isRandomMode, randomPool, session.proficiencyLevel, session.startIndex, session.batchCount, session.batchSize]);

  // Filtered active words (if user filters favorites)
  const displayWords = useMemo(() => {
    return activeWords.filter((w) => {
      if (showBookmarkedOnly && !bookmarkedIds.has(w.id)) {
        return false;
      }
      return true;
    });
  }, [activeWords, showBookmarkedOnly, bookmarkedIds]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem('mandarin_app_session', JSON.stringify(session));
  }, [session]);

  useEffect(() => {
    localStorage.setItem('mandarin_is_random_mode', isRandomMode ? 'true' : 'false');
  }, [isRandomMode]);

  useEffect(() => {
    localStorage.setItem('mandarin_is_loop_mode', isLoopMode ? 'true' : 'false');
  }, [isLoopMode]);

  useEffect(() => {
    localStorage.setItem('mandarin_app_language', appLanguage);
  }, [appLanguage]);

  useEffect(() => {
    localStorage.setItem('mandarin_study_direction', studyDirection);
  }, [studyDirection]);

  useEffect(() => {
    localStorage.setItem('mandarin_audio_settings', JSON.stringify(audioSettings));
  }, [audioSettings]);

  useEffect(() => {
    localStorage.setItem('mandarin_bookmarked_ids', JSON.stringify(Array.from(bookmarkedIds)));
  }, [bookmarkedIds]);

  // Register speechService status update callback
  useEffect(() => {
    speechService.setCallback((props: SpeechCallbackProps) => {
      if (props.isComplete) {
        if (isLoopModeRef.current) {
          if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
          loopTimerRef.current = setTimeout(() => {
            handlePlayBatch(0);
          }, Math.max(600, liveSettingsRef.current.pauseBetweenWordsMs));
        } else {
          setPlaybackState((prev) => ({
            ...prev,
            isPlaying: false,
            isPaused: false,
            currentSpeechPhase: 'idle',
          }));
        }
        return;
      }

      setPlaybackState((prev) => ({
        ...prev,
        isPlaying: true,
        currentWordIndex: props.wordIndex,
        currentRepetition: props.repetitionIndex,
        currentSpeechPhase: props.phase,
        activeWord: props.word,
      }));
    });
  }, []);

  // --- Action Handlers ---

  // 1. Play Full Active Batch
  const handlePlayBatch = (startFromIndex: number = 0) => {
    if (activeWords.length === 0) return;
    if (loopTimerRef.current) {
      clearTimeout(loopTimerRef.current);
      loopTimerRef.current = null;
    }

    setPlaybackState({
      isPlaying: true,
      isPaused: false,
      currentWordIndex: startFromIndex,
      currentRepetition: 1,
      currentSpeechPhase: studyDirection === 'id_to_zh' ? 'meaning' : 'mandarin',
      activeWord: activeWords[startFromIndex],
    });

    speechService.playBatch(
      activeWords,
      startFromIndex,
      () => liveSettingsRef.current,
      liveLangRef.current,
      () => {
        if (isLoopModeRef.current) {
          if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
          loopTimerRef.current = setTimeout(() => {
            handlePlayBatch(0);
          }, Math.max(600, liveSettingsRef.current.pauseBetweenWordsMs));
        } else {
          setPlaybackState((prev) => ({
            ...prev,
            isPlaying: false,
            isPaused: false,
            currentSpeechPhase: 'idle',
          }));
        }
      },
      liveDirectionRef.current
    );
  };

  const handlePause = () => {
    if (loopTimerRef.current) {
      clearTimeout(loopTimerRef.current);
      loopTimerRef.current = null;
    }
    speechService.pause();
    setPlaybackState((prev) => ({ ...prev, isPaused: true }));
  };

  const handleResume = () => {
    speechService.resume();
    setPlaybackState((prev) => ({ ...prev, isPaused: false }));
  };

  const handleStop = () => {
    if (loopTimerRef.current) {
      clearTimeout(loopTimerRef.current);
      loopTimerRef.current = null;
    }
    speechService.stop();
    setPlaybackState({
      isPlaying: false,
      isPaused: false,
      currentWordIndex: 0,
      currentRepetition: 1,
      currentSpeechPhase: 'idle',
      activeWord: null,
    });
  };

  // 2. Tombol Ulang (Replay Current Batch)
  const handleReplayCurrentBatch = () => {
    handleStop();
    handlePlayBatch(0);
  };

  // 3. Tombol Lanjut (+5 Kosakata Baru Kumulatif)
  const handleAdvanceAdd5Cumulative = () => {
    handleStop();
    setSession((prev) => {
      const nextBatchCount = prev.batchCount + 1;
      const totalWords = nextBatchCount * prev.batchSize;
      return {
        ...prev,
        batchCount: nextBatchCount,
        totalLearnedWords: Math.max(prev.totalLearnedWords, totalWords),
      };
    });
  };

  // 4. Toggle Mode Acak (Random ON/OFF)
  const handleToggleRandomMode = () => {
    handleStop();
    const next = !isRandomMode;
    setIsRandomMode(next);
    if (next) {
      const freshShuffled = shuffleWords(getWordsByProficiency(session.proficiencyLevel));
      setRandomPool(freshShuffled);
    }
    setSession((prev) => ({
      ...prev,
      startIndex: 0,
      batchCount: 1,
      batchSize: BATCH_SIZE,
      totalLearnedWords: 5,
      completedBatches: [],
    }));
    setShowBookmarkedOnly(false);
  };

  // 5. Toggle Mode Looping (Loop ON/OFF)
  const handleToggleLoopMode = () => {
    setIsLoopMode((prev) => !prev);
  };

  // 6. Reset to First Batch (5 Words)
  const handleResetToFirstBatch = () => {
    handleStop();
    if (isRandomMode) {
      const freshShuffled = shuffleWords(getWordsByProficiency(session.proficiencyLevel));
      setRandomPool(freshShuffled);
    }
    setSession((prev) => ({
      ...prev,
      startIndex: 0,
      batchCount: 1,
      batchSize: BATCH_SIZE,
      totalLearnedWords: 5,
      completedBatches: [],
    }));
    setHideMode('none');
    setShowBookmarkedOnly(false);
  };

  // 7. Select Proficiency Level (Basic, Intermediate, Advanced, All)
  const handleSelectProficiencyLevel = (level: ProficiencyLevel) => {
    handleStop();
    setRandomPool(shuffleWords(getWordsByProficiency(level)));
    setSession({
      proficiencyLevel: level,
      startIndex: 0,
      batchCount: 1,
      batchSize: BATCH_SIZE,
      totalLearnedWords: 5,
      completedBatches: [],
    });
    setHideMode('none');
    setShowBookmarkedOnly(false);
  };

  // 6. Change Language
  const handleSelectLanguage = (lang: AppLanguage) => {
    setAppLanguage(lang);
    if (playbackState.isPlaying) {
      // Re-trigger playback if active with new language
      const currentIndex = playbackState.currentWordIndex;
      handleStop();
      setTimeout(() => {
        handlePlayBatch(currentIndex);
      }, 150);
    }
  };

  // 7. Jump to Previous/Next word during playback
  const handlePrevWord = () => {
    if (playbackState.currentWordIndex > 0) {
      handleStop();
      handlePlayBatch(playbackState.currentWordIndex - 1);
    }
  };

  const handleNextWord = () => {
    if (playbackState.currentWordIndex < activeWords.length - 1) {
      handleStop();
      handlePlayBatch(playbackState.currentWordIndex + 1);
    }
  };

  // 8. Live Speed adjustment
  const handleUpdateSpeedRate = (newSpeed: number) => {
    setAudioSettings((prev) => ({ ...prev, speedRate: newSpeed }));
  };

  // 9. Repetition Count adjustment
  const handleUpdateRepetitionCount = (count: number) => {
    setAudioSettings((prev) => ({ ...prev, repetitionCount: count }));
  };

  // 10. Pause Interval (Jarak Waktu Pengulangan) adjustment
  const handleUpdatePauseBetweenReps = (pauseMs: number) => {
    setAudioSettings((prev) => ({
      ...prev,
      pauseBetweenRepsMs: pauseMs,
      // Scale pauseBetweenWordsMs proportionately if desired, or keep as user sets
      pauseBetweenWordsMs: Math.max(800, Math.round(pauseMs * 1.6)),
    }));
  };

  // 11. Tiered Repetition handlers
  const handleToggleTieredRepetition = () => {
    setAudioSettings((prev) => {
      const currentTiered = prev.tieredRepetition || DEFAULT_TIERED_SETTINGS;
      return {
        ...prev,
        tieredRepetition: {
          ...currentTiered,
          enabled: !currentTiered.enabled,
        },
      };
    });
  };

  const handleUpdateTieredOlderReps = (reps: number) => {
    setAudioSettings((prev) => {
      const currentTiered = prev.tieredRepetition || DEFAULT_TIERED_SETTINGS;
      return {
        ...prev,
        tieredRepetition: {
          ...currentTiered,
          olderWordsReps: reps,
        },
      };
    });
  };

  const handleUpdateTieredRecentCount = (count: number) => {
    setAudioSettings((prev) => {
      const currentTiered = prev.tieredRepetition || DEFAULT_TIERED_SETTINGS;
      return {
        ...prev,
        tieredRepetition: {
          ...currentTiered,
          recentWordsCount: count,
        },
      };
    });
  };

  // 12. Bookmark Toggle
  const handleToggleBookmark = (wordId: number) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(wordId)) {
        next.delete(wordId);
      } else {
        next.add(wordId);
      }
      return next;
    });
  };

  // 11. Jump from catalog to specific word index
  const handleSelectWordFromCatalog = (wordIndex: number) => {
    handleStop();
    const batchIndex = Math.floor(wordIndex / BATCH_SIZE);
    setSession((prev) => ({
      ...prev,
      startIndex: batchIndex * BATCH_SIZE,
      batchCount: 1,
      batchSize: BATCH_SIZE,
      totalLearnedWords: Math.max(prev.totalLearnedWords, (batchIndex + 1) * BATCH_SIZE),
      completedBatches: prev.completedBatches,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-950 via-blue-950 to-indigo-950 text-white flex flex-col font-['Outfit',sans-serif] selection:bg-cyan-400 selection:text-slate-950 pb-12 relative overflow-x-hidden">
      
      {/* Ambient background glow accents */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Application Header */}
      <Header
        totalLearned={session.totalLearnedWords}
        currentBatchCount={session.batchCount}
        totalWordsInPool={totalPoolWords}
        activeHSK={activeWords[0]?.hsk || 'HSK 1'}
        appLanguage={appLanguage}
        onSelectLanguage={handleSelectLanguage}
        studyDirection={studyDirection}
        onToggleStudyDirection={() => {
          handleStop();
          setStudyDirection((prev) => (prev === 'zh_to_id' ? 'id_to_zh' : 'zh_to_id'));
        }}
        onOpenToneGuide={() => setIsToneGuideOpen(true)}
        onOpenCatalog={() => setIsCatalogOpen(true)}
        onOpenQuiz={() => setIsQuizOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onResetToFirstBatch={handleResetToFirstBatch}
        bookmarkedCount={bookmarkedIds.size}
        showBookmarkedOnly={showBookmarkedOnly}
        onToggleBookmarkedOnly={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        
        {/* Method Instruction & Session Overview Banner */}
        <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-400/20 border border-cyan-300/40 flex items-center justify-center text-cyan-300 shrink-0 shadow-lg shadow-cyan-950/30">
              <Flame className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-bold text-lg sm:text-xl text-white tracking-tight">
                  {t.cumulativeMethodTitle} ({activeWords.length} {t.wordsUnit})
                </span>
                <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/25 text-cyan-200 font-mono font-bold border border-cyan-400/40 shadow-sm">
                  {t.groupLabel} #{session.batchCount} • {activeWords.length} {t.wordsUnit}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-cyan-100/75 mt-1 leading-relaxed max-w-2xl">
                {t.cumulativeMethodDesc}
              </p>
            </div>
          </div>

          {/* Quick Action Chips & Progress */}
          <div className="flex items-center gap-2.5 flex-wrap text-xs">
            <div className="px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-cyan-100 flex items-center gap-2 font-mono shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{t.databaseTotal}: <strong className="text-white">{totalPoolWords}</strong> {t.wordsUnit}</span>
            </div>
            <button
              id="btn-trigger-quiz-banner"
              onClick={() => setIsQuizOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-500/25 hover:bg-emerald-500/40 text-emerald-200 border border-emerald-400/50 backdrop-blur-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer font-bold shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>{t.quiz} ({activeWords.length} {t.wordsUnit})</span>
            </button>
            <button
              id="btn-banner-reset-5-words"
              onClick={handleResetToFirstBatch}
              className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/35 text-rose-200 border border-rose-400/40 backdrop-blur-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer font-bold shadow-sm"
              title={t.resetLevelTooltip}
            >
              <ListRestart className="w-4 h-4 text-rose-300" />
              <span>{t.resetToStart}</span>
            </button>
          </div>

        </div>

        {/* 3 Proficiency Levels Selector (Dasar, Menengah, Mahir) */}
        <ProficiencyLevelSelector
          currentLevel={session.proficiencyLevel}
          onSelectLevel={handleSelectProficiencyLevel}
          appLanguage={appLanguage}
          stats={proficiencyStats}
        />

        {/* Audio Player Control Bar (Posisi di atas Toolbar Kosakata) */}
        <AudioPlayerBar
          playbackState={playbackState}
          audioSettings={audioSettings}
          hideMode={hideMode}
          activeBatchWordCount={activeWords.length}
          totalBatchBatchesCount={session.batchCount}
          currentBatchIndex={Math.floor(session.startIndex / BATCH_SIZE)}
          isRandomMode={isRandomMode}
          isLoopMode={isLoopMode}
          onPlay={() => handlePlayBatch(0)}
          onPause={handlePause}
          onResume={handleResume}
          onStop={handleStop}
          onReplayCurrentBatch={handleResetToFirstBatch}
          onAdvanceAdd5Cumulative={handleAdvanceAdd5Cumulative}
          onToggleRandomMode={handleToggleRandomMode}
          onToggleLoopMode={handleToggleLoopMode}
          onPrevWord={handlePrevWord}
          onNextWord={handleNextWord}
          onUpdateSpeedRate={handleUpdateSpeedRate}
          onUpdateRepetitionCount={handleUpdateRepetitionCount}
          onUpdatePauseBetweenReps={handleUpdatePauseBetweenReps}
          onToggleHideMode={setHideMode}
          onToggleTieredRepetition={handleToggleTieredRepetition}
          onUpdateTieredOlderReps={handleUpdateTieredOlderReps}
          onUpdateTieredRecentCount={handleUpdateTieredRecentCount}
          appLanguage={appLanguage}
        />

        {/* Active Words Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {displayWords.map((word, idx) => {
            const isCurrentlyPlaying =
              playbackState.isPlaying &&
              playbackState.currentWordIndex === idx &&
              !showBookmarkedOnly;

            const isTieredEnabled = Boolean(audioSettings.tieredRepetition?.enabled);
            const wordReps = getWordRepetitions(idx, activeWords.length, audioSettings);
            const isOlder = isWordOlderTier(idx, activeWords.length, audioSettings);

            return (
              <WordCard
                key={word.id}
                word={word}
                index={idx}
                isActive={isCurrentlyPlaying}
                activeRepetition={playbackState.currentRepetition}
                totalRepetitions={wordReps}
                currentSpeechPhase={playbackState.currentSpeechPhase}
                hideMode={hideMode}
                isBookmarked={bookmarkedIds.has(word.id)}
                onToggleBookmark={handleToggleBookmark}
                speed={audioSettings.speedRate}
                mandarinVoiceURI={audioSettings.mandarinVoiceURI}
                meaningVoiceURI={audioSettings.indonesianVoiceURI}
                appLanguage={appLanguage}
                studyDirection={studyDirection}
                isTieredEnabled={isTieredEnabled}
                wordRepetitions={wordReps}
                isOlderTier={isOlder}
              />
            );
          })}
        </div>

        {/* Empty state if search has no results */}
        {displayWords.length === 0 && (
          <div className="text-center py-16 p-8 rounded-3xl bg-white/5 backdrop-blur-md border border-dashed border-white/20 text-cyan-100/70">
            <p className="text-sm font-medium">
              {t.noResults}
            </p>
            {showBookmarkedOnly && (
              <button
                onClick={() => setShowBookmarkedOnly(false)}
                className="mt-3 px-5 py-2.5 rounded-2xl bg-cyan-400 text-slate-950 text-xs font-bold hover:bg-cyan-300 transition shadow-lg"
              >
                {t.showAll}
              </button>
            )}
          </div>
        )}

        {/* Bottom Helper Tip */}
        <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/15 text-xs text-cyan-100/80 flex items-start sm:items-center gap-3 shadow-sm">
          <Lightbulb className="w-4 h-4 text-amber-300 shrink-0 mt-0.5 sm:mt-0" />
          <div>
            <strong className="text-white">Tip:</strong> {t.cumulativeMethodDesc}
          </div>
        </div>

      </main>

      {/* 4 Tones Guide Modal */}
      <ToneGuideModal
        isOpen={isToneGuideOpen}
        onClose={() => setIsToneGuideOpen(false)}
        speed={audioSettings.speedRate}
        appLanguage={appLanguage}
      />

      {/* Quiz Modal */}
      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        words={activeWords}
        speed={audioSettings.speedRate}
        mandarinVoiceURI={audioSettings.mandarinVoiceURI}
        appLanguage={appLanguage}
      />

      {/* 3000-Word Catalog Modal */}
      <VocabCatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        onSelectWordToLearn={handleSelectWordFromCatalog}
        bookmarkedIds={bookmarkedIds}
        onToggleBookmark={handleToggleBookmark}
        speed={audioSettings.speedRate}
        appLanguage={appLanguage}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={audioSettings}
        onSaveSettings={setAudioSettings}
        appLanguage={appLanguage}
        activeWords={activeWords}
        onSelectLanguage={handleSelectLanguage}
      />

    </div>
  );
}
