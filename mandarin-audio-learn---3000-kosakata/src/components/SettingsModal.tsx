import React, { useEffect, useState } from 'react';
import { X, Volume2, Settings, Sliders, Globe, Layers, Plus, Trash2, Sparkles, Check, Info, Smartphone, CheckCircle2, DownloadCloud, Database, RefreshCw } from 'lucide-react';
import { AudioSettings, AppLanguage, TieredRepetitionRule, TieredRepetitionSettings, MandarinWord } from '../types';
import { speechService, unlockAudioForAndroidWebView } from '../services/speechService';
import { audioCacheService } from '../services/audioCacheService';
import { UI_TRANSLATIONS } from '../services/translationService';
import { DEFAULT_TIERED_SETTINGS, getWordRepetitions } from '../services/repetitionHelper';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AudioSettings;
  appLanguage: AppLanguage;
  activeWords?: MandarinWord[];
  onSelectLanguage: (lang: AppLanguage) => void;
  onSaveSettings: (newSettings: AudioSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  appLanguage,
  activeWords = [],
  onSelectLanguage,
  onSaveSettings,
}) => {
  const [localSettings, setLocalSettings] = useState<AudioSettings>(() => ({
    ...settings,
    tieredRepetition: {
      ...DEFAULT_TIERED_SETTINGS,
      ...(settings.tieredRepetition || {}),
    },
  }));
  const [mandarinVoices, setMandarinVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [meaningVoices, setMeaningVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [cachedAudioCount, setCachedAudioCount] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });

  const t = UI_TRANSLATIONS[appLanguage] || UI_TRANSLATIONS.id;

  const refreshCacheCount = async () => {
    try {
      const count = await audioCacheService.getCachedCount();
      setCachedAudioCount(count);
    } catch {}
  };

  useEffect(() => {
    setLocalSettings({
      ...settings,
      tieredRepetition: {
        ...DEFAULT_TIERED_SETTINGS,
        ...(settings.tieredRepetition || {}),
      },
    });
  }, [settings]);

  useEffect(() => {
    if (isOpen) {
      const zh = speechService.getMandarinVoices();
      const meaningV = speechService.getMeaningVoices(appLanguage);
      setMandarinVoices(zh);
      setMeaningVoices(meaningV);
      refreshCacheCount();
    }
  }, [isOpen, appLanguage]);

  const handleDownloadActiveCategoryAudio = async () => {
    if (activeWords.length === 0 || isDownloading) return;
    setIsDownloading(true);
    const total = activeWords.length * 2; // Mandarin + Translation
    setDownloadProgress({ current: 0, total });

    let current = 0;
    for (const w of activeWords) {
      try {
        // 1. Mandarin
        await audioCacheService.fetchAndCacheAudio(w.hanzi, 'zh-CN');
        current++;
        setDownloadProgress({ current, total });

        // 2. Translation
        const targetLangCode = appLanguage === 'en' ? 'en-US' : appLanguage === 'ms' ? 'ms-MY' : 'id-ID';
        const cleanMeaning = (w.indonesian || '').replace(/\//g, ' atau ').replace(/[()]/g, '');
        if (cleanMeaning) {
          await audioCacheService.fetchAndCacheAudio(cleanMeaning, targetLangCode);
        }
        current++;
        setDownloadProgress({ current, total });
      } catch (e) {
        console.warn('Preload item error:', e);
      }
    }

    setIsDownloading(false);
    await refreshCacheCount();
    setTestFeedback(`✅ Sukses menyimpan ${activeWords.length} kata offline!`);
    setTimeout(() => setTestFeedback(null), 3500);
  };

  const handleClearAudioCache = async () => {
    if (window.confirm('Hapus seluruh file cache suara offline dari memori HP?')) {
      await audioCacheService.clearCache();
      await refreshCacheCount();
      setTestFeedback('Cache suara berhasil dibersihkan.');
      setTimeout(() => setTestFeedback(null), 2500);
    }
  };

  if (!isOpen) return null;

  const tiered: TieredRepetitionSettings = localSettings.tieredRepetition || DEFAULT_TIERED_SETTINGS;

  const updateTiered = (partial: Partial<TieredRepetitionSettings>) => {
    setLocalSettings((prev) => ({
      ...prev,
      tieredRepetition: {
        ...DEFAULT_TIERED_SETTINGS,
        ...(prev.tieredRepetition || {}),
        ...partial,
      },
    }));
  };

  const handleAddCustomRange = () => {
    const currentRanges = tiered.customRanges || [];
    const lastRange = currentRanges[currentRanges.length - 1];
    const newStart = lastRange ? lastRange.toWord + 1 : 1;
    const newEnd = newStart + 4;
    const newRule: TieredRepetitionRule = {
      id: 'rule_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      fromWord: newStart,
      toWord: newEnd,
      reps: localSettings.repetitionCount,
    };
    updateTiered({ customRanges: [...currentRanges, newRule] });
  };

  const handleUpdateCustomRange = (idx: number, patch: Partial<TieredRepetitionRule>) => {
    const currentRanges = [...(tiered.customRanges || [])];
    if (currentRanges[idx]) {
      currentRanges[idx] = { ...currentRanges[idx], ...patch };
      updateTiered({ customRanges: currentRanges });
    }
  };

  const handleRemoveCustomRange = (idx: number) => {
    const currentRanges = (tiered.customRanges || []).filter((_, i) => i !== idx);
    updateTiered({ customRanges: currentRanges });
  };

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  const [testFeedback, setTestFeedback] = useState<string | null>(null);

  const testAudio = async () => {
    unlockAudioForAndroidWebView();
    setTestFeedback('Memutar audio...');
    try {
      await speechService.speakSingleWord(
        {
          id: 1,
          hanzi: '你好',
          pinyin: 'nǐ hǎo',
          indonesian: 'Halo / Apa kabar',
          category: 'Salam',
          hsk: 'HSK 1',
          tone: 3,
        },
        localSettings.speedRate,
        localSettings.mandarinVoiceURI
      );
      setTestFeedback('✅ Audio Aktif & Berfungsi!');
      setTimeout(() => setTestFeedback(null), 3000);
    } catch (e) {
      setTestFeedback('Audio sedang dipersiapkan...');
      setTimeout(() => setTestFeedback(null), 2500);
    }
  };

  const languages: { code: AppLanguage; label: string; flag: string }[] = [
    { code: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'ms', label: 'Bahasa Melayu', flag: '🇲🇾' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900/95 border border-white/20 rounded-3xl max-w-xl w-full flex flex-col shadow-2xl backdrop-blur-2xl overflow-hidden text-white max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-white/15 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-400/20 border border-cyan-300/40 flex items-center justify-center text-cyan-300">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {t.settingsTitle}
              </h3>
              <p className="text-xs text-cyan-100/70">
                {t.settingsSubtitle}
              </p>
            </div>
          </div>
          <button
            id="btn-close-settings"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer border border-white/15"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          
          {/* App Language Selector */}
          <div>
            <label className="block text-xs font-semibold text-cyan-100 mb-2 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-cyan-300" />
              {t.langSelector} (UI & Terjemahan):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {languages.map((l) => {
                const isSelected = appLanguage === l.code;
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => onSelectLanguage(l.code)}
                    className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-400 text-slate-950 border-cyan-300 shadow-md ring-2 ring-cyan-300/30'
                        : 'bg-white/10 hover:bg-white/20 text-white/90 border-white/15'
                    }`}
                  >
                    <span className="text-lg">{l.flag}</span>
                    <span className="truncate text-[11px]">{l.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ============================================================== */}
          {/* FITUR PENGULANGAN BERJENJANG (TIERED REPETITION) */}
          {/* ============================================================== */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-emerald-500/30 space-y-4 shadow-inner">
            
            {/* Header & Main Toggle Switch */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-200 flex items-center gap-1.5">
                    {t.tieredRepsSectionTitle}
                    <span className="text-[10px] uppercase px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-mono">
                      Smart Audio
                    </span>
                  </h4>
                  <p className="text-xs text-emerald-100/70">
                    {t.tieredRepsSectionSubtitle}
                  </p>
                </div>
              </div>

              {/* Toggle Switch ON/OFF */}
              <button
                id="toggle-tiered-repetition-modal"
                type="button"
                onClick={() => updateTiered({ enabled: !tiered.enabled })}
                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  tiered.enabled ? 'bg-emerald-500 shadow-lg shadow-emerald-950/50' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    tiered.enabled ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Sub-Panel saat Berjenjang Aktif */}
            {tiered.enabled && (
              <div className="space-y-4 pt-3 border-t border-emerald-500/20 animate-in fade-in duration-200">
                
                {/* Mode Selector: Sliding Window (Otomatis) vs Rentang Kustom */}
                <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
                  <button
                    type="button"
                    onClick={() => updateTiered({ mode: 'sliding_window' })}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                      tiered.mode === 'sliding_window'
                        ? 'bg-emerald-400 text-slate-950 shadow-sm'
                        : 'text-emerald-100/70 hover:text-white'
                    }`}
                  >
                    {t.slidingWindowMode}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateTiered({ mode: 'custom_ranges' })}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                      tiered.mode === 'custom_ranges'
                        ? 'bg-emerald-400 text-slate-950 shadow-sm'
                        : 'text-emerald-100/70 hover:text-white'
                    }`}
                  >
                    {t.customRangesMode}
                  </button>
                </div>

                {/* Kontrol Mode: Sliding Window */}
                {tiered.mode === 'sliding_window' && (
                  <div className="space-y-3.5 bg-black/30 p-3.5 rounded-xl border border-white/10">
                    
                    {/* Repetisi Kata Lama */}
                    <div>
                      <div className="flex justify-between items-center mb-1 text-xs">
                        <label className="font-semibold text-emerald-100 flex items-center gap-1.5">
                          {t.olderWordsRepsLabel}
                        </label>
                        <span className="font-mono text-emerald-300 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                          {tiered.olderWordsReps === 0 ? '0x (Skip/Lewati)' : `${tiered.olderWordsReps}x`}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-100/60 mb-2">
                        {t.olderWordsRepsDesc}
                      </p>
                      <div className="grid grid-cols-5 gap-1.5">
                        {[
                          { label: '0x (Skip)', val: 0 },
                          { label: '1x', val: 1 },
                          { label: '2x', val: 2 },
                          { label: '3x', val: 3 },
                          { label: '5x', val: 5 },
                        ].map((item) => (
                          <button
                            key={item.val}
                            type="button"
                            onClick={() => updateTiered({ olderWordsReps: item.val })}
                            className={`py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer border text-center ${
                              tiered.olderWordsReps === item.val
                                ? 'bg-emerald-400 text-slate-950 border-emerald-300 shadow-sm'
                                : 'bg-white/10 hover:bg-white/20 text-white/80 border-white/15'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Batas Kata Baru untuk Pengulangan dari Kata yang Terakhir */}
                    <div className="border-t border-white/10 pt-3">
                      <div className="flex justify-between items-center mb-1 text-xs">
                        <label className="font-semibold text-emerald-100">
                          {t.tieredRecentWordsLabel || 'Batas kata baru untuk pengulangan dari kata yang terakhir:'}
                        </label>
                        <span className="font-mono text-cyan-300 font-bold bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-500/30">
                          {tiered.recentWordsCount} {t.wordsUnit}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-100/60 mb-2">
                        {t.tieredRecentWordsDesc || 'Jumlah kata urutan terakhir yang akan dibaca dengan pengulangan penuh'} ({localSettings.repetitionCount}x)
                      </p>
                      <div className="grid grid-cols-5 gap-1.5">
                        {[5, 10, 15, 20, 25].map((cnt) => (
                          <button
                            key={cnt}
                            type="button"
                            onClick={() => updateTiered({ recentWordsCount: cnt })}
                            className={`py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer border text-center ${
                              tiered.recentWordsCount === cnt
                                ? 'bg-cyan-400 text-slate-950 border-cyan-300 shadow-sm'
                                : 'bg-white/10 hover:bg-white/20 text-white/80 border-white/15'
                            }`}
                          >
                            {cnt} {t.wordsUnit}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* Kontrol Mode: Rentang Kustom (Custom Ranges) */}
                {tiered.mode === 'custom_ranges' && (
                  <div className="space-y-3 bg-black/30 p-3.5 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-200">
                        {t.customRangesTitle || 'Daftar Rentang Kosakata:'}
                      </span>
                      <button
                        type="button"
                        onClick={handleAddCustomRange}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t.addRangeBtn}</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(tiered.customRanges || []).map((rule, idx) => (
                        <div
                          key={rule.id || idx}
                          className="flex items-center gap-2 bg-white/5 p-2.5 rounded-xl border border-white/10 text-xs flex-wrap sm:flex-nowrap"
                        >
                          <span className="text-white/60 font-mono text-[11px] w-6">{idx + 1}.</span>
                          <div className="flex items-center gap-1 flex-1">
                            <span className="text-white/70 text-[11px]">{t.rangeFromWord}</span>
                            <input
                              type="number"
                              min="1"
                              value={rule.fromWord}
                              onChange={(e) =>
                                handleUpdateCustomRange(idx, {
                                  fromWord: parseInt(e.target.value) || 1,
                                })
                              }
                              className="w-14 p-1 rounded-lg bg-black/40 border border-white/20 text-center font-mono font-bold text-cyan-300"
                            />
                            <span className="text-white/70 text-[11px]">{t.rangeToWord}</span>
                            <input
                              type="number"
                              min="1"
                              value={rule.toWord}
                              onChange={(e) =>
                                handleUpdateCustomRange(idx, {
                                  toWord: parseInt(e.target.value) || 1,
                                })
                              }
                              className="w-14 p-1 rounded-lg bg-black/40 border border-white/20 text-center font-mono font-bold text-cyan-300"
                            />
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-white/70 text-[11px]">{t.rangeRepsCount}</span>
                            <select
                              value={rule.reps}
                              onChange={(e) =>
                                handleUpdateCustomRange(idx, {
                                  reps: parseInt(e.target.value),
                                })
                              }
                              className="p-1 rounded-lg bg-black/40 border border-white/20 text-xs font-mono font-bold text-emerald-300"
                            >
                              <option value="0">0x (Skip)</option>
                              <option value="1">1x</option>
                              <option value="2">2x</option>
                              <option value="3">3x</option>
                              <option value="5">5x</option>
                              <option value="7">7x</option>
                              <option value="10">10x</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomRange(idx)}
                              className="p-1 text-rose-300 hover:text-rose-200 hover:bg-rose-500/20 rounded-lg transition cursor-pointer"
                              title={t.deleteRangeTooltip}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Simulasi Interaktif 20 Kata */}
                <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-emerald-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      {t.previewSimulationTitle}
                    </span>
                    <span className="text-white/60">
                      Total 20 kata
                    </span>
                  </div>

                  {/* Visual Simulation Grid */}
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-1 text-center font-mono text-[10px]">
                    {Array.from({ length: 20 }).map((_, i) => {
                      const wordNum = i + 1;
                      const reps = getWordRepetitions(i, 20, localSettings);
                      const isZero = reps === 0;
                      const isFull = reps === localSettings.repetitionCount;
                      return (
                        <div
                          key={wordNum}
                          className={`p-1 rounded-lg border flex flex-col items-center justify-center ${
                            isZero
                              ? 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                              : isFull
                              ? 'bg-cyan-950/60 border-cyan-400/50 text-cyan-200'
                              : 'bg-emerald-950/50 border-emerald-400/40 text-emerald-200'
                          }`}
                          title={`Kata #${wordNum} dibaca ${reps}x`}
                        >
                          <span className="text-[9px] text-white/50">#{wordNum}</span>
                          <span className="font-bold">{reps}x</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Repetition Count (Default Global / New Words) */}
          <div>
            <div className="flex justify-between items-center mb-1.5 text-xs">
              <label className="font-semibold text-cyan-100">
                {t.repCountSetting} {tiered.enabled ? `(${t.recentWordsLabel || 'Kata Baru'})` : ''}
              </label>
              <span className="font-mono text-cyan-300 font-bold bg-white/10 px-2 py-0.5 rounded-lg border border-white/15">
                {localSettings.repetitionCount}x {t.repUnit}
              </span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {[1, 2, 3, 5, 7, 10].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() =>
                    setLocalSettings({ ...localSettings, repetitionCount: count })
                  }
                  className={`py-2 rounded-2xl border text-xs font-bold transition cursor-pointer ${
                    localSettings.repetitionCount === count
                      ? 'bg-cyan-400 text-slate-950 border-cyan-300 shadow-md'
                      : 'bg-white/10 hover:bg-white/20 text-white/90 border-white/15'
                  }`}
                >
                  {count}x
                </button>
              ))}
            </div>
          </div>

          {/* Speed Rate */}
          <div>
            <div className="flex justify-between items-center mb-1.5 text-xs">
              <label className="font-semibold text-cyan-100">
                {t.speedSetting}
              </label>
              <span className="font-mono text-cyan-300 font-bold bg-white/10 px-2 py-0.5 rounded-lg border border-white/15">
                {localSettings.speedRate}x {localSettings.speedRate <= 0.75 ? '(Pelan)' : '(Normal)'}
              </span>
            </div>
            <input
              id="input-setting-speed-rate"
              type="range"
              min="0.4"
              max="1.4"
              step="0.05"
              value={localSettings.speedRate}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  speedRate: parseFloat(e.target.value),
                })
              }
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-cyan-100/60 font-mono mt-1">
              <span>0.4x ({t.slow})</span>
              <span>0.75x ({t.recommended})</span>
              <span>1.0x ({t.normal})</span>
              <span>1.4x ({t.fast})</span>
            </div>
          </div>

          {/* Pengaturan Jeda Audio */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/15 space-y-4">
            
            {/* Jeda Antar Pengulangan Kata (Slider) */}
            <div>
              <div className="flex justify-between items-center mb-1.5 text-xs">
                <label className="font-semibold text-cyan-100 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-cyan-300" />
                  {t.pauseBetweenRepsSetting}
                </label>
                <span className="font-mono text-cyan-300 font-bold bg-black/40 px-2 py-0.5 rounded-lg border border-white/15 text-xs">
                  {localSettings.pauseBetweenRepsMs} ms
                </span>
              </div>
              <input
                id="input-setting-pause-reps"
                type="range"
                min="200"
                max="7000"
                step="100"
                value={localSettings.pauseBetweenRepsMs}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    pauseBetweenRepsMs: parseInt(e.target.value),
                  })
                }
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="grid grid-cols-4 gap-1.5 mt-2">
                {[
                  { label: '0.4s', val: 400 },
                  { label: '0.7s (Standar)', val: 700 },
                  { label: '1.2s', val: 1200 },
                  { label: '2.0s', val: 2000 },
                ].map((p) => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() =>
                      setLocalSettings({
                        ...localSettings,
                        pauseBetweenRepsMs: p.val,
                      })
                    }
                    className={`py-1 rounded-xl text-[10px] font-mono transition cursor-pointer border text-center ${
                      Math.abs(localSettings.pauseBetweenRepsMs - p.val) < 80
                        ? 'bg-cyan-400 text-slate-950 font-bold border-cyan-300 shadow-sm'
                        : 'bg-white/10 hover:bg-white/20 text-white/80 border-white/15'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Jeda Antar Kata Baru (Slider) */}
            <div className="border-t border-white/10 pt-3">
              <div className="flex justify-between items-center mb-1.5 text-xs">
                <label className="font-semibold text-cyan-100 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-cyan-300" />
                  {t.pauseBetweenWordsSetting}
                </label>
                <span className="font-mono text-slate-950 bg-cyan-300 font-black text-xs px-2.5 py-0.5 rounded-lg shadow-sm">
                  {(localSettings.pauseBetweenWordsMs / 1000).toFixed(1)} {t.pauseUnitSec}
                </span>
              </div>
              <input
                id="input-setting-pause-words"
                type="range"
                min="400"
                max="5000"
                step="200"
                value={localSettings.pauseBetweenWordsMs}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    pauseBetweenWordsMs: parseInt(e.target.value),
                  })
                }
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex items-center justify-between gap-1.5 mt-2">
                {[
                  { label: '0.8s', val: 800 },
                  { label: '1.2s (Standar)', val: 1200 },
                  { label: '2.0s', val: 2000 },
                  { label: '3.0s', val: 3000 },
                ].map((p) => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() =>
                      setLocalSettings({
                        ...localSettings,
                        pauseBetweenWordsMs: p.val,
                      })
                    }
                    className={`flex-1 py-1 rounded-xl text-[10px] font-mono transition cursor-pointer border ${
                      Math.abs(localSettings.pauseBetweenWordsMs - p.val) < 100
                        ? 'bg-cyan-400 text-slate-950 font-bold border-cyan-300 shadow-sm'
                        : 'bg-white/10 hover:bg-white/20 text-white/80 border-white/15'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Play Order */}
          <div>
            <label className="block text-xs font-semibold text-cyan-100 mb-1.5">
              {t.playOrderSetting}
            </label>
            <select
              id="select-play-order"
              value={localSettings.playOrder}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  playOrder: e.target.value as any,
                })
              }
              className="w-full p-3 rounded-2xl bg-black/30 border border-white/20 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="mandarin_then_indo" className="bg-slate-900 text-white">
                {t.orderMandarinThenMeaning}
              </option>
              <option value="indo_then_mandarin" className="bg-slate-900 text-white">
                {t.orderMeaningThenMandarin}
              </option>
              <option value="mandarin_only" className="bg-slate-900 text-white">
                {t.orderMandarinOnly}
              </option>
            </select>
          </div>

          {/* Mandarin Voice Selector */}
          <div>
            <label className="block text-xs font-semibold text-cyan-100 mb-1.5">
              {t.mandarinVoice}
            </label>
            <select
              id="select-mandarin-voice"
              value={localSettings.mandarinVoiceURI || ''}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, mandarinVoiceURI: e.target.value })
              }
              className="w-full p-3 rounded-2xl bg-black/30 border border-white/20 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="" className="bg-slate-900 text-white">Otomatis / Bawaan Browser (zh-CN)</option>
              {mandarinVoices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI} className="bg-slate-900 text-white">
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Translation Voice Selector */}
          <div>
            <label className="block text-xs font-semibold text-cyan-100 mb-1.5">
              {t.meaningVoice}
            </label>
            <select
              id="select-meaning-voice"
              value={localSettings.meaningVoiceURI || localSettings.indonesianVoiceURI || ''}
              onChange={(e) =>
                setLocalSettings({
                  ...localSettings,
                  meaningVoiceURI: e.target.value,
                  indonesianVoiceURI: e.target.value,
                })
              }
              className="w-full p-3 rounded-2xl bg-black/30 border border-white/20 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="" className="bg-slate-900 text-white">Otomatis / Bawaan Browser</option>
              {meaningVoices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI} className="bg-slate-900 text-white">
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Audio Offline Cache & APK Support Manager */}
          <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-400/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                <Database className="w-4 h-4 text-cyan-400" />
                <span>Penyimpanan Audio Offline (Memori HP)</span>
              </div>
              <span className="text-[11px] font-mono bg-cyan-400/20 text-cyan-200 px-2 py-0.5 rounded-lg border border-cyan-400/30">
                {cachedAudioCount} File Tersimpan
              </span>
            </div>

            <p className="text-[11px] text-cyan-100/70 leading-relaxed">
              Suara yang telah diunduh akan tersimpan permanen di memori HP Anda via <strong>IndexedDB Cache</strong>. Anda bisa memutarnya <strong>100% Offline</strong> di Median APK tanpa kuota dan tanpa download ulang.
            </p>

            {isDownloading ? (
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/80 border border-cyan-400/30">
                <div className="flex justify-between text-[11px] text-cyan-200">
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    Sedang mengunduh audio kata ke memori HP...
                  </span>
                  <span className="font-mono font-bold">
                    {downloadProgress.current} / {downloadProgress.total}
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-cyan-400 h-full rounded-full transition-all duration-200"
                    style={{
                      width: `${downloadProgress.total > 0 ? (downloadProgress.current / downloadProgress.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                {activeWords.length > 0 && (
                  <button
                    type="button"
                    onClick={handleDownloadActiveCategoryAudio}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-black transition cursor-pointer shadow-md active:scale-98"
                  >
                    <DownloadCloud className="w-4 h-4" />
                    <span>Unduh Audio Kategori Aktif ({activeWords.length} kata)</span>
                  </button>
                )}

                {cachedAudioCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAudioCache}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-400/30 text-xs font-bold transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Cache</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Test Audio Button & Offline / APK Helper */}
          <div className="pt-2 space-y-2">
            <button
              id="btn-test-audio-settings"
              onClick={testAudio}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-200 border border-cyan-400/40 text-xs font-bold transition cursor-pointer backdrop-blur-md active:scale-98"
            >
              <Volume2 className="w-4 h-4 text-cyan-300" />
              <span>{t.testVoice} ("Nǐ hǎo") & Aktifkan Suara</span>
            </button>

            {testFeedback && (
              <div className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs text-center font-medium animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{testFeedback}</span>
              </div>
            )}

            <div className="p-3 rounded-2xl bg-slate-950/40 border border-white/10 text-[11px] text-white/70 space-y-1">
              <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Tips Mode Offline & Aplikasi APK (Median)</span>
              </div>
              <p className="leading-relaxed">
                Aplikasi telah dilengkapi <strong>Dual-Engine Audio (HTML5 Audio + IndexedDB)</strong> sehingga suara otomatis berjalan lancar di APK Median tanpa kendala WebView.
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/15 bg-white/5 flex items-center justify-end gap-3">
          <button
            id="btn-cancel-settings"
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer border border-white/15"
          >
            {t.close}
          </button>
          <button
            id="btn-save-settings"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs shadow-lg shadow-cyan-950/40 transition cursor-pointer"
          >
            {t.saveSettings}
          </button>
        </div>

      </div>
    </div>
  );
};

