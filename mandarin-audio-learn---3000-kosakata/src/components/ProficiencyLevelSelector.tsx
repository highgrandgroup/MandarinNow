import React from 'react';
import { Sparkles, Award, Compass, Layers, ShoppingBag, GraduationCap, CheckCircle2 } from 'lucide-react';
import { ProficiencyLevel, AppLanguage } from '../types';
import { UI_TRANSLATIONS } from '../services/translationService';

interface ProficiencyLevelSelectorProps {
  currentLevel: ProficiencyLevel;
  onSelectLevel: (level: ProficiencyLevel) => void;
  appLanguage: AppLanguage;
  stats: {
    basic: number;
    numbers_shopping?: number;
    intermediate: number;
    advanced: number;
    total: number;
    hsk1?: number;
    hsk2?: number;
    hsk3?: number;
    hsk4?: number;
    hsk5?: number;
    hsk6?: number;
  };
}

export const ProficiencyLevelSelector: React.FC<ProficiencyLevelSelectorProps> = ({
  currentLevel,
  onSelectLevel,
  appLanguage,
  stats,
}) => {
  const t = UI_TRANSLATIONS[appLanguage] || UI_TRANSLATIONS.id;

  const hskLevels: {
    id: ProficiencyLevel;
    label: string;
    sub: string;
    count: number;
    color: string;
    badgeColor: string;
  }[] = [
    {
      id: 'hsk1',
      label: 'HSK 1',
      sub: 'Dasar Pemula',
      count: stats.hsk1 || 0,
      color: 'hover:border-emerald-400 focus:border-emerald-400',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
    },
    {
      id: 'hsk2',
      label: 'HSK 2',
      sub: 'Dasar Menengah',
      count: stats.hsk2 || 0,
      color: 'hover:border-teal-400 focus:border-teal-400',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-400/40',
    },
    {
      id: 'hsk3',
      label: 'HSK 3',
      sub: 'Menengah 1',
      count: stats.hsk3 || 0,
      color: 'hover:border-sky-400 focus:border-sky-400',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
    },
    {
      id: 'hsk4',
      label: 'HSK 4',
      sub: 'Menengah 2',
      count: stats.hsk4 || 0,
      color: 'hover:border-indigo-400 focus:border-indigo-400',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40',
    },
    {
      id: 'hsk5',
      label: 'HSK 5',
      sub: 'Tingkat Mahir',
      count: stats.hsk5 || 0,
      color: 'hover:border-fuchsia-400 focus:border-fuchsia-400',
      badgeColor: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/40',
    },
    {
      id: 'hsk6',
      label: 'HSK 6',
      sub: 'Mahir Lanjutan',
      count: stats.hsk6 || 0,
      color: 'hover:border-rose-400 focus:border-rose-400',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
    },
  ];

  const levels: {
    id: ProficiencyLevel;
    title: string;
    sub: string;
    desc: string;
    count: number;
    icon: React.ReactNode;
    color: string;
    activeBorder: string;
    activeBg: string;
    badgeBg: string;
  }[] = [
    {
      id: 'basic',
      title: t.levelBasic,
      sub: t.levelBasicSub,
      desc: t.levelBasicDesc,
      count: stats.basic,
      icon: <Sparkles className="w-5 h-5 text-emerald-300" />,
      color: 'from-emerald-500/20 to-teal-500/10',
      activeBorder: 'border-emerald-400 ring-2 ring-emerald-400/40 shadow-emerald-950/40',
      activeBg: 'bg-emerald-500/25',
      badgeBg: 'bg-emerald-400 text-slate-950',
    },
    {
      id: 'numbers_shopping',
      title: (t as any).levelNumbersShopping || 'Angka & Belanja',
      sub: (t as any).levelNumbersShoppingSub || 'Hitungan, Diskon & Satuan',
      desc: (t as any).levelNumbersShoppingDesc || 'Angka 1-100jt, operasi (+ - × ÷), diskon, persetengah kilo (jin), dan satuan belanja harian',
      count: stats.numbers_shopping || 65,
      icon: <ShoppingBag className="w-5 h-5 text-amber-300" />,
      color: 'from-amber-500/20 to-orange-500/10',
      activeBorder: 'border-amber-400 ring-2 ring-amber-400/40 shadow-amber-950/40',
      activeBg: 'bg-amber-500/25',
      badgeBg: 'bg-amber-400 text-slate-950',
    },
    {
      id: 'intermediate',
      title: t.levelIntermediate,
      sub: t.levelIntermediateSub,
      desc: t.levelIntermediateDesc,
      count: stats.intermediate,
      icon: <Compass className="w-5 h-5 text-cyan-300" />,
      color: 'from-cyan-500/20 to-blue-500/10',
      activeBorder: 'border-cyan-400 ring-2 ring-cyan-400/40 shadow-cyan-950/40',
      activeBg: 'bg-cyan-500/25',
      badgeBg: 'bg-cyan-400 text-slate-950',
    },
    {
      id: 'advanced',
      title: t.levelAdvanced,
      sub: t.levelAdvancedSub,
      desc: t.levelAdvancedDesc,
      count: stats.advanced,
      icon: <Award className="w-5 h-5 text-purple-300" />,
      color: 'from-purple-500/20 to-rose-500/10',
      activeBorder: 'border-purple-400 ring-2 ring-purple-400/40 shadow-purple-950/40',
      activeBg: 'bg-purple-500/25',
      badgeBg: 'bg-purple-400 text-slate-950',
    },
  ];

  return (
    <div className="w-full mb-6 space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4" />
            Tingkat Kurikulum Standar (HSK 1 - HSK 6)
          </span>
        </div>
        <button
          id="btn-level-all"
          onClick={() => onSelectLevel('all')}
          className={`text-xs px-3.5 py-1.5 rounded-xl transition cursor-pointer font-bold border ${
            currentLevel === 'all'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-300 shadow-md ring-2 ring-purple-400/40'
              : 'bg-white/5 hover:bg-white/15 text-white/80 border-white/10'
          }`}
        >
          {t.levelAll} ({stats.total})
        </button>
      </div>

      {/* Direct HSK 1 - HSK 6 Level Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {hskLevels.map((hsk) => {
          const isSelected = currentLevel === hsk.id;
          return (
            <button
              key={hsk.id}
              id={`btn-select-hsk-${hsk.id}`}
              onClick={() => onSelectLevel(hsk.id)}
              className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer backdrop-blur-xl flex flex-col justify-between text-left ${
                isSelected
                  ? 'bg-cyan-500/25 border-cyan-400 ring-2 ring-cyan-400/40 shadow-lg scale-[1.02]'
                  : 'bg-white/10 border-white/15 hover:bg-white/15 hover:border-white/30 text-white/90 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-extrabold text-sm text-white">{hsk.label}</span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md border ${hsk.badgeColor}`}>
                  {hsk.count}
                </span>
              </div>
              <span className="text-[11px] text-cyan-200/80 font-medium truncate">
                {hsk.sub}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grouped Proficiency Level Cards */}
      <div className="pt-1">
        <div className="flex items-center gap-1.5 mb-2.5 text-xs text-white/60 font-semibold">
          <Layers className="w-3.5 h-3.5 text-cyan-300" />
          <span>Paket Belajar Tematik & Gabungan Tingkat</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {levels.map((lvl) => {
            const isSelected = currentLevel === lvl.id;
            return (
              <button
                key={lvl.id}
                id={`btn-select-level-${lvl.id}`}
                onClick={() => onSelectLevel(lvl.id)}
                className={`relative text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer backdrop-blur-xl flex flex-col justify-between ${
                  isSelected
                    ? `${lvl.activeBg} ${lvl.activeBorder} shadow-lg scale-[1.01]`
                    : 'bg-white/10 border-white/15 hover:bg-white/15 hover:border-white/30 text-white/90 shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-white/10 border border-white/15">
                        {lvl.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-white tracking-tight leading-none">
                          {lvl.title}
                        </h3>
                        <span className="text-xs text-cyan-200/80 font-mono font-medium">
                          {lvl.sub}
                        </span>
                      </div>
                    </div>

                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full font-mono shadow-sm ${lvl.badgeBg}`}>
                      {lvl.count} {t.wordsUnit}
                    </span>
                  </div>

                  <p className="text-xs text-white/70 leading-relaxed mt-2 line-clamp-2">
                    {lvl.desc}
                  </p>
                </div>

                {isSelected && (
                  <div className="mt-3 pt-2.5 border-t border-white/15 flex items-center justify-between text-[11px] font-semibold text-cyan-300">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                      Sedang Dipelajari
                    </span>
                    <span>Mulai ➔</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
