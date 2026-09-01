export type HSKLevel = 'HSK 1' | 'HSK 2' | 'HSK 3' | 'HSK 4' | 'HSK 5' | 'HSK 6';

export type AppLanguage = 'id' | 'ms' | 'en';

export type StudyDirection = 'zh_to_id' | 'id_to_zh'; // zh_to_id: Belajar Mandarin (Default), id_to_zh: Belajar Bahasa Indonesia (学印尼语)

export type ProficiencyLevel =
  | 'basic'
  | 'numbers_shopping'
  | 'intermediate'
  | 'advanced'
  | 'all'
  | 'hsk1'
  | 'hsk2'
  | 'hsk3'
  | 'hsk4'
  | 'hsk5'
  | 'hsk6';

export interface MandarinWord {
  id: number;
  hanzi: string;
  pinyin: string;
  indonesian: string;
  malay?: string;
  english?: string;
  category: string;
  hsk: HSKLevel;
  tone?: number; // 1, 2, 3, 4, 0 (neutral)
  pinyinWithoutTone?: string;
  exampleHanzi?: string;
  examplePinyin?: string;
  exampleIndonesian?: string;
  exampleMalay?: string;
  exampleEnglish?: string;
}

export type PlaybackHideMode = 'none' | 'all' | 'meaning_only' | 'hanzi_only' | 'pinyin_only';

export interface TieredRepetitionRule {
  id: string;
  fromWord: number; // 1-indexed (e.g. 1)
  toWord: number;   // 1-indexed (e.g. 5, or 9999 for end)
  reps: number;     // 0, 1, 2, 3, 5, 7, 10
}

export interface TieredRepetitionSettings {
  enabled: boolean; // ON / OFF
  mode: 'sliding_window' | 'custom_ranges'; // 'sliding_window' (otomatis) vs 'custom_ranges'
  recentWordsCount: number; // Jumlah kata terbaru yang dibaca full repetitionCount (default: 15)
  olderWordsReps: number;   // Jumlah repetisi untuk kata sebelum recentWordsCount (pilihan: 0, 1, 2, 3, 5, 7, 10)
  customRanges: TieredRepetitionRule[];
}

export interface AudioSettings {
  repetitionCount: number; // default: 5 (untuk kata baru atau global jika tiered mati)
  speedRate: number; // default: 0.75 (range 0.4 to 1.5)
  pauseBetweenRepsMs: number; // default: 700ms
  pauseBetweenWordsMs: number; // default: 1200ms
  mandarinVoiceURI?: string;
  indonesianVoiceURI?: string;
  meaningVoiceURI?: string;
  playOrder: 'mandarin_then_indo' | 'mandarin_only' | 'indo_then_mandarin';
  autoAdvanceCumulative?: boolean;
  tieredRepetition: TieredRepetitionSettings;
}

export interface PlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  currentWordIndex: number;
  currentRepetition: number;
  currentSpeechPhase: 'mandarin' | 'indonesian' | 'meaning' | 'idle';
  activeWord: MandarinWord | null;
}

export interface CumulativeSession {
  proficiencyLevel: ProficiencyLevel;
  startIndex: number;
  batchCount: number; // e.g. 1 means 5 words, 2 means 10 words, 3 means 15 words
  batchSize: number; // default 5
  totalLearnedWords: number;
  completedBatches: number[];
}


