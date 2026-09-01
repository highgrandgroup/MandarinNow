import React, { useState } from 'react';
import { Volume2, Volume1, Bookmark, Eye, EyeOff, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { MandarinWord, PlaybackHideMode, AppLanguage, StudyDirection } from '../types';
import { speechService } from '../services/speechService';
import { getWordMeaning, getWordExampleMeaning, UI_TRANSLATIONS } from '../services/translationService';

interface WordCardProps {
  word: MandarinWord;
  index: number;
  isActive: boolean;
  activeRepetition: number;
  totalRepetitions: number;
  currentSpeechPhase: 'mandarin' | 'indonesian' | 'meaning' | 'idle';
  hideMode: PlaybackHideMode;
  isBookmarked: boolean;
  onToggleBookmark: (wordId: number) => void;
  speed: number;
  appLanguage: AppLanguage;
  studyDirection?: StudyDirection;
  mandarinVoiceURI?: string;
  meaningVoiceURI?: string;
  isTieredEnabled?: boolean;
  wordRepetitions?: number;
  isOlderTier?: boolean;
}

export const WordCard: React.FC<WordCardProps> = ({
  word,
  index,
  isActive,
  activeRepetition,
  totalRepetitions,
  currentSpeechPhase,
  hideMode,
  isBookmarked,
  onToggleBookmark,
  speed,
  appLanguage,
  studyDirection = 'zh_to_id',
  mandarinVoiceURI,
  meaningVoiceURI,
  isTieredEnabled,
  wordRepetitions,
  isOlderTier,
}) => {
  const [showExample, setShowExample] = useState(false);
  const [isManuallyRevealed, setIsManuallyRevealed] = useState(false);

  const isReverseMode = studyDirection === 'id_to_zh';
  const t = UI_TRANSLATIONS[appLanguage] || UI_TRANSLATIONS.id;

  // Determine if this card is currently hidden by the hideMode or global playback
  const isContentHidden = !isManuallyRevealed && hideMode !== 'none';
  const hideMain = isContentHidden && (hideMode === 'all' || hideMode === 'hanzi_only');
  const hideSub = isContentHidden && (hideMode === 'all' || hideMode === 'pinyin_only');
  const hideMeaning = isContentHidden && (hideMode === 'all' || hideMode === 'meaning_only');

  const playMandarinOnly = (e: React.MouseEvent) => {
    e.stopPropagation();
    speechService.speakSingleWord(word, speed, mandarinVoiceURI);
  };

  const playMeaningOnly = (e: React.MouseEvent) => {
    e.stopPropagation();
    speechService.speakSingleMeaning(word, speed, appLanguage === 'zh' ? 'id' : appLanguage, meaningVoiceURI);
  };

  const playIndoOnly = (e: React.MouseEvent) => {
    e.stopPropagation();
    speechService.speakSingleMeaning(word, speed, 'id', meaningVoiceURI);
  };

  // HSK Level color styling helper
  const getHskBadgeClass = (hsk?: string) => {
    switch (hsk) {
      case 'HSK 1':
        return 'bg-emerald-500/25 text-emerald-200 border-emerald-400/40';
      case 'HSK 2':
        return 'bg-teal-500/25 text-teal-200 border-teal-400/40';
      case 'HSK 3':
        return 'bg-sky-500/25 text-sky-200 border-sky-400/40';
      case 'HSK 4':
        return 'bg-indigo-500/25 text-indigo-200 border-indigo-400/40';
      case 'HSK 5':
        return 'bg-fuchsia-500/25 text-fuchsia-200 border-fuchsia-400/40';
      case 'HSK 6':
        return 'bg-rose-500/25 text-rose-200 border-rose-400/40';
      default:
        return 'bg-white/15 text-cyan-100 border-white/25';
    }
  };

  // Tone color styling helper
  const getToneBadgeClass = (tone?: number) => {
    switch (tone) {
      case 1:
        return 'bg-cyan-500/30 text-cyan-200 border-cyan-400/40';
      case 2:
        return 'bg-emerald-500/30 text-emerald-200 border-emerald-400/40';
      case 3:
        return 'bg-amber-500/30 text-amber-200 border-amber-400/40';
      case 4:
        return 'bg-rose-500/30 text-rose-200 border-rose-400/40';
      default:
        return 'bg-purple-500/30 text-purple-200 border-purple-400/40';
    }
  };

  const getToneLabel = (tone?: number) => {
    switch (tone) {
      case 1:
        return t.tone1;
      case 2:
        return t.tone2;
      case 3:
        return t.tone3;
      case 4:
        return t.tone4;
      default:
        return t.toneNeutral;
    }
  };

  const translatedMeaning = getWordMeaning(word, appLanguage);
  const translatedExample = getWordExampleMeaning(word, appLanguage);

  return (
    <div
      id={`word-card-${word.id}`}
      className={`group relative rounded-3xl border transition-all duration-300 p-6 backdrop-blur-xl ${
        isActive
          ? 'bg-white/20 border-2 border-cyan-400 ring-4 ring-cyan-400/25 shadow-[0_0_30px_rgba(34,211,238,0.3)] scale-[1.02]'
          : 'bg-white/10 border-white/20 hover:border-white/35 hover:bg-white/15 shadow-xl shadow-black/10'
      }`}
    >
      {/* Active Audio Highlight Banner */}
      {isActive && (
        <div className="absolute -top-3.5 left-5 right-5 flex items-center justify-between px-3.5 py-1.5 rounded-full bg-cyan-400 text-slate-950 text-xs font-black shadow-lg shadow-cyan-950/40 animate-pulse">
          <div className="flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 animate-bounce" />
            <span className="tracking-wide">
              {currentSpeechPhase === 'mandarin'
                ? t.phaseMandarin
                : currentSpeechPhase === 'meaning' || currentSpeechPhase === 'indonesian'
                ? t.phaseMeaning
                : t.phasePause}
            </span>
          </div>
          <span className="bg-slate-950 text-cyan-300 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold">
            {activeRepetition} / {totalRepetitions}
          </span>
        </div>
      )}

      {/* Card Header Info */}
      <div className={`flex items-center justify-between gap-2 mb-3.5 ${isActive ? 'mt-2' : ''}`}>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Index numbering badge */}
          <span className="w-6 h-6 rounded-lg bg-white/15 text-white/90 border border-white/25 flex items-center justify-center text-xs font-mono font-bold">
            {index + 1}
          </span>

          {/* HSK Badge */}
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${getHskBadgeClass(word.hsk)}`}>
            {word.hsk}
          </span>

          {/* Tone Badge */}
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border ${getToneBadgeClass(word.tone)}`}>
            {getToneLabel(word.tone)}
          </span>

          {/* Category Tag */}
          <span className="text-[11px] text-cyan-100/70 hidden sm:inline-block max-w-[130px] truncate">
            {word.category}
          </span>

          {/* Tiered Repetition Indicator Badge */}
          {isTieredEnabled && wordRepetitions !== undefined && (
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border ${
                isOlderTier
                  ? wordRepetitions === 0
                    ? 'bg-rose-500/20 text-rose-300 border-rose-400/40'
                    : 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40'
                  : 'bg-cyan-500/20 text-cyan-200 border-cyan-400/40'
              }`}
              title={
                isOlderTier
                  ? wordRepetitions === 0
                    ? 'Kata Lama (Urutan Awal) - Dilewati / Tidak dibaca'
                    : `Kata Lama (Urutan Awal) - Dibaca ${wordRepetitions}x`
                  : `Kata Baru (Urutan Terakhir) - Dibaca ${wordRepetitions}x`
              }
            >
              {isOlderTier
                ? wordRepetitions === 0
                  ? 'Lama: 0x (Skip)'
                  : `Lama: ${wordRepetitions}x`
                : `Baru: ${wordRepetitions}x`}
            </span>
          )}
        </div>

        {/* Action icons: Peek Hide & Bookmark */}
        <div className="flex items-center gap-1.5">
          {/* Peek button if masked */}
          {hideMode !== 'none' && (
            <button
              id={`btn-peek-word-${word.id}`}
              onClick={() => setIsManuallyRevealed(!isManuallyRevealed)}
              className={`p-1.5 rounded-xl border backdrop-blur-md transition text-xs cursor-pointer ${
                isManuallyRevealed
                  ? 'bg-amber-400/30 text-amber-200 border-amber-300/50'
                  : 'bg-white/10 hover:bg-white/20 text-white/80 border-white/20'
              }`}
              title={isManuallyRevealed ? t.hideAgain : t.peekWord}
            >
              {isManuallyRevealed ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-cyan-300" />}
            </button>
          )}

          {/* Bookmark Button */}
          <button
            id={`btn-bookmark-word-${word.id}`}
            onClick={() => onToggleBookmark(word.id)}
            className={`p-1.5 rounded-xl border backdrop-blur-md transition text-xs cursor-pointer ${
              isBookmarked
                ? 'bg-amber-400/30 text-amber-300 border-amber-300/50 shadow-sm'
                : 'bg-white/10 hover:bg-white/20 text-white/70 border-white/20'
            }`}
            title={isBookmarked ? t.bookmarkRemove : t.bookmarkAdd}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-300 text-amber-300' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Content: Layout switches based on studyDirection */}
      {isReverseMode ? (
        /* MODE REVERSE: Target Language ➔ Mandarin */
        <div className="space-y-3.5">
          {/* Target Language Prominent Word (ID / MS / EN) */}
          <div className="flex items-baseline justify-between gap-4">
            <div className="flex-1">
              {hideMain ? (
                <div
                  onClick={() => setIsManuallyRevealed(true)}
                  className="h-16 bg-black/25 backdrop-blur-md border border-dashed border-white/25 rounded-2xl flex items-center justify-center text-xs text-white/70 hover:border-cyan-400/70 hover:text-cyan-200 transition cursor-pointer select-none"
                >
                  {t.maskedMeaning}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl font-black text-amber-300 tracking-wide select-all drop-shadow-md">
                    {translatedMeaning}
                  </span>
                  
                  {/* Single audio pronunciation button for Target Language */}
                  <button
                    id={`btn-speak-meaning-${word.id}`}
                    onClick={playMeaningOnly}
                    className="p-2.5 rounded-2xl bg-white/15 hover:bg-amber-400 hover:text-slate-950 text-amber-300 border border-white/25 transition active:scale-95 cursor-pointer shadow-md"
                    title={t.listenMeaning}
                    aria-label={`Dengarkan ${translatedMeaning}`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Hanzi & Pinyin reference */}
          <div className="pt-3 border-t border-white/15 flex items-center justify-between gap-3">
            <div className="flex-1">
              <span className="text-[11px] text-cyan-100/70 block font-medium">
                {appLanguage === 'en' ? 'Mandarin (Hanzi & Pinyin):' : appLanguage === 'ms' ? 'Mandarin (Hanzi & Pinyin):' : appLanguage === 'zh' ? '中文释义与拼音:' : 'Mandarin (Hanzi & Pinyin):'}
              </span>
              {hideMeaning ? (
                <div
                  onClick={() => setIsManuallyRevealed(true)}
                  className="py-1 px-2.5 bg-black/20 border border-dashed border-white/20 rounded-xl text-xs text-cyan-300 hover:text-white transition cursor-pointer mt-0.5 inline-block"
                >
                  {t.maskedHanzi}
                </div>
              ) : (
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-2xl sm:text-3xl font-black text-white font-['Noto_Sans_SC']">
                    {word.hanzi}
                  </span>
                  <span className="text-sm font-mono text-cyan-300 font-semibold tracking-wider">
                    {word.pinyin}
                  </span>
                </div>
              )}
            </div>

            {/* Listen Mandarin */}
            <button
              id={`btn-speak-hanzi-${word.id}`}
              onClick={playMandarinOnly}
              className="p-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/20 transition active:scale-95 cursor-pointer shadow-sm shrink-0"
              title={t.listenMandarin}
            >
              <Volume1 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* STANDARD MODE: Belajar Mandarin */
        <div className="space-y-3.5">
          {/* Hanzi (Chinese Characters) */}
          <div className="flex items-baseline justify-between gap-4">
            <div className="flex-1">
              {hideMain ? (
                <div
                  onClick={() => setIsManuallyRevealed(true)}
                  className="h-16 bg-black/25 backdrop-blur-md border border-dashed border-white/25 rounded-2xl flex items-center justify-center text-xs text-white/70 hover:border-cyan-400/70 hover:text-cyan-200 transition cursor-pointer select-none"
                >
                  {t.maskedHanzi}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-4xl sm:text-5xl font-black text-white font-['Noto_Sans_SC'] tracking-wider select-all drop-shadow-md">
                    {word.hanzi}
                  </span>
                  
                  {/* Single audio pronunciation button for Mandarin */}
                  <button
                    id={`btn-speak-hanzi-${word.id}`}
                    onClick={playMandarinOnly}
                    className="p-2.5 rounded-2xl bg-white/15 hover:bg-cyan-400 hover:text-slate-950 text-cyan-300 border border-white/25 transition active:scale-95 cursor-pointer shadow-md"
                    title={t.listenMandarin}
                    aria-label={`${t.listenMandarin} ${word.hanzi}`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Pinyin with Tone marks */}
          <div>
            {hideSub ? (
              <div
                onClick={() => setIsManuallyRevealed(true)}
                className="py-1 px-3 bg-black/20 border border-white/15 rounded-xl inline-block text-xs text-white/50 cursor-pointer"
              >
                {t.maskedPinyin}
              </div>
            ) : (
              <div className="text-lg font-mono font-bold text-cyan-200 tracking-widest flex items-center gap-2">
                <span>{word.pinyin}</span>
              </div>
            )}
          </div>

          {/* Translated Meaning */}
          <div className="pt-3 border-t border-white/15 flex items-center justify-between gap-3">
            <div className="flex-1">
              <span className="text-[11px] text-cyan-100/70 block font-medium">{t.meaningLabel}</span>
              {hideMeaning ? (
                <div
                  onClick={() => setIsManuallyRevealed(true)}
                  className="py-1 px-2.5 bg-black/20 border border-dashed border-white/20 rounded-xl text-xs text-cyan-300 hover:text-white transition cursor-pointer mt-0.5 inline-block"
                >
                  {t.maskedMeaning}
                </div>
              ) : (
                <p className="text-base sm:text-lg font-medium text-white italic mt-0.5 leading-snug">
                  "{translatedMeaning}"
                </p>
              )}
            </div>

            {/* Audio pronunciation button for Meaning */}
            <button
              id={`btn-speak-meaning-${word.id}`}
              onClick={playMeaningOnly}
              className="p-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/20 transition active:scale-95 cursor-pointer shadow-sm shrink-0"
              title={t.listenMeaning}
              aria-label={`${t.listenMeaning} ${translatedMeaning}`}
            >
              <Volume1 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Example Sentence Accordion */}
      {word.exampleHanzi && (
        <div className="mt-3.5 pt-3 border-t border-white/15">
          <button
            id={`btn-toggle-example-${word.id}`}
            onClick={() => setShowExample(!showExample)}
            className="w-full flex items-center justify-between text-xs text-cyan-100/80 hover:text-white transition py-1 cursor-pointer"
          >
            <span className="flex items-center gap-1.5 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              {t.exampleSentence}
            </span>
            {showExample ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showExample && (
            <div className="mt-2.5 p-3.5 rounded-2xl bg-black/30 backdrop-blur-md border border-white/15 text-xs space-y-1.5 animate-in fade-in duration-150 shadow-inner">
              <div className="text-sm font-semibold text-white font-['Noto_Sans_SC']">
                {word.exampleHanzi}
              </div>
              <div className="text-xs font-mono text-cyan-300">
                {word.examplePinyin}
              </div>
              <div className="text-xs text-white/80 italic">
                "{translatedExample}"
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

