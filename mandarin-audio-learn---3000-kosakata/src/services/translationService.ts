import { AppLanguage, MandarinWord, ProficiencyLevel, HSKLevel } from '../types';
import { SHOPPING_TRAVEL_NUMBERS_VOCAB } from '../data/shoppingTravelNumbersVocab';

// UI Strings in 3 Languages: Indonesian (id), Malay (ms), English (en)
export const UI_TRANSLATIONS = {
  id: {
    appTitle: 'MANDARINNOW',
    appSubtitle: 'Menghafal kosa kata cara santai',
    levelBasic: 'Dasar',
    levelBasicSub: 'HSK 1 & HSK 2',
    levelBasicDesc: 'Fondasi 0, percakapan sehari-hari esensial & salam',
    levelNumbersShopping: 'Belanja, Travel & Angka',
    levelNumbersShoppingSub: 'Kurasi Khusus HSK 1 - HSK 3',
    levelNumbersShoppingDesc: 'Kosakata praktis belanja tawar-menawar, transportasi wisata keliling kota, dan sistem angka penanggalan dari HSK 1-3',
    levelIntermediate: 'Menengah',
    levelIntermediateSub: 'HSK 3 & HSK 4',
    levelIntermediateDesc: 'Percakapan lancar, kantor, belanja, transportasi & opini',
    levelAdvanced: 'Mahir',
    levelAdvancedSub: 'HSK 5 & HSK 6',
    levelAdvancedDesc: 'Bisnis, teknologi, istilah profesional & literatur',
    levelAll: 'Semua (3000 Kata)',
    
    // Header & Navigation
    toneGuide: 'Panduan 4 Nada',
    catalog: 'Katalog 3000 Kata',
    quiz: 'Kuis & Latihan',
    bookmarks: 'Favorit',
    resetToStart: 'Reset ke Awal',
    settings: 'Pengaturan',
    langSelector: 'Bahasa',
    
    // Banner info
    batchBannerTitle: 'Sesi Aktif',
    batchCumulativePrefix: 'Kosakata Aktif:',
    wordsUnit: 'Kata',
    batchNum: 'Batch',
    startListening: 'Mulai Dengar',
    pauseAudio: 'Jeda Audio',
    resumeAudio: 'Lanjutkan Audio',
    quizActive: 'Tes Kuis',
    resetWordsBtn: 'Acak (Random)',
    randomMode: 'Acak (Random)',
    randomModeOn: 'Acak: ON',
    randomModeOff: 'Acak: OFF',
    randomModeTooltip: 'Mode Acak: Kosakata awal dan penambahan +5 kata akan diacak agar tidak bosan',
    loopMode: 'Loop Ulang',
    loopModeOn: 'Loop: ON',
    loopModeOff: 'Loop: OFF',
    loopModeTooltip: 'Putar Ulang Terus (Looping batch otomatis tanpa henti)',
    
    // Audio Player Bar
    liveSpeed: 'Kecepatan Baca:',
    repPerWord: 'Ulang Baca Perkata:',
    pauseIntervalLabel: 'Jeda Kata dalam Pembacaan:',
    pauseBetweenRepsSetting: 'Jeda Antara Pengulangan:',
    pauseBetweenWordsSetting: 'Jeda Antar Kata Baru:',
    pauseUnitSec: 'detik',
    hideModeLabel: 'Mode Sembunyi:',
    hideAll: 'Sembunyikan Semua',
    hideMeaning: 'Tutup Arti',
    hideHanzi: 'Tutup Hanzi',
    hideNone: 'Buka Semua',
    repeatBatchBtn: 'Reset',
    next5WordsBtn: 'Tambah 5 Kata Baru',
    prevWordTooltip: 'Kata Sebelumnya',
    nextWordTooltip: 'Kata Berikutnya',
    stopAudioTooltip: 'Hentikan Audio',
    resetLevelTooltip: 'Reset kembali belajar dari 5 kosakata pertama level ini',
    
    // Word Card
    meaningLabel: 'Arti:',
    exampleSentence: 'Contoh Kalimat Sehari-hari',
    listenMandarin: 'Dengarkan pengucapan Mandarin',
    listenMeaning: 'Dengarkan pengucapan arti',
    bookmarkAdd: 'Simpan ke favorit',
    bookmarkRemove: 'Hapus dari favorit',
    peekWord: 'Intip / Buka kata',
    hideAgain: 'Sembunyikan kembali',
    maskedHanzi: '🔒 Karakter Hanzi Disembunyikan (Klik untuk Intip)',
    maskedPinyin: '🔒 Pinyin tersembunyi',
    maskedMeaning: '🔒 Arti Disembunyikan (Uji Ingatan)',
    tone1: 'Nada 1 (—)',
    tone2: 'Nada 2 (／)',
    tone3: 'Nada 3 (∨)',
    tone4: 'Nada 4 (＼)',
    toneNeutral: 'Netral (•)',
    phaseMandarin: '🇨🇳 Mandarin',
    phaseMeaning: '🇮🇩 Arti Indonesia',
    phasePause: '⏸️ Jeda',
    
    // Catalog Modal
    catalogTitle: 'Katalog 3000 Kosakata Mandarin Harian',
    catalogSubtitle: 'Jelajahi, cari berdasarkan Hanzi / Pinyin / Terjemahan, atau mulai sesi dari kata tertentu',
    searchPlaceholder: 'Cari hanzi, pinyin, arti...',
    allHSK: 'Semua Level HSK',
    allCategories: 'Semua Kategori',
    learnFromHere: 'Mulai Belajar Dari Sini',
    close: 'Tutup',
    showingWords: 'Menampilkan kata',
    pageOf: 'Halaman',
    of: 'dari',
    
    // Quiz Modal
    quizTitle: 'Kuis & Evaluasi Penguasaan Kosakata',
    quizSubtitle: 'Uji daya ingat karakter Hanzi, Pinyin, dan Terjemahan secara interaktif',
    question: 'Pertanyaan',
    score: 'Skor Anda:',
    selectMeaningFor: 'Pilih arti yang tepat untuk karakter:',
    selectHanziFor: 'Pilih karakter Hanzi yang tepat untuk:',
    listenAndSelect: 'Dengarkan suara audio dan pilih arti yang tepat:',
    listenAgain: 'Dengar Ulang Audio',
    correct: 'Benar! Luar biasa!',
    incorrect: 'Kurang tepat! Jawaban benar adalah:',
    nextQuestion: 'Pertanyaan Berikutnya',
    quizFinished: 'Kuis Selesai!',
    quizResultMsg: 'Hebat! Anda telah menyelesaikan latihan uji ingatan.',
    tryAgain: 'Ulangi Kuis',
    
    // Settings Modal
    settingsTitle: 'Pengaturan Audio & Suara',
    settingsSubtitle: 'Sesuaikan kecepatan, jumlah pengulangan, bahasa, dan suara TTS',
    repCountSetting: 'Jumlah Pengulangan Setiap Kosakata:',
    speedSetting: 'Kecepatan Bicara Mandarin:',
    playOrderSetting: 'Urutan Pemutaran Suara:',
    orderMandarinThenMeaning: '🇨🇳 Mandarin dahulu ➔ 🇮🇩 Terjemahan',
    orderMeaningThenMandarin: '🇮🇩 Terjemahan dahulu ➔ 🇨🇳 Mandarin',
    orderMandarinOnly: '🇨🇳 Mandarin Saja (Tanpa Terjemahan)',
    mandarinVoice: 'Pilihan Suara Mandarin (TTS):',
    meaningVoice: 'Pilihan Suara Terjemahan (TTS):',
    testVoice: 'Uji Suara Contoh',
    saveSettings: 'Simpan Pengaturan',
    autoAdvanceSetting: 'Otomatis tambah 5 kata baru setelah batch selesai',

    // Pengulangan Berjenjang (Kata Lama vs Baru)
    tieredRepsSectionTitle: 'Pengulangan Berjenjang (Kata Lama vs Baru)',
    tieredRepsSectionSubtitle: 'Kurangi repetisi kata-kata awal/lama yang sudah hafal agar waktu belajar lebih efisien dan tidak membosankan',
    tieredRepsToggleLabel: 'Fitur Repetisi Berjenjang (ON/OFF):',
    tieredRepsOn: 'Berjenjang: ON',
    tieredRepsOff: 'Berjenjang: OFF',
    tieredRecentWordsLabel: 'Batas kata baru untuk pengulangan dari kata yang terakhir:',
    tieredRecentWordsBarLabel: 'Batas kata baru untuk pengulangan dari kata yang terakhir:',
    tieredRecentWordsDesc: 'Jumlah kata urutan terakhir yang akan dibaca dengan pengulangan penuh',
    tieredOlderWordsDesc: 'Kata-kata awal sebelum batas kata baru yang dibaca lebih sedikit / dilewati',
    tieredOlderRepsLabel: 'Repetisi untuk Kata Lama (Sebelum Kata Baru):',
    tieredOlderRepsDesc: 'Kata urutan awal sejak nomor 1 sebelum batas kata baru terakhir',
    tieredOlderRepsSkip: '0x (Lewati / Skip)',
    tieredModeSlidingLabel: 'Metode 1: Otomatis Jarak Kata (Direkomendasikan)',
    tieredModeCustomLabel: 'Metode 2: Rentang Nomor Kata Kustom',
    tieredExampleText: 'Contoh: Saat sesi mencapai 20 kata dan batas 15 kata baru, kata no. 1–5 dibaca 1x (atau dilewati 0x), sedangkan kata no. 6–20 dibaca 3x.',
    tieredRangeFrom: 'Kata No.',
    tieredRangeTo: 's/d No.',
    tieredRangeReps: 'Dibaca',
    tieredAddRule: '+ Tambah Rentang Baru',
    tieredDeleteRule: 'Hapus',
    allWordsLabel: 'Semua Kata',
    olderWordsLabel: 'Kata Lama',
    recentWordsLabel: 'Kata Baru',
    skippedLabel: 'Lewati (0x)',
    tieredLivePreview: 'Simulasi Pembacaan Batch Saat Ini:',
    
    // Tone Guide Modal
    toneGuideTitle: 'Panduan Lengkap 4 Nada Mandarin',
    toneGuideSubtitle: 'Pahami perbedaan nada, intonasi, dan arti yang berbeda dalam Bahasa Mandarin',
    playToneSample: 'Dengarkan Contoh Nada',

    // Trial License (2 Bulan)
    licenseSectionTitle: 'Limitasi Waktu / Masa Lisensi (2 Bulan)',
    licenseSectionSubtitle: 'Pengaturan limitasi akses 60 hari sejak aplikasi pertama kali diinstall',
    licenseToggleLabel: 'Limitasi Waktu (2 Bulan):',
    licenseStatusActive: 'Limitasi Aktif (2 Bulan / 60 Hari)',
    licenseStatusDisabled: 'Limitasi Nonaktif (Akses Penuh / Bebas)',
    licenseUnlocked: 'Lisensi Permanen Aktif (Akses Penuh)',
    licenseDaysRemaining: 'Sisa Waktu Akses:',
    licenseDays: 'Hari',
    licenseHours: 'Jam',
    licenseInstalledOn: 'Tanggal Mulai Install:',
    licenseExpiresOn: 'Batas Kedaluwarsa:',
    licenseResetBtn: 'Reset Masa Uji Coba (Mulai 60 Hari Baru)',
    licenseTestExpireBtn: 'Uji Tampilan Kedaluwarsa',
    licenseCodePlaceholder: 'Masukkan kode aktivasi (contoh: VIP-MANDARIN-2026)',
    licenseActivateBtn: 'Buka Akses Penuh',
    licenseExpiredModalTitle: 'Masa Akses 2 Bulan Telah Berakhir',
    licenseExpiredModalDesc: 'Masa uji coba 60 hari sejak aplikasi pertama kali dipasang telah selesai. Masukkan kode aktivasi resmi untuk melanjutkan belajar.',
    licenseExpiredBadge: 'Akses Berakhir (Expired)',
    licenseActiveBadge: 'Masa Aktif 2 Bulan',
    licenseUnlimitedBadge: 'Akses Penuh (Unlimited)',
  },
  
  ms: {
    appTitle: 'MANDARINNOW',
    appSubtitle: 'Menghafal kosa kata cara santai',
    levelBasic: 'Asas',
    levelBasicSub: 'HSK 1 & HSK 2',
    levelBasicDesc: 'Asas 0, perbualan harian penting & ucapan salam',
    levelNumbersShopping: 'Nombor & Beli-Belah',
    levelNumbersShoppingSub: 'Kiraan, Diskaun & Unit',
    levelNumbersShoppingDesc: 'Nombor 1-100juta, operasi (+ - × ÷), diskaun, setengah kilo (jin), dan unit membeli-belah harian',
    levelIntermediate: 'Pertengahan',
    levelIntermediateSub: 'HSK 3 & HSK 4',
    levelIntermediateDesc: 'Perbualan lancar, pejabat, membeli-belah, pengangkutan & pendapat',
    levelAdvanced: 'Maju',
    levelAdvancedSub: 'HSK 5 & HSK 6',
    levelAdvancedDesc: 'Perniagaan, teknologi, istilah profesional & sastera',
    levelAll: 'Semua (3000 Perkataan)',
    
    // Header & Navigation
    toneGuide: 'Panduan 4 Nada',
    catalog: 'Katalog 3000 Perkataan',
    quiz: 'Kuiz & Latihan',
    bookmarks: 'Kegemaran',
    resetToStart: 'Set Semula ke Awal',
    settings: 'Tetapan',
    langSelector: 'Bahasa',
    
    // Banner info
    batchBannerTitle: 'Sesi Aktif',
    batchCumulativePrefix: 'Perkataan Aktif:',
    wordsUnit: 'Perkataan',
    batchNum: 'Kumpulan',
    startListening: 'Mula Dengar',
    pauseAudio: 'Jeda Audio',
    resumeAudio: 'Sambung Audio',
    quizActive: 'Ujian Kuiz',
    resetWordsBtn: 'Rawak (Random)',
    randomMode: 'Rawak (Random)',
    randomModeOn: 'Rawak: ON',
    randomModeOff: 'Rawak: OFF',
    randomModeTooltip: 'Mod Rawak: Perkataan awal dan penambahan +5 perkataan akan dirawakkan agar tidak bosan',
    loopMode: 'Loop Ulang',
    loopModeOn: 'Loop: ON',
    loopModeOff: 'Loop: OFF',
    loopModeTooltip: 'Main Semula Berterusan (Looping kumpulan secara automatik)',
    
    // Audio Player Bar
    liveSpeed: 'Kelajuan Baca:',
    repPerWord: 'Ulang Baca Setiap Perkataan:',
    pauseIntervalLabel: 'Jeda Perkataan dalam Pembacaan:',
    pauseBetweenRepsSetting: 'Jeda Antara Ulangan:',
    pauseBetweenWordsSetting: 'Jeda Antara Perkataan Baru:',
    pauseUnitSec: 'saat',
    hideModeLabel: 'Mod Sorok:',
    hideAll: 'Sorok Semua',
    hideMeaning: 'Tutup Maksud',
    hideHanzi: 'Tutup Hanzi',
    hideNone: 'Buka Semua',
    repeatBatchBtn: 'Reset',
    next5WordsBtn: 'Tambah 5 Perkataan Baru',
    prevWordTooltip: 'Perkataan Sebelumnya',
    nextWordTooltip: 'Perkataan Seterusnya',
    stopAudioTooltip: 'Hentikan Audio',
    resetLevelTooltip: 'Set semula pembelajaran dari 5 perkataan pertama tahap ini',
    
    // Word Card
    meaningLabel: 'Maksud:',
    exampleSentence: 'Contoh Ayat Harian',
    listenMandarin: 'Dengar sebutan Mandarin',
    listenMeaning: 'Dengar sebutan maksud',
    bookmarkAdd: 'Simpan ke kegemaran',
    bookmarkRemove: 'Padam dari kegemaran',
    peekWord: 'Intip / Buka perkataan',
    hideAgain: 'Sorok semula',
    maskedHanzi: '🔒 Aksara Hanzi Disorokkan (Klik untuk Intip)',
    maskedPinyin: '🔒 Pinyin disorokkan',
    maskedMeaning: '🔒 Maksud Disorokkan (Uji Ingatan)',
    tone1: 'Nada 1 (—)',
    tone2: 'Nada 2 (／)',
    tone3: 'Nada 3 (∨)',
    tone4: 'Nada 4 (＼)',
    toneNeutral: 'Neutral (•)',
    phaseMandarin: '🇨🇳 Mandarin',
    phaseMeaning: '🇲🇾 Maksud Melayu',
    phasePause: '⏸️ Jeda',
    
    // Catalog Modal
    catalogTitle: 'Katalog 3000 Perbendaharaan Kata Mandarin Harian',
    catalogSubtitle: 'Terokai, cari berdasarkan Hanzi / Pinyin / Terjemahan, atau mulakan sesi dari perkataan tertentu',
    searchPlaceholder: 'Cari hanzi, pinyin, maksud...',
    allHSK: 'Semua Tahap HSK',
    allCategories: 'Semua Kategori',
    learnFromHere: 'Mula Belajar Dari Sini',
    close: 'Tutup',
    showingWords: 'Menunjukkan perkataan',
    pageOf: 'Halaman',
    of: 'daripada',
    
    // Quiz Modal
    quizTitle: 'Kuiz & Penilaian Penguasaan Kosakata',
    quizSubtitle: 'Uji daya ingatan aksara Hanzi, Pinyin, dan Terjemahan secara interaktif',
    question: 'Soalan',
    score: 'Skor Anda:',
    selectMeaningFor: 'Pilih maksud yang tepat untuk aksara:',
    selectHanziFor: 'Pilih aksara Hanzi yang tepat untuk:',
    listenAndSelect: 'Dengar audio dan pilih maksud yang tepat:',
    listenAgain: 'Dengar Semula Audio',
    correct: 'Betul! Cemerlang!',
    incorrect: 'Kurang tepat! Jawapan yang betul ialah:',
    nextQuestion: 'Soalan Seterusnya',
    quizFinished: 'Kuiz Selesai!',
    quizResultMsg: 'Syabas! Anda telah melengkapkan latihan ingatan.',
    tryAgain: 'Ulangi Kuiz',
    
    // Settings Modal
    settingsTitle: 'Tetapan Audio & Suara',
    settingsSubtitle: 'Laraskan kelajuan, bilangan ulangan, bahasa, dan suara TTS',
    repCountSetting: 'Bilangan Ulangan Setiap Perkataan:',
    speedSetting: 'Kelajuan Pertuturan Mandarin:',
    playOrderSetting: 'Susunan Mainan Suara:',
    orderMandarinThenMeaning: '🇨🇳 Mandarin dahulu ➔ 🇲🇾 Terjemahan',
    orderMeaningThenMandarin: '🇲🇾 Terjemahan dahulu ➔ 🇨🇳 Mandarin',
    orderMandarinOnly: '🇨🇳 Mandarin Sahaja (Tanpa Terjemahan)',
    mandarinVoice: 'Pilihan Suara Mandarin (TTS):',
    meaningVoice: 'Pilihan Suara Terjemahan (TTS):',
    testVoice: 'Uji Contoh Suara',
    saveSettings: 'Simpan Tetapan',
    autoAdvanceSetting: 'Automatik tambah 5 perkataan baru selepas kumpulan selesai',

    // Pengulangan Berjenjang (Kata Lama vs Baru)
    tieredRepsSectionTitle: 'Ulangan Berperingkat (Perkataan Lama vs Baru)',
    tieredRepsSectionSubtitle: 'Kurangkan ulangan perkataan awal/lama yang sudah diingati agar sesi lebih cekap dan tidak membosankan',
    tieredRepsToggleLabel: 'Ciri Ulangan Berperingkat (ON/OFF):',
    tieredRepsOn: 'Berperingkat: ON',
    tieredRepsOff: 'Berperingkat: OFF',
    tieredRecentWordsLabel: 'Batas perkataan baru untuk ulangan daripada perkataan yang terakhir:',
    tieredRecentWordsBarLabel: 'Batas perkataan baru untuk ulangan daripada perkataan yang terakhir:',
    tieredRecentWordsDesc: 'Bilangan perkataan urutan terakhir yang akan dibaca dengan ulangan penuh',
    tieredOlderWordsDesc: 'Perkataan awal sebelum batas perkataan baru yang dibaca lebih sedikit / dilangkau',
    tieredOlderRepsLabel: 'Ulangan untuk Perkataan Lama:',
    tieredOlderRepsDesc: 'Perkataan urutan awal sejak nombor 1 sebelum batas perkataan baru terakhir',
    tieredOlderRepsSkip: '0x (Langkau / Skip)',
    tieredModeSlidingLabel: 'Kaedah 1: Automatik Jarak Perkataan (Disyorkan)',
    tieredModeCustomLabel: 'Kaedah 2: Julat Nombor Perkataan Tersuai',
    tieredExampleText: 'Contoh: Apabila sesi mencapai 20 perkataan dan batas 15 perkataan baru, no. 1–5 dibaca 1x (atau dilangkau 0x), manakala no. 6–20 dibaca 3x.',
    tieredRangeFrom: 'Perkataan No.',
    tieredRangeTo: 'hingga No.',
    tieredRangeReps: 'Dibaca',
    tieredAddRule: '+ Tambah Julat Baru',
    tieredDeleteRule: 'Padam',
    allWordsLabel: 'Semua Perkataan',
    olderWordsLabel: 'Perkataan Lama',
    recentWordsLabel: 'Perkataan Baru',
    skippedLabel: 'Langkau (0x)',
    tieredLivePreview: 'Simulasi Bacaan Kumpulan Semasa:',
    
    // Tone Guide Modal
    toneGuideTitle: 'Panduan Lengkap 4 Nada Mandarin',
    toneGuideSubtitle: 'Fahami perbezaan nada, intonasi, dan maksud yang berbeza dalam Bahasa Mandarin',
    playToneSample: 'Dengar Contoh Nada',

    // Trial License (2 Bulan)
    licenseSectionTitle: 'Had Masa / Tempoh Lesen (2 Bulan)',
    licenseSectionSubtitle: 'Tetapan had akses 60 hari dari tarikh aplikasi mula dipasang',
    licenseToggleLabel: 'Had Masa (2 Bulan):',
    licenseStatusActive: 'Had Aktif (2 Bulan / 60 Hari)',
    licenseStatusDisabled: 'Had Dinyahaktifkan (Akses Penuh / Bebas)',
    licenseUnlocked: 'Lesen Kekal Aktif (Akses Penuh)',
    licenseDaysRemaining: 'Baki Masa Akses:',
    licenseDays: 'Hari',
    licenseHours: 'Jam',
    licenseInstalledOn: 'Tarikh Mula Pasang:',
    licenseExpiresOn: 'Tarikh Tamat Tempoh:',
    licenseResetBtn: 'Set Semula Tempoh Percubaan (Mula 60 Hari Baru)',
    licenseTestExpireBtn: 'Uji Paparan Tamat Tempoh',
    licenseCodePlaceholder: 'Masukkan kod pengaktifan (contoh: VIP-MANDARIN-2026)',
    licenseActivateBtn: 'Buka Akses Penuh',
    licenseExpiredModalTitle: 'Tempoh Akses 2 Bulan Telah Tamat',
    licenseExpiredModalDesc: 'Tempoh percubaan 60 hari sejak aplikasi pertama kali dipasang telah tamat. Masukkan kod pengaktifan rasmi untuk menyambung pembelajaran.',
    licenseExpiredBadge: 'Akses Tamat (Expired)',
    licenseActiveBadge: 'Masa Aktif 2 Bulan',
    licenseUnlimitedBadge: 'Akses Penuh (Unlimited)',
  },
  
  en: {
    appTitle: 'MANDARINNOW',
    appSubtitle: 'Memorize vocabulary the relaxed way while doing daily activities',
    levelBasic: 'Basic',
    levelBasicSub: 'HSK 1 & HSK 2',
    levelBasicDesc: 'Zero foundation, essential everyday greetings & basics',
    levelNumbersShopping: 'Numbers & Shopping',
    levelNumbersShoppingSub: 'Math, Discounts & Units',
    levelNumbersShoppingDesc: 'Numbers 1-100M, arithmetic (+ - × ÷), discounts, half-kilo (jin), and shopping units',
    levelIntermediate: 'Intermediate',
    levelIntermediateSub: 'HSK 3 & HSK 4',
    levelIntermediateDesc: 'Fluent conversation, workplace, shopping, travel & opinions',
    levelAdvanced: 'Advanced',
    levelAdvancedSub: 'HSK 5 & HSK 6',
    levelAdvancedDesc: 'Business, tech, professional terms, idioms & literature',
    levelAll: 'All (3000 Words)',
    
    // Header & Navigation
    toneGuide: '4 Tones Guide',
    catalog: '3000 Words Catalog',
    quiz: 'Quiz & Practice',
    bookmarks: 'Favorites',
    resetToStart: 'Reset to Start',
    settings: 'Settings',
    langSelector: 'Language',
    
    // Banner info
    batchBannerTitle: 'Active Session',
    batchCumulativePrefix: 'Active Vocabulary:',
    wordsUnit: 'Words',
    batchNum: 'Batch',
    startListening: 'Start Listening',
    pauseAudio: 'Pause Audio',
    resumeAudio: 'Resume Audio',
    quizActive: 'Take Quiz',
    resetWordsBtn: 'Random (Shuffle)',
    randomMode: 'Random (Shuffle)',
    randomModeOn: 'Random: ON',
    randomModeOff: 'Random: OFF',
    randomModeTooltip: 'Random Mode: Starting words and new +5 words will be shuffled to keep practice fresh',
    loopMode: 'Loop Playback',
    loopModeOn: 'Loop: ON',
    loopModeOff: 'Loop: OFF',
    loopModeTooltip: 'Continuous Looping (Auto-replays current active batch continuously)',
    
    // Audio Player Bar
    liveSpeed: 'Reading Speed:',
    repPerWord: 'Repeat Per Word:',
    pauseIntervalLabel: 'Word Pause in Reading:',
    pauseBetweenRepsSetting: 'Pause Between Repetitions:',
    pauseBetweenWordsSetting: 'Pause Between New Words:',
    pauseUnitSec: 'sec',
    hideModeLabel: 'Hide Mode:',
    hideAll: 'Hide All',
    hideMeaning: 'Hide Meaning',
    hideHanzi: 'Hide Hanzi',
    hideNone: 'Show All',
    repeatBatchBtn: 'Reset',
    next5WordsBtn: 'Add 5 New Words',
    prevWordTooltip: 'Previous Word',
    nextWordTooltip: 'Next Word',
    stopAudioTooltip: 'Stop Audio',
    resetLevelTooltip: 'Reset learning back to first 5 words of this level',
    
    // Word Card
    meaningLabel: 'Meaning:',
    exampleSentence: 'Everyday Example Sentence',
    listenMandarin: 'Listen to Mandarin pronunciation',
    listenMeaning: 'Listen to meaning pronunciation',
    bookmarkAdd: 'Save to favorites',
    bookmarkRemove: 'Remove from favorites',
    peekWord: 'Peek / Reveal word',
    hideAgain: 'Hide again',
    maskedHanzi: '🔒 Hanzi Characters Hidden (Click to Peek)',
    maskedPinyin: '🔒 Pinyin hidden',
    maskedMeaning: '🔒 Meaning Hidden (Recall Test)',
    tone1: 'Tone 1 (—)',
    tone2: 'Tone 2 (／)',
    tone3: 'Tone 3 (∨)',
    tone4: 'Tone 4 (＼)',
    toneNeutral: 'Neutral (•)',
    phaseMandarin: '🇨🇳 Mandarin',
    phaseMeaning: '🇬🇧 English Meaning',
    phasePause: '⏸️ Pause',
    
    // Catalog Modal
    catalogTitle: 'Daily 3000 Mandarin Vocabulary Catalog',
    catalogSubtitle: 'Browse, search by Hanzi / Pinyin / English / Indonesian, or start learning from any word',
    searchPlaceholder: 'Search hanzi, pinyin, meaning...',
    allHSK: 'All HSK Levels',
    allCategories: 'All Categories',
    learnFromHere: 'Start Learning From Here',
    close: 'Close',
    showingWords: 'Showing words',
    pageOf: 'Page',
    of: 'of',
    
    // Quiz Modal
    quizTitle: 'Vocabulary Mastery Quiz & Evaluation',
    quizSubtitle: 'Test your memory of Hanzi, Pinyin, and translations interactively',
    question: 'Question',
    score: 'Your Score:',
    selectMeaningFor: 'Select the correct meaning for the character:',
    selectHanziFor: 'Select the correct Hanzi character for:',
    listenAndSelect: 'Listen to the audio and choose the correct meaning:',
    listenAgain: 'Replay Audio',
    correct: 'Correct! Excellent!',
    incorrect: 'Not quite! The correct answer is:',
    nextQuestion: 'Next Question',
    quizFinished: 'Quiz Completed!',
    quizResultMsg: 'Awesome! You have finished the memory retention practice.',
    tryAgain: 'Restart Quiz',
    
    // Settings Modal
    settingsTitle: 'Audio & Voice Settings',
    settingsSubtitle: 'Adjust playback speed, repetitions, language, and TTS voices',
    repCountSetting: 'Repetitions for Each Vocabulary Word:',
    speedSetting: 'Mandarin Speech Rate:',
    playOrderSetting: 'Audio Playback Sequence:',
    orderMandarinThenMeaning: '🇨🇳 Mandarin first ➔ 🌐 Translation',
    orderMeaningThenMandarin: '🌐 Translation first ➔ 🇨🇳 Mandarin',
    orderMandarinOnly: '🇨🇳 Mandarin Only (No Translation)',
    mandarinVoice: 'Mandarin Voice Selection (TTS):',
    meaningVoice: 'Translation Voice Selection (TTS):',
    testVoice: 'Test Sample Voice',
    saveSettings: 'Save Settings',
    autoAdvanceSetting: 'Automatically advance +5 words after batch completes',

    // Pengulangan Berjenjang (Kata Lama vs Baru)
    tieredRepsSectionTitle: 'Tiered Repetitions (Older vs New Words)',
    tieredRepsSectionSubtitle: 'Automatically reduce repetitions for mastered/older words to make long cumulative sessions efficient',
    tieredRepsToggleLabel: 'Tiered Repetition Feature (ON/OFF):',
    tieredRepsOn: 'Tiered: ON',
    tieredRepsOff: 'Tiered: OFF',
    tieredRecentWordsLabel: 'New words limit for repetition from the latest words:',
    tieredRecentWordsBarLabel: 'New words limit for repetition from the latest words:',
    tieredRecentWordsDesc: 'Number of latest words in the active session that receive full repetitions',
    tieredOlderWordsDesc: 'Early words before the new words limit that receive fewer repetitions or are skipped',
    tieredOlderRepsLabel: 'Repetitions for Older Words:',
    tieredOlderRepsDesc: 'Early words from #1 before the latest new words threshold',
    tieredOlderRepsSkip: '0x (Skip)',
    tieredModeSlidingLabel: 'Method 1: Automatic Distance Window (Recommended)',
    tieredModeCustomLabel: 'Method 2: Custom Word Number Ranges',
    tieredExampleText: 'Example: When session reaches 20 words with a limit of 15 new words, words #1–5 are read 1x (or skipped 0x), while #6–20 are read 3x.',
    tieredRangeFrom: 'Word #',
    tieredRangeTo: 'to #',
    tieredRangeReps: 'Reps',
    tieredAddRule: '+ Add Range Rule',
    tieredDeleteRule: 'Delete',
    allWordsLabel: 'All Words',
    olderWordsLabel: 'Older Words',
    recentWordsLabel: 'New Words',
    skippedLabel: 'Skip (0x)',
    tieredLivePreview: 'Current Batch Reading Simulation:',
    
    // Tone Guide Modal
    toneGuideTitle: 'Complete Guide to 4 Mandarin Tones',
    toneGuideSubtitle: 'Master tone differences, pitches, and meanings in Mandarin Chinese',
    playToneSample: 'Listen to Tone Sample',

    // Trial License (2 Months)
    licenseSectionTitle: 'Time Limitation / License Period (2 Months)',
    licenseSectionSubtitle: '60-day access limitation setting since app first installation',
    licenseToggleLabel: 'Time Limitation (2 Months):',
    licenseStatusActive: 'Limitation Active (2 Months / 60 Days)',
    licenseStatusDisabled: 'Limitation Disabled (Unlimited Full Access)',
    licenseUnlocked: 'Permanent License Active (Full Access)',
    licenseDaysRemaining: 'Remaining Access Time:',
    licenseDays: 'Days',
    licenseHours: 'Hours',
    licenseInstalledOn: 'First Installed On:',
    licenseExpiresOn: 'Expires On:',
    licenseResetBtn: 'Reset Trial Period (Start New 60 Days)',
    licenseTestExpireBtn: 'Test Expired Screen',
    licenseCodePlaceholder: 'Enter activation code (e.g. VIP-MANDARIN-2026)',
    licenseActivateBtn: 'Unlock Full Access',
    licenseExpiredModalTitle: '2-Month Access Period Expired',
    licenseExpiredModalDesc: 'The 60-day trial period since the app was first installed has ended. Enter an official activation code to resume learning.',
    licenseExpiredBadge: 'Access Expired',
    licenseActiveBadge: '2-Month Active Period',
    licenseUnlimitedBadge: 'Full Access (Unlimited)',
  },

  zh: {
    appTitle: '印尼语听力与词汇背诵',
    appSubtitle: '累积记忆法 真人发音循环 (基础到高阶 3000词)',
    levelBasic: '基础入门',
    levelBasicSub: '日常基础 & 问候',
    levelBasicDesc: '零基础入门，日常生存交流与基本问候',
    levelNumbersShopping: '数字与购物',
    levelNumbersShoppingSub: '计数、折扣与单位',
    levelNumbersShoppingDesc: '数字1-1亿、运算(+ - × ÷)、打折换算、斤两与购物常用词',
    levelIntermediate: '进阶提高',
    levelIntermediateSub: '流利沟通 & 工作',
    levelIntermediateDesc: '职场办公、出行交通、商务买卖与观点表达',
    levelAdvanced: '高级精通',
    levelAdvancedSub: '专业与深度表达',
    levelAdvancedDesc: '商务谈判、科技、法律与文学深度词汇',
    levelAll: '全部词库 (3000词)',
    
    // Header & Navigation
    toneGuide: '声调指南',
    catalog: '3000词总表',
    quiz: '记忆测验',
    bookmarks: '收藏夹',
    resetToStart: '重置回起点',
    settings: '设置',
    langSelector: '界面语言',
    
    // Banner info
    batchBannerTitle: '当前学习组',
    batchCumulativePrefix: '当前词汇量:',
    wordsUnit: '词',
    batchNum: '组',
    startListening: '开始听力',
    pauseAudio: '暂停播放',
    resumeAudio: '继续播放',
    quizActive: '开始测验',
    resetWordsBtn: '随机模式 (Random)',
    randomMode: '随机模式 (Random)',
    randomModeOn: '随机: 开启',
    randomModeOff: '随机: 关闭',
    randomModeTooltip: '随机模式：初始单词及后续+5词均将随机抽取，避免记忆枯燥',
    loopMode: '循环播放',
    loopModeOn: '循环: 开启',
    loopModeOff: '循环: 关闭',
    loopModeTooltip: '连续循环播放（当前组单词播放完毕后自动重新从头开始）',
    
    // Audio Player Bar
    liveSpeed: '朗读速度:',
    repPerWord: '单字重复朗读:',
    pauseIntervalLabel: '词间朗读停顿:',
    pauseBetweenRepsSetting: '重复之间的停顿:',
    pauseBetweenWordsSetting: '切换新词之间的停顿:',
    pauseUnitSec: '秒',
    hideModeLabel: '遮挡模式:',
    hideAll: '全部遮挡',
    hideMeaning: '遮挡中文释义',
    hideHanzi: '遮挡印尼语',
    hideNone: '全部显示',
    repeatBatchBtn: '重置',
    next5WordsBtn: '增加5个新词',
    prevWordTooltip: '上一个词',
    nextWordTooltip: '下一个词',
    stopAudioTooltip: '停止播放',
    resetLevelTooltip: '重新从本等级前5个词开始',
    
    // Word Card
    meaningLabel: '中文释义 / 拼音:',
    exampleSentence: '常用实用例句',
    listenMandarin: '听中文发音',
    listenMeaning: '听印尼语发音',
    bookmarkAdd: '加入收藏',
    bookmarkRemove: '移出收藏',
    peekWord: '偷看 / 显示词汇',
    hideAgain: '重新隐藏',
    maskedHanzi: '🔒 印尼语已遮挡 (点击查看)',
    maskedPinyin: '🔒 拼音已隐藏',
    maskedMeaning: '🔒 中文释义已遮挡 (测试记忆)',
    tone1: '一声 (—)',
    tone2: '二声 (／)',
    tone3: '三声 (∨)',
    tone4: '四声 (＼)',
    toneNeutral: '轻声 (•)',
    phaseMandarin: '🇮🇩 印尼语发音',
    phaseMeaning: '🇨🇳 中文释义',
    phasePause: '⏸️ 停顿间隔',
    
    // Catalog Modal
    catalogTitle: '3000常用印尼语词汇总表',
    catalogSubtitle: '按印尼语 / 中文 / 拼音快速检索，或选择任意词汇开始循环背诵',
    searchPlaceholder: '搜索印尼语、中文或拼音...',
    allHSK: '所有等级',
    allCategories: '所有分类',
    learnFromHere: '从该词开始循环背诵',
    close: '关闭',
    showingWords: '显示词汇',
    pageOf: '页码',
    of: '/',
    
    // Quiz Modal
    quizTitle: '词汇掌握度测试',
    quizSubtitle: '测验印尼语词汇理解与中印双向翻译记忆',
    question: '题目',
    score: '得分:',
    selectMeaningFor: '请选择正确的中文释义:',
    selectHanziFor: '请选择对应的印尼语单词:',
    listenAndSelect: '听印尼语音频，选择正确的中文释义:',
    listenAgain: '重听音频',
    correct: '回答正确！太棒了！',
    incorrect: '回答错误！正确答案是:',
    nextQuestion: '下一题',
    quizFinished: '测验完成！',
    quizResultMsg: '太棒了！您已顺利完成本次词汇背诵测评。',
    tryAgain: '重新测验',
    
    // Settings Modal
    settingsTitle: '音频与发音设置',
    settingsSubtitle: '自定义播放速度、单词循环次数、语言及发音人',
    repCountSetting: '每个词汇循环次数:',
    speedSetting: '印尼语发音语速:',
    playOrderSetting: '发音播放顺序:',
    orderMandarinThenMeaning: '🇮🇩 印尼语优先 ➔ 🇨🇳 中文释义',
    orderMeaningThenMandarin: '🇨🇳 中文释义优先 ➔ 🇮🇩 印尼语',
    orderMandarinOnly: '🇮🇩 仅播放印尼语 (不读中文)',
    mandarinVoice: '印尼语发音人 (TTS):',
    meaningVoice: '中文发音人 (TTS):',
    testVoice: '试听发音',
    saveSettings: '保存设置',
    autoAdvanceSetting: '本组播放完成后自动增加 +5个新词',

    // Pengulangan Berjenjang (Kata Lama vs Baru)
    tieredRepsSectionTitle: '分层渐进循环模式 (新旧词差异循环)',
    tieredRepsSectionSubtitle: '自动减少已熟记的早期旧词循环次数，提升长组累积背诵效率',
    tieredRepsToggleLabel: '分层循环功能 (开启/关闭):',
    tieredRepsOn: '分层循环: 开启',
    tieredRepsOff: '分层循环: 关闭',
    tieredRecentWordsLabel: '从最后词汇开始的新词循环数量限制:',
    tieredRecentWordsBarLabel: '从最后词汇开始的新词循环数量限制:',
    tieredRecentWordsDesc: '当前学习组末尾将获得完整循环次数的新生词数量',
    tieredOlderWordsDesc: '新生词范围之前的前期旧词将减少循环或跳过',
    tieredOlderRepsLabel: '旧词循环次数:',
    tieredOlderRepsDesc: '新生词范围之前从第1号开始的前期旧词',
    tieredOlderRepsSkip: '0次 (跳过旧词)',
    tieredModeSlidingLabel: '模式一：自动距离滑动窗口 (推荐)',
    tieredModeCustomLabel: '模式二：自定义词序号区间',
    tieredExampleText: '示例：当达到20词且设定15个新词时，前1–5词读1次（或跳过0次），后6–20词读3次。',
    tieredRangeFrom: '词序号从',
    tieredRangeTo: '到',
    tieredRangeReps: '循环',
    tieredAddRule: '+ 添加区间规则',
    tieredDeleteRule: '删除',
    allWordsLabel: '全部词汇',
    olderWordsLabel: '旧词',
    recentWordsLabel: '新词',
    skippedLabel: '跳过 (0次)',
    tieredLivePreview: '当前学习组循环模拟:',
    
    // Tone Guide Modal
    toneGuideTitle: '印尼语音标与发音指南',
    toneGuideSubtitle: '掌握印尼语元音、辅音及自然拼读规则',
    playToneSample: '试听发音示例',

    // Trial License (2 Months)
    licenseSectionTitle: '时间限制 / 授权期限 (2个月)',
    licenseSectionSubtitle: '自安装起算60天使用权限控制',
    licenseToggleLabel: '时间限制 (2个月):',
    licenseStatusActive: '时间限制开启 (2个月 / 60天)',
    licenseStatusDisabled: '时间限制关闭 (无限制完整访问)',
    licenseUnlocked: '永久授权已激活 (完整权限)',
    licenseDaysRemaining: '剩余有效时间:',
    licenseDays: '天',
    licenseHours: '小时',
    licenseInstalledOn: '首次安装日期:',
    licenseExpiresOn: '到期截止日期:',
    licenseResetBtn: '重置试用期 (重新开始60天)',
    licenseTestExpireBtn: '测试到期锁定界面',
    licenseCodePlaceholder: '输入激活码 (例如: VIP-MANDARIN-2026)',
    licenseActivateBtn: '激活完整权限',
    licenseExpiredModalTitle: '2个月授权期限已到期',
    licenseExpiredModalDesc: '自首次安装起60天试用期已结束。请输入官方激活码解锁继续学习。',
    licenseExpiredBadge: '已到期 (Expired)',
    licenseActiveBadge: '2个月有效期',
    licenseUnlimitedBadge: '无限完整版',
  },
};

