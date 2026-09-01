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

# Comprehensive Master Curated Dictionary for HSK & Daily Mandarin
CURATED = {
    # HSK 1 Core
    '爱': ('ài', 'Mencintai / menyukai', 'Mencintai / menyukai', 'To love / like'),
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
    '呢': ('ne', 'Partikel tanya / penegas (...bagaimana dengan...?)', 'Partikel tanya (...bagaimana dengan...?)', 'Question particle (how about...?)'),
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
    '时候': ('shí hou', 'Waktu / saat / ketika', 'Masa / ketika', 'Time / when'),
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
    '听': ('tīng', 'Mendengar / mendengarkan', 'Mendengar', 'To listen / hear'),
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
    '在': ('zài', 'Di / berada di / sedang', 'Di / sedang', 'At / in / to be located'),
    '怎么': ('zěn me', 'Bagaimana / kenapa', 'Bagaimana / mengapa', 'How / why'),
    '怎么样': ('zěn me yàng', 'Bagaimana keadaannya?', 'Bagaimanakah?', 'How is it? / How about?'),
    '这': ('zhè', 'Ini', 'Ini', 'This'),
    '这儿': ('zhèr', 'Di sini', 'Di sini', 'Here'),
    '中国': ('zhōng guó', 'Tiongkok / Cina', 'Negara China', 'China'),
    '中午': ('zhōng wǔ', 'Tengah hari / siang hari', 'Tengah hari', 'Noon / midday'),
    '住': ('zhù', 'Tinggal / menetap', 'Tinggal / menetap', 'To live / stay'),
    '桌子': ('zhuō zi', 'Meja', 'Meja', 'Table / desk'),
    '字': ('zì', 'Karakter / huruf / aksara', 'Huruf / perkataan', 'Character / word'),
    '昨天': ('zuó tiān', 'Kemarin', 'Semalam / kelmarin', 'Yesterday'),
    '坐': ('zuò', 'Duduk / naik (kendaraan)', 'Duduk / menaiki (kenderaan)', 'To sit / travel by'),
    '做': ('zuò', 'Membuat / mengerjakan / melakukan', 'Membuat / melakukan', 'To do / make'),

    # HSK 2 Core & Target Words
    '吧': ('ba', 'Partikel saran / ajakan (...kan / ...lah)', 'Partikel cadangan (...lah / ...kan)', 'Suggestion particle'),
    '白': ('bái', 'Putih', 'Putih', 'White'),
    '百': ('bǎi', 'Ratus / seratus (100)', 'Ratus / seratus (100)', 'Hundred (100)'),
    '帮助': ('bāng zhù', 'Membantu / bantuan', 'Membantu / pertolongan', 'To help / assistance'),
    '报纸': ('bào zhǐ', 'Koran / surat kabar', 'Surat khabar / akhbar', 'Newspaper'),
    '比': ('bǐ', 'Dibandingkan / daripada', 'Berbanding / daripada', 'To compare / than'),
    '别': ('bié', 'Jangan / lainnya', 'Jangan / lain', "Don't / other"),
    '长': ('cháng', 'Panjang', 'Panjang', 'Long'),
    '唱歌': ('chàng gē', 'Menyanyi', 'Menyanyi', 'To sing'),
    '出': ('chū', 'Keluar', 'Keluar', 'To go out / come out'),
    '穿': ('chuān', 'Memakai (baju / sepatu)', 'Memakai (baju/kasut)', 'To wear / put on'),
    '次': ('cì', 'Kali (frekuensi)', 'Kali (kekerapan)', 'Time / occurrence'),
    '从': ('cóng', 'Dari', 'Dari / daripada', 'From'),
    '错': ('cuò', 'Salah / keliru', 'Salah / silap', 'Wrong / mistake'),
    '打篮球': ('dǎ lán qiú', 'Bermain bola basket', 'Bermain bola keranjang', 'To play basketball'),
    '大家': ('dà jiā', 'Semua orang / semuanya', 'Semua orang / sekalian', 'Everyone / all'),
    '到': ('dào', 'Sampai / tiba', 'Sampai / tiba', 'To arrive / reach'),
    '得': ('de', 'Partikel pelengkap derajat', 'Partikel pelengkap darjah', 'Structural particle'),
    '等': ('děng', 'Menunggu / dll', 'Menunggu / dan lain-lain', 'To wait / etc.'),
    '弟弟': ('dì di', 'Adik laki-laki', 'Adik lelaki', 'Younger brother'),
    '第一': ('dì yī', 'Pertama / nomor satu', 'Pertama / nombor satu', 'First / number one'),
    '懂': ('dǒng', 'Mengerti / paham', 'Faham / mengerti', 'To understand'),
    '对': ('duì', 'Benar / tepat / terhadap', 'Betul / benar / terhadap', 'Correct / right / to'),
    '房间': ('fáng jiān', 'Kamar / ruangan', 'Bilik / bilik tidur', 'Room'),
    '非常': ('fēi cháng', 'Sangat / luar biasa', 'Sangat / luar biasa', 'Extremely / very'),
    '服务员': ('fú wù yuán', 'Pelayan / pramusaji', 'Pelayan / pekerja restoran', 'Waiter / attendant'),
    '高': ('gāo', 'Tinggi', 'Tinggi', 'Tall / high'),
    '告诉': ('gào su', 'Memberitahu / mengabari', 'Memberitahu / pesan', 'To tell / inform'),
    '哥哥': ('gē ge', 'Kakak laki-laki', 'Abang', 'Older brother'),
    '给': ('gěi', 'Memberi / kepada', 'Memberi / kepada', 'To give / to'),
    '公共汽车': ('gōng gòng qì chē', 'Bus kota / bus umum', 'Bas awam / bas bandar', 'Bus / public bus'),
    '公司': ('gōng sī', 'Perusahaan / kantor', 'Syarikat / pejabat', 'Company / corporation'),
    '贵': ('guì', 'Mahal / terhormat', 'Mahal / berharga', 'Expensive / honorable'),
    '过': ('guò', 'Pernah / melewati', 'Pernah / melintas', 'To pass / experienced'),
    '还': ('hái', 'Masih / juga / mengembalikan', 'Masih / lagi / kembalikan', 'Still / also / return'),
    '孩子': ('hái zi', 'Anak-anak', 'Kanak-kanak / anak', 'Child / children'),
    '好吃': ('hǎo chī', 'Enak / lezat (makanan)', 'Sedap / enak', 'Delicious / tasty'),
    '黑': ('hēi', 'Hitam / gelap', 'Hitam / gelap', 'Black / dark'),
    '红': ('hóng', 'Merah', 'Merah', 'Red'),
    '火车站': ('huǒ chē zhàn', 'Stasiun kereta api', 'Stesen kereta api', 'Train station'),
    '机场': ('jī chǎng', 'Bandara / lapangan terbang', 'Lapangan terbang', 'Airport'),
    '鸡蛋': ('jī dàn', 'Telur ayam', 'Telur ayam', 'Egg'),
    '件': ('jiàn', 'Potong / helai (kata bantu pakaian)', 'Helai / pasang (baju)', 'Measure word for clothes'),
    '教室': ('jiào shì', 'Ruang kelas', 'Bilik darjah / kelas', 'Classroom'),
    '姐姐': ('jiě jie', 'Kakak perempuan', 'Kakak', 'Older sister'),
    '介绍': ('jiè shào', 'Memperkenalkan', 'Memperkenalkan', 'To introduce'),
    '进': ('jìn', 'Masuk', 'Masuk', 'To enter'),
    '近': ('jìn', 'Dekat', 'Dekat', 'Near / close'),
    '就': ('jiù', 'Langsung / segera / maka', 'Terus / segera / maka', 'Just / then / right away'),
    '觉得': ('jué de', 'Merasa / berpendapat', 'Rasa / berpendapat', 'To feel / think'),
    '咖啡': ('kā fēi', 'Kopi', 'Kopi', 'Coffee'),
    '开始': ('kāi shǐ', 'Mulai / memulai', 'Mula / memulakan', 'To start / begin'),
    '考试': ('kǎo shì', 'Ujian / tes', 'Ujian / peperiksaan', 'Exam / test'),
    '可能': ('kě néng', 'Mungkin / barangkali', 'Mungkin / kemungkinan', 'Possible / maybe'),
    '可以': ('kě yǐ', 'Bisa / boleh', 'Boleh / dapat', 'Can / may'),
    '课': ('kè', 'Pelajaran / kelas', 'Pelajaran / kelas', 'Lesson / class'),
    '快': ('kuài', 'Cepat / segera', 'Pantas / cepat / segera', 'Fast / quick'),
    '快乐': ('kuài lè', 'Bahagia / gembira', 'Gembira / selamat', 'Happy / joyful'),
    '累': ('lèi', 'Lelah / capek', 'Penat / letih', 'Tired / exhausted'),
    '离': ('lí', 'Dari / berjarak dari', 'Dari / berjarak daripada', 'From / away from'),
    '两': ('liǎng', 'Dua (untuk jumlah benda)', 'Dua (untuk kuantiti)', 'Two (quantity)'),
    '路': ('lù', 'Jalan / rute', 'Jalan / laluan', 'Road / path / route'),
    '旅游': ('lǚ yóu', 'Wisata / bepergian (traveling)', 'Melancong / melawat', 'Travel / tourism'),
    '卖': ('mài', 'Menjual', 'Menjual', 'To sell'),
    '慢': ('màn', 'Lambat / pelan', 'Perlahan / lambat', 'Slow'),
    '忙': ('máng', 'Sibuk', 'Sibuk', 'Busy'),
    '每': ('měi', 'Setiap / tiap', 'Setiap / tiap-tiap', 'Every / each'),
    '妹妹': ('mèi mei', 'Adik perempuan', 'Adik perempuan', 'Younger sister'),
    '门': ('mén', 'Pintu / gerbang', 'Pintu / pagar', 'Door / gate'),
    '男人': ('nán rén', 'Pria / laki-laki', 'Lelaki / orang lelaki', 'Man / male'),
    '您': ('nín', 'Anda (bentuk hormat)', 'Anda (bahasa sopan)', 'You (respectful)'),
    '牛奶': ('niú nǎi', 'Susu sapi', 'Susu lembu', 'Cow milk'),
    '女人': ('nǚ rén', 'Wanita / perempuan', 'Wanita / perempuan', 'Woman / female'),
    '旁边': ('páng biān', 'Di samping / sebelah', 'Di sebelah / tepi', 'Beside / next to'),
    '跑步': ('pǎo bù', 'Berlari / jogging', 'Berlari / berjoging', 'To run / jog'),
    '便宜': ('pián yi', 'Murah', 'Murah', 'Cheap / inexpensive'),
    '票': ('piào', 'Tiket / karcis', 'Tiket', 'Ticket'),
    '妻子': ('qī zi', 'Istri', 'Isteri', 'Wife'),
    '起床': ('qǐ chuáng', 'Bangun tidur', 'Bangun tidur', 'To wake up / get up'),
    '千': ('qiān', 'Ribu / seribu (1000)', 'Ribu / seribu (1000)', 'Thousand (1000)'),
    '晴': ('qíng', 'Cerah (cuaca)', 'Cerah (cuaca)', 'Sunny / clear weather'),
    '去年': ('qù nián', 'Tahun lalu / tahun kemarin', 'Tahun lepas / tahun lalu', 'Last year'),
    '让': ('ràng', 'Membiarkan / mengizinkan / menyuruh', 'Membiarkan / membenarkan / suruh', 'To let / allow / make'),
    '日': ('rì', 'Hari / tanggal / matahari', 'Hari / tarikh / matahari', 'Day / date / sun'),
    '上班': ('shàng bān', 'Masuk kerja / berangkat kerja', 'Pergi kerja / masuk pejabat', 'To go to work'),
    '身体': ('shēn tǐ', 'Tubuh / badan / kesehatan', 'Badan / tubuh / kesihatan', 'Body / health'),
    '生病': ('shēng bìng', 'Sakit / jatuh sakit', 'Sakit / jatuh sakit', 'To get sick / ill'),
    '生日': ('shēng rì', 'Ulang tahun', 'Hari lahir / hari jadi', 'Birthday'),
    '时间': ('shí jiān', 'Waktu / masa', 'Masa / waktu', 'Time / duration'),
    '事情': ('shì qing', 'Urusan / hal / perkara', 'Hal / perkara / urusan', 'Matter / affair / thing'),
    '手表': ('shǒu biǎo', 'Jam tangan', 'Jam tangan', 'Wristwatch'),
    '手机': ('shǒu jī', 'Ponsel / HP (Handphone)', 'Telefon bimbit / telefon pintar', 'Mobile phone'),
    '送': ('sòng', 'Mengantar / memberi hadiah', 'Menghantar / memberi hadiah', 'To deliver / give as gift'),
    '虽然': ('suī rán', 'Meskipun / walaupun', 'Walaupun / meskipun', 'Although / even though'),
    '但是': ('dàn shì', 'Tetapi / namun', 'Tetapi / namun', 'But / however'),
    '所以': ('suǒ yǐ', 'Oleh karena itu / jadi', 'Oleh itu / jadi', 'Therefore / so'),
    '它': ('tā', 'Itu / dia (hewan / benda)', 'Ia (haiwan / benda)', 'It'),
    '踢足球': ('tī zú qiú', 'Bermain sepak bola', 'Bermain bola sepak', 'To play soccer / football'),
    '题': ('tí', 'Soal / pertanyaan / judul', 'Soalan / tajuk', 'Question / problem / topic'),
    '跳舞': ('tiào wǔ', 'Menari / berdansa', 'Menari / tarian', 'To dance'),
    '外': ('wài', 'Luar / di luar', 'Luar / di luar', 'Outside / foreign'),
    '完': ('wán', 'Selesai / habis', 'Selesai / habis', 'To finish / complete'),
    '玩': ('wán', 'Bermain / bersenang-senang', 'Bermain / berseronok', 'To play / have fun'),
    '晚上': ('wǎn shang', 'Malam hari', 'Malam', 'Evening / night'),
    '为什么': ('wèi shén me', 'Mengapa / kenapa', 'Mengapa / kenapa', 'Why'),
    '问': ('wèn', 'Bertanya / menanyakan', 'Bertanya / menyoal', 'To ask'),
    '问题': ('wèn tí', 'Pertanyaan / masalah', 'Soalan / masalah', 'Question / problem'),
    '西瓜': ('xī guā', 'Semangka', 'Tembikai', 'Watermelon'),
    '希望': ('xī wàng', 'Berharap / harapan', 'Berharap / harapan', 'To hope / wish'),
    '洗': ('xǐ', 'Mencuci', 'Membasuh / mencuci', 'To wash'),
    '向': ('xiàng', 'Ke arah / menghadap', 'Ke arah / menghadap', 'Towards / to'),
    '小': ('xiǎo', 'Kecil', 'Kecil', 'Small'),
    '笑': ('xiào', 'Tertawa / tersenyum', 'Ketawa / senyum', 'To laugh / smile'),
    '新': ('xīn', 'Baru', 'Baharu / baru', 'New'),
    '姓': ('xìng', 'Nama keluarga / marga', 'Nama keluarga / marga', 'Surname / family name'),
    '休息': ('xiū xi', 'Beristirahat / istirahat', 'Berehat / rehat', 'To rest'),
    '雪': ('xuě', 'Salju', 'Salji', 'Snow'),
    '颜色': ('yán sè', 'Warna', 'Warna', 'Color'),
    '眼睛': ('yǎn jing', 'Mata', 'Mata', 'Eye'),
    '羊肉': ('yáng ròu', 'Daging kambing / domba', 'Daging kambing', 'Mutton / lamb'),
    '药': ('yào', 'Obat', 'Ubat', 'Medicine'),
    '要': ('yào', 'Mau / ingin / harus', 'Mahu / hendak / perlu', 'To want / need / must'),
    '也': ('yě', 'Juga / pun', 'Juga / pun', 'Also / too'),
    '一下': ('yí xià', 'Sebentar / sekejap', 'Sekejap / sebentar', 'A bit / in a moment'),
    '一起': ('yì qǐ', 'Bersama-sama / bareng', 'Bersama-sama / sekali', 'Together'),
    '意思': ('yì si', 'Arti / makna / maksud', 'Maksud / erti', 'Meaning / idea'),
    '因为': ('yīn wèi', 'Karena / sebab', 'Kerana / sebab', 'Because'),
    '游泳': ('yóu yǒng', 'Berenang', 'Berenang', 'To swim'),
    '右边': ('yòu bian', 'Sebelah kanan', 'Sebelah kanan', 'Right side'),
    '鱼': ('yú', 'Ikan', 'Ikan', 'Fish'),
    '元': ('yuán', 'Yuan (mata uang Tiongkok)', 'Yuan (mata wang)', 'Yuan (currency)'),
    '远': ('yuǎn', 'Jauh', 'Jauh', 'Far / distant'),
    '运动': ('yùn dòng', 'Olahraga / bergerak', 'Sukan / bersenam', 'Exercise / sports'),
    '再': ('zài', 'Lagi / sekali lagi', 'Lagi / sekali lagi', 'Again / once more'),
    '早上': ('zǎo shang', 'Pagi hari', 'Pagi', 'Early morning'),
    '丈夫': ('zhàng fu', 'Suami', 'Suami', 'Husband'),
    '找': ('zhǎo', 'Mencari / memberi kembalian', 'Mencari / pulangkan baki', 'To look for / give change'),
    '着': ('zhe', 'Partikel keadaan berlangsung (sedang)', 'Partikel keadaan berlangsung', 'Action in progress particle'),
    '真': ('zhēn', 'Sungguh / benar-benar', 'Sungguh / benar-benar', 'Real / really / truly'),
    '正在': ('zhèng zài', 'Sedang / tengah melakukan', 'Sedang / tengah buat', 'Currently in progress'),
    '知道': ('zhī dào', 'Tahu / mengetahui', 'Tahu / mengetahui', 'To know'),
    '准备': ('zhǔn bèi', 'Mempersiapkan / bersiap', 'Menyediakan / bersiap', 'To prepare / get ready'),
    '自行车': ('zì xíng chē', 'Sepeda', 'Basikal', 'Bicycle'),
    '走': ('zǒu', 'Berjalan / pergi', 'Berjalan / beredar', 'To walk / leave'),
    '左边': ('zuǒ bian', 'Sebelah kiri', 'Sebelah kiri', 'Left side'),
}

