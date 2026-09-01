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

# High-priority curated dictionary of common and special words
CURATED_DICT = {
    '听': { 'pinyin': 'tīng', 'id': 'Mendengar / mendengarkan', 'ms': 'Mendengar', 'en': 'To listen / hear' },
    '呢': { 'pinyin': 'ne', 'id': 'Partikel tanya / penegas (...bagaimana dengan...?)', 'ms': 'Partikel tanya (...bagaimana dengan...?)', 'en': 'Question particle (how about...?)' },
    '近': { 'pinyin': 'jìn', 'id': 'Dekat', 'ms': 'Dekat', 'en': 'Near / close' },
    '时候': { 'pinyin': 'shí hou', 'id': 'Waktu / saat / ketika', 'ms': 'Masa / ketika', 'en': 'Time / when' },
    '颜色': { 'pinyin': 'yán sè', 'id': 'Warna', 'ms': 'Warna', 'en': 'Color' },
    '可以': { 'pinyin': 'kě yǐ', 'id': 'Bisa / boleh', 'ms': 'Boleh / dapat', 'en': 'Can / may' },
    '大家': { 'pinyin': 'dà jiā', 'id': 'Semua orang / semuanya', 'ms': 'Semua orang / sekalian', 'en': 'Everyone' },
    '自行车': { 'pinyin': 'zì xíng chē', 'id': 'Sepeda', 'ms': 'Basikal', 'en': 'Bicycle' },
    '知道': { 'pinyin': 'zhī dào', 'id': 'Tahu / mengetahui', 'ms': 'Tahu / mengetahui', 'en': 'To know' },
    '意思': { 'pinyin': 'yì si', 'id': 'Arti / makna / maksud', 'ms': 'Maksud / erti', 'en': 'Meaning / idea' },
    '桌子': { 'pinyin': 'zhuō zi', 'id': 'Meja', 'ms': 'Meja', 'en': 'Table / desk' },
    '所以': { 'pinyin': 'suǒ yǐ', 'id': 'Oleh karena itu / jadi', 'ms': 'Oleh itu / jadi', 'en': 'Therefore / so' },
    '在': { 'pinyin': 'zài', 'id': 'Di / berada di / sedang', 'ms': 'Di / sedang', 'en': 'At / in / to be located' },
    '八': { 'pinyin': 'bā', 'id': 'Delapan (8)', 'ms': 'Lapan (8)', 'en': 'Eight (8)' },
    '爸爸': { 'pinyin': 'bà ba', 'id': 'Ayah / bapak / papa', 'ms': 'Bapa / ayah', 'en': 'Father / dad' },
    '杯子': { 'pinyin': 'bēi zi', 'id': 'Cangkir / gelas', 'ms': 'Cawan / gelas', 'en': 'Cup / glass' },
    '北京': { 'pinyin': 'Běi jīng', 'id': 'Beijing (ibu kota Tiongkok)', 'ms': 'Beijing', 'en': 'Beijing' },
    '本': { 'pinyin': 'běn', 'id': 'Buku / jilid (kata bantu bilangan)', 'ms': 'Buku / naskhah', 'en': 'Book / volume measure word' },
    '不': { 'pinyin': 'bù', 'id': 'Tidak / bukan', 'ms': 'Tidak / bukan', 'en': 'No / not' },
    '不客气': { 'pinyin': 'bù kè qi', 'id': 'Sama-sama / kembali', 'ms': 'Sama-sama', 'en': "You're welcome" },
    '菜': { 'pinyin': 'cài', 'id': 'Masakan / sayur / hidangan', 'ms': 'Masakan / sayur', 'en': 'Dish / vegetable' },
    '茶': { 'pinyin': 'chá', 'id': 'Teh', 'ms': 'Teh', 'en': 'Tea' },
    '吃': { 'pinyin': 'chī', 'id': 'Makan', 'ms': 'Makan', 'en': 'To eat' },
    '出租车': { 'pinyin': 'chū zū chē', 'id': 'Taksi', 'ms': 'Teksi', 'en': 'Taxi' },
    '打电话': { 'pinyin': 'dǎ diàn huà', 'id': 'Menelepon', 'ms': 'Menelefon', 'en': 'To make a phone call' },
    '大': { 'pinyin': 'dà', 'id': 'Besar', 'ms': 'Besar', 'en': 'Big / large' },
    '的': { 'pinyin': 'de', 'id': 'Partikel kepemilikan (punya / yang)', 'ms': 'Partikel kepunyaan (punya / yang)', 'en': 'Possessive particle (of)' },
    '点': { 'pinyin': 'diǎn', 'id': 'Jam / titik / sedikit', 'ms': 'Pukul / jam / sedikit', 'en': "O'clock / point / a little" },
    '电脑': { 'pinyin': 'diàn nǎo', 'id': 'Komputer', 'ms': 'Komputer', 'en': 'Computer' },
    '电视': { 'pinyin': 'diàn shì', 'id': 'Televisi / TV', 'ms': 'Televisyen / TV', 'en': 'Television / TV' },
    '电影': { 'pinyin': 'diàn yǐng', 'id': 'Film / bioskop', 'ms': 'Filem / wayang', 'en': 'Movie / film' },
    '东西': { 'pinyin': 'dōng xi', 'id': 'Barang / benda', 'ms': 'Barang / benda', 'en': 'Thing / stuff' },
    '都': { 'pinyin': 'dōu', 'id': 'Semuanya / juga', 'ms': 'Semuanya / juga', 'en': 'All / both' },
    '读': { 'pinyin': 'dú', 'id': 'Membaca', 'ms': 'Membaca', 'en': 'To read' },
    '对不起': { 'pinyin': 'duì bu qǐ', 'id': 'Maaf / mohon maaf', 'ms': 'Minta maaf', 'en': 'Sorry' },
    '多': { 'pinyin': 'duō', 'id': 'Banyak / berapa (usia)', 'ms': 'Banyak / berapa', 'en': 'Many / much' },
    '多少': { 'pinyin': 'duō shao', 'id': 'Berapa (jumlah / harga)', 'ms': 'Berapa (harga/kuantiti)', 'en': 'How much / how many' },
    '儿子': { 'pinyin': 'ér zi', 'id': 'Anak laki-laki / putra', 'ms': 'Anak lelaki', 'en': 'Son' },
    '二': { 'pinyin': 'èr', 'id': 'Dua (2)', 'ms': 'Dua (2)', 'en': 'Two (2)' },
    '饭馆': { 'pinyin': 'fàn guǎn', 'id': 'Restoran / rumah makan', 'ms': 'Restoran / kedai makan', 'en': 'Restaurant' },
    '飞机': { 'pinyin': 'fēi jī', 'id': 'Pesawat terbang', 'ms': 'Kapal terbang', 'en': 'Airplane' },
    '分钟': { 'pinyin': 'fēn zhōng', 'id': 'Menit', 'ms': 'Minit', 'en': 'Minute' },
    '高兴': { 'pinyin': 'gāo xìng', 'id': 'Senang / gembira', 'ms': 'Gembira / seronok', 'en': 'Happy / glad' },
    '个': { 'pinyin': 'gè', 'id': 'Buah / orang (kata bantu bilangan)', 'ms': 'Buah / orang (penjodoh bilangan)', 'en': 'General measure word' },
    '工作': { 'pinyin': 'gōng zuò', 'id': 'Bekerja / pekerjaan', 'ms': 'Bekerja / pekerjaan', 'en': 'Job / work' },
    '狗': { 'pinyin': 'gǒu', 'id': 'Anjing', 'ms': 'Anjing', 'en': 'Dog' },
    '汉语': { 'pinyin': 'hàn yǔ', 'id': 'Bahasa Mandarin / Tionghoa', 'ms': 'Bahasa Mandarin / Cina', 'en': 'Chinese language' },
    '好': { 'pinyin': 'hǎo', 'id': 'Baik / bagus / oke', 'ms': 'Baik / bagus / elok', 'en': 'Good / fine / well' },
    '喝': { 'pinyin': 'hē', 'id': 'Minum', 'ms': 'Minum', 'en': 'To drink' },
    '和': { 'pinyin': 'hé', 'id': 'Dan / dengan', 'ms': 'Dan / bersama', 'en': 'And / with' },
    '很': { 'pinyin': 'hěn', 'id': 'Sangat', 'ms': 'Sangat / amat', 'en': 'Very' },
    '后面': { 'pinyin': 'hòu mian', 'id': 'Belakang / di belakang', 'ms': 'Belakang / di belakang', 'en': 'Behind / back' },
    '回': { 'pinyin': 'huí', 'id': 'Kembali / pulang', 'ms': 'Kembali / pulang', 'en': 'To return / go back' },
    '会': { 'pinyin': 'huì', 'id': 'Bisa / akan / rapat', 'ms': 'Boleh / akan / mesyuarat', 'en': 'Can / will / meeting' },
    '几': { 'pinyin': 'jǐ', 'id': 'Berapa / beberapa', 'ms': 'Berapa / beberapa', 'en': 'How many / several' },
    '家': { 'pinyin': 'jiā', 'id': 'Rumah / keluarga', 'ms': 'Rumah / keluarga', 'en': 'Home / family' },
    '叫': { 'pinyin': 'jiào', 'id': 'Bernama / memanggil', 'ms': 'Bernama / memanggil', 'en': 'To be called / to call' },
    '今天': { 'pinyin': 'jīn tiān', 'id': 'Hari ini', 'ms': 'Hari ini', 'en': 'Today' },
    '九': { 'pinyin': 'jiǔ', 'id': 'Sembilan (9)', 'ms': 'Sembilan (9)', 'en': 'Nine (9)' },
    '开': { 'pinyin': 'kāi', 'id': 'Membuka / menyetir', 'ms': 'Membuka / memandu', 'en': 'To open / drive' },
    '看': { 'pinyin': 'kàn', 'id': 'Melihat / menonton / membaca', 'ms': 'Melihat / menonton / membaca', 'en': 'To look / watch / read' },
    '看见': { 'pinyin': 'kàn jiàn', 'id': 'Melihat / tampak', 'ms': 'Nampak / melihat', 'en': 'To see' },
    '块': { 'pinyin': 'kuài', 'id': 'Yuan / potong (mata uang / kata bantu)', 'ms': 'Yuan / keping / ketul', 'en': 'Yuan / piece' },
    '来': { 'pinyin': 'lái', 'id': 'Datang', 'ms': 'Datang / mari', 'en': 'To come' },
    '老师': { 'pinyin': 'lǎo shī', 'id': 'Guru', 'ms': 'Guru / cikgu', 'en': 'Teacher' },
    '了': { 'pinyin': 'le', 'id': 'Sudah / telah (partikel penanda selesai)', 'ms': 'Sudah / telah', 'en': 'Aspect particle (already)' },
    '冷': { 'pinyin': 'lěng', 'id': 'Dingin', 'ms': 'Sejuk / dingin', 'en': 'Cold' },
    '里': { 'pinyin': 'lǐ', 'id': 'Di dalam', 'ms': 'Di dalam', 'en': 'Inside / in' },
    '六': { 'pinyin': 'liù', 'id': 'Enam (6)', 'ms': 'Enam (6)', 'en': 'Six (6)' },
    '妈妈': { 'pinyin': 'mā ma', 'id': 'Ibu / mama', 'ms': 'Ibu / emak / mama', 'en': 'Mother / mom' },
    '吗': { 'pinyin': 'ma', 'id': 'Apakah? (partikel tanya ya/tidak)', 'ms': 'Adakah? / kah?', 'en': 'Yes-no question particle' },
    '买': { 'pinyin': 'mǎi', 'id': 'Membeli', 'ms': 'Membeli', 'en': 'To buy' },
    '猫': { 'pinyin': 'māo', 'id': 'Kucing', 'ms': 'Kucing', 'en': 'Cat' },
    '没关系': { 'pinyin': 'méi guān xi', 'id': 'Tidak apa-apa / tidak masalah', 'ms': 'Tidak mengapa / tak apa', 'en': "It doesn't matter" },
    '没有': { 'pinyin': 'méi yǒu', 'id': 'Tidak ada / belum', 'ms': 'Tiada / belum', 'en': 'Do not have / not exist' },
    '米饭': { 'pinyin': 'mǐ fàn', 'id': 'Nasi putih', 'ms': 'Nasi putih', 'en': 'Cooked rice' },
    '明天': { 'pinyin': 'míng tiān', 'id': 'Besok', 'ms': 'Esok', 'en': 'Tomorrow' },
    '名字': { 'pinyin': 'míng zi', 'id': 'Nama', 'ms': 'Nama', 'en': 'Name' },
    '哪': { 'pinyin': 'nǎ', 'id': 'Yang mana', 'ms': 'Mana satu', 'en': 'Which' },
    '哪儿': { 'pinyin': 'nǎr', 'id': 'Di mana / ke mana', 'ms': 'Di mana', 'en': 'Where' },
    '那': { 'pinyin': 'nà', 'id': 'Itu', 'ms': 'Itu', 'en': 'That' },
    '那儿': { 'pinyin': 'nàr', 'id': 'Di sana', 'ms': 'Di sana', 'en': 'There' },
    '你': { 'pinyin': 'nǐ', 'id': 'Kamu / anda', 'ms': 'Awak / anda / kamu', 'en': 'You' },
    '年': { 'pinyin': 'nián', 'id': 'Tahun', 'ms': 'Tahun', 'en': 'Year' },
    '女儿': { 'pinyin': 'nǚ ér', 'id': 'Anak perempuan / putri', 'ms': 'Anak perempuan', 'en': 'Daughter' },
    '朋友': { 'pinyin': 'péng you', 'id': 'Teman / sahabat', 'ms': 'Kawan / sahabat', 'en': 'Friend' },
    '漂亮': { 'pinyin': 'piào liang', 'id': 'Cantik / indah', 'ms': 'Cantik / molek', 'en': 'Beautiful / pretty' },
    '苹果': { 'pinyin': 'píng guǒ', 'id': 'Apel', 'ms': 'Epal', 'en': 'Apple' },
    '七': { 'pinyin': 'qī', 'id': 'Tujuh (7)', 'ms': 'Tujuh (7)', 'en': 'Seven (7)' },
    '钱': { 'pinyin': 'qián', 'id': 'Uang', 'ms': 'Duit / wang', 'en': 'Money' },
    '前面': { 'pinyin': 'qián mian', 'id': 'Depan / di depan', 'ms': 'Depan / di hadapan', 'en': 'In front / ahead' },
    '请': { 'pinyin': 'qǐng', 'id': 'Silakan / tolong / mengundang', 'ms': 'Sila / jemput / tolong', 'en': 'Please / invite' },
    '去': { 'pinyin': 'qù', 'id': 'Pergi', 'ms': 'Pergi', 'en': 'To go' },
    '热': { 'pinyin': 'rè', 'id': 'Panas', 'ms': 'Panas', 'en': 'Hot' },
    '人': { 'pinyin': 'rén', 'id': 'Orang / manusia', 'ms': 'Orang / manusia', 'en': 'Person / people' },
    '认识': { 'pinyin': 'rèn shi', 'id': 'Mengenal / kenal', 'ms': 'Mengenali / kenal', 'en': 'To know / recognize' },
    '三': { 'pinyin': 'sān', 'id': 'Tiga (3)', 'ms': 'Tiga (3)', 'en': 'Three (3)' },
    '上': { 'pinyin': 'shàng', 'id': 'Atas / naik / menghadiri', 'ms': 'Atas / naik', 'en': 'Up / on / above' },
    '上午': { 'pinyin': 'shàng wǔ', 'id': 'Pagi hari / sebelum tengah hari', 'ms': 'Pagi / sebelum tengah hari', 'en': 'Morning' },
    '少': { 'pinyin': 'shǎo', 'id': 'Sedikit / kurang', 'ms': 'Sedikit / kurang', 'en': 'Few / little' },
    '谁': { 'pinyin': 'shéi', 'id': 'Siapa', 'ms': 'Siapa', 'en': 'Who' },
    '什么': { 'pinyin': 'shén me', 'id': 'Apa', 'ms': 'Apa', 'en': 'What' },
    '十': { 'pinyin': 'shí', 'id': 'Sepuluh (10)', 'ms': 'Sepuluh (10)', 'en': 'Ten (10)' },
    '是': { 'pinyin': 'shì', 'id': 'Adalah / ya / benar', 'ms': 'Ialah / adalah / ya', 'en': 'To be / yes' },
    '书': { 'pinyin': 'shū', 'id': 'Buku', 'ms': 'Buku', 'en': 'Book' },
    '水': { 'pinyin': 'shuǐ', 'id': 'Air', 'ms': 'Air', 'en': 'Water' },
    '水果': { 'pinyin': 'shuǐ guǒ', 'id': 'Buah-buahan', 'ms': 'Buah-buahan', 'en': 'Fruit' },
    '睡觉': { 'pinyin': 'shuì jiào', 'id': 'Tidur', 'ms': 'Tidur', 'en': 'To sleep' },
    '说话': { 'pinyin': 'shuō huà', 'id': 'Berbicara / mengobrol', 'ms': 'Bercakap / berbual', 'en': 'To speak / talk' },
    '四': { 'pinyin': 'sì', 'id': 'Empat (4)', 'ms': 'Empat (4)', 'en': 'Four (4)' },
    '岁': { 'pinyin': 'suì', 'id': 'Tahun (usia/umur)', 'ms': 'Tahun (umur)', 'en': 'Years old / age' },
    '他': { 'pinyin': 'tā', 'id': 'Dia (laki-laki)', 'ms': 'Dia (lelaki)', 'en': 'He / him' },
    '她': { 'pinyin': 'tā', 'id': 'Dia (perempuan)', 'ms': 'Dia (perempuan)', 'en': 'She / her' },
    '太': { 'pinyin': 'tài', 'id': 'Terlalu / sangat', 'ms': 'Terlalu / terlampau', 'en': 'Too / extremely' },
    '天气': { 'pinyin': 'tiān qì', 'id': 'Cuaca', 'ms': 'Cuaca', 'en': 'Weather' },
    '同学': { 'pinyin': 'tóng xué', 'id': 'Teman sekelas', 'ms': 'Rakan sekelas', 'en': 'Classmate' },
    '喂': { 'pinyin': 'wèi', 'id': 'Halo (di telepon)', 'ms': 'Helo (di telefon)', 'en': 'Hello (phone)' },
    '我': { 'pinyin': 'wǒ', 'id': 'Saya / aku', 'ms': 'Saya / aku', 'en': 'I / me' },
    '我们': { 'pinyin': 'wǒ men', 'id': 'Kita / kami', 'ms': 'Kami / kita', 'en': 'We / us' },
    '五': { 'pinyin': 'wǔ', 'id': 'Lima (5)', 'ms': 'Lima (5)', 'en': 'Five (5)' },
    '喜欢': { 'pinyin': 'xǐ huan', 'id': 'Suka / menyukai', 'ms': 'Suka / gemar', 'en': 'To like' },
    '下': { 'pinyin': 'xià', 'id': 'Bawah / turun', 'ms': 'Bawah / turun', 'en': 'Down / below / next' },
    '下午': { 'pinyin': 'xià wǔ', 'id': 'Sore hari / siang', 'ms': 'Petang / tengah hari', 'en': 'Afternoon' },
    '下雨': { 'pinyin': 'xià yǔ', 'id': 'Hujan / turun hujan', 'ms': 'Hujan / turun hujan', 'en': 'To rain' },
    '先生': { 'pinyin': 'xiān sheng', 'id': 'Tuan / bapak / suami', 'ms': 'Encik / tuan / suami', 'en': 'Mister / sir / husband' },
    '现在': { 'pinyin': 'xiàn zài', 'id': 'Sekarang / saat ini', 'ms': 'Sekarang / kini', 'en': 'Now' },
    '想': { 'pinyin': 'xiǎng', 'id': 'Ingin / rindu / berpikir', 'ms': 'Mahu / rindu / berfikir', 'en': 'To want / think / miss' },
    '小': { 'pinyin': 'xiǎo', 'id': 'Kecil', 'ms': 'Kecil', 'en': 'Small / little' },
    '小姐': { 'pinyin': 'xiǎo jie', 'id': 'Nona', 'ms': 'Cik / puan muda', 'en': 'Miss / young lady' },
    '些': { 'pinyin': 'xiē', 'id': 'Beberapa (sedikit)', 'ms': 'Beberapa (sedikit)', 'en': 'Some / few' },
    '写': { 'pinyin': 'xiě', 'id': 'Menulis', 'ms': 'Menulis', 'en': 'To write' },
    '谢谢': { 'pinyin': 'xiè xie', 'id': 'Terima kasih', 'ms': 'Terima kasih', 'en': 'Thank you' },
    '星期': { 'pinyin': 'xīng qī', 'id': 'Minggu / pekan', 'ms': 'Minggu', 'en': 'Week' },
    '学生': { 'pinyin': 'xué sheng', 'id': 'Murid / siswa / mahasiswa', 'ms': 'Pelajar / murid', 'en': 'Student' },
    '学习': { 'pinyin': 'xué xí', 'id': 'Belajar', 'ms': 'Belajar', 'en': 'To study / learn' },
    '学校': { 'pinyin': 'xué xiào', 'id': 'Sekolah', 'ms': 'Sekolah', 'en': 'School' },
    '一': { 'pinyin': 'yī', 'id': 'Satu (1)', 'ms': 'Satu (1)', 'en': 'One (1)' },
    '一点儿': { 'pinyin': 'yì diǎnr', 'id': 'Sedikit', 'ms': 'Sedikit', 'en': 'A little bit' },
    '衣服': { 'pinyin': 'yī fu', 'id': 'Pakaian / baju', 'ms': 'Pakaian / baju', 'en': 'Clothes' },
    '医生': { 'pinyin': 'yī shēng', 'id': 'Dokter', 'ms': 'Doktor', 'en': 'Doctor' },
    '医院': { 'pinyin': 'yī yuàn', 'id': 'Rumah sakit', 'ms': 'Hospital', 'en': 'Hospital' },
    '椅子': { 'pinyin': 'yǐ zi', 'id': 'Kursi', 'ms': 'Kerusi', 'en': 'Chair' },
    '有': { 'pinyin': 'yǒu', 'id': 'Ada / punya / memiliki', 'ms': 'Ada / mempunyai / memiliki', 'en': 'To have / exist' },
    '月': { 'pinyin': 'yuè', 'id': 'Bulan (kalender / langit)', 'ms': 'Bulan (kalendar / langit)', 'en': 'Month / moon' },
    '再见': { 'pinyin': 'zài jiàn', 'id': 'Sampai jumpa / selamat tinggal', 'ms': 'Selamat tinggal / jumpa lagi', 'en': 'Goodbye' },
    '怎么': { 'pinyin': 'zěn me', 'id': 'Bagaimana / kenapa', 'ms': 'Bagaimana / mengapa', 'en': 'How / why' },
    '怎么样': { 'pinyin': 'zěn me yàng', 'id': 'Bagaimana keadaannya?', 'ms': 'Bagaimanakah?', 'en': 'How is it? / How about?' },
    '这': { 'pinyin': 'zhè', 'id': 'Ini', 'ms': 'Ini', 'en': 'This' },
    '这儿': { 'pinyin': 'zhèr', 'id': 'Di sini', 'ms': 'Di sini', 'en': 'Here' },
    '中国': { 'pinyin': 'zhōng guó', 'id': 'Tiongkok / Cina', 'ms': 'Negara China', 'en': 'China' },
    '中午': { 'pinyin': 'zhōng wǔ', 'id': 'Tengah hari / siang hari', 'ms': 'Tengah hari', 'en': 'Noon / midday' },
    '住': { 'pinyin': 'zhù', 'id': 'Tinggal / menetap', 'ms': 'Tinggal / menetap', 'en': 'To live / stay' },
    '做': { 'pinyin': 'zuò', 'id': 'Membuat / mengerjakan / melakukan', 'ms': 'Membuat / melakukan', 'en': 'To do / make' },
    '坐': { 'pinyin': 'zuò', 'id': 'Duduk / naik (kendaraan)', 'ms': 'Duduk / menaiki (kenderaan)', 'en': 'To sit / travel by' }
}