// Specialized translations dictionary for Mandarin Words into Malay and English
const WORD_TRANSLATION_MAP: Record<string, { ms: string; en: string; exMs?: string; exEn?: string }> = {
  // Core HSK 1
  '你好': { ms: 'Helo / Apa khabar', en: 'Hello / How are you', exMs: 'Helo! Gembira berkenalan dengan anda.', exEn: 'Hello! Nice to meet you.' },
  '我': { ms: 'Saya / Aku', en: 'I / Me', exMs: 'Saya seorang pelajar.', exEn: 'I am a student.' },
  '你': { ms: 'Awak / Anda', en: 'You', exMs: 'Siapakah nama awak?', exEn: 'What is your name?' },
  '他': { ms: 'Dia (lelaki)', en: 'He / Him', exMs: 'Dia adalah guru saya.', exEn: 'He is my teacher.' },
  '她': { ms: 'Dia (perempuan)', en: 'She / Her', exMs: 'Dia seorang doktor.', exEn: 'She is a doctor.' },
  '我们': { ms: 'Kami / Kita', en: 'We / Us', exMs: 'Mari kita pergi bersama.', exEn: 'Let us go together.' },
  '你们': { ms: 'Kamu semua / Kalian', en: 'You all / You guys', exMs: 'Helo kamu semua!', exEn: 'Hello everyone!' },
  '他们': { ms: 'Mereka', en: 'They / Them', exMs: 'Mereka semua ada di rumah.', exEn: 'They are all at home.' },
  '谢谢': { ms: 'Terima kasih', en: 'Thank you / Thanks', exMs: 'Terima kasih banyak!', exEn: 'Thank you very much!' },
  '不客气': { ms: 'Sama-sama / Jangan segan', en: 'You are welcome', exMs: 'Tidak mengapa, sama-sama.', exEn: 'No need to thank, you are welcome.' },
  '再见': { ms: 'Selamat tinggal / Jumpa lagi', en: 'Goodbye / See you again', exMs: 'Jumpa esok!', exEn: 'See you tomorrow!' },
  '对不起': { ms: 'Minta maaf / Maafkan saya', en: 'Sorry / Excuse me', exMs: 'Maaf, saya terlambat.', exEn: 'Sorry, I am late.' },
  '没关系': { ms: 'Tidak mengapa / Tiada masalah', en: 'It does not matter / No problem', exMs: 'Tidak mengapa, jangan risau.', exEn: 'No worries, do not worry.' },
  '是': { ms: 'Ialah / Ya / Benar', en: 'To be / Yes / Is / Am / Are', exMs: 'Ya, ini buku saya.', exEn: 'Yes, this is my book.' },
  '不': { ms: 'Tidak / Bukan', en: 'No / Not', exMs: 'Saya tidak pergi ke sekolah.', exEn: 'I am not going to school.' },
  '好': { ms: 'Bagus / Baik / Elok', en: 'Good / Fine / Okay', exMs: 'Barang ini sangat bagus.', exEn: 'This thing is very good.' },
  '很': { ms: 'Sangat / Amat', en: 'Very / Quite', exMs: 'Cuaca hari ini sangat baik.', exEn: 'The weather is very nice today.' },
  '人': { ms: 'Orang / Manusia', en: 'Person / People', exMs: 'Di sana ada ramai orang.', exEn: 'There are many people there.' },
  '朋友': { ms: 'Kawan / Sahabat', en: 'Friend', exMs: 'Dia adalah sahabat baik saya.', exEn: 'He is my good friend.' },
  '中国': { ms: 'Negara China', en: 'China', exMs: 'Saya mahu pergi melancong ke China.', exEn: 'I want to travel to China.' },
  '印尼': { ms: 'Indonesia', en: 'Indonesia', exMs: 'Saya berasal dari Indonesia.', exEn: 'I come from Indonesia.' },
  '马来西亚': { ms: 'Malaysia', en: 'Malaysia', exMs: 'Kawan saya tinggal di Malaysia.', exEn: 'My friend lives in Malaysia.' },
  '汉语': { ms: 'Bahasa Mandarin', en: 'Mandarin Chinese', exMs: 'Belajar bahasa Mandarin sangat menarik.', exEn: 'Learning Mandarin is very interesting.' },
  '吃': { ms: 'Makan', en: 'To eat', exMs: 'Awak nak makan apa?', exEn: 'What do you want to eat?' },
  '喝': { ms: 'Minum', en: 'To drink', exMs: 'Sila minum teh.', exEn: 'Please drink tea.' },
  '水': { ms: 'Air', en: 'Water', exMs: 'Tolong beri saya segelas air.', exEn: 'Please give me a cup of water.' },
  '茶': { ms: 'Teh', en: 'Tea', exMs: 'Orang China suka minum teh.', exEn: 'Chinese people like to drink tea.' },
  '米饭': { ms: 'Nasi', en: 'Cooked rice', exMs: 'Saya mahu semangkuk nasi.', exEn: 'I want a bowl of rice.' },
  '家': { ms: 'Rumah / Keluarga', en: 'Home / Family', exMs: 'Saya sekarang balik ke rumah.', exEn: 'I am going home now.' },
  '爸爸': { ms: 'Bapa / Ayah', en: 'Father / Dad', exMs: 'Ayah sedang membaca buku.', exEn: 'Dad is reading a book.' },
  '妈妈': { ms: 'Ibu / Emak', en: 'Mother / Mom', exMs: 'Masakan ibu sangat sedap.', exEn: 'Mom cooks delicious food.' },
  '儿子': { ms: 'Anak lelaki', en: 'Son', exMs: 'Anak lelakinya sangat bijak.', exEn: 'His son is very smart.' },
  '女儿': { ms: 'Anak perempuan', en: 'Daughter', exMs: 'Anak perempuan suka melukis.', exEn: 'Daughter likes drawing.' },
  '今天': { ms: 'Hari ini', en: 'Today', exMs: 'Hari ini hari apa?', exEn: 'What day is today?' },
  '明天': { ms: 'Esok', en: 'Tomorrow', exMs: 'Esok kami akan pergi ke Beijing.', exEn: 'Tomorrow we are going to Beijing.' },
  '昨天': { ms: 'Semalam', en: 'Yesterday', exMs: 'Semalam hujan lebat.', exEn: 'Yesterday it rained heavily.' },
  '现在': { ms: 'Sekarang', en: 'Now / At present', exMs: 'Sekarang pukul berapa?', exEn: 'What time is it now?' },
  '一': { ms: 'Satu', en: 'One', exMs: 'Sebiji epal.', exEn: 'One apple.' },
  '二': { ms: 'Dua', en: 'Two', exMs: 'Bulan Februari ada 28 hari.', exEn: 'February has 28 days.' },
  '三': { ms: 'Tiga', en: 'Three', exMs: 'Keluarga saya ada tiga orang.', exEn: 'There are three people in my family.' },
  '四': { ms: 'Empat', en: 'Four', exMs: 'Di atas meja ada empat biji cawan.', exEn: 'There are four cups on the table.' },
  '五': { ms: 'Lima', en: 'Five', exMs: 'Saya ada lima biji epal.', exEn: 'I have five apples.' },
  '六': { ms: 'Enam', en: 'Six', exMs: 'Bangun tidur pukul enam.', exEn: 'Wake up at six o\'clock.' },
  '七': { ms: 'Tujuh', en: 'Seven', exMs: 'Satu minggu ada tujuh hari.', exEn: 'A week has seven days.' },
  '八': { ms: 'Lapan', en: 'Eight', exMs: 'Orang China sukakan nombor lapan.', exEn: 'Chinese people like the number eight.' },
  '九': { ms: 'Sembilan', en: 'Nine', exMs: 'Sesi persekolahan bermula bulan September.', exEn: 'School starts in September.' },
  '十': { ms: 'Sepuluh', en: 'Ten', exMs: 'Saya ada sepuluh yuan.', exEn: 'I have ten yuan.' },
  '钱': { ms: 'Duit / Wang', en: 'Money', exMs: 'Berapa harga barang ini?', exEn: 'How much is this?' },
  '买': { ms: 'Beli / Membeli', en: 'To buy', exMs: 'Saya ingin membeli pakaian.', exEn: 'I want to buy clothes.' },
  '卖': { ms: 'Jual / Menjual', en: 'To sell', exMs: 'Kedai ini menjual buah-buahan.', exEn: 'This shop sells fruits.' },
  '帮助': { ms: 'Membantu / Pertolongan', en: 'To help / Assistance', exMs: 'Terima kasih atas bantuan anda.', exEn: 'Thank you for your help.' },
  '准备': { ms: 'Menyediakan / Bersiap', en: 'To prepare / Ready', exMs: 'Saya sedang bersiap untuk peperiksaan.', exEn: 'I am preparing for the exam.' },
  '开始': { ms: 'Mula / Permulaan', en: 'To begin / Start', exMs: 'Pukul berapa mesyuarat bermula?', exEn: 'What time does the meeting start?' },
  '介绍': { ms: 'Memperkenalkan / Pengenalan', en: 'To introduce / Introduction', exMs: 'Izinkan saya memperkenalkan diri.', exEn: 'Allow me to introduce myself.' },
  '懂': { ms: 'Faham / Mengerti', en: 'To understand', exMs: 'Adakah anda faham apa yang didengar?', exEn: 'Did you understand what you heard?' },
  '明白': { ms: 'Jelas / Faham', en: 'Clear / To understand', exMs: 'Saya faham maksud anda.', exEn: 'I understand what you mean.' },
  '问题': { ms: 'Soalan / Masalah', en: 'Question / Problem', exMs: 'Adakah sebarang soalan?', exEn: 'Do you have any questions?' },
  '时间': { ms: 'Masa / Waktu', en: 'Time', exMs: 'Kita tidak mempunyai banyak masa.', exEn: 'We do not have much time.' },
  '苹果': { ms: 'Epal', en: 'Apple', exMs: 'Epal merah sangat manis.', exEn: 'Red apples are very sweet.' },
  '咖啡': { ms: 'Kopi', en: 'Coffee', exMs: 'Minum secawan kopi tanpa gula.', exEn: 'Drink a cup of coffee without sugar.' },
  '面条': { ms: 'Mee / Mi', en: 'Noodles', exMs: 'Semangkuk mee daging lembu.', exEn: 'A bowl of beef noodles.' },
  '牛奶': { ms: 'Susu lembu', en: 'Milk', exMs: 'Segelas susu lembu suam pada waktu pagi.', exEn: 'A glass of warm milk in the morning.' },
  '鸡蛋': { ms: 'Telur ayam', en: 'Egg', exMs: 'Makan sebiji telur semasa sarapan.', exEn: 'Eat an egg for breakfast.' },
  '跑步': { ms: 'Berlari / Berjoging', en: 'To run / Jogging', exMs: 'Saya berjoging setiap pagi.', exEn: 'I go jogging every morning.' },
  '游泳': { ms: 'Berenang', en: 'To swim / Swimming', exMs: 'Berenang di laut pada musim panas.', exEn: 'Swim in the sea during summer.' },
  '上班': { ms: 'Masuk kerja / Bekerja', en: 'To go to work / On duty', exMs: 'Mula kerja pukul 8.30 pagi.', exEn: 'Start work at 8:30 AM.' },
  '下班': { ms: 'Balik kerja / Tamat kerja', en: 'Off work / Finish work', exMs: 'Makan malam bersama selepas balik kerja.', exEn: 'Have dinner together after work.' },
  '合同': { ms: 'Kontrak / Perjanjian kerja', en: 'Contract / Agreement', exMs: 'Kedua-dua pihak rasmi menandatangani kontrak.', exEn: 'Both parties officially signed the contract.' },
  '投资': { ms: 'Pelaburan / Melabur', en: 'Investment / To invest', exMs: 'Melabur dalam projek teknologi baru.', exEn: 'Invest in new technology projects.' },
  '互联网': { ms: 'Internet', en: 'Internet', exMs: 'Internet mengubah gaya hidup manusia.', exEn: 'The internet changed people\'s lifestyle.' },
  '手机': { ms: 'Telefon bimbit / Telefon pintar', en: 'Mobile phone / Smartphone', exMs: 'Imbas kod QR bayaran guna telefon.', exEn: 'Scan payment QR code using mobile phone.' },
  '火锅': { ms: 'Stimbot / Hotpot Cina', en: 'Hotpot', exMs: 'Makan hotpot mala sangat menyelerakan.', exEn: 'Eating spicy hotpot in winter is very satisfying.' },
};

