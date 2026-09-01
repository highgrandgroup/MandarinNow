import React, { useState } from 'react';
import { X, Volume2, Music, Check, Info } from 'lucide-react';
import { speechService } from '../services/speechService';
import { AppLanguage } from '../types';
import { UI_TRANSLATIONS } from '../services/translationService';

interface ToneGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  speed: number;
  appLanguage?: AppLanguage;
}

const TONES_DATA = [
  {
    toneNumber: 1,
    name: 'Nada 1 (第一声 - Dī Píng)',
    chinese: '阴平 (一声)',
    symbol: '— (Datar Tinggi / High Flat)',
    desc: 'Suara diucapkan tinggi, rata, dan panjang seperti nada menyanyi yang stabil (pitch 55).',
    exampleHanzi: '妈',
    examplePinyin: 'mā',
    meaning: 'Ibu / Mother',
    color: 'from-blue-500/20 to-blue-600/10 border-blue-500/40 text-blue-300',
    barClass: 'bg-blue-400',
    curve: 'M 10 20 L 90 20', // High flat
  },
  {
    toneNumber: 2,
    name: 'Nada 2 (第二声 - Yáng Píng)',
    chinese: '阳平 (二声)',
    symbol: '／ (Naik / Rising)',
    desc: 'Suara naik dari nada sedang ke nada tinggi, seperti intonasi saat bertanya "Hah?" atau "Apa?".',
    exampleHanzi: '麻',
    examplePinyin: 'má',
    meaning: 'Rami / Hemp',
    color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/40 text-emerald-300',
    barClass: 'bg-emerald-400',
    curve: 'M 10 45 Q 50 35 90 15', // Rising
  },
  {
    toneNumber: 3,
    name: 'Nada 3 (第三声 - Shǎng Shēng)',
    chinese: '上声 (三声)',
    symbol: '∨ (Turun lalu Naik / Dipping)',
    desc: 'Suara turun ke nada rendah lalu melengkung naik kembali, seperti saat kita terkesima "O...oh!".',
    exampleHanzi: '马',
    examplePinyin: 'mǎ',
    meaning: 'Kuda / Horse',
    color: 'from-amber-500/20 to-amber-600/10 border-amber-500/40 text-amber-300',
    barClass: 'bg-amber-400',
    curve: 'M 10 25 Q 45 55 90 20', // Dipping
  },
  {
    toneNumber: 4,
    name: 'Nada 4 (第四声 - Qù Shēng)',
    chinese: '去声 (四声)',
    symbol: '＼ (Turun Tegas / Falling)',
    desc: 'Suara jatuh tajam dari tinggi ke rendah dengan tegas dan mantap, seperti aba-aba "Stop!".',
    exampleHanzi: '骂',
    examplePinyin: 'mà',
    meaning: 'Memarahi / Scold',
    color: 'from-rose-500/20 to-rose-600/10 border-rose-500/40 text-rose-300',
    barClass: 'bg-rose-400',
    curve: 'M 10 15 Q 50 35 90 55', // Falling
  },
  {
    toneNumber: 0,
    name: 'Nada Netral / Ringan (轻声 - Qīng Shēng)',
    chinese: '轻声 (轻音)',
    symbol: '• (Ringan & Singkat / Neutral)',
    desc: 'Diucapkan secara lembut, singkat, dan rileks tanpa penekanan intonasi.',
    exampleHanzi: '吗',
    examplePinyin: 'ma',
    meaning: 'Partikel tanya / Question particle',
    color: 'from-purple-500/20 to-purple-600/10 border-purple-500/40 text-purple-300',
    barClass: 'bg-purple-400',
    curve: 'M 40 35 Q 50 35 60 35', // Short dot
  },
];

