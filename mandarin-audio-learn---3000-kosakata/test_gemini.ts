import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
  const words = [
    { hanzi: "爱", pinyin: "ài" },
    { hanzi: "八", pinyin: "bā" },
    { hanzi: "爸爸", pinyin: "bà ba" },
    { hanzi: "杯子", pinyin: "bēi zi" },
    { hanzi: "阿姨", pinyin: "ā yí" },
    { hanzi: "矮", pinyin: "ǎi" },
    { hanzi: "安静", pinyin: "ān jìng" }
  ];

  const prompt = `You are an expert Mandarin-Indonesian-Malay lexicographer for HSK Chinese.
Translate these Chinese words into Indonesian (indonesian), Malay (malay), and English (english). Also provide natural, practical example sentences with pinyin and translations.

Input JSON:
${JSON.stringify(words, null, 2)}

Return a strict JSON array of objects with the exact keys:
- hanzi (string)
- pinyin (string)
- indonesian (string - authentic Indonesian meaning, clear, no English)
- malay (string - authentic Malay meaning, e.g. 'lapan', 'cawan', 'makcik', 'hospital', 'kereta')
- english (string - English meaning)
- exampleHanzi (string - natural Chinese sentence using this word)
- examplePinyin (string - pinyin of the sentence)
- exampleIndonesian (string - Indonesian translation of the sentence)
- exampleMalay (string - Malay translation of the sentence)
- exampleEnglish (string - English translation of the sentence)

Respond with ONLY raw JSON, no markdown formatting.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.7-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json'
    }
  });

  console.log("Result:", response.text);
}

test().catch(console.error);
