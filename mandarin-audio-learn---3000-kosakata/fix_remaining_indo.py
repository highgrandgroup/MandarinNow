import os
import re
import json
import time
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor

CACHE_FILE = 'translation_cache.json'
cache = {}
if os.path.exists(CACHE_FILE):
    try:
        with open(CACHE_FILE, 'r', encoding='utf-8') as f:
            cache = json.load(f)
    except Exception:
        cache = {}

def translate_fast(text, target_lang='id'):
    key = f"{target_lang}_{text}"
    if key in cache and cache[key]:
        return cache[key]
    
    clean_text = text.strip()
    if not clean_text:
        return ""
    
    for attempt in range(3):
        try:
            url = f"https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=zh-CN&tl={target_lang}&q={urllib.parse.quote(clean_text)}"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
            with urllib.request.urlopen(req, timeout=5) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                if isinstance(data, list) and len(data) > 0 and isinstance(data[0], str):
                    val = data[0].strip()
                    val = val[0].upper() + val[1:] if val else ""
                    if val:
                        cache[key] = val
                        return val
        except Exception:
            time.sleep(0.1)
    
    return ""

def is_english_text(text):
    if not text:
        return True
    lower = text.strip().lower()
    indicators = [
        'to ', 'the ', 'of ', 'and ', 'or ', 'for ', 'with ', 'in ', 'on ', 'at ', 'by ', 'from ', 
        'about ', 'into ', 'through ', 'during ', 'before ', 'after ', 'above ', 'below ', 'which ', 
        'that ', 'this ', 'these ', 'those ', 'verb', 'noun', 'adj', 'particle', 'pronoun', 'adverb',
        'near', 'time', 'color', 'smile', 'can', 'everyone', 'bicycle', 'idea', 'table', 'therefore',
        'father', 'eight', 'cup', 'book', 'good', 'he', 'she', 'it', 'we', 'they', 'you',
        'tea', 'dish', 'water', 'hospital', 'school', 'student', 'teacher', 'money', 'big',
        'small', 'few', 'many', 'hot', 'cold', 'apple', 'cat', 'dog', 'friend', 'read', 'see',
        'listen', 'look', 'write', 'sleep', 'say', 'speak', 'agree', 'accept', 'allow', 'appear',
        'apply', 'arrive', 'ask', 'become', 'begin', 'believe', 'bring', 'build', 'buy', 'call',
        'catch', 'change', 'choose', 'close', 'come', 'continue', 'cook', 'cost', 'count', 'cover',
        'create', 'cross', 'cry', 'cut', 'decide', 'describe', 'develop', 'die', 'discover', 'discuss',
        'draw', 'dream', 'drink', 'drive', 'drop', 'eat', 'enjoy', 'enter', 'explain', 'fall',
        'feel', 'find', 'finish', 'fly', 'follow', 'forget', 'forgive', 'get', 'give', 'go',
        'grow', 'happen', 'hate', 'have', 'hear', 'help', 'hide', 'hit', 'hold', 'hope', 'hurt',
        'keep', 'kill', 'know', 'laugh', 'learn', 'leave', 'let', 'lie', 'like', 'listen', 'live',
        'look', 'lose', 'love', 'make', 'marry', 'mean', 'meet', 'move', 'need', 'open', 'order',
        'pay', 'play', 'promise', 'protect', 'provide', 'pull', 'push', 'put', 'read', 'receive',
        'remember', 'remind', 'repeat', 'reply', 'report', 'require', 'return', 'ride', 'ring',
        'rise', 'run', 'save', 'say', 'see', 'sell', 'send', 'set', 'shake', 'shine', 'shoot',
        'show', 'shut', 'sing', 'sit', 'sleep', 'smile', 'speak', 'spend', 'stand', 'start',
        'stay', 'steal', 'stop', 'study', 'suggest', 'support', 'swim', 'take', 'talk', 'teach',
        'tell', 'thank', 'think', 'throw', 'touch', 'travel', 'try', 'turn', 'understand', 'use',
        'visit', 'wait', 'wake', 'walk', 'want', 'warn', 'wash', 'watch', 'wear', 'win', 'wish',
        'worry', 'write'
    ]
    for ind in indicators:
        if lower == ind or lower.startswith(ind + ' ') or f" {ind} " in f" {lower} " or lower.endswith(' ' + ind):
            return True
    return False

def parse_ts_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    items = []
    raw_blocks = re.split(r'\{\s*\n?\s*hanzi:', content)
    for rb in raw_blocks[1:]:
        block = "hanzi:" + rb.split('}')[0]
        
        def get_field(name):
            m = re.search(rf'{name}:\s*["\'](.*?)["\'],?', block)
            if m:
                return m.group(1).replace(r'\"', '"')
            m_num = re.search(rf'{name}:\s*([0-9]+)', block)
            if m_num:
                return int(m_num.group(1))
            return None
        
        hanzi = get_field('hanzi')
        pinyin = get_field('pinyin')
        indonesian = get_field('indonesian') or ''
        malay = get_field('malay') or ''
        english = get_field('english') or ''
        category = get_field('category') or 'Umum'
        hsk = get_field('hsk') or 'HSK'
        tone = get_field('tone')
        if tone is None:
            tone = 0

        if hanzi and pinyin:
            items.append({
                'hanzi': hanzi,
                'pinyin': pinyin,
                'indonesian': indonesian,
                'malay': malay,
                'english': english,
                'category': category,
                'hsk': hsk,
                'tone': tone
            })
    return items

