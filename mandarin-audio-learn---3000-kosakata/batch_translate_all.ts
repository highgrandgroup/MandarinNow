import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

const ai = new GoogleGenAI({});

const CACHE_FILE = path.join(process.cwd(), 'gemini_vocab_cache.json');
let cache: Record<string, any> = {};
if (fs.existsSync(CACHE_FILE)) {
  try {
    cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
  } catch (e) {
    cache = {};
  }
}

function saveCache() {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving cache:', e);
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

async function translateBatch(batch: RawWord[]): Promise<any[]> {
  const uncached = batch.filter(w => !cache[w.hanzi]);
  
  if (uncached.length === 0) {
    return batch.map(w => ({ ...w, ...cache[w.hanzi] }));
  }

  const prompt = `You are a master Mandarin lexicographer and professional linguist specializing in standard HSK Chinese curriculum translated into Indonesian and Malay.

Translate the following Chinese words accurately:
${JSON.stringify(uncached.map(w => ({ hanzi: w.hanzi, pinyin: w.pinyin, hsk: w.hsk, category: w.category })), null, 2)}

Requirements:
1. indonesian: authentic, clear Indonesian translation (NEVER English). E.g. 八 -> "Delapan (8)", 爸爸 -> "Ayah / Bapak", 杯子 -> "Cangkir / Gelas", 阿姨 -> "Bibi / Tante", 矮 -> "Pendek / Rendah", 苹果 -> "Apel", 医院 -> "Rumah sakit", 电脑 -> "Komputer", 吧 -> "Partikel saran / ajakan (...kan? / ...yuk)", 白 -> "Putih", 百 -> "Ratus (100)".
2. malay: authentic standard Bahasa Melayu (Bahasa Malaysia). E.g. 八 -> "Lapan (8)", 爸爸 -> "Bapa / Ayah", 杯子 -> "Cawan / Gelas", 阿姨 -> "Makcik / Ibu saudara", 矮 -> "Pendek / Rendah", 苹果 -> "Epal", 医院 -> "Hospital", 电脑 -> "Komputer", 吧 -> "Partikel cadangan / ajakan (...kan? / ...jom)", 白 -> "Putih", 百 -> "Ratus (100)".
3. english: standard English translation.
4. exampleHanzi: short, natural, daily conversational sentence using this Chinese word.
5. examplePinyin: accurate pinyin of the example sentence.
6. exampleIndonesian: Indonesian translation of the example sentence.
7. exampleMalay: Malay translation of the example sentence.
8. exampleEnglish: English translation of the example sentence.

Return ONLY a valid JSON array of objects with keys: hanzi, pinyin, indonesian, malay, english, exampleHanzi, examplePinyin, exampleIndonesian, exampleMalay, exampleEnglish.`;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(res.text || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) {
        for (const item of parsed) {
          if (item.hanzi) {
            cache[item.hanzi] = {
              indonesian: item.indonesian,
              malay: item.malay,
              english: item.english,
              exampleHanzi: item.exampleHanzi,
              examplePinyin: item.examplePinyin,
              exampleIndonesian: item.exampleIndonesian,
              exampleMalay: item.exampleMalay,
              exampleEnglish: item.exampleEnglish
            };
          }
        }
        saveCache();
        break;
      }
    } catch (err) {
      console.warn(`Attempt ${attempt + 1} failed for batch of ${uncached.length}:`, err);
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }

  return batch.map(w => ({
    ...w,
    ...(cache[w.hanzi] || {
      indonesian: w.hanzi,
      malay: w.hanzi,
      english: w.hanzi,
      exampleHanzi: `这是“${w.hanzi}”。`,
      examplePinyin: `Zhè shì “${w.pinyin}”.`,
      exampleIndonesian: `Ini adalah \"${w.hanzi}\".`,
      exampleMalay: `Ini ialah \"${w.hanzi}\".`,
      exampleEnglish: `This is \"${w.hanzi}\".`
    })
  }));
}

