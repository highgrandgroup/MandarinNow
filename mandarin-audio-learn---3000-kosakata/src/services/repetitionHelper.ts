import { AudioSettings, TieredRepetitionSettings } from '../types';

export const DEFAULT_TIERED_SETTINGS: TieredRepetitionSettings = {
  enabled: false,
  mode: 'sliding_window',
  recentWordsCount: 15, // 15 kata terakhir dibaca full reps
  olderWordsReps: 1,    // Kata lama sebelum 15 kata terakhir dibaca 1x (atau 0x jika dipilih)
  customRanges: [
    { id: '1', fromWord: 1, toWord: 5, reps: 1 },
    { id: '2', fromWord: 6, toWord: 20, reps: 3 },
  ],
};

/**
 * Menghitung berapa kali kata ke-wordIndex (0-indexed) harus dibaca dalam batch aktif
 * @param wordIndex Index kata saat ini (0 sampai totalWords-1)
 * @param totalWords Jumlah total kata dalam batch aktif saat ini (misal 20 atau 25 kata)
 * @param settings Pengaturan audio saat ini
 * @returns Jumlah repetisi (0 = lewati / skip, 1, 2, 3, 5, 7, 10, dsb)
 */
export function getWordRepetitions(
  wordIndex: number,
  totalWords: number,
  settings: AudioSettings
): number {
  if (!settings.tieredRepetition || !settings.tieredRepetition.enabled) {
    return Math.max(1, settings.repetitionCount);
  }

  const { mode, recentWordsCount, olderWordsReps, customRanges } = settings.tieredRepetition;

  // 1. Sliding Window Mode (Otomatis & Pintar saat +5 kata)
  if (mode === 'sliding_window') {
    // Jarak kata dari akhir daftar (0 = kata paling terakhir/baru)
    const distanceFromEnd = totalWords - 1 - wordIndex;

    // Jika masuk dalam batas kata terbaru (misal 15 kata terakhir)
    if (distanceFromEnd < recentWordsCount) {
      return Math.max(0, settings.repetitionCount);
    }

    // Jika kata lama (sebelum N kata terakhir)
    return Math.max(0, olderWordsReps);
  }

  // 2. Custom Ranges Mode (Aturan Range Manual)
  if (mode === 'custom_ranges' && Array.isArray(customRanges) && customRanges.length > 0) {
    const wordNumber = wordIndex + 1; // 1-indexed (Nomor urut kata 1, 2, 3, dst.)

    for (const range of customRanges) {
      if (wordNumber >= range.fromWord && wordNumber <= range.toWord) {
        return Math.max(0, range.reps);
      }
    }
  }

  // Fallback ke repetisi utama jika tidak masuk dalam range khusus
  return Math.max(1, settings.repetitionCount);
}

/**
 * Cek apakah kata tertentu dianggap "Kata Lama" yang repetisinya dikurangi
 */
export function isWordOlderTier(
  wordIndex: number,
  totalWords: number,
  settings: AudioSettings
): boolean {
  if (!settings.tieredRepetition || !settings.tieredRepetition.enabled) {
    return false;
  }
  const reps = getWordRepetitions(wordIndex, totalWords, settings);
  return reps < settings.repetitionCount;
}

/**
 * Menghasilkan ringkasan pembacaan repetisi untuk status bar / tooltip
 */
export function getTieredSummaryText(
  totalWords: number,
  settings: AudioSettings,
  labels: {
    allWords: string;
    olderWords: string;
    recentWords: string;
    skipped: string;
  }
): string {
  if (!settings.tieredRepetition || !settings.tieredRepetition.enabled) {
    return `${settings.repetitionCount}x per kata`;
  }

  const { mode, recentWordsCount, olderWordsReps, customRanges } = settings.tieredRepetition;

  if (mode === 'sliding_window') {
    // Jika jumlah kata aktif saat ini belum melebihi batas kata baru
    if (totalWords <= recentWordsCount) {
      return `${labels.recentWords || 'Kata Baru'} (No. 1–${totalWords}): ${settings.repetitionCount}x (Semua kata dibaca penuh)`;
    }
    
    // Kata Lama = urutan kata dari awal sejak pertama kali di-PLAY sebelum N kata terakhir
    const olderCount = totalWords - recentWordsCount;
    const olderLabel = olderWordsReps === 0 ? (labels.skipped || '0x [Lewati]') : `${olderWordsReps}x`;
    
    // Kata Baru = N kata urutan yang dibaca terakhir
    const recentStart = olderCount + 1;
    return `Kata Lama (No. 1–${olderCount}): ${olderLabel} • Kata Baru (No. ${recentStart}–${totalWords}): ${settings.repetitionCount}x`;
  }

  if (mode === 'custom_ranges' && Array.isArray(customRanges) && customRanges.length > 0) {
    return 'Aturan Rentang Kustom Aktif';
  }

  return `${settings.repetitionCount}x`;
}