/**
 * Get word translation according to active app language
 */
export function getWordMeaning(word: MandarinWord, lang: AppLanguage): string {
  if (!word) return '';
  
  if (lang === 'id') {
    if (word.indonesian && word.indonesian.trim()) return word.indonesian;
    if (word.malay && word.malay.trim()) return word.malay;
    return word.english || word.hanzi;
  }
  
  if (lang === 'ms') {
    if (word.malay && word.malay.trim()) return word.malay;
    const dict = WORD_TRANSLATION_MAP[word.hanzi];
    if (dict?.ms) return dict.ms;
    if (word.indonesian && word.indonesian.trim()) {
      return word.indonesian
        .replace(/bisa /gi, 'boleh ')
        .replace(/mobil /gi, 'kereta ')
        .replace(/uang /gi, 'duit ')
        .replace(/toko /gi, 'kedai ')
        .replace(/kantor /gi, 'pejabat ')
        .replace(/restoran /gi, 'restoran ')
        .replace(/sepatu /gi, 'kasut ')
        .replace(/rumah sakit /gi, 'hospital ')
        .replace(/pesawat /gi, 'kapal terbang ')
        .replace(/stasiun /gi, 'stesen ')
        .replace(/pria /gi, 'lelaki ')
        .replace(/wanita /gi, 'perempuan ');
    }
    return word.english || word.hanzi;
  }
  
  if (lang === 'en') {
    if (word.english && word.english.trim()) return word.english;
    const dict = WORD_TRANSLATION_MAP[word.hanzi];
    if (dict?.en) return dict.en;
    return word.indonesian || word.malay || word.hanzi;
  }
  
  return word.indonesian || word.malay || word.english || word.hanzi;
}

