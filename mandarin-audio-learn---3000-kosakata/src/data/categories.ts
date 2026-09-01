export interface VocabCategory {
  id: string;
  name: string;
  chinese: string;
  icon: string;
  description: string;
}

export const VOCAB_CATEGORIES: VocabCategory[] = [
  { id: 'shopping_travel_numbers', name: 'Belanja, Travel dan Angka', chinese: '购物·旅游·数字', icon: '🛍️', description: 'Kosakata praktis belanja tawar-menawar, transportasi wisata keliling kota, dan sistem angka penanggalan dari HSK 1-3.' },
  { id: 'basics', name: 'Salam & Percakapan Dasar', chinese: '日常问候', icon: '👋', description: 'Kata sapaan, ucapan terima kasih, dan frasa penting sehari-hari.' },
  { id: 'pronouns', name: 'Kata Ganti & Orang', chinese: '代词与人物', icon: '👤', description: 'Kata ganti orang (saya, kamu, dia), gelar, dan panggilan.' },
  { id: 'numbers_time', name: 'Angka, Waktu & Tanggal', chinese: '数字与时间', icon: '⏰', description: 'Bilangan, jam, hari, bulan, tahun, dan penunjuk durasi.' },
  { id: 'food_drink', name: 'Makanan & Minuman', chinese: '餐饮美食', icon: '🍜', description: 'Bahan masakan, buah, sayur, hidangan restoran, dan rasa.' },
  { id: 'family_home', name: 'Keluarga & Rumah Tangga', chinese: '家庭与居家', icon: '🏠', description: 'Anggota keluarga, perabot rumah, dan aktivitas domestik.' },
  { id: 'places_travel', name: 'Tempat, Arah & Perjalanan', chinese: '地点与旅游', icon: '🗺️', description: 'Lokasi kota, penunjuk arah mata angin, dan pariwisata.' },
  { id: 'transportation', name: 'Transportasi & Lalu Lintas', chinese: '交通出行', icon: '🚗', description: 'Kendaraan umum, tiket, bandara, stasiun, dan navigasi.' },
  { id: 'shopping_money', name: 'Belanja, Uang & Bisnis', chinese: '购物与商务', icon: '💰', description: 'Mata uang, harga, tawar-menawar, toko, dan transaksi.' },
  { id: 'work_office', name: 'Pekerjaan & Profesi', chinese: '工作与职业', icon: '💼', description: 'Dunia kerja, rapat, jabatan kantor, dan profesi.' },
  { id: 'education_study', name: 'Sekolah & Belajar', chinese: '教育与学习', icon: '📚', description: 'Pelajaran, ujian, universitas, alat tulis, dan buku.' },
  { id: 'emotions_traits', name: 'Emosi, Sifat & Perasaan', chinese: '情绪与性格', icon: '😊', description: 'Karakteristik manusia, perasaan senang, sedih, dan marah.' },
  { id: 'health_body', name: 'Kesehatan & Bagian Tubuh', chinese: '健康与身体', icon: '🏥', description: 'Organ tubuh, gejala penyakit, obat, dan rumah sakit.' },
  { id: 'weather_nature', name: 'Cuaca, Musim & Alam', chinese: '天气与自然', icon: '☀️', description: 'Kondisi iklim, hewan, tumbuhan, dan pemandangan alam.' },
  { id: 'verbs_actions', name: 'Kata Kerja Aksi Sehari-hari', chinese: '常用动词', icon: '⚡', description: 'Tindakan harian, pergerakan, komunikasi, dan kebiasaan.' },
  { id: 'adjectives_desc', name: 'Kata Sifat & Deskripsi', chinese: '形容词与描述', icon: '✨', description: 'Warna, ukuran, kualitas, bentuk, dan karakteristik benda.' },
  { id: 'grammar_particles', name: 'Kata Hubung & Partikel Tata Bahasa', chinese: '虚词与语法', icon: '🧩', description: 'Partikel penegas (de, le, ba, ma), konjungsi, dan preposisi.' },
];
