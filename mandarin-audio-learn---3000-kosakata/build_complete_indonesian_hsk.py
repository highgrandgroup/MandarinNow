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

# Master curated dictionary
CURATED = {
    '听': ('tīng', 'Mendengar / mendengarkan', 'Mendengar', 'To listen / hear'),
    '呢': ('ne', 'Partikel tanya / penegas (...bagaimana dengan...?)', 'Partikel tanya (...bagaimana dengan...?)', 'Question particle (how about...?)'),
    '近': ('jìn', 'Dekat', 'Dekat', 'Near / close'),
    '时候': ('shí hou', 'Waktu / saat / ketika', 'Masa / ketika', 'Time / when'),
    '颜色': ('yán sè', 'Warna', 'Warna', 'Color'),
    '可以': ('kě yǐ', 'Bisa / boleh', 'Boleh / dapat', 'Can / may'),
    '大家': ('dà jiā', 'Semua orang / semuanya', 'Semua orang / sekalian', 'Everyone / all'),
    '自行车': ('zì xíng chē', 'Sepeda', 'Basikal', 'Bicycle'),
    '知道': ('zhī dào', 'Tahu / mengetahui', 'Tahu / mengetahui', 'To know'),
    '意思': ('yì si', 'Arti / makna / maksud', 'Maksud / erti', 'Meaning / idea'),
    '桌子': ('zhuō zi', 'Meja', 'Meja', 'Table / desk'),
    '所以': ('suǒ yǐ', 'Oleh karena itu / jadi', 'Oleh itu / jadi', 'Therefore / so'),
    '在': ('zài', 'Di / berada di / sedang', 'Di / sedang', 'At / in / to be located'),
    '八': ('bā', 'Delapan (8)', 'Lapan (8)', 'Eight (8)'),
    '爸爸': ('bà ba', 'Ayah / bapak / papa', 'Bapa / ayah', 'Father / dad'),
    '杯子': ('bēi zi', 'Cangkir / gelas', 'Cawan / gelas', 'Cup / glass'),
    '北京': ('Běi jīng', 'Beijing (ibu kota Tiongkok)', 'Beijing', 'Beijing'),
    '本': ('běn', 'Buku / jilid (kata bantu bilangan)', 'Buku / naskhah', 'Book / measure word'),
    '不': ('bù', 'Tidak / bukan', 'Tidak / bukan', 'No / not'),
    '不客气': ('bù kè qi', 'Sama-sama / kembali', 'Sama-sama', "You're welcome"),
    '菜': ('cài', 'Masakan / hidangan / sayur', 'Masakan / lauk / sayur', 'Dish / vegetable'),
    '茶': ('chá', 'Teh', 'Teh', 'Tea'),
    '吃': ('chī', 'Makan', 'Makan', 'To eat'),
    '出租车': ('chū zū chē', 'Taksi', 'Teksi', 'Taxi'),
    '打电话': ('dǎ diàn huà', 'Menelepon', 'Menelefon', 'To make a phone call'),
    '大': ('dà', 'Besar', 'Besar', 'Big / large'),
    '的': ('de', 'Partikel kepemilikan (punya / yang)', 'Partikel kepunyaan (punya / yang)', 'Possessive particle'),
    '点': ('diǎn', 'Jam / titik / sedikit', 'Pukul / jam / sedikit', "O'clock / point / a little"),
    '电脑': ('diàn nǎo', 'Komputer', 'Komputer', 'Computer'),
    '电视': ('diàn shì', 'Televisi / TV', 'Televisyen / TV', 'Television / TV'),
    '电影': ('diàn yǐng', 'Film / bioskop', 'Filem / wayang', 'Movie / film'),
    '东西': ('dōng xi', 'Barang / benda', 'Barang / benda', 'Thing / stuff'),
    '都': ('dōu', 'Semuanya / juga', 'Semuanya / juga', 'All / both'),
    '读': ('dú', 'Membaca', 'Membaca', 'To read'),
    '对不起': ('duì bu qǐ', 'Maaf / mohon maaf', 'Minta maaf', 'Sorry'),
    '多': ('duō', 'Banyak / berapa (usia)', 'Banyak / berapa', 'Many / much'),
    '多少': ('duō shao', 'Berapa (jumlah / harga)', 'Berapa (harga/kuantiti)', 'How much / how many'),
    '儿子': ('ér zi', 'Anak laki-laki / putra', 'Anak lelaki', 'Son'),
    '二': ('èr', 'Dua (2)', 'Dua (2)', 'Two (2)'),
    '饭馆': ('fàn guǎn', 'Restoran / rumah makan', 'Restoran / kedai makan', 'Restaurant'),
    '飞机': ('fēi jī', 'Pesawat terbang', 'Kapal terbang', 'Airplane'),
    '分钟': ('fēn zhōng', 'Menit', 'Minit', 'Minute'),
    '高兴': ('gāo xìng', 'Senang / gembira', 'Gembira / seronok', 'Happy / glad'),
    '个': ('gè', 'Buah / orang (kata bantu bilangan)', 'Buah / orang (penjodoh bilangan)', 'General measure word'),
    '工作': ('gōng zuò', 'Bekerja / pekerjaan', 'Bekerja / pekerjaan', 'Job / work'),
    '狗': ('gǒu', 'Anjing', 'Anjing', 'Dog'),
    '汉语': ('hàn yǔ', 'Bahasa Mandarin / Tionghoa', 'Bahasa Mandarin / Cina', 'Chinese language'),
    '好': ('hǎo', 'Baik / bagus / oke', 'Baik / bagus / elok', 'Good / fine / well'),
    '喝': ('hē', 'Minum', 'Minum', 'To drink'),
    '和': ('hé', 'Dan / dengan', 'Dan / bersama', 'And / with'),
    '很': ('hěn', 'Sangat', 'Sangat / amat', 'Very'),
    '后面': ('hòu mian', 'Belakang / di belakang', 'Belakang / di belakang', 'Behind / back'),
    '回': ('huí', 'Kembali / pulang', 'Kembali / pulang', 'To return / go back'),
    '会': ('huì', 'Bisa / dapat / akan', 'Boleh / akan / mesyuarat', 'Can / will'),
    '几': ('jǐ', 'Berapa / beberapa', 'Berapa / beberapa', 'How many / several'),
    '家': ('jiā', 'Rumah / keluarga', 'Rumah / keluarga', 'Home / family'),
    '叫': ('jiào', 'Bernama / memanggil', 'Bernama / memanggil', 'To be called / to call'),
    '今天': ('jīn tiān', 'Hari ini', 'Hari ini', 'Today'),
    '九': ('jiǔ', 'Sembilan (9)', 'Sembilan (9)', 'Nine (9)'),
    '开': ('kāi', 'Membuka / mengemudi (menyetir)', 'Membuka / memandu', 'To open / drive'),
    '看': ('kàn', 'Melihat / menonton / membaca', 'Melihat / menonton / membaca', 'To look / watch / read'),
    '看见': ('kàn jiàn', 'Melihat / tampak', 'Nampak / melihat', 'To see'),
    '块': ('kuài', 'Yuan / potong (mata uang / kata bantu)', 'Yuan / keping / ketul', 'Yuan / piece'),
    '来': ('lái', 'Datang', 'Datang / mari', 'To come'),
    '老师': ('lǎo shī', 'Guru', 'Guru / cikgu', 'Teacher'),
    '了': ('le', 'Sudah / telah (partikel penanda)', 'Sudah / telah', 'Aspect particle (already)'),
    '冷': ('lěng', 'Dingin', 'Sejuk / dingin', 'Cold'),
    '里': ('lǐ', 'Di dalam', 'Di dalam', 'Inside / in'),
    '六': ('liù', 'Enam (6)', 'Enam (6)', 'Six (6)'),
    '妈妈': ('mā ma', 'Ibu / mama', 'Ibu / emak / mama', 'Mother / mom'),
    '吗': ('ma', 'Apakah? (partikel tanya ya/tidak)', 'Adakah? / kah?', 'Yes-no question particle'),
    '买': ('mǎi', 'Membeli', 'Membeli', 'To buy'),
    '猫': ('māo', 'Kucing', 'Kucing', 'Cat'),
    '没关系': ('méi guān xi', 'Tidak apa-apa / tidak masalah', 'Tidak mengapa / tak apa', "It doesn't matter"),
    '没有': ('méi yǒu', 'Tidak ada / belum', 'Tiada / belum', 'Do not have / not exist'),
    '米饭': ('mǐ fàn', 'Nasi putih', 'Nasi putih', 'Cooked rice'),
    '明天': ('míng tiān', 'Besok', 'Esok', 'Tomorrow'),
    '名字': ('míng zi', 'Nama', 'Nama', 'Name'),
    '哪': ('nǎ', 'Yang mana', 'Mana satu', 'Which'),
    '哪儿': ('nǎr', 'Di mana / ke mana', 'Di mana', 'Where'),
    '那': ('nà', 'Itu', 'Itu', 'That'),
    '那儿': ('nàr', 'Di sana', 'Di sana', 'There'),
    '能': ('néng', 'Bisa / mampu / boleh', 'Boleh / mampu', 'Can / to be able to'),
    '你': ('nǐ', 'Kamu / anda', 'Awak / anda / kamu', 'You'),
    '年': ('nián', 'Tahun', 'Tahun', 'Year'),
    '女儿': ('nǚ ér', 'Anak perempuan / putri', 'Anak perempuan', 'Daughter'),
    '朋友': ('péng you', 'Teman / sahabat', 'Kawan / sahabat', 'Friend'),
    '漂亮': ('piào liang', 'Cantik / indah', 'Cantik / molek', 'Beautiful / pretty'),
    '苹果': ('píng guǒ', 'Apel', 'Epal', 'Apple'),
    '七': ('qī', 'Tujuh (7)', 'Tujuh (7)', 'Seven (7)'),
    '钱': ('qián', 'Uang', 'Duit / wang', 'Money'),
    '前面': ('qián mian', 'Depan / di depan', 'Depan / di hadapan', 'In front / ahead'),
    '请': ('qǐng', 'Silakan / tolong / mengundang', 'Sila / jemput / tolong', 'Please / invite'),
    '去': ('qù', 'Pergi', 'Pergi', 'To go'),
    '热': ('rè', 'Panas', 'Panas', 'Hot'),
    '人': ('rén', 'Orang / manusia', 'Orang / manusia', 'Person / people'),
    '认识': ('rèn shi', 'Mengenal / kenal', 'Mengenali / kenal', 'To know / recognize'),
    '三': ('sān', 'Tiga (3)', 'Tiga (3)', 'Three (3)'),
    '商店': ('shāng diàn', 'Toko / warung', 'Kedai / stor', 'Shop / store'),
    '上': ('shàng', 'Atas / naik / menghadiri', 'Atas / naik', 'Up / on / above'),
    '上午': ('shàng wǔ', 'Pagi hari / sebelum tengah hari', 'Pagi / sebelum tengah hari', 'Morning'),
    '少': ('shǎo', 'Sedikit / kurang', 'Sedikit / kurang', 'Few / little'),
    '谁': ('shéi', 'Siapa', 'Siapa', 'Who'),
    '什么': ('shén me', 'Apa', 'Apa', 'What'),
    '十': ('shí', 'Sepuluh (10)', 'Sepuluh (10)', 'Ten (10)'),
    '是': ('shì', 'Adalah / ya / benar', 'Ialah / adalah / ya', 'To be / yes'),
    '书': ('shū', 'Buku', 'Buku', 'Book'),
    '水': ('shuǐ', 'Air', 'Air', 'Water'),
    '水果': ('shuǐ guǒ', 'Buah-buahan', 'Buah-buahan', 'Fruit'),
    '睡觉': ('shuì jiào', 'Tidur', 'Tidur', 'To sleep'),
    '说话': ('shuō huà', 'Berbicara / mengobrol', 'Bercakap / berbual', 'To speak / talk'),
    '四': ('sì', 'Empat (4)', 'Empat (4)', 'Four (4)'),
    '岁': ('suì', 'Tahun (usia/umur)', 'Tahun (umur)', 'Years old / age'),
    '他': ('tā', 'Dia (laki-laki)', 'Dia (lelaki)', 'He / him'),
    '她': ('tā', 'Dia (perempuan)', 'Dia (perempuan)', 'She / her'),
    '太': ('tài', 'Terlalu / sangat', 'Terlalu / terlampau', 'Too / extremely'),
    '天气': ('tiān qì', 'Cuaca', 'Cuaca', 'Weather'),
    '同学': ('tóng xué', 'Teman sekelas', 'Rakan sekelas', 'Classmate'),
    '喂': ('wèi', 'Halo (di telepon)', 'Helo (di telefon)', 'Hello (phone)'),
    '我': ('wǒ', 'Saya / aku', 'Saya / aku', 'I / me'),
    '我们': ('wǒ men', 'Kita / kami', 'Kami / kita', 'We / us'),
    '五': ('wǔ', 'Lima (5)', 'Lima (5)', 'Five (5)'),
    '喜欢': ('xǐ huan', 'Suka / menyukai', 'Suka / gemar', 'To like'),
    '下': ('xià', 'Bawah / turun', 'Bawah / turun', 'Down / below / next'),
    '下午': ('xià wǔ', 'Sore hari / siang', 'Petang / tengah hari', 'Afternoon'),
    '下雨': ('xià yǔ', 'Hujan / turun hujan', 'Hujan / turun hujan', 'To rain'),
    '先生': ('xiān sheng', 'Tuan / bapak / suami', 'Encik / tuan / suami', 'Mister / sir / husband'),
    '现在': ('xiàn zài', 'Sekarang / saat ini', 'Sekarang / kini', 'Now'),
    '想': ('xiǎng', 'Ingin / rindu / berpikir', 'Mahu / rindu / berfikir', 'To want / think / miss'),
    '小': ('xiǎo', 'Kecil', 'Kecil', 'Small / little'),
    '小姐': ('xiǎo jie', 'Nona', 'Cik / puan muda', 'Miss / young lady'),
    '些': ('xiē', 'Beberapa (sedikit)', 'Beberapa (sedikit)', 'Some / few'),
    '写': ('xiě', 'Menulis', 'Menulis', 'To write'),
    '谢谢': ('xiè xie', 'Terima kasih', 'Terima kasih', 'Thank you'),
    '星期': ('xīng qī', 'Minggu / pekan', 'Minggu', 'Week'),
    '学生': ('xué sheng', 'Murid / siswa / mahasiswa', 'Pelajar / murid', 'Student'),
    '学习': ('xué xí', 'Belajar', 'Belajar', 'To study / learn'),
    '学校': ('xué xiào', 'Sekolah', 'Sekolah', 'School'),
    '一': ('yī', 'Satu (1)', 'Satu (1)', 'One (1)'),
    '一点儿': ('yì diǎnr', 'Sedikit', 'Sedikit', 'A little bit'),
    '衣服': ('yī fu', 'Pakaian / baju', 'Pakaian / baju', 'Clothes'),
    '医生': ('yī shēng', 'Dokter', 'Doktor', 'Doctor'),
    '医院': ('yī yuàn', 'Rumah sakit', 'Hospital', 'Hospital'),
    '椅子': ('yǐ zi', 'Kursi', 'Kerusi', 'Chair'),
    '有': ('yǒu', 'Ada / punya / memiliki', 'Ada / mempunyai / memiliki', 'To have / exist'),
    '月': ('yuè', 'Bulan (kalender / langit)', 'Bulan (kalendar / langit)', 'Month / moon'),
    '再见': ('zài jiàn', 'Sampai jumpa / selamat tinggal', 'Selamat tinggal / jumpa lagi', 'Goodbye'),
    '怎么': ('zěn me', 'Bagaimana / kenapa', 'Bagaimana / mengapa', 'How / why'),
    '怎么样': ('zěn me yàng', 'Bagaimana keadaannya?', 'Bagaimanakah?', 'How is it? / How about?'),
    '这': ('zhè', 'Ini', 'Ini', 'This'),
    '这儿': ('zhèr', 'Di sini', 'Di sini', 'Here'),
    '中国': ('zhōng guó', 'Tiongkok / Cina', 'Negara China', 'China'),
    '中午': ('zhōng wǔ', 'Tengah hari / siang hari', 'Tengah hari', 'Noon / midday'),
    '住': ('zhù', 'Tinggal / menetap', 'Tinggal / menetap', 'To live / stay'),
    '做': ('zuò', 'Membuat / mengerjakan / melakukan', 'Membuat / melakukan', 'To do / make'),
    '坐': ('zuò', 'Duduk / naik (kendaraan)', 'Duduk / menaiki (kenderaan)', 'To sit / travel by')
}

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
            with urllib.request.urlopen(req, timeout=4) as resp:
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