export const ToneGuideModal: React.FC<ToneGuideModalProps> = ({ isOpen, onClose, speed, appLanguage = 'id' }) => {
  const [playingTone, setPlayingTone] = useState<number | null>(null);

  if (!isOpen) return null;

  const t = UI_TRANSLATIONS[appLanguage] || UI_TRANSLATIONS.id;

  const playToneExample = async (hanzi: string, toneIndex: number) => {
    setPlayingTone(toneIndex);
    await speechService.speakSingleWord(
      {
        id: 0,
        hanzi,
        pinyin: '',
        indonesian: '',
        category: '',
        hsk: 'HSK 1',
        tone: toneIndex,
      },
      Math.max(0.6, speed)
    );
    setTimeout(() => {
      setPlayingTone((curr) => (curr === toneIndex ? null : curr));
    }, 800);
  };

  const playAllTones = async () => {
    for (const item of TONES_DATA) {
      setPlayingTone(item.toneNumber);
      await speechService.speakSingleWord(
        {
          id: 0,
          hanzi: item.exampleHanzi,
          pinyin: '',
          indonesian: '',
          category: '',
          hsk: 'HSK 1',
          tone: item.toneNumber,
        },
        Math.max(0.6, speed)
      );
      await new Promise((r) => setTimeout(r, 900));
    }
    setPlayingTone(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900/90 border border-white/20 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl backdrop-blur-2xl overflow-hidden text-white">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-white/15 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-400/20 border border-cyan-300/40 flex items-center justify-center text-cyan-300">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {t.toneGuideTitle} (声调 - Shēngdiào)
              </h2>
              <p className="text-xs text-cyan-100/70">
                {t.toneGuideSubtitle}
              </p>
            </div>
          </div>
          <button
            id="btn-close-tone-guide"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer border border-white/15"
            aria-label="Tutup Panduan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Quick Tip Box */}
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-start gap-3 text-xs text-cyan-100 leading-relaxed backdrop-blur-md">
            <Info className="w-4 h-4 text-cyan-300 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-cyan-200">Penting / Important: </span>
              Bahasa Mandarin adalah bahasa tonal. Satu silabel huruf (misal: <em>"ma"</em>) memiliki makna berbeda tergantung nada: <strong>mā (Ibu)</strong>, <strong>má (Rami)</strong>, <strong>mǎ (Kuda)</strong>, <strong>mà (Memarahi)</strong>, dan <strong>ma (Partikel tanya)</strong>.
            </div>
          </div>

          {/* Master Play Button */}
          <div className="flex justify-end">
            <button
              id="btn-play-all-tones"
              onClick={playAllTones}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs shadow-lg shadow-cyan-950/40 transition active:scale-95 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>Dengarkan Urutan 4 Nada (mā - má - mǎ - mà - ma)</span>
            </button>
          </div>

          {/* Tone Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {TONES_DATA.map((item) => (
              <div
                key={item.toneNumber}
                className="p-4 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl flex flex-col justify-between transition hover:border-cyan-400/50 shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-cyan-200">
                        {item.name}
                      </span>
                      <h4 className="text-sm font-semibold text-white font-['Noto_Sans_SC']">
                        {item.chinese}
                      </h4>
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-black/30 border border-white/20 text-cyan-200">
                      {item.symbol}
                    </span>
                  </div>

                  {/* Curve Pitch Diagram */}
                  <div className="h-14 w-full bg-black/30 backdrop-blur-md rounded-xl p-2 flex items-center justify-center my-2 border border-white/15">
                    <svg className="w-full h-full" viewBox="0 0 100 60">
                      {/* Grid lines */}
                      <line x1="5" y1="15" x2="95" y2="15" stroke="rgba(255,255,255,0.15)" strokeDasharray="2,2" strokeWidth="0.5" />
                      <line x1="5" y1="35" x2="95" y2="35" stroke="rgba(255,255,255,0.15)" strokeDasharray="2,2" strokeWidth="0.5" />
                      <line x1="5" y1="55" x2="95" y2="55" stroke="rgba(255,255,255,0.15)" strokeDasharray="2,2" strokeWidth="0.5" />
                      
                      {/* Pitch curve */}
                      <path
                        d={item.curve}
                        fill="none"
                        stroke="#22d3ee"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  <p className="text-xs text-white/80 leading-relaxed mb-3">
                    {item.desc}
                  </p>
                </div>

                {/* Example Word & Audio Button */}
                <div className="pt-2.5 border-t border-white/15 flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white font-['Noto_Sans_SC']">
                      {item.exampleHanzi}
                    </span>
                    <span className="text-sm font-bold text-cyan-300 font-mono">
                      {item.examplePinyin}
                    </span>
                    <span className="text-xs text-white/70">
                      ({item.meaning})
                    </span>
                  </div>

                  <button
                    id={`btn-play-tone-${item.toneNumber}`}
                    onClick={() => playToneExample(item.exampleHanzi, item.toneNumber)}
                    className={`p-2 rounded-xl border transition active:scale-90 flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                      playingTone === item.toneNumber
                        ? 'bg-cyan-400 text-slate-950 border-cyan-300 shadow-md shadow-cyan-400/50 scale-105'
                        : 'bg-white/15 hover:bg-cyan-400 hover:text-slate-950 text-cyan-200 border-white/20'
                    }`}
                    title={`Dengarkan pengucapan nada ${item.toneNumber}`}
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${playingTone === item.toneNumber ? 'animate-bounce' : ''}`} />
                    <span>{playingTone === item.toneNumber ? 'Memutar...' : 'Putar'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/15 bg-white/5 flex justify-end">
          <button
            id="btn-close-tone-guide-footer"
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/20 font-bold text-xs transition cursor-pointer"
          >
            {t.close}
          </button>
        </div>

      </div>
    </div>
  );
};