def save_cache():
    try:
        with open(CACHE_FILE, 'w', encoding='utf-8') as f:
            json.dump(cache, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print('Error saving cache:', e)

def translate(text, sl='zh-CN', tl='id', retries=3):
    key = f"{sl}_{tl}_{text}"
    if key in cache and cache[key]:
        return cache[key]
    
    clean_text = text.strip()
    if not clean_text:
        return ""

    for attempt in range(retries):
        try:
            url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=' + sl + '&tl=' + tl + '&dt=t&q=' + urllib.parse.quote(clean_text)
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                res = ''.join([x[0] for x in data[0] if x[0]]).strip()
                if res:
                    cache[key] = res
                    return res
        except Exception as e:
            time.sleep(0.3 * (attempt + 1))
    
    return ""

def clean_meaning(text):
    if not text:
        return ""
    t = text.strip()
    if t:
        t = t[0].upper() + t[1:]
    return t

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
        hsk = get_field('hsk') or 'HSK 1'
        tone = get_field('tone')
        if tone is None:
            tone = 0
        exampleHanzi = get_field('exampleHanzi') or ''
        examplePinyin = get_field('examplePinyin') or ''
        exampleIndonesian = get_field('exampleIndonesian') or ''
        exampleMalay = get_field('exampleMalay') or ''
        exampleEnglish = get_field('exampleEnglish') or ''

        if hanzi and pinyin:
            items.append({
                'hanzi': hanzi,
                'pinyin': pinyin,
                'indonesian': indonesian,
                'malay': malay,
                'english': english,
                'category': category,
                'hsk': hsk,
                'tone': tone,
                'exampleHanzi': exampleHanzi,
                'examplePinyin': examplePinyin,
                'exampleIndonesian': exampleIndonesian,
                'exampleMalay': exampleMalay,
                'exampleEnglish': exampleEnglish
            })
    return items

def is_english(text):
    if not text:
        return True
    indicators = ['to ', 'the ', 'of ', 'and ', 'or ', 'for ', 'with ', 'in ', 'on ', 'at ', 'by ', 'from ', 'about ', 'into ', 'through ', 'during ', 'before ', 'after ', 'above ', 'below ', 'which ', 'that ', 'this ', 'these ', 'those ', 'verb', 'noun', 'adj', 'particle']
    lower = text.lower()
    if any(ind in lower for ind in indicators):
        return True
    english_words = ['near', 'time', 'color', 'smile', 'can', 'everyone', 'bicycle', 'idea', 'table', 'therefore', 'father', 'eight', 'cup', 'book', 'good', 'he', 'she', 'it', 'we', 'they', 'you', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'nine', 'ten', 'zero', 'tea', 'dish', 'water', 'hospital', 'school', 'student', 'teacher', 'money', 'big', 'small', 'few', 'many', 'hot', 'cold', 'apple', 'cat', 'dog', 'friend', 'read', 'see', 'listen', 'look', 'write', 'sleep', 'say', 'speak']
    if lower in english_words:
        return True
    return False

def process_word(item):
    hanzi = item['hanzi']
    pinyin = item['pinyin']
    current_indo = item.get('indonesian', '')
    current_ms = item.get('malay', '')
    current_en = item.get('english', '')

    # Check curated dict first
    if hanzi in CURATED_DICT:
        cur = CURATED_DICT[hanzi]
        pinyin = cur.get('pinyin', pinyin)
        id_meaning = cur.get('id')
        ms_meaning = cur.get('ms')
        en_meaning = cur.get('en')
    else:
        # If current_indo is definitely English or empty, translate directly from Hanzi
        if is_english(current_indo) or not current_indo:
            id_meaning = translate(hanzi, 'zh-CN', 'id')
            ms_meaning = translate(hanzi, 'zh-CN', 'ms')
            en_meaning = translate(hanzi, 'zh-CN', 'en')
        else:
            id_meaning = current_indo
            ms_meaning = current_ms if current_ms and not is_english(current_ms) else translate(hanzi, 'zh-CN', 'ms')
            en_meaning = current_en if current_en else translate(hanzi, 'zh-CN', 'en')

        if not id_meaning or is_english(id_meaning):
            id_meaning = translate(hanzi, 'zh-CN', 'id')
        if not ms_meaning or is_english(ms_meaning):
            ms_meaning = translate(hanzi, 'zh-CN', 'ms')
        if not en_meaning:
            en_meaning = translate(hanzi, 'zh-CN', 'en')

    id_meaning = clean_meaning(id_meaning)
    ms_meaning = clean_meaning(ms_meaning)
    en_meaning = clean_meaning(en_meaning)

    # Contextual example sentence
    exHanzi = item.get('exampleHanzi', '')
    exPinyin = item.get('examplePinyin', '')
    
    if not exHanzi or '这个重要的汉语词汇' in exHanzi or '日常生活中' in exHanzi or not item.get('exampleIndonesian'):
        exHanzi = f"在日常生活中，我们经常使用“{hanzi}”这个词。"
        exPinyin = f"Zài rìcháng shēnghuó zhōng, wǒmen jīngcháng shǐyòng “{pinyin}” zhè ge cí."
        exId = f"Dalam kehidupan sehari-hari, kita sering menggunakan kata \"{hanzi}\" ({id_meaning})."
        exMs = f"Dalam kehidupan seharian, kita kerap menggunakan perkataan \"{hanzi}\" ({ms_meaning})."
        exEn = f"In daily life, we often use the word \"{hanzi}\" ({en_meaning})."
    else:
        exId = item.get('exampleIndonesian', '')
        exMs = item.get('exampleMalay', '')
        exEn = item.get('exampleEnglish', '')
        if not exId or is_english(exId):
            exId = translate(exHanzi, 'zh-CN', 'id')
        if not exMs or is_english(exMs):
            exMs = translate(exHanzi, 'zh-CN', 'ms')
        if not exEn:
            exEn = translate(exHanzi, 'zh-CN', 'en')

    return {
        'hanzi': hanzi,
        'pinyin': pinyin,
        'indonesian': id_meaning,
        'malay': ms_meaning,
        'english': en_meaning,
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
        if w.get('exampleHanzi'):
            lines.append(f'    exampleHanzi: {json.dumps(w["exampleHanzi"], ensure_ascii=False)},')
            lines.append(f'    examplePinyin: {json.dumps(w["examplePinyin"], ensure_ascii=False)},')
            lines.append(f'    exampleIndonesian: {json.dumps(w["exampleIndonesian"], ensure_ascii=False)},')
            lines.append(f'    exampleMalay: {json.dumps(w["exampleMalay"], ensure_ascii=False)},')
            lines.append(f'    exampleEnglish: {json.dumps(w["exampleEnglish"], ensure_ascii=False)},')
        lines.append("  },")
    lines.append("];")
    lines.append("")
    return "\n".join(lines)

def process_all_files():
    files = [
        ('src/data/hsk1Data.ts', 'HSK1_VOCAB_LIST', 'Standar Kurikulum HSK 1 (Dasar Pemula - 150 Kosakata Resmi)'),
        ('src/data/hsk2Data.ts', 'HSK2_VOCAB_LIST', 'Standar Kurikulum HSK 2 (Dasar Lanjutan - 150 Kosakata Resmi)'),
        ('src/data/hsk3Data.ts', 'HSK3_VOCAB_LIST', 'Standar Kurikulum HSK 3 (Menengah Awal - 300 Kosakata Resmi)'),
        ('src/data/hsk4Data.ts', 'HSK4_VOCAB_LIST', 'Standar Kurikulum HSK 4 (Menengah Mandiri - 600 Kosakata Resmi)'),
        ('src/data/hsk5Data.ts', 'HSK5_VOCAB_LIST', 'Standar Kurikulum HSK 5 (Tingkat Mahir Membaca & Diskusi - 1000 Kosakata Resmi)'),
        ('src/data/hsk6Data.ts', 'HSK6_VOCAB_LIST', 'Standar Kurikulum HSK 6 (Tingkat Mahir Sastra & Profesional - 800 Kosakata Resmi)'),
        ('src/data/shoppingTravelNumbersVocab.ts', 'SHOPPING_TRAVEL_NUMBERS_VOCAB', 'Kurasi Khusus: Belanja, Travel & Angka (HSK 1 - HSK 3: 125 Kosakata Praktis)'),
    ]

    for filepath, var_name, title in files:
        print(f"Processing {filepath}...")
        raw_items = parse_ts_file(filepath)
        print(f"Parsed {len(raw_items)} items from {filepath}")
        
        with ThreadPoolExecutor(max_workers=20) as executor:
            results = list(executor.map(process_word, raw_items))
        
        save_cache()
        ts_code = format_ts_file(var_name, title, results)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(ts_code)
        print(f"✓ Saved {len(results)} translated items to {filepath}")

if __name__ == '__main__':
    process_all_files()
    save_cache()
    print("ALL FILES TRANSLATED AND SAVED SUCCESSFULLY!")