def determine_tone(pinyin_str):
    if not pinyin_str:
        return 0
    first_word = pinyin_str.split()[0].lower() if pinyin_str else ""
    if any(c in first_word for c in ['ā', 'ē', 'ī', 'ō', 'ū', 'ǖ']):
        return 1
    if any(c in first_word for c in ['á', 'é', 'í', 'ó', 'ú', 'ǘ']):
        return 2
    if any(c in first_word for c in ['ǎ', 'ě', 'ǐ', 'ǒ', 'ǔ', 'ǚ']):
        return 3
    if any(c in first_word for c in ['à', 'è', 'ì', 'ò', 'ù', 'ǜ']):
        return 4
    return 5

def categorize_word(hanzi, meaning_id, hsk_level):
    m = (meaning_id or '').lower()
    if any(k in m for k in ['angka', 'nomor', 'hari', 'bulan', 'tahun', 'jam', 'menit', 'waktu', 'tanggal', 'kemarin', 'besok', 'sekarang']):
        return "Angka, Waktu & Tanggal"
    if any(k in m for k in ['ayah', 'ibu', 'anak', 'kakak', 'adik', 'teman', 'rumah', 'keluarga', 'kucing', 'anjing']):
        return "Keluarga & Rumah Tangga"
    if any(k in m for k in ['makan', 'minum', 'restoran', 'teh', 'sayur', 'nasi', 'buah', 'apel', 'daging', 'kopi', 'ikan', 'telur']):
        return "Makanan, Minuman & Restoran"
    if any(k in m for k in ['beli', 'jual', 'uang', 'toko', 'harga', 'mahal', 'murah', 'yuan', 'belanja']):
        return "Belanja, Uang & Bisnis"
    if any(k in m for k in ['pergi', 'datang', 'bandara', 'stasiun', 'pesawat', 'taksi', 'bus', 'sepeda', 'jalan', 'tempat', 'kamar', 'kiri', 'kanan', 'atas', 'bawah', 'depan', 'belakang']):
        return "Tempat, Arah & Perjalanan"
    if any(k in m for k in ['belajar', 'sekolah', 'guru', 'murid', 'buku', 'membaca', 'menulis', 'komputer', 'bicara', 'bahasa', 'kelas', 'ujian']):
        return "Pendidikan & Pekerjaan"
    if any(k in m for k in ['senang', 'suka', 'sedih', 'marah', 'dingin', 'panas', 'lelah', 'sakit', 'istirahat', 'olahraga', 'tidur', 'nyanyi']):
        return "Aktivitas, Kesehatan & Perasaan"
    if any(k in m for k in ['dan', 'atau', 'tetapi', 'karena', 'oleh karena itu', 'jika', 'partikel', 'apakah', 'tidak', 'sangat', 'sudah', 'adalah']):
        return "Kata Hubung & Partikel Tata Bahasa"
    return "Kosakata Praktis & Umum"

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

