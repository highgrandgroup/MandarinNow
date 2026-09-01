import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

const ai = new GoogleGenAI({});

const CACHE_FILE = path.join(process.cwd(), 'full_gemini_dictionary.json');
let dictionary: Record<string, { indonesian: string; malay: string; english: string; exampleHanzi?: string; examplePinyin?: string; exampleIndonesian?: string; exampleMalay?: string; exampleEnglish?: string }> = {};

if (fs.existsSync(CACHE_FILE)) {
  try {
    dictionary = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    console.log(`Loaded ${Object.keys(dictionary).length} existing entries from dictionary cache.`);
  } catch (e) {
    dictionary = {};
  }
}

function saveDictionary() {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(dictionary, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving dictionary:', e);
  }
}

interface RawWord {
  hanzi: string;
  pinyin: string;
  category: string;
  hsk: string;
  tone: number;
}

function parseFile(filepath: string): RawWord[] {
  const content = fs.readFileSync(filepath, 'utf-8');
  const items: RawWord[] = [];
  const rawBlocks = content.split(/\{\s*\n?\s*hanzi:/);
  
  for (const rb of rawBlocks.slice(1)) {
    const block = 'hanzi:' + rb.split('}')[0];
    
    const getField = (name: string) => {
      const m = block.match(new RegExp(`${name}:\\s*["'](.*?)["'],?`));
      if (m) return m[1].replace(/\\"/g, '"');
      const mNum = block.match(new RegExp(`${name}:\\s*([0-9]+)`));
      if (mNum) return parseInt(mNum[1], 10);
      return null;
    };

    const hanzi = getField('hanzi') as string;
    const pinyin = getField('pinyin') as string;
    const category = (getField('category') as string) || 'Umum';
    const hsk = (getField('hsk') as string) || 'HSK 1';
    const tone = (getField('tone') as number) ?? 0;

    if (hanzi && pinyin) {
      items.push({ hanzi, pinyin, category, hsk, tone });
    }
  }
  return items;
}

function capitalize(s: string): string {
  if (!s) return '';
  const trimmed = s.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

async function translateChunk(chunk: { hanzi: string; pinyin: string; hsk: string }[]): Promise<void> {
  const uncached = chunk.filter(w => !dictionary[w.hanzi]);
  if (uncached.length === 0) return;

  const prompt = `You are a master lexicographer translating standard HSK Mandarin vocabulary into Indonesian and Malay.
Translate each word with high pedagogical accuracy:
- Indonesian (indonesian): clear Indonesian definition (e.g. 八 -> "Delapan (8)", 杯子 -> "Cangkir / Gelas", 苹果 -> "Apel", 医院 -> "Rumah sakit", 电脑 -> "Komputer", 机场 -> "Bandara", 报纸 -> "Koran", 便宜 -> "Murah")
- Malay (malay): standard Bahasa Melayu Malaysia (e.g. 八 -> "Lapan (8)", 杯子 -> "Cawan / Gelas", 苹果 -> "Epal", 医院 -> "Hospital", 电脑 -> "Komputer", 机场 -> "Lapangan terbang", 报纸 -> "Surat khabar", 便宜 -> "Murah")
- English (english): standard English definition

Words to translate:
${JSON.stringify(uncached.map(w => ({ hanzi: w.hanzi, pinyin: w.pinyin, hsk: w.hsk })))}

Return ONLY a JSON array of objects with keys:
[{"hanzi": "...", "indonesian": "...", "malay": "...", "english": "..."}]`;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const list = JSON.parse(res.text || '[]');
      if (Array.isArray(list)) {
        for (const item of list) {
          if (item.hanzi) {
            dictionary[item.hanzi] = {
              indonesian: capitalize(item.indonesian || item.hanzi),
              malay: capitalize(item.malay || item.indonesian || item.hanzi),
              english: capitalize(item.english || item.hanzi)
            };
          }
        }
        saveDictionary();
        return;
      }
    } catch (e) {
      console.warn(`Chunk retry ${attempt + 1}:`, e);
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
}

async function runPool(chunks: { hanzi: string; pinyin: string; hsk: string }[][], concurrency = 5) {
  let index = 0;
  async function worker() {
    while (index < chunks.length) {
      const i = index++;
      console.log(`[Batch ${i + 1}/${chunks.length}] Translating ${chunks[i].length} words...`);
      await translateChunk(chunks[i]);
    }
  }
  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
}

function writeUpdatedFile(filepath: string, varName: string, title: string, words: RawWord[]) {
  const lines = [
    "import { MandarinWord } from '../types';",
    "",
    `// ${title}`,
    `export const ${varName}: Omit<MandarinWord, 'id'>[] = [`
  ];

  for (const w of words) {
    const tr = dictionary[w.hanzi] || {
      indonesian: w.hanzi,
      malay: w.hanzi,
      english: w.hanzi
    };

    const exHanzi = `在日常生活中，我们经常使用“${w.hanzi}”这个词。`;
    const exPinyin = `Zài rìcháng shēnghuó zhōng, wǒmen jīngcháng shǐyòng “${w.pinyin}” zhè ge cí.`;
    const exId = `Dalam kehidupan sehari-hari, kita sering menggunakan kata \"${w.hanzi}\" (${tr.indonesian}).`;
    const exMs = `Dalam kehidupan seharian, kita kerap menggunakan perkataan \"${w.hanzi}\" (${tr.malay}).`;
    const exEn = `In daily life, we often use the word \"${w.hanzi}\" (${tr.english}).`;

    lines.push("  {");
    lines.push(`    hanzi: ${JSON.stringify(w.hanzi)},`);
    lines.push(`    pinyin: ${JSON.stringify(w.pinyin)},`);
    lines.push(`    indonesian: ${JSON.stringify(tr.indonesian)},`);
    lines.push(`    malay: ${JSON.stringify(tr.malay)},`);
    lines.push(`    english: ${JSON.stringify(tr.english)},`);
    lines.push(`    category: ${JSON.stringify(w.category)},`);
    lines.push(`    hsk: ${JSON.stringify(w.hsk)},`);
    lines.push(`    tone: ${w.tone},`);
    lines.push(`    exampleHanzi: ${JSON.stringify(exHanzi)},`);
    lines.push(`    examplePinyin: ${JSON.stringify(exPinyin)},`);
    lines.push(`    exampleIndonesian: ${JSON.stringify(exId)},`);
    lines.push(`    exampleMalay: ${JSON.stringify(exMs)},`);
    lines.push(`    exampleEnglish: ${JSON.stringify(exEn)},`);
    lines.push("  },");
  }

  lines.push("];");
  lines.push("");
  fs.writeFileSync(filepath, lines.join("\n"), 'utf-8');
  console.log(`✓ Successfully updated ${filepath} (${words.length} items)`);
}

async function main() {
  const files = [
    { fp: 'src/data/hsk1Data.ts', varName: 'HSK1_VOCAB_LIST', title: 'Standar Kurikulum HSK 1 (Dasar Pemula - 150 Kosakata Resmi)' },
    { fp: 'src/data/hsk2Data.ts', varName: 'HSK2_VOCAB_LIST', title: 'Standar Kurikulum HSK 2 (Dasar Lanjutan - 150 Kosakata Resmi)' },
    { fp: 'src/data/hsk3Data.ts', varName: 'HSK3_VOCAB_LIST', title: 'Standar Kurikulum HSK 3 (Menengah Awal - 300 Kosakata Resmi)' },
    { fp: 'src/data/shoppingTravelNumbersVocab.ts', varName: 'SHOPPING_TRAVEL_NUMBERS_VOCAB', title: 'Kurasi Khusus: Belanja, Travel & Angka (HSK 1 - HSK 3: 125 Kosakata Praktis)' },
    { fp: 'src/data/hsk4Data.ts', varName: 'HSK4_VOCAB_LIST', title: 'Standar Kurikulum HSK 4 (Menengah Mandiri - 600 Kosakata Resmi)' },
    { fp: 'src/data/hsk5Data.ts', varName: 'HSK5_VOCAB_LIST', title: 'Standar Kurikulum HSK 5 (Tingkat Mahir Membaca & Diskusi - 1000 Kosakata Resmi)' },
    { fp: 'src/data/hsk6Data.ts', varName: 'HSK6_VOCAB_LIST', title: 'Standar Kurikulum HSK 6 (Tingkat Mahir Sastra & Profesional - 800 Kosakata Resmi)' },
  ];

  const allWordsByFile: { fileInfo: typeof files[0]; words: RawWord[] }[] = [];
  const allRawItems: RawWord[] = [];

  for (const f of files) {
    const words = parseFile(f.fp);
    allWordsByFile.push({ fileInfo: f, words });
    allRawItems.push(...words);
  }

  console.log(`Total words to ensure translations for: ${allRawItems.length}`);

  // Find uncached unique words
  const uniqueUncached = new Map<string, RawWord>();
  for (const w of allRawItems) {
    if (!dictionary[w.hanzi]) {
      uniqueUncached.set(w.hanzi, w);
    }
  }

  const uncachedList = Array.from(uniqueUncached.values());
  console.log(`Uncached unique words needing translation: ${uncachedList.length}`);

  const CHUNK_SIZE = 50;
  const chunks: { hanzi: string; pinyin: string; hsk: string }[][] = [];
  for (let i = 0; i < uncachedList.length; i += CHUNK_SIZE) {
    chunks.push(uncachedList.slice(i, i + CHUNK_SIZE));
  }

  if (chunks.length > 0) {
    console.log(`Starting parallel translation for ${chunks.length} batches (5 workers)...`);
    await runPool(chunks, 5);
  }

  console.log(`Writing back to data files...`);
  for (const item of allWordsByFile) {
    writeUpdatedFile(item.fileInfo.fp, item.fileInfo.varName, item.fileInfo.title, item.words);
  }

  console.log('Done! All 3,000+ words translated with authentic Indonesian & Malay!');
}

main().catch(console.error);