/**
 * Get example sentence translation according to active app language
 */
export function getWordExampleMeaning(word: MandarinWord, lang: AppLanguage): string {
  if (!word) return '';
  
  if (lang === 'id') {
    if (word.exampleIndonesian && word.exampleIndonesian.trim()) return word.exampleIndonesian;
    if (word.exampleMalay && word.exampleMalay.trim()) return word.exampleMalay;
    return word.exampleEnglish || '';
  }
  
  if (lang === 'ms') {
    if (word.exampleMalay && word.exampleMalay.trim()) return word.exampleMalay;
    const dict = WORD_TRANSLATION_MAP[word.hanzi];
    if (dict?.exMs) return dict.exMs;
    if (word.exampleIndonesian && word.exampleIndonesian.trim()) {
      return word.exampleIndonesian
        .replace(/bisa /gi, 'boleh ')
        .replace(/mobil /gi, 'kereta ')
        .replace(/uang /gi, 'duit ')
        .replace(/toko /gi, 'kedai ')
        .replace(/kantor /gi, 'pejabat ')
        .replace(/rumah sakit /gi, 'hospital ')
        .replace(/pesawat /gi, 'kapal terbang ')
        .replace(/stasiun /gi, 'stesen ')
        .replace(/sepatu /gi, 'kasut ');
    }
    return word.exampleEnglish || '';
  }
  
  if (lang === 'en') {
    if (word.exampleEnglish && word.exampleEnglish.trim()) return word.exampleEnglish;
    const dict = WORD_TRANSLATION_MAP[word.hanzi];
    if (dict?.exEn) return dict.exEn;
    return word.exampleIndonesian || word.exampleMalay || '';
  }
  
  return word.exampleIndonesian || word.exampleMalay || '';
}