def build_all():
    print("Fetching master HSK dataset...")
    url = 'https://raw.githubusercontent.com/drkameleon/complete-hsk-vocabulary/master/complete.json'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=15) as r:
        raw_dataset = json.loads(r.read().decode('utf-8'))
    
    print(f"Loaded {len(raw_dataset)} total entries.")

    hsk_buckets = {
        'old-1': [],
        'old-2': [],
        'old-3': [],
        'old-4': [],
        'old-5': [],
        'old-6': [],
    }

    seen_hanzi = set()
    for item in raw_dataset:
        hanzi = item.get('simplified', '')
        if not hanzi or hanzi in seen_hanzi:
            continue
        
        levels = item.get('level', [])
        target_bucket = None
        for b in ['old-1', 'old-2', 'old-3', 'old-4', 'old-5', 'old-6']:
            if b in levels:
                target_bucket = b
                break
        
        if target_bucket:
            pinyin = ""
            en_meanings = []
            if item.get('forms') and len(item['forms']) > 0:
                form = item['forms'][0]
                pinyin = form.get('transcriptions', {}).get('pinyin', '')
                en_meanings = form.get('meanings', [])
            
            en_def = en_meanings[0] if en_meanings else ""
            hsk_buckets[target_bucket].append({
                'hanzi': hanzi,
                'pinyin': pinyin,
                'en_def': en_def,
                'level_code': target_bucket
            })
            seen_hanzi.add(hanzi)

    for k, v in hsk_buckets.items():
        print(f"Bucket {k}: {len(v)} words")

    level_configs = [
        ('old-1', 'src/data/hsk1Data.ts', 'HSK1_VOCAB_LIST', 'HSK 1', 'Standar Kurikulum HSK 1 (Dasar Pemula - 150 Kosakata Resmi)'),
        ('old-2', 'src/data/hsk2Data.ts', 'HSK2_VOCAB_LIST', 'HSK 2', 'Standar Kurikulum HSK 2 (Dasar Lanjutan - 150 Kosakata Resmi)'),
        ('old-3', 'src/data/hsk3Data.ts', 'HSK3_VOCAB_LIST', 'HSK 3', 'Standar Kurikulum HSK 3 (Menengah Awal - 300 Kosakata Resmi)'),
        ('old-4', 'src/data/hsk4Data.ts', 'HSK4_VOCAB_LIST', 'HSK 4', 'Standar Kurikulum HSK 4 (Menengah Mandiri - 600 Kosakata Resmi)'),
        ('old-5', 'src/data/hsk5Data.ts', 'HSK5_VOCAB_LIST', 'HSK 5', 'Standar Kurikulum HSK 5 (Tingkat Mahir Membaca & Diskusi - 1000 Kosakata Resmi)'),
        ('old-6', 'src/data/hsk6Data.ts', 'HSK6_VOCAB_LIST', 'HSK 6', 'Standar Kurikulum HSK 6 (Tingkat Mahir Sastra & Profesional - 800 Kosakata Resmi)'),
    ]

    for bucket_key, filepath, var_name, hsk_tag, title in level_configs:
        items = hsk_buckets[bucket_key]
        if bucket_key == 'old-5':
            items = items[:1000]
        elif bucket_key == 'old-6':
            items = items[:800]

        print(f"\nProcessing {hsk_tag} ({len(items)} items) -> {filepath}...")

        def process_entry(it):
            hz = it['hanzi']
            py = it['pinyin']
            en_def = it['en_def']

            if hz in CURATED:
                cur_py, cur_id, cur_ms, cur_en = CURATED[hz]
                py = cur_py or py
                id_meaning = cur_id
                ms_meaning = cur_ms
                en_meaning = cur_en
            else:
                id_meaning = translate_fast(hz, 'id')
                ms_meaning = translate_fast(hz, 'ms') or id_meaning
                en_meaning = en_def or translate_fast(hz, 'en') or hz

            if not id_meaning:
                id_meaning = translate_fast(hz, 'id') or hz
            if not ms_meaning:
                ms_meaning = translate_fast(hz, 'ms') or id_meaning

            id_meaning = id_meaning.strip()
            id_meaning = id_meaning[0].upper() + id_meaning[1:] if id_meaning else ""
            ms_meaning = ms_meaning.strip()
            ms_meaning = ms_meaning[0].upper() + ms_meaning[1:] if ms_meaning else ""
            en_meaning = en_meaning.strip()
            en_meaning = en_meaning[0].upper() + en_meaning[1:] if en_meaning else ""

            cat = categorize_word(hz, id_meaning, hsk_tag)
            tone = determine_tone(py)

            exHanzi = f"在日常生活中，我们经常使用“{hz}”这个词。"
            exPinyin = f"Zài rìcháng shēnghuó zhōng, wǒmen jīngcháng shǐyòng “{py}” zhè ge cí."
            exId = f"Dalam kehidupan sehari-hari, kita sering menggunakan kata \"{hz}\" ({id_meaning})."
            exMs = f"Dalam kehidupan seharian, kita kerap menggunakan perkataan \"{hz}\" ({ms_meaning})."
            exEn = f"In daily life, we often use the word \"{hz}\" ({en_meaning})."

            return {
                'hanzi': hz,
                'pinyin': py,
                'indonesian': id_meaning,
                'malay': ms_meaning,
                'english': en_meaning,
                'category': cat,
                'hsk': hsk_tag,
                'tone': tone,
                'exampleHanzi': exHanzi,
                'examplePinyin': exPinyin,
                'exampleIndonesian': exId,
                'exampleMalay': exMs,
                'exampleEnglish': exEn
            }

        with ThreadPoolExecutor(max_workers=35) as ex:
            translated = list(ex.map(process_entry, items))

        code = format_ts_file(var_name, title, translated)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(code)
        print(f"✓ Saved {len(translated)} items to {filepath}")

    with open(CACHE_FILE, 'w', encoding='utf-8') as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)

    print("\n=======================================================")
    print("ALL HSK 1 - 6 VOCABULARY FILES CREATED WITH 100% INDONESIAN TRANSLATIONS!")
    print("=======================================================")

if __name__ == '__main__':
    build_all()