def translate_fast(text, target_lang='id'):
    key = f"{target_lang}_{text}"
    if key in cache and cache[key]:
        return cache[key]
    
    clean_text = text.strip()
    if not clean_text:
        return ""
    
    for attempt in range(2):
        try:
            url = f"https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=zh-CN&tl={target_lang}&q={urllib.parse.quote(clean_text)}"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=4) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                if isinstance(data, list) and len(data) > 0 and isinstance(data[0], str):
                    val = data[0].strip()
                    val = val[0].upper() + val[1:] if val else ""
                    cache[key] = val
                    return val
        except Exception:
            time.sleep(0.1)
    
    return ""

def is_definitely_english(text):
    if not text:
        return True
    lower = text.strip().lower()
    common_en = [
        'near', 'time', 'color', 'smile', 'can', 'everyone', 'bicycle', 'idea', 'table', 'therefore',
        'father', 'eight', 'cup', 'book', 'good', 'he', 'she', 'it', 'we', 'they', 'you',
        'tea', 'dish', 'water', 'hospital', 'school', 'student', 'teacher', 'money', 'big',
        'small', 'few', 'many', 'hot', 'cold', 'apple', 'cat', 'dog', 'friend', 'read', 'see',
        'listen', 'look', 'write', 'sleep', 'say', 'speak', 'to ', 'the ', 'of ', 'and ', 'or '
    ]
    for en in common_en:
        if lower == en or lower.startswith(en) or f" {en} " in f" {lower} ":
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