/**
 * Categorize words into 3 main proficiency levels:
 * - Basic: HSK 1 & HSK 2
 * - Intermediate: HSK 3 & HSK 4
 * - Advanced: HSK 5 & HSK 6
 */
export const getTranslatedMeaning = getWordMeaning;
export const getTranslatedExample = getWordExampleMeaning;

const CATEGORY_TRANSLATIONS: Record<string, { ms: string; en: string }> = {
  'Belanja, Travel dan Angka': { ms: 'Membeli-belah, Pelancongan & Nombor', en: 'Shopping, Travel & Numbers' },
  'Salam & Percakapan Dasar': { ms: 'Salam & Perbualan Asas', en: 'Greetings & Basic Conversation' },
  'Kata Ganti & Orang': { ms: 'Kata Ganti Nama & Orang', en: 'Pronouns & People' },
  'Angka, Waktu & Tanggal': { ms: 'Nombor, Masa & Tarikh', en: 'Numbers, Time & Dates' },
  'Keluarga & Rumah Tangga': { ms: 'Keluarga & Rumah Tangga', en: 'Family & Household' },
  'Makanan & Minuman': { ms: 'Makanan & Minuman', en: 'Food & Drinks' },
  'Kata Kerja Aksi Sehari-hari': { ms: 'Kata Kerja Tindakan Harian', en: 'Daily Action Verbs' },
  'Kata Sifat & Deskripsi': { ms: 'Kata Adjektif & Penerangan', en: 'Adjectives & Descriptions' },
  'Tempat, Arah & Perjalanan': { ms: 'Tempat, Arah & Perjalanan', en: 'Places, Directions & Travel' },
  'Sekolah & Belajar': { ms: 'Sekolah & Pembelajaran', en: 'School & Learning' },
  'Pekerjaan & Profesi': { ms: 'Pekerjaan & Profesion', en: 'Work & Professions' },
  'Belanja, Uang & Bisnis': { ms: 'Membeli-belah, Wang & Perniagaan', en: 'Shopping, Money & Business' },
  'Kesehatan & Bagian Tubuh': { ms: 'Kesihatan & Bahagian Badan', en: 'Health & Body Parts' },
  'Cuaca, Musim & Alam': { ms: 'Cuaca, Musim & Alam Semula Jadi', en: 'Weather, Seasons & Nature' },
  'Kata Hubung & Partikel Tata Bahasa': { ms: 'Kata Hubung & Partikel Tatabahasa', en: 'Conjunctions & Grammar Particles' },
  'Emosi, Sifat & Perasaan': { ms: 'Emosi, Sifat & Perasaan', en: 'Emotions, Traits & Feelings' },
  'Transportasi & Lalu Lintas': { ms: 'Pengangkutan & Lalu Lintas', en: 'Transportation & Traffic' },
};

