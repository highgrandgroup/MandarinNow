import React from 'react';
import { Volume2, BookOpen, Music, Settings, HelpCircle, Sparkles, CheckCircle2, Bookmark, RotateCcw, Globe, ArrowLeftRight } from 'lucide-react';
import { HSKLevel, AppLanguage, StudyDirection } from '../types';
import { UI_TRANSLATIONS } from '../services/translationService';

interface HeaderProps {
  totalLearned: number;
  currentBatchCount: number;
  totalWordsInPool: number;
  activeHSK: string;
  appLanguage: AppLanguage;
  onSelectLanguage: (lang: AppLanguage) => void;
  studyDirection: StudyDirection;
  onToggleStudyDirection: () => void;
  onOpenToneGuide: () => void;
  onOpenCatalog: () => void;
  onOpenQuiz: () => void;
  onOpenSettings: () => void;
  onResetToFirstBatch: () => void;
  bookmarkedCount: number;
  showBookmarkedOnly: boolean;
  onToggleBookmarkedOnly: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalLearned,
  currentBatchCount,
  totalWordsInPool,
  activeHSK,
  appLanguage,
  onSelectLanguage,
  studyDirection,
  onToggleStudyDirection,
  onOpenToneGuide,
  onOpenCatalog,
  onOpenQuiz,
  onOpenSettings,
  onResetToFirstBatch,
  bookmarkedCount,
  showBookmarkedOnly,
  onToggleBookmarkedOnly,
}) => {
  const t = UI_TRANSLATIONS[appLanguage] || UI_TRANSLATIONS.id;

  const languages: { code: AppLanguage; label: string; flag: string }[] = [
    { code: 'id', label: 'Indonesia', flag: '🇮🇩' },
    { code: 'ms', label: 'Melayu', flag: '🇲🇾' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  const isReverseMode = studyDirection === 'id_to_zh';

  return (
    <header className="border-b border-white/15 bg-white/10 backdrop-blur-xl sticky top-0 z-30 px-4 lg:px-8 py-3.5 shadow-lg shadow-black/20 text-white">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3.5">
        
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl ${isReverseMode ? 'bg-amber-300 text-slate-950' : 'bg-white/90 text-blue-700'} font-black text-xl flex items-center justify-center shadow-lg shadow-cyan-950/30 select-none font-['Noto_Sans_SC'] transition-colors`}>
            {isReverseMode ? '印' : '汉'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-bold text-lg text-white tracking-tight flex items-center gap-2">
                {t.appTitle}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 font-semibold shadow-sm">
                  3000 {t.wordsUnit}
                </span>
              </h1>
            </div>
            <p className="text-xs text-cyan-100/70">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Action Controls & Language Selector */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          
          {/* Mode Switcher: ID/MY/GB > CN VS CN > ID/MY/GB */}
          <button
            id="btn-toggle-study-direction"
            onClick={onToggleStudyDirection}
            className={`flex items-center gap-2 px-3 py-2 rounded-2xl border backdrop-blur-md transition active:scale-95 font-semibold cursor-pointer shadow-md ${
              isReverseMode
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-amber-400/30'
                : 'bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-200 border-cyan-400/40'
            }`}
            title="Klik untuk menukar arah belajar (ID/MY/GB > CN atau CN > ID/MY/GB)"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span className="font-bold">
              {isReverseMode ? '🇨🇳 > 🇮🇩/🇲🇾/🇬🇧 CN > ID/MY/GB' : '🇮🇩/🇲🇾/🇬🇧 > 🇨🇳 ID/MY/GB > CN'}
            </span>
          </button>

          {/* Language Switcher (Indonesia, Melayu, English, Chinese) */}
          <div className="flex items-center gap-1 bg-black/30 p-1 rounded-2xl border border-white/20 backdrop-blur-md shadow-inner">
            <Globe className="w-3.5 h-3.5 text-cyan-300 ml-1.5 mr-0.5" />
            {languages.map((l) => {
              const isSelected = appLanguage === l.code;
              return (
                <button
                  key={l.code}
                  id={`btn-lang-${l.code}`}
                  onClick={() => onSelectLanguage(l.code)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-medium transition cursor-pointer text-xs ${
                    isSelected
                      ? 'bg-cyan-400 text-slate-950 font-bold shadow-md shadow-cyan-400/20'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                  title={`Ganti bahasa / Switch language to ${l.label}`}
                >
                  <span>{l.flag}</span>
                  <span className="hidden sm:inline">{l.label}</span>
                  <span className="sm:hidden uppercase font-mono">{l.code}</span>
                </button>
              );
            })}
          </div>

          {/* Tone Guide Button */}
          <button
            id="btn-tone-guide"
            onClick={onOpenToneGuide}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition active:scale-95 font-medium cursor-pointer shadow-sm"
            title={t.toneGuide}
          >
            <Music className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">{t.toneGuide}</span>
            <span className="sm:hidden">Nada</span>
          </button>

          {/* Catalog 3000 Words */}
          <button
            id="btn-catalog-3000"
            onClick={onOpenCatalog}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition active:scale-95 font-medium cursor-pointer shadow-sm"
            title={t.catalog}
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-300" />
            <span className="hidden sm:inline">{t.catalog}</span>
            <span className="sm:hidden">Katalog</span>
          </button>

          {/* Quiz Test */}
          <button
            id="btn-quiz-test"
            onClick={onOpenQuiz}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 backdrop-blur-md transition active:scale-95 font-medium cursor-pointer shadow-sm"
            title={t.quiz}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>{t.quiz}</span>
          </button>

          {/* Bookmarked Filter */}
          <button
            id="btn-bookmarks"
            onClick={onToggleBookmarkedOnly}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border backdrop-blur-md transition active:scale-95 font-medium cursor-pointer shadow-sm ${
              showBookmarkedOnly
                ? 'bg-amber-400/30 text-amber-200 border-amber-300/60 shadow-amber-400/20'
                : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
            }`}
            title={t.bookmarks}
          >
            <Bookmark className={`w-3.5 h-3.5 ${showBookmarkedOnly ? 'fill-amber-300 text-amber-300' : 'text-white/70'}`} />
            <span>{t.bookmarks} ({bookmarkedCount})</span>
          </button>

          {/* Reset ke 5 Kata Awal */}
          <button
            id="btn-header-reset"
            onClick={onResetToFirstBatch}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/40 backdrop-blur-md transition active:scale-95 font-medium cursor-pointer shadow-sm"
            title={t.resetLevelTooltip}
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-300" />
            <span className="hidden sm:inline">{t.resetToStart}</span>
            <span className="sm:hidden">Reset</span>
          </button>

          {/* Settings */}
          <button
            id="btn-settings"
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition active:scale-95 cursor-pointer shadow-sm"
            title={t.settings}
            aria-label={t.settings}
          >
            <Settings className="w-4 h-4 text-cyan-200" />
          </button>
        </div>

      </div>
    </header>
  );
};


