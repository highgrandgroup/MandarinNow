import { MandarinWord, ProficiencyLevel } from '../types';
import { HSK1_VOCAB_LIST } from './hsk1Data';
import { HSK2_VOCAB_LIST } from './hsk2Data';
import { HSK3_VOCAB_LIST } from './hsk3Data';
import { HSK4_VOCAB_LIST } from './hsk4Data';
import { HSK5_VOCAB_LIST } from './hsk5Data';
import { HSK6_VOCAB_LIST } from './hsk6Data';

let cachedAllWords: MandarinWord[] | null = null;

export function getAllMandarinWords(): MandarinWord[] {
  if (cachedAllWords) return cachedAllWords;

  // Aggregate across all 6 verified HSK levels (HSK 1-6 total 3000 words)
  const rawList: Omit<MandarinWord, 'id'>[] = [
    ...HSK1_VOCAB_LIST,
    ...HSK2_VOCAB_LIST,
    ...HSK3_VOCAB_LIST,
    ...HSK4_VOCAB_LIST,
    ...HSK5_VOCAB_LIST,
    ...HSK6_VOCAB_LIST,
  ];

  cachedAllWords = rawList.map((item, idx) => ({
    ...item,
    id: idx + 1,
  }));

  return cachedAllWords;
}

export function getWordById(id: number): MandarinWord | undefined {
  const words = getAllMandarinWords();
  return words.find((w) => w.id === id);
}

export function getWordsByProficiency(level: ProficiencyLevel = 'all'): MandarinWord[] {
  const all = getAllMandarinWords();
  if (level === 'all') return all;
  if (level === 'hsk1') return all.filter((w) => w.hsk === 'HSK 1');
  if (level === 'hsk2') return all.filter((w) => w.hsk === 'HSK 2');
  if (level === 'hsk3') return all.filter((w) => w.hsk === 'HSK 3');
  if (level === 'hsk4') return all.filter((w) => w.hsk === 'HSK 4');
  if (level === 'hsk5') return all.filter((w) => w.hsk === 'HSK 5');
  if (level === 'hsk6') return all.filter((w) => w.hsk === 'HSK 6');
  if (level === 'basic') {
    return all.filter((w) => w.hsk === 'HSK 1' || w.hsk === 'HSK 2');
  }
  if (level === 'numbers_shopping') {
    return all.filter((w) => 
      w.category === 'Belanja, Travel dan Angka' ||
      w.category === 'Angka, Waktu & Tanggal' || 
      w.category === 'Belanja, Uang & Bisnis' ||
      (w.category === 'Tempat, Arah & Perjalanan' && (w.hsk === 'HSK 1' || w.hsk === 'HSK 2' || w.hsk === 'HSK 3'))
    );
  }
  if (level === 'intermediate') {
    return all.filter((w) => w.hsk === 'HSK 3' || w.hsk === 'HSK 4');
  }
  if (level === 'advanced') {
    return all.filter((w) => w.hsk === 'HSK 5' || w.hsk === 'HSK 6');
  }
  return all;
}

export function getCumulativeBatch(startIndex: number, batchCount: number, batchSize: number = 5): MandarinWord[] {
  const all = getAllMandarinWords();
  const totalCount = Math.min(all.length, (batchCount + 1) * batchSize);
  return all.slice(0, totalCount);
}

export function getCumulativeBatchByProficiency(
  level: ProficiencyLevel = 'all',
  startIndex: number = 0,
  batchCount: number = 1,
  batchSize: number = 5
): MandarinWord[] {
  const words = getWordsByProficiency(level);
  const totalCount = Math.min(words.length, Math.max(batchSize, batchCount * batchSize));
  return words.slice(0, totalCount);
}

export function getSingleBatch(batchIndex: number, batchSize: number = 5): MandarinWord[] {
  const all = getAllMandarinWords();
  const start = batchIndex * batchSize;
  const end = Math.min(all.length, start + batchSize);
  return all.slice(start, end);
}

export const getAllVocabulary = getAllMandarinWords;

export function getTotalVocabCount(): number {
  return getAllMandarinWords().length;
}

export function getTotalVocabCountByProficiency(level: ProficiencyLevel = 'all'): number {
  return getWordsByProficiency(level).length;
}

export const VOCABULARY_CATEGORIES = [
  'Belanja, Travel dan Angka',
  'Salam & Percakapan Dasar',
  'Kata Ganti & Orang',
  'Angka, Waktu & Tanggal',
  'Keluarga & Rumah Tangga',
  'Makanan & Minuman',
  'Kata Kerja Aksi Sehari-hari',
  'Kata Sifat & Deskripsi',
  'Tempat, Arah & Perjalanan',
  'Sekolah & Belajar',
  'Pekerjaan & Profesi',
  'Belanja, Uang & Bisnis',
  'Kesehatan & Bagian Tubuh',
  'Cuaca, Musim & Alam',
  'Kata Hubung & Partikel Tata Bahasa',
  'Emosi, Sifat & Perasaan',
  'Transportasi & Lalu Lintas',
];