export function getTranslatedCategory(category: string, lang: AppLanguage): string {
  if (lang === 'id') return category;
  const item = CATEGORY_TRANSLATIONS[category];
  if (item && item[lang]) return item[lang];
  return category;
}

export function filterWordsByProficiency(words: MandarinWord[], level: ProficiencyLevel): MandarinWord[] {
  if (level === 'all') return words;
  
  if (level === 'basic') {
    return words.filter((w) => w.hsk === 'HSK 1' || w.hsk === 'HSK 2');
  }

  if (level === 'numbers_shopping') {
    const targetHanzi = new Set(SHOPPING_TRAVEL_NUMBERS_VOCAB.map((w) => w.hanzi));
    return words.filter((w) => 
      targetHanzi.has(w.hanzi) || 
      w.category === 'Belanja, Travel dan Angka' ||
      w.category === 'Angka, Waktu & Tanggal' || 
      w.category === 'Belanja, Uang & Bisnis' ||
      (w.category === 'Tempat, Arah & Perjalanan' && (w.hsk === 'HSK 1' || w.hsk === 'HSK 2' || w.hsk === 'HSK 3'))
    );
  }
  
  if (level === 'intermediate') {
    return words.filter((w) => w.hsk === 'HSK 3' || w.hsk === 'HSK 4');
  }
  
  if (level === 'advanced') {
    return words.filter((w) => w.hsk === 'HSK 5' || w.hsk === 'HSK 6');
  }
  
  return words;
}

export function getProficiencyStats(allWords: MandarinWord[]) {
  const basicCount = allWords.filter((w) => w.hsk === 'HSK 1' || w.hsk === 'HSK 2').length;
  const targetHanzi = new Set(SHOPPING_TRAVEL_NUMBERS_VOCAB.map((w) => w.hanzi));
  const numbersShoppingCount = allWords.filter((w) => 
    targetHanzi.has(w.hanzi) || 
    w.category === 'Belanja, Travel dan Angka' ||
    w.category === 'Angka, Waktu & Tanggal' || 
    w.category === 'Belanja, Uang & Bisnis' ||
    (w.category === 'Tempat, Arah & Perjalanan' && (w.hsk === 'HSK 1' || w.hsk === 'HSK 2' || w.hsk === 'HSK 3'))
  ).length;
  const intermediateCount = allWords.filter((w) => w.hsk === 'HSK 3' || w.hsk === 'HSK 4').length;
  const advancedCount = allWords.filter((w) => w.hsk === 'HSK 5' || w.hsk === 'HSK 6').length;
  return {
    basic: basicCount,
    numbers_shopping: numbersShoppingCount,
    intermediate: intermediateCount,
    advanced: advancedCount,
    total: allWords.length,
  };
}