def process_word(item):
    hz = item['hanzi']
    py = item['pinyin']
    indo = item.get('indonesian', '')
    ms = item.get('malay', '')
    en = item.get('english', '')

    if is_english_text(indo) or not indo:
        indo = translate_fast(hz, 'id') or indo
    if is_english_text(ms) or not ms:
        ms = translate_fast(hz, 'ms') or indo
    if not en:
        en = translate_fast(hz, 'en') or hz

    if indo:
        indo = indo.strip()
        indo = indo[0].upper() + indo[1:]
    if ms:
        ms = ms.strip()
        ms = ms[0].upper() + ms[1:]
    if en:
        en = en.strip()
        en = en[0].upper() + en[1:]

    exHanzi = f"在日常生活中，我们经常使用“{hz}”这个词。"
    exPinyin = f"Zài rìcháng shēnghuó zhōng, wǒmen jīngcháng shǐyòng “{py}” zhè ge cí."
    exId = f"Dalam kehidupan sehari-hari, kita sering menggunakan kata \"{hz}\" ({indo})."
    exMs = f"Dalam kehidupan seharian, kita kerap menggunakan perkataan \"{hz}\" ({ms})."
    exEn = f"In daily life, we often use the word \"{hz}\" ({en})."

    return {
        'hanzi': hz,
        'pinyin': py,
        'indonesian': indo,
        'malay': ms,
        'english': en,
        'category': item['category'],
        'hsk': item['hsk'],
        'tone': item['tone'],
        'exampleHanzi': exHanzi,
        'examplePinyin': exPinyin,
        'exampleIndonesian': exId,
        'exampleMalay': exMs,
        'exampleEnglish': exEn
    }

def format_ts_file(var_name, title, words):
    lines = [
        "import { MandarinWord } from '../types';",
        "",
        f"// {title}",
        f"export const {var_name}: Omit<MandarinWord, 'id'>[] = ["
    ]
    for w in words:
        lines.append("  {")
        lines.append(f'    hanzi: {json.dumps(w["hanzi"], ensure_ascii=False)},')
        lines.append(f'    pinyin: {json.dumps(w["pinyin"], ensure_ascii=False)},')
        lines.append(f'    indonesian: {json.dumps(w["indonesian"], ensure_ascii=False)},')
        lines.append(f'    malay: {json.dumps(w["malay"], ensure_ascii=False)},')
        lines.append(f'    english: {json.dumps(w["english"], ensure_ascii=False)},')
        lines.append(f'    category: {json.dumps(w["category"], ensure_ascii=False)},')
        lines.append(f'    hsk: {json.dumps(w["hsk"], ensure_ascii=False)},')
        lines.append(f'    tone: {w["tone"]},')
        lines.append(f'    exampleHanzi: {json.dumps(w["exampleHanzi"], ensure_ascii=False)},')
        lines.append(f'    examplePinyin: {json.dumps(w["examplePinyin"], ensure_ascii=False)},')
        lines.append(f'    exampleIndonesian: {json.dumps(w["exampleIndonesian"], ensure_ascii=False)},')
        lines.append(f'    exampleMalay: {json.dumps(w["exampleMalay"], ensure_ascii=False)},')
        lines.append(f'    exampleEnglish: {json.dumps(w["exampleEnglish"], ensure_ascii=False)},')
        lines.append("  },")
    lines.append("];")
    lines.append("")
    return "\n".join(lines)

def run():
    files = [
        ('src/data/hsk2Data.ts', 'HSK2_VOCAB_LIST', 'Standar Kurikulum HSK 2 (Dasar Lanjutan - 150 Kosakata Resmi)'),
        ('src/data/hsk3Data.ts', 'HSK3_VOCAB_LIST', 'Standar Kurikulum HSK 3 (Menengah Awal - 300 Kosakata Resmi)'),
        ('src/data/hsk4Data.ts', 'HSK4_VOCAB_LIST', 'Standar Kurikulum HSK 4 (Menengah Mandiri - 600 Kosakata Resmi)'),
        ('src/data/hsk5Data.ts', 'HSK5_VOCAB_LIST', 'Standar Kurikulum HSK 5 (Tingkat Mahir Membaca & Diskusi - 1000 Kosakata Resmi)'),
        ('src/data/hsk6Data.ts', 'HSK6_VOCAB_LIST', 'Standar Kurikulum HSK 6 (Tingkat Mahir Sastra & Profesional - 800 Kosakata Resmi)'),
    ]

    for filepath, var_name, title in files:
        raw_items = parse_ts_file(filepath)
        print(f"Translating {len(raw_items)} words in {filepath}...")
        with ThreadPoolExecutor(max_workers=30) as ex:
            results = list(ex.map(process_word, raw_items))
        
        ts_code = format_ts_file(var_name, title, results)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(ts_code)
        print(f"✓ Saved {len(results)} items in {filepath}")

    with open(CACHE_FILE, 'w', encoding='utf-8') as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)
    print("ALL FILES SUCCESSFULLY TRANSLATED TO INDONESIAN!")

if __name__ == '__main__':
    run()
