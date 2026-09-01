import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  PlusCircle,
  Square,
  SkipBack,
  SkipForward,
  Gauge,
  Repeat,
  Timer,
  EyeOff,
  Eye,
  Shuffle,
  Infinity as InfinityIcon,
  Layers,
  Sparkles,
} from 'lucide-react';
import { PlaybackState, PlaybackHideMode, AudioSettings, AppLanguage } from '../types';
import { UI_TRANSLATIONS } from '../services/translationService';
import { getWordRepetitions, getTieredSummaryText } from '../services/repetitionHelper';

interface AudioPlayerBarProps {
  playbackState: PlaybackState;
  audioSettings: AudioSettings;
  hideMode: PlaybackHideMode;
  activeBatchWordCount: number;
  totalBatchBatchesCount: number;
  currentBatchIndex: number;
  appLanguage: AppLanguage;
  isRandomMode: boolean;
  isLoopMode: boolean;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReplayCurrentBatch: () => void;
  onAdvanceAdd5Cumulative: () => void;
  onToggleRandomMode: () => void;
  onToggleLoopMode: () => void;
  onPrevWord: () => void;
  onNextWord: () => void;
  onUpdateSpeedRate: (newSpeed: number) => void;
  onUpdateRepetitionCount: (count: number) => void;
  onUpdatePauseBetweenReps: (pauseMs: number) => void;
  onToggleHideMode: (mode: PlaybackHideMode) => void;
  onToggleTieredRepetition?: () => void;
  onUpdateTieredOlderReps?: (reps: number) => void;
  onUpdateTieredRecentCount?: (count: number) => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  playbackState,
  audioSettings,
  hideMode,
  activeBatchWordCount,
  currentBatchIndex,
  appLanguage,
  isRandomMode,
  isLoopMode,
  onPlay,
  onPause,
  onResume,
  onStop,
  onReplayCurrentBatch,
  onAdvanceAdd5Cumulative,
  onToggleRandomMode,
  onToggleLoopMode,
  onPrevWord,
  onNextWord,
  onUpdateSpeedRate,
  onUpdateRepetitionCount,
  onUpdatePauseBetweenReps,
  onToggleHideMode,
  onToggleTieredRepetition,
  onUpdateTieredOlderReps,
  onUpdateTieredRecentCount,
}) => {
  const t = UI_TRANSLATIONS[appLanguage] || UI_TRANSLATIONS.id;

  const isTieredEnabled = !!audioSettings.tieredRepetition?.enabled;
  const recentWordsCount = audioSettings.tieredRepetition?.recentWordsCount || 15;
  const olderWordsReps = audioSettings.tieredRepetition?.olderWordsReps ?? 1;

  // Repetisi aktual untuk kata yang sedang aktif dibaca
  const activeWordReps = playbackState.isPlaying
    ? getWordRepetitions(playbackState.currentWordIndex, activeBatchWordCount, audioSettings)
    : audioSettings.repetitionCount;

  const summaryText = getTieredSummaryText(activeBatchWordCount, audioSettings, {
    allWords: t.allWordsLabel || 'Semua Kata',
    olderWords: t.olderWordsLabel || 'Kata Lama',
    recentWords: t.recentWordsLabel || 'Kata Baru',
    skipped: t.skippedLabel || '0x (Lewati)',
  });

  return (
    <div className="relative w-full rounded-3xl bg-slate-900/90 backdrop-blur-2xl border border-white/20 shadow-2xl p-4 sm:p-5 text-white my-2 space-y-3.5">
      <div className="flex flex-col gap-3">
        
        {/* Top Control Sub-Bar: Live Speed, Pause Interval Slider, Repetition Counter, Tiered Toggle & Hide Words */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white/5 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/15 text-xs shadow-sm overflow-hidden">
          
          {/* Sliders Area (Kecepatan & Jeda Kata) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 w-full lg:w-auto">
            {/* Live Speed */}
            <div className="flex items-center justify-between gap-2 bg-black/20 sm:bg-transparent p-2 sm:p-0 rounded-xl">
              <div className="flex items-center gap-1.5 text-cyan-100 font-semibold min-w-0">
                <Gauge className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                <span className="truncate">{t.liveSpeed}</span>
                <span className="font-mono text-slate-950 bg-cyan-300 font-bold px-1.5 py-0.5 rounded-md shadow-sm shrink-0 text-[11px]">
                  {audioSettings.speedRate.toFixed(2)}x
                </span>
              </div>

              {/* Live Speed Slider */}
              <input
                id="slider-live-speed"
                type="range"
                min="0.4"
                max="1.4"
                step="0.05"
                value={audioSettings.speedRate}
                onChange={(e) => onUpdateSpeedRate(parseFloat(e.target.value))}
                className="w-24 sm:w-28 accent-cyan-400 cursor-pointer shrink-0"
                title="Speed Rate Slider"
              />
            </div>

            {/* Jarak Waktu Pengulangan Slider (Pause Interval Slider) */}
            <div className="flex items-center justify-between gap-2 bg-black/20 sm:bg-transparent p-2 sm:p-0 rounded-xl">
              <div className="flex items-center gap-1.5 text-cyan-100 font-semibold min-w-0">
                <Timer className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                <span className="truncate">{t.pauseIntervalLabel}</span>
                <span className="font-mono text-slate-950 bg-cyan-300 font-bold px-1.5 py-0.5 rounded-md shadow-sm shrink-0 text-[11px]">
                  {(audioSettings.pauseBetweenRepsMs / 1000).toFixed(1)}s
                </span>
              </div>

              {/* Interval Slider: 0.2s - 7.0s */}
              <input
                id="slider-pause-interval"
                type="range"
                min="200"
                max="7000"
                step="100"
                value={audioSettings.pauseBetweenRepsMs}
                onChange={(e) => onUpdatePauseBetweenReps(parseInt(e.target.value))}
                className="w-24 sm:w-28 accent-cyan-400 cursor-pointer shrink-0"
                title="Pause Interval Slider (0.2s - 7.0s)"
              />
            </div>
          </div>

          {/* Repetition Count & Mode Sembunyi Controls */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 w-full lg:w-auto border-t lg:border-t-0 pt-2.5 lg:pt-0 border-white/10">
            
            {/* Reps per Word Primary Counter & Tiered Toggle */}
            <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2 bg-black/20 sm:bg-transparent p-2 sm:p-0 rounded-xl">
              <div className="flex items-center gap-1.5 text-cyan-100 font-semibold shrink-0">
                <Repeat className="w-3.5 h-3.5 text-cyan-300" />
                <span className="text-xs">{t.repPerWord}</span>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                {[1, 2, 3, 5, 7, 10].map((count) => (
                  <button
                    key={count}
                    id={`btn-rep-count-${count}`}
                    onClick={() => onUpdateRepetitionCount(count)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer shrink-0 ${
                      audioSettings.repetitionCount === count
                        ? 'bg-cyan-400 text-slate-950 shadow-md ring-2 ring-cyan-300/30'
                        : 'bg-white/10 hover:bg-white/20 text-white/80 border border-white/15'
                    }`}
                    title={`${count}x`}
                  >
                    {count}x
                  </button>
                ))}
              </div>

              {/* Toggle Repetisi Berjenjang (ON / OFF) */}
              {onToggleTieredRepetition && (
                <button
                  id="btn-toggle-tiered-repetition"
                  onClick={onToggleTieredRepetition}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-bold transition cursor-pointer shadow-sm ml-auto sm:ml-0 ${
                    isTieredEnabled
                      ? 'bg-emerald-500/30 text-emerald-200 border-emerald-400/60 ring-2 ring-emerald-300/40'
                      : 'bg-white/10 hover:bg-white/20 text-white/70 border-white/20'
                  }`}
                  title={t.tieredRepsSectionSubtitle || 'Kurangi pengulangan kata lama agar hemat waktu'}
                >
                  <Layers className={`w-3.5 h-3.5 ${isTieredEnabled ? 'text-emerald-300' : 'text-white/60'}`} />
                  <span>{isTieredEnabled ? (t.tieredRepsOn || 'Berjenjang: ON') : (t.tieredRepsOff || 'Berjenjang: OFF')}</span>
                </button>
              )}
            </div>

            {/* Hide Words Mode */}
            <div className="flex items-center justify-between sm:justify-start gap-2 bg-black/20 sm:bg-transparent p-2 sm:p-0 rounded-xl sm:border-l sm:border-white/10 sm:pl-3">
              <span className="text-cyan-100/70 text-xs shrink-0">{t.hideModeLabel}</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  id="btn-hide-mode-all"
                  onClick={() => onToggleHideMode(hideMode === 'all' ? 'none' : 'all')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-xs font-semibold transition cursor-pointer backdrop-blur-md ${
                    hideMode === 'all'
                      ? 'bg-amber-400/30 text-amber-200 border-amber-300/60 shadow-sm'
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                  }`}
                  title={t.hideAll}
                >
                  {hideMode === 'all' ? <EyeOff className="w-3.5 h-3.5 text-amber-300" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{t.hideAll}</span>
                </button>

                <button
                  id="btn-hide-mode-meaning"
                  onClick={() => onToggleHideMode(hideMode === 'meaning_only' ? 'none' : 'meaning_only')}
                  className={`px-2.5 py-1 rounded-xl border text-xs transition cursor-pointer backdrop-blur-md ${
                    hideMode === 'meaning_only'
                      ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400/60 font-semibold'
                      : 'bg-white/10 hover:bg-white/20 text-white/80 border-white/15'
                  }`}
                  title={t.hideMeaning}
                >
                  {t.hideMeaning}
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Quick Tiered Repetition Sub-Bar (Muncul saat Berjenjang ON) */}
        {isTieredEnabled && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs shadow-inner animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 font-bold text-emerald-300">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.tieredRepsSectionTitle || 'Pengulangan Berjenjang'}:</span>
              </span>

              {/* Repetisi Kata Lama */}
              <div className="flex items-center gap-1.5 sm:pl-2 sm:border-l sm:border-emerald-500/30 flex-wrap">
                <span className="text-emerald-100/80 font-medium shrink-0">Kata Lama:</span>
                <div className="flex items-center gap-1 flex-wrap">
                  {[
                    { label: '0x (Skip)', val: 0 },
                    { label: '1x', val: 1 },
                    { label: '2x', val: 2 },
                    { label: '3x', val: 3 },
                    { label: '5x', val: 5 },
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => onUpdateTieredOlderReps?.(item.val)}
                      className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                        olderWordsReps === item.val
                          ? 'bg-emerald-400 text-slate-950 shadow-sm ring-1 ring-emerald-200'
                          : 'bg-emerald-900/40 hover:bg-emerald-900/70 text-emerald-200 border border-emerald-500/20'
                      }`}
                      title={item.val === 0 ? 'Lewati kata lama (tidak dibaca)' : `Baca ${item.val}x untuk kata lama`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Batas Kata Baru untuk Pengulangan dari Kata yang Terakhir */}
              <div className="flex items-center gap-1.5 sm:pl-2 sm:border-l sm:border-emerald-500/30 flex-wrap">
                <span className="text-emerald-100/80 font-medium shrink-0">
                  {t.tieredRecentWordsBarLabel || 'Batas kata baru:'}
                </span>
                <div className="flex items-center gap-1 flex-wrap">
                  {[5, 10, 15, 20, 25].map((cnt) => (
                    <button
                      key={cnt}
                      onClick={() => onUpdateTieredRecentCount?.(cnt)}
                      className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                        recentWordsCount === cnt
                          ? 'bg-cyan-400 text-slate-950 shadow-sm ring-1 ring-cyan-200'
                          : 'bg-emerald-900/40 hover:bg-emerald-900/70 text-cyan-200 border border-emerald-500/20'
                      }`}
                      title={`${cnt} kata terakhir dibaca ${audioSettings.repetitionCount}x`}
                    >
                      {cnt} kata
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Ringkasan Status Sesi Aktif */}
            <div className="font-mono text-[11px] text-emerald-200/90 bg-black/40 px-2.5 py-1 rounded-xl border border-emerald-400/20 self-start md:self-auto">
              {summaryText}
            </div>
          </div>
        )}

        {/* Main Audio Controls, Repetition Step Bubbles & Cumulative Flow */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Left: Active Batch State & Repetition Step Badges */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
            <div className="flex items-center gap-2">
              <div className="px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-xs shadow-sm">
                <span className="text-cyan-100/70 block text-[10px] uppercase font-bold tracking-wider">{t.batchBannerTitle}:</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-black text-cyan-300 font-mono text-base">
                    {activeBatchWordCount} {t.wordsUnit}
                  </span>
                  <span className="text-white/60 text-[10px]">
                    ({t.batchNum} #{currentBatchIndex + 1})
                  </span>
                  {isRandomMode && (
                    <span className="px-1.5 py-0.2 rounded-md bg-purple-500/30 text-purple-200 text-[10px] font-bold border border-purple-400/40">
                      Acak
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Repetition Visual Steps */}
            {playbackState.isPlaying && (
              <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/15">
                <span className="text-[11px] text-cyan-100/80 mr-1 font-semibold hidden sm:inline">
                  {t.repPerWord}
                </span>
                {Array.from({ length: Math.max(1, activeWordReps) }).map((_, idx) => {
                  const stepNum = idx + 1;
                  const isCurrent = stepNum === playbackState.currentRepetition;
                  const isPast = stepNum < playbackState.currentRepetition;
                  return (
                    <div
                      key={stepNum}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black font-mono transition-all duration-300 ${
                        isCurrent
                          ? 'bg-cyan-400 text-slate-950 scale-110 shadow-lg shadow-cyan-400/40 ring-2 ring-cyan-200'
                          : isPast
                          ? 'bg-emerald-400/40 text-emerald-200'
                          : 'bg-white/10 text-white/40'
                      }`}
                    >
                      {stepNum}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Center: Main Playback Controls (Play / Pause / Stop / Prev / Next) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Prev Word */}
            <button
              id="btn-prev-word"
              onClick={onPrevWord}
              disabled={!playbackState.isPlaying || playbackState.currentWordIndex <= 0}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white border border-white/20 backdrop-blur-md transition active:scale-95 cursor-pointer shadow-sm"
              title={t.prevWordTooltip}
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Play / Pause / Resume Primary Button */}
            {!playbackState.isPlaying ? (
              <button
                id="btn-main-play"
                onClick={onPlay}
                className="flex items-center gap-2.5 px-7 sm:px-9 py-3.5 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-sm sm:text-base border-[3pt] border-red-600 shadow-[0_0_22px_rgba(249,115,22,0.9),0_0_40px_rgba(234,88,12,0.65)] hover:shadow-[0_0_30px_rgba(249,115,22,1),0_0_55px_rgba(234,88,12,0.85)] transition-all duration-200 active:scale-95 cursor-pointer ring-2 ring-orange-400/50"
              >
                <Play className="w-5 h-5 fill-slate-950 text-slate-950" />
                <span>{t.startListening}</span>
              </button>
            ) : playbackState.isPaused ? (
              <button
                id="btn-main-resume"
                onClick={onResume}
                className="flex items-center gap-2 px-7 sm:px-9 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm sm:text-base shadow-xl shadow-emerald-950/50 transition-all active:scale-95 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>{t.resumeAudio}</span>
              </button>
            ) : (
              <button
                id="btn-main-pause"
                onClick={onPause}
                className="flex items-center gap-2 px-7 sm:px-9 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm sm:text-base shadow-xl shadow-amber-950/50 transition-all active:scale-95 cursor-pointer"
              >
                <Pause className="w-5 h-5 fill-slate-950" />
                <span>{t.pauseAudio}</span>
              </button>
            )}

            {/* Stop Button */}
            {playbackState.isPlaying && (
              <button
                id="btn-main-stop"
                onClick={onStop}
                className="p-3 rounded-2xl bg-rose-500/30 hover:bg-rose-500/50 text-rose-200 border border-rose-400/40 backdrop-blur-md transition active:scale-95 cursor-pointer shadow-sm"
                title={t.stopAudioTooltip}
              >
                <Square className="w-4 h-4 fill-rose-300" />
              </button>
            )}

            {/* Next Word */}
            <button
              id="btn-next-word"
              onClick={onNextWord}
              disabled={!playbackState.isPlaying || playbackState.currentWordIndex >= activeBatchWordCount - 1}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white border border-white/20 backdrop-blur-md transition active:scale-95 cursor-pointer shadow-sm"
              title={t.nextWordTooltip}
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Right: Loop, Replay, Advance, & Random Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-center sm:justify-end">
            
            {/* Tombol Loop (ON / OFF) */}
            <button
              id="btn-toggle-loop-mode"
              onClick={onToggleLoopMode}
              className={`flex items-center justify-center gap-1.5 px-3.5 py-3 rounded-2xl border backdrop-blur-md transition active:scale-95 text-xs font-bold shadow-sm cursor-pointer ${
                isLoopMode
                  ? 'bg-emerald-500/30 text-emerald-200 border-emerald-400/60 shadow-emerald-950/40 ring-2 ring-emerald-300/40'
                  : 'bg-white/10 hover:bg-white/20 text-white/80 border-white/20'
              }`}
              title={t.loopModeTooltip}
            >
              <InfinityIcon className={`w-3.5 h-3.5 ${isLoopMode ? 'text-emerald-300' : 'text-white/60'}`} />
              <span>{isLoopMode ? t.loopModeOn : t.loopModeOff}</span>
            </button>

            {/* Tombol Reset (Mereset Sesi Aktif kembali ke 5 kata awal) */}
            <button
              id="btn-reset-batch"
              onClick={onReplayCurrentBatch}
              className="flex items-center justify-center gap-1.5 px-3.5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition active:scale-95 text-xs font-bold shadow-sm cursor-pointer"
              title={t.resetLevelTooltip || 'Reset sesi aktif kembali ke 5 kosakata awal'}
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-300" />
              <span>{t.repeatBatchBtn}</span>
            </button>

            {/* Tombol Lanjut (+5 Kata) */}
            <button
              id="btn-advance-add-5"
              onClick={onAdvanceAdd5Cumulative}
              className="flex items-center justify-center gap-1.5 px-4 sm:px-5 py-3 rounded-2xl bg-indigo-500/60 hover:bg-indigo-400/70 text-white border border-white/25 backdrop-blur-md transition active:scale-95 text-xs font-bold shadow-lg shadow-indigo-950/40 cursor-pointer"
              title={t.next5WordsBtn}
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.next5WordsBtn}</span>
            </button>

            {/* Tombol Acak (Random) ON-OFF */}
            <button
              id="btn-toggle-random-mode"
              onClick={onToggleRandomMode}
              className={`flex items-center justify-center gap-1.5 px-3.5 py-3 rounded-2xl border backdrop-blur-md transition active:scale-95 text-xs font-bold shadow-sm cursor-pointer ${
                isRandomMode
                  ? 'bg-purple-500/35 text-purple-200 border-purple-400/60 shadow-purple-950/50 ring-2 ring-purple-300/40'
                  : 'bg-white/10 hover:bg-white/20 text-white/80 border-white/20'
              }`}
              title={t.randomModeTooltip}
            >
              <Shuffle className={`w-3.5 h-3.5 ${isRandomMode ? 'text-purple-300' : 'text-white/60'}`} />
              <span>{isRandomMode ? t.randomModeOn : t.randomModeOff}</span>
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};