def process_word(item):
    hanzi = item['hanzi']
    pinyin = item['pinyin']
    indo = item.get('indonesian', '')
    ms = item.get('malay', '')
    en = item.get('english', '')

    if hanzi in CURATED:
        cur_pinyin, cur_id, cur_ms, cur_en = CURATED[hanzi]
        pinyin = cur_pinyin
        indo = cur_id
        ms = cur_ms
        en = cur_en
    else:
        if not indo or is_definitely_english(indo):
            indo = translate_fast(hanzi, 'id') or indo
        if not ms or is_definitely_english(ms):
            ms = translate_fast(hanzi, 'ms') or indo
        if not en:
            en = translate_fast(hanzi, 'en') or hanzi

    if indo:
        indo = indo.strip()
        indo = indo[0].upper() + indo[1:]
    if ms:
        ms = ms.strip()
        ms = ms[0].upper() + ms[1:]
    if en:
        en = en.strip()
        en = en[0].upper() + en[1:]

    # Fix natural example sentence
    exHanzi = f"在日常生活中，我们经常使用“{hanzi}”这个词。"
    exPinyin = f"Zài rìcháng shēnghuó zhōng, wǒmen jīngcháng shǐyòng “{pinyin}” zhè ge cí."
    exId = f"Dalam kehidupan sehari-hari, kita sering menggunakan kata \"{hanzi}\" ({indo})."
    exMs = f"Dalam kehidupan seharian, kita kerap menggunakan perkataan \"{hanzi}\" ({ms})."
    exEn = f"In daily life, we often use the word \"{hanzi}\" ({en})."

    return {
        'hanzi': hanzi,
        'pinyin': pinyin,
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
        ('src/data/hsk1Data.ts', 'HSK1_VOCAB_LIST', 'Standar Kurikulum HSK 1 (Dasar Pemula - 150 Kosakata Resmi)'),
        ('src/data/hsk2Data.ts', 'HSK2_VOCAB_LIST', 'Standar Kurikulum HSK 2 (Dasar Lanjutan - 150 Kosakata Resmi)'),
        ('src/data/hsk3Data.ts', 'HSK3_VOCAB_LIST', 'Standar Kurikulum HSK 3 (Menengah Awal - 300 Kosakata Resmi)'),
        ('src/data/hsk4Data.ts', 'HSK4_VOCAB_LIST', 'Standar Kurikulum HSK 4 (Menengah Mandiri - 600 Kosakata Resmi)'),
        ('src/data/hsk5Data.ts', 'HSK5_VOCAB_LIST', 'Standar Kurikulum HSK 5 (Tingkat Mahir Membaca & Diskusi - 1000 Kosakata Resmi)'),
        ('src/data/hsk6Data.ts', 'HSK6_VOCAB_LIST', 'Standar Kurikulum HSK 6 (Tingkat Mahir Sastra & Profesional - 800 Kosakata Resmi)'),
        ('src/data/shoppingTravelNumbersVocab.ts', 'SHOPPING_TRAVEL_NUMBERS_VOCAB', 'Kurasi Khusus: Belanja, Travel & Angka (HSK 1 - HSK 3: 125 Kosakata Praktis)'),
    ]

    for filepath, var_name, title in files:
        raw_items = parse_ts_file(filepath)
        print(f"Translating {len(raw_items)} words in {filepath}...")
        with ThreadPoolExecutor(max_workers=25) as ex:
            results = list(ex.map(process_word, raw_items))
        
        ts_code = format_ts_file(var_name, title, results)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(ts_code)
        print(f"✓ Saved {len(results)} translated items to {filepath}")

    with open(CACHE_FILE, 'w', encoding='utf-8') as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)
    print("ALL VOCABULARY FILES TRANSLATED TO INDONESIAN & MALAY!")

if __name__ == '__main__':
    run()
