import React, { useState, useMemo } from 'react';
import { X, Search, Volume2, Bookmark, Check, Play, BookOpen, Layers, Filter } from 'lucide-react';
import { MandarinWord, HSKLevel, AppLanguage } from '../types';
import { getAllVocabulary, VOCABULARY_CATEGORIES } from '../data/mandarinVocab';
import { speechService } from '../services/speechService';
import { getWordMeaning, UI_TRANSLATIONS } from '../services/translationService';

interface VocabCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWordToLearn: (wordIndex: number) => void;
  bookmarkedIds: Set<number>;
  onToggleBookmark: (wordId: number) => void;
  speed: number;
  appLanguage: AppLanguage;
}

export const VocabCatalogModal: React.FC<VocabCatalogModalProps> = ({
  isOpen,
  onClose,
  onSelectWordToLearn,
  bookmarkedIds,
  onToggleBookmark,
  speed,
  appLanguage,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHSK, setSelectedHSK] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 30;

  const t = UI_TRANSLATIONS[appLanguage] || UI_TRANSLATIONS.id;

  const allWords = useMemo(() => {
    return getAllVocabulary();
  }, []);

  const filteredWords = useMemo(() => {
    return allWords.filter((w) => {
      const matchHSK = selectedHSK === 'all' || w.hsk === selectedHSK;
      const matchCat = selectedCategory === 'all' || w.category === selectedCategory;
      const meaning = getWordMeaning(w, appLanguage);
      const matchSearch =
        searchTerm.trim() === '' ||
        w.hanzi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.pinyin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.indonesian.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meaning.toLowerCase().includes(searchTerm.toLowerCase());

      return matchHSK && matchCat && matchSearch;
    });
  }, [allWords, searchTerm, selectedHSK, selectedCategory, appLanguage]);

  const totalPages = Math.ceil(filteredWords.length / itemsPerPage);
  const currentWords = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredWords.slice(start, start + itemsPerPage);
  }, [filteredWords, page]);

  if (!isOpen) return null;

  const playWord = (word: MandarinWord) => {
    speechService.speakSingleWord(word, speed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900/90 border border-white/20 rounded-3xl max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl backdrop-blur-2xl overflow-hidden text-white">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/15 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-400/20 border border-cyan-300/40 flex items-center justify-center text-cyan-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg flex items-center gap-2">
                {t.catalogTitle}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 font-bold shadow-sm">
                  {filteredWords.length} {t.wordsUnit}
                </span>
              </h3>
              <p className="text-xs text-cyan-100/70">
                {t.catalogSubtitle}
              </p>
            </div>
          </div>
          <button
            id="btn-close-catalog"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer border border-white/15"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="p-4 border-b border-white/15 bg-white/5 flex flex-col sm:flex-row gap-3 items-center justify-between">
          
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-cyan-200/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-catalog-search"
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/30 border border-white/20 text-xs text-white placeholder-cyan-200/40 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          {/* HSK Level Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <span className="text-xs text-cyan-100/70 mr-1 hidden sm:inline">HSK:</span>
            {['all', 'HSK 1', 'HSK 2', 'HSK 3', 'HSK 4', 'HSK 5', 'HSK 6'].map((lvl) => (
              <button
                key={lvl}
                id={`btn-filter-hsk-${lvl}`}
                onClick={() => {
                  setSelectedHSK(lvl);
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedHSK === lvl
                    ? 'bg-cyan-400 text-slate-950 shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-white/80 border border-white/15'
                }`}
              >
                {lvl === 'all' ? (appLanguage === 'en' ? 'All' : appLanguage === 'ms' ? 'Semua' : 'Semua') : lvl}
              </button>
            ))}
          </div>

        </div>

        {/* Catalog Table / Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {currentWords.map((word, idx) => {
              const isSaved = bookmarkedIds.has(word.id);
              const realGlobalIndex = allWords.findIndex((w) => w.id === word.id);
              const wordMeaning = getWordMeaning(word, appLanguage);

              return (
                <div
                  key={word.id}
                  className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 hover:border-cyan-400/40 hover:bg-white/15 transition flex flex-col justify-between group shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-cyan-200/70 font-semibold">
                        #{word.id}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-lg bg-white/15 text-cyan-100 font-bold border border-white/20">
                        {word.hsk}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        id={`btn-catalog-audio-${word.id}`}
                        onClick={() => playWord(word)}
                        className="p-1.5 rounded-xl bg-white/15 hover:bg-cyan-400 hover:text-slate-950 text-cyan-200 transition cursor-pointer border border-white/20"
                        title={t.listenMandarin}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id={`btn-catalog-star-${word.id}`}
                        onClick={() => onToggleBookmark(word.id)}
                        className="p-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white/80 transition cursor-pointer border border-white/20"
                        title={isSaved ? t.bookmarkRemove : t.bookmarkAdd}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-300 text-amber-300' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Hanzi & Pinyin */}
                  <div className="mb-2">
                    <div className="text-2xl font-black text-white font-['Noto_Sans_SC']">
                      {word.hanzi}
                    </div>
                    <div className="text-xs font-mono font-bold text-cyan-300">
                      {word.pinyin}
                    </div>
                  </div>

                  {/* Translated Meaning */}
                  <div className="pt-2.5 border-t border-white/15 flex items-center justify-between text-xs">
                    <div className="text-white/90 font-medium truncate mr-2 italic" title={wordMeaning}>
                      "{wordMeaning}"
                    </div>
                    <button
                      id={`btn-jump-to-word-${word.id}`}
                      onClick={() => {
                        onSelectWordToLearn(realGlobalIndex >= 0 ? realGlobalIndex : 0);
                        onClose();
                      }}
                      className="px-3 py-1 rounded-xl bg-cyan-400/20 hover:bg-cyan-400 hover:text-slate-950 text-cyan-200 border border-cyan-400/40 text-[11px] font-bold transition cursor-pointer shrink-0"
                      title={t.learnFromHere}
                    >
                      {appLanguage === 'en' ? 'Learn' : 'Pelajari'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredWords.length === 0 && (
            <div className="text-center py-16 text-cyan-200/60 text-sm">
              Tidak ada kosakata yang cocok dengan filter atau kata kunci pencarian.
            </div>
          )}
        </div>

        {/* Footer & Pagination */}
        <div className="p-4 border-t border-white/15 bg-white/5 flex items-center justify-between text-xs text-cyan-100/70">
          <div>
            {t.showingWords} {Math.min(filteredWords.length, (page - 1) * itemsPerPage + 1)} -{' '}
            {Math.min(filteredWords.length, page * itemsPerPage)} {t.of} {filteredWords.length} {t.wordsUnit}
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-catalog-prev-page"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white border border-white/15 transition cursor-pointer"
            >
              {appLanguage === 'en' ? 'Previous' : appLanguage === 'ms' ? 'Sebelumnya' : 'Sebelumnya'}
            </button>
            <span className="font-mono text-cyan-200 font-bold">
              {t.pageOf} {page} / {Math.max(1, totalPages)}
            </span>
            <button
              id="btn-catalog-next-page"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white border border-white/15 transition cursor-pointer"
            >
              {appLanguage === 'en' ? 'Next' : appLanguage === 'ms' ? 'Seterusnya' : 'Selanjutnya'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