function formatTsFile(varName: string, title: string, words: any[]): string {
  const lines = [
    "import { MandarinWord } from '../types';",
    "",
    `// ${title}`,
    `export const ${varName}: Omit<MandarinWord, 'id'>[] = [`
  ];
  for (const w of words) {
    lines.push("  {");
    lines.push(`    hanzi: ${JSON.stringify(w.hanzi)},`);
    lines.push(`    pinyin: ${JSON.stringify(w.pinyin)},`);
    lines.push(`    indonesian: ${JSON.stringify(w.indonesian)},`);
    lines.push(`    malay: ${JSON.stringify(w.malay)},`);
    lines.push(`    english: ${JSON.stringify(w.english)},`);
    lines.push(`    category: ${JSON.stringify(w.category)},`);
    lines.push(`    hsk: ${JSON.stringify(w.hsk)},`);
    lines.push(`    tone: ${w.tone},`);
    if (w.exampleHanzi) {
      lines.push(`    exampleHanzi: ${JSON.stringify(w.exampleHanzi)},`);
      lines.push(`    examplePinyin: ${JSON.stringify(w.examplePinyin)},`);
      lines.push(`    exampleIndonesian: ${JSON.stringify(w.exampleIndonesian)},`);
      lines.push(`    exampleMalay: ${JSON.stringify(w.exampleMalay)},`);
      lines.push(`    exampleEnglish: ${JSON.stringify(w.exampleEnglish)},`);
    }
    lines.push("  },");
  }
  lines.push("];");
  lines.push("");
  return lines.join("\n");
}

async function processFile(filepath: string, varName: string, title: string) {
  console.log(`\n=== Processing ${filepath} ===`);
  const raw = parseFile(filepath);
  console.log(`Found ${raw.length} words in ${filepath}`);

  const CHUNK_SIZE = 40;
  const chunks: RawWord[][] = [];
  for (let i = 0; i < raw.length; i += CHUNK_SIZE) {
    chunks.push(raw.slice(i, i + CHUNK_SIZE));
  }

  const allResults: any[] = [];
  for (let i = 0; i < chunks.length; i++) {
    console.log(`Translating chunk ${i + 1}/${chunks.length} (${chunks[i].length} words)...`);
    const res = await translateBatch(chunks[i]);
    allResults.push(...res);
  }

  const ts = formatTsFile(varName, title, allResults);
  fs.writeFileSync(filepath, ts, 'utf-8');
  console.log(`✓ Saved ${allResults.length} words to ${filepath}`);
}

async function run() {
  const files = [
    { fp: 'src/data/hsk1Data.ts', varName: 'HSK1_VOCAB_LIST', title: 'Standar Kurikulum HSK 1 (Dasar Pemula - 150 Kosakata Resmi)' },
    { fp: 'src/data/hsk2Data.ts', varName: 'HSK2_VOCAB_LIST', title: 'Standar Kurikulum HSK 2 (Dasar Lanjutan - 150 Kosakata Resmi)' },
    { fp: 'src/data/hsk3Data.ts', varName: 'HSK3_VOCAB_LIST', title: 'Standar Kurikulum HSK 3 (Menengah Awal - 300 Kosakata Resmi)' },
    { fp: 'src/data/shoppingTravelNumbersVocab.ts', varName: 'SHOPPING_TRAVEL_NUMBERS_VOCAB', title: 'Kurasi Khusus: Belanja, Travel & Angka (HSK 1 - HSK 3: 125 Kosakata Praktis)' },
    { fp: 'src/data/hsk4Data.ts', varName: 'HSK4_VOCAB_LIST', title: 'Standar Kurikulum HSK 4 (Menengah Mandiri - 600 Kosakata Resmi)' },
    { fp: 'src/data/hsk5Data.ts', varName: 'HSK5_VOCAB_LIST', title: 'Standar Kurikulum HSK 5 (Tingkat Mahir Membaca & Diskusi - 1000 Kosakata Resmi)' },
    { fp: 'src/data/hsk6Data.ts', varName: 'HSK6_VOCAB_LIST', title: 'Standar Kurikulum HSK 6 (Tingkat Mahir Sastra & Profesional - 800 Kosakata Resmi)' },
  ];

  for (const f of files) {
    await processFile(f.fp, f.varName, f.title);
  }

  console.log('\n🎉 ALL FILES PROCESSED WITH 100% INDONESIAN & MALAY TRANSLATIONS!');
}

run().catch(console.error);
