import { MandarinWord } from '../types';
import { HSK4_VOCAB_LIST } from './hsk4Data';
import { HSK5_VOCAB_LIST } from './hsk5Data';
import { HSK6_VOCAB_LIST } from './hsk6Data';

// Authentic curriculum-based HSK 4, HSK 5, and HSK 6 vocabulary datasets
export const VOCABULARY_EXPANSION_PACK_2: Omit<MandarinWord, 'id'>[] = [
  ...HSK4_VOCAB_LIST,
  ...HSK5_VOCAB_LIST,
  ...HSK6_VOCAB_LIST,
];
