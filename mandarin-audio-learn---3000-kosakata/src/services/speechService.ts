import { MandarinWord, AudioSettings, AppLanguage } from '../types';
import { getWordMeaning } from './translationService';
import { getWordRepetitions } from './repetitionHelper';
import { audioCacheService } from './audioCacheService';

export interface SpeechCallbackProps {
  wordIndex: number;
  word: MandarinWord;
  repetitionIndex: number; // 1 to totalReps
  totalReps: number;
  phase: 'mandarin' | 'meaning' | 'indonesian' | 'pause';
  isComplete?: boolean;
}

// Global active utterance store to prevent Chromium/Android WebView garbage collection bug
const globalUtterancePool: Set<SpeechSynthesisUtterance> = new Set();
let audioContextInstance: AudioContext | null = null;
let isAudioUnlocked = false;

/**
 * Unlock AudioContext and Web Speech API on Android WebView / Median APK
 */
export function unlockAudioForAndroidWebView(): void {
  if (typeof window === 'undefined') return;

  try {
    // 1. Unlock Web Audio API Context
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      if (!audioContextInstance || audioContextInstance.state === 'closed') {
        audioContextInstance = new AudioCtx();
      }
      if (audioContextInstance.state === 'suspended') {
        audioContextInstance.resume();
      }
      // Play a tiny silent buffer
      const buffer = audioContextInstance.createBuffer(1, 1, 22050);
      const source = audioContextInstance.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextInstance.destination);
      source.start(0);
    }

    // 2. Prime Web Speech API
    if ('speechSynthesis' in window) {
      window.speechSynthesis.resume();
      if (!isAudioUnlocked) {
        const silentUtterance = new SpeechSynthesisUtterance(' ');
        silentUtterance.volume = 0.01;
        silentUtterance.rate = 2.0;
        window.speechSynthesis.speak(silentUtterance);
        isAudioUnlocked = true;
      }
    }
  } catch (e) {
    console.warn('Audio unlock notice:', e);
  }
}

// Auto-register touch/click listeners to immediately unlock audio on first user touch in APK
if (typeof window !== 'undefined') {
  const handleUserInteraction = () => {
    unlockAudioForAndroidWebView();
  };
  window.addEventListener('touchstart', handleUserInteraction, { once: false, passive: true });
  window.addEventListener('click', handleUserInteraction, { once: false, passive: true });
  window.addEventListener('keydown', handleUserInteraction, { once: false, passive: true });
}

class SpeechService {
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private currentSessionId: number = 0;
  private voices: SpeechSynthesisVoice[] = [];
  private onStatusChange?: (props: SpeechCallbackProps) => void;
  private keepAliveInterval: any = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
      // Re-poll voices after delay for Android WebView slow voice loading
      setTimeout(() => this.loadVoices(), 500);
      setTimeout(() => this.loadVoices(), 2000);
    }
  }

  private startKeepAlive() {
    if (this.keepAliveInterval) return;
    this.keepAliveInterval = setInterval(() => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && this.isRunning && !this.isPaused) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }
    }, 250);
  }

  private stopKeepAlive() {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  private loadVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) {
        this.voices = v;
      }
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
    }
    return this.voices;
  }

  public getMandarinVoices(): SpeechSynthesisVoice[] {
    const all = this.getVoices();
    return all.filter(
      (v) =>
        v.lang.toLowerCase().includes('zh') ||
        v.lang.toLowerCase().includes('cmn') ||
        v.lang.toLowerCase().includes('chinese')
    );
  }

  public getMeaningVoices(lang: AppLanguage = 'id'): SpeechSynthesisVoice[] {
    const all = this.getVoices();
    if (lang === 'en') {
      return all.filter(
        (v) => v.lang.toLowerCase().startsWith('en') || v.lang.toLowerCase().includes('english')
      );
    }
    if (lang === 'ms') {
      const msVoices = all.filter(
        (v) => v.lang.toLowerCase().startsWith('ms') || v.lang.toLowerCase().includes('malay')
      );
      if (msVoices.length > 0) return msVoices;
      // Fallback to id voices
      return all.filter(
        (v) => v.lang.toLowerCase().startsWith('id') || v.lang.toLowerCase().includes('indonesian')
      );
    }
    // Default Indonesian
    return all.filter(
      (v) =>
        v.lang.toLowerCase().startsWith('id') ||
        v.lang.toLowerCase().includes('indonesian') ||
        v.lang.toLowerCase().startsWith('ms')
    );
  }

  public getIndonesianVoices(): SpeechSynthesisVoice[] {
    return this.getMeaningVoices('id');
  }

  public setCallback(cb: (props: SpeechCallbackProps) => void) {
    this.onStatusChange = cb;
  }

  public stop() {
    this.currentSessionId++;
    this.isRunning = false;
    this.isPaused = false;
    this.stopKeepAlive();
    audioCacheService.stopAudio();
    globalUtterancePool.clear();
    if (typeof window !== 'undefined') {
      try {
        if ((window as any).AndroidTTS?.stop) {
          (window as any).AndroidTTS.stop();
        }
      } catch {}
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch (e) {
          console.warn('Cancel speech error:', e);
        }
      }
    }
  }

  public pause() {
    this.isPaused = true;
    audioCacheService.pauseAudio();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.pause();
      } catch (e) {
        console.warn('Pause speech error:', e);
      }
    }
  }

  public resume() {
    this.isPaused = false;
    unlockAudioForAndroidWebView();
    audioCacheService.resumeAudio();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.resume();
      } catch (e) {
        console.warn('Resume speech error:', e);
      }
    }
  }

  public getIsPlaying(): boolean {
    return this.isRunning;
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }

  /**
   * Play speech audio using Triple-Engine Architecture:
   * 1. Android Native TTS Bridge (Instant, crystal clear, 0 latency in Android Wrapper APK)
   * 2. HTML5 Audio via IndexedDB / Online TTS Stream
   * 3. Web Speech API Utterance
   */
  private async playSpeechText(
    text: string,
    langCode: string,
    rate: number,
    voiceURI?: string,
    pitch: number = 1.0,
    isSession: boolean = false,
    sessionId?: number
  ): Promise<void> {
    if (isSession) {
      if (!this.isRunning || (sessionId !== undefined && this.currentSessionId !== sessionId)) {
        return;
      }
    }

    unlockAudioForAndroidWebView();

    // 1. First-Class Engine: Native Android TTS Bridge (if running inside Android Wrapper APK)
    if (typeof window !== 'undefined' && (window as any).AndroidTTS) {
      try {
        const androidTTS = (window as any).AndroidTTS;
        if (typeof androidTTS.speak === 'function') {
          androidTTS.speak(text, langCode, rate);
          // Wait duration proportional to speech length
          const estimatedDuration = Math.max(700, Math.min(6000, (text.length * 350) / Math.max(0.5, rate)));
          await new Promise((r) => setTimeout(r, estimatedDuration));
          return;
        }
      } catch (e) {
        console.warn('AndroidTTS native bridge call failed:', e);
      }
    }

    // 2. Secondary Engine: HTML5 Audio & IndexedDB Cache
    try {
      const html5Success = await audioCacheService.playAudio(text, langCode, rate);
      if (html5Success) {
        return;
      }
    } catch (e) {
      console.warn('HTML5 audio play attempt failed, trying synthesis fallback:', e);
    }

    // 3. Fallback Engine: Web Speech API Utterance
    await this.speakUtterance(text, langCode, rate, voiceURI, pitch, isSession, sessionId);
  }

  /**
   * Speak a single utterance via Web Speech API with Promise resolve on end with GC protection & safety timeout
   */
  private speakUtterance(
    text: string,
    langCode: string,
    rate: number,
    voiceURI?: string,
    pitch: number = 1.0,
    isSession: boolean = false,
    sessionId?: number
  ): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setTimeout(resolve, 300);
        return;
      }

      // If this is part of a batch learning session, check if still running
      if (isSession) {
        if (!this.isRunning || (sessionId !== undefined && this.currentSessionId !== sessionId)) {
          resolve();
          return;
        }
      }

      try {
        unlockAudioForAndroidWebView();

        // Ensure speech synthesis is active and not paused in Chrome/Android WebView
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = Math.max(0.3, Math.min(1.8, rate));
        utterance.pitch = pitch;
        utterance.lang = langCode;

        // Find best voice
        const voices = this.getVoices();
        if (voiceURI) {
          const matchingVoice = voices.find((v) => v.voiceURI === voiceURI);
          if (matchingVoice) {
            utterance.voice = matchingVoice;
          }
        } else {
          // Fallback matching
          if (langCode.startsWith('zh')) {
            const zhVoice = voices.find(
              (v) =>
                v.lang.toLowerCase().includes('zh') ||
                v.lang.toLowerCase().includes('cmn') ||
                v.lang.toLowerCase().includes('chinese')
            );
            if (zhVoice) utterance.voice = zhVoice;
          } else if (langCode.startsWith('en')) {
            const enVoice = voices.find((v) => v.lang.toLowerCase().startsWith('en'));
            if (enVoice) utterance.voice = enVoice;
          } else if (langCode.startsWith('ms')) {
            const msVoice = voices.find((v) => v.lang.toLowerCase().startsWith('ms'));
            if (msVoice) utterance.voice = msVoice;
            else {
              const idVoice = voices.find((v) => v.lang.toLowerCase().startsWith('id'));
              if (idVoice) utterance.voice = idVoice;
            }
          } else {
            const idVoice = voices.find((v) => v.lang.toLowerCase().startsWith('id'));
            if (idVoice) utterance.voice = idVoice;
          }
        }

        // CRITICAL FIX FOR ANDROID WEBVIEW & APK:
        // Keep utterance in global set to prevent GC from stopping playback prematurely
        globalUtterancePool.add(utterance);

        let isResolved = false;
        const done = () => {
          if (!isResolved) {
            isResolved = true;
            globalUtterancePool.delete(utterance);
            clearTimeout(timeoutId);
            resolve();
          }
        };

        // Safety timeout so speech never hangs indefinitely on Windows / Android WebView
        const maxDuration = Math.max(3500, text.length * 450);
        const timeoutId = setTimeout(() => {
          console.warn('Utterance timed out, continuing:', text);
          done();
        }, maxDuration);

        utterance.onend = () => {
          done();
        };

        utterance.onerror = (e) => {
          console.warn('Speech synthesis utterance error / interrupted:', e);
          done();
        };

        window.speechSynthesis.speak(utterance);

        // Additional Android WebView fix: resume immediately after speak
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch (err) {
        console.error('Failed to trigger speech synthesis:', err);
        resolve();
      }
    });
  }

  private sleep(ms: number, sessionId: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (this.currentSessionId === sessionId && this.isRunning) {
          resolve();
        } else {
          resolve();
        }
      }, ms);
    });
  }

  /**
   * Play full sequence: iterate through words, for each word speak Mandarin + Meaning N times (default 5x)
   */
  public async playBatch(
    words: MandarinWord[],
    startWordIndex: number,
    getLiveSettings: () => AudioSettings,
    appLang: AppLanguage = 'id',
    onComplete?: () => void,
    studyDirection: 'zh_to_id' | 'id_to_zh' = 'zh_to_id'
  ) {
    this.stop(); // Stop any ongoing session
    unlockAudioForAndroidWebView();
    this.isRunning = true;
    this.isPaused = false;
    this.startKeepAlive();
    const sessionId = ++this.currentSessionId;

    const langCode = appLang === 'en' ? 'en-US' : appLang === 'ms' ? 'ms-MY' : 'id-ID';

    for (let wIdx = startWordIndex; wIdx < words.length; wIdx++) {
      if (!this.isRunning || this.currentSessionId !== sessionId) break;

      const currentWord = words[wIdx];
      const settings = getLiveSettings();
      const reps = getWordRepetitions(wIdx, words.length, settings);

      // If reps is 0 (e.g. skipped older words), smoothly skip to next word
      if (reps <= 0) {
        continue;
      }

      // Loop for repetitions
      for (let rep = 1; rep <= reps; rep++) {
        if (!this.isRunning || this.currentSessionId !== sessionId) break;

        // While paused, wait
        while (this.isPaused && this.isRunning && this.currentSessionId === sessionId) {
          await this.sleep(200, sessionId);
        }

        const liveSettings = getLiveSettings();
        const voiceMeaningURI = liveSettings.meaningVoiceURI || liveSettings.indonesianVoiceURI;

        if (studyDirection === 'id_to_zh') {
          // REVERSE MODE: Speak Target Word (ID / MS / EN) ➔ Mandarin
          const targetLang = appLang === 'ms' ? 'ms' : appLang === 'en' ? 'en' : 'id';
          const targetLangCode = targetLang === 'en' ? 'en-US' : targetLang === 'ms' ? 'ms-MY' : 'id-ID';
          const targetText = getWordMeaning(currentWord, targetLang);
          const cleanTargetText = targetText
            .replace(/\//g, targetLang === 'en' ? ' or ' : ' atau ')
            .replace(/[()]/g, '');

          // 1. Speak Target Word (Indonesian / Malay / English)
          this.onStatusChange?.({
            wordIndex: wIdx,
            word: currentWord,
            repetitionIndex: rep,
            totalReps: reps,
            phase: 'meaning',
          });

          await this.playSpeechText(
            cleanTargetText,
            targetLangCode,
            liveSettings.speedRate,
            voiceMeaningURI,
            1.0,
            true,
            sessionId
          );

          // Small pause between Target language and Mandarin
          await this.sleep(Math.max(400, liveSettings.pauseBetweenRepsMs * 0.4), sessionId);

          if (!this.isRunning || this.currentSessionId !== sessionId) break;

          // 2. Speak Mandarin definition if not 'mandarin_only'
          if (liveSettings.playOrder !== 'mandarin_only') {
            this.onStatusChange?.({
              wordIndex: wIdx,
              word: currentWord,
              repetitionIndex: rep,
              totalReps: reps,
              phase: 'mandarin',
            });

            await this.playSpeechText(
              currentWord.hanzi,
              'zh-CN',
              Math.min(1.0, liveSettings.speedRate * 1.05),
              liveSettings.mandarinVoiceURI,
              1.0,
              true,
              sessionId
            );
          }
        } else {
          // STANDARD MODE: Belajar Mandarin (zh_to_id)
          // 1. Speak Mandarin
          if (liveSettings.playOrder !== 'indo_then_mandarin') {
            this.onStatusChange?.({
              wordIndex: wIdx,
              word: currentWord,
              repetitionIndex: rep,
              totalReps: reps,
              phase: 'mandarin',
            });

            // Pronounce Mandarin
            await this.playSpeechText(
              currentWord.hanzi,
              'zh-CN',
              liveSettings.speedRate,
              liveSettings.mandarinVoiceURI,
              1.0,
              true,
              sessionId
            );

            // Small pause between Mandarin and meaning translation
            await this.sleep(Math.max(400, liveSettings.pauseBetweenRepsMs * 0.4), sessionId);
          }

          if (!this.isRunning || this.currentSessionId !== sessionId) break;

          // 2. Speak Translated Meaning in chosen language (ID / MS / EN)
          if (liveSettings.playOrder !== 'mandarin_only') {
            this.onStatusChange?.({
              wordIndex: wIdx,
              word: currentWord,
              repetitionIndex: rep,
              totalReps: reps,
              phase: 'meaning',
            });

            const meaningText = getWordMeaning(currentWord, appLang);
            const cleanMeaning = meaningText
              .replace(/\//g, appLang === 'en' ? ' or ' : ' atau ')
              .replace(/[()]/g, '')
              .replace(/\s+\d+$/g, '')
              .trim();

            await this.playSpeechText(
              cleanMeaning,
              langCode,
              Math.min(1.0, liveSettings.speedRate * 1.05),
              voiceMeaningURI,
              1.0,
              true,
              sessionId
            );
          }

          // If order was meaning first, then Mandarin second
          if (liveSettings.playOrder === 'indo_then_mandarin') {
            await this.sleep(400, sessionId);
            if (!this.isRunning || this.currentSessionId !== sessionId) break;

            this.onStatusChange?.({
              wordIndex: wIdx,
              word: currentWord,
              repetitionIndex: rep,
              totalReps: reps,
              phase: 'mandarin',
            });

            await this.playSpeechText(
              currentWord.hanzi,
              'zh-CN',
              liveSettings.speedRate,
              liveSettings.mandarinVoiceURI,
              1.0,
              true,
              sessionId
            );
          }
        }

        // Pause before next repetition
        if (rep < reps) {
          this.onStatusChange?.({
            wordIndex: wIdx,
            word: currentWord,
            repetitionIndex: rep,
            totalReps: reps,
            phase: 'pause',
          });
          await this.sleep(liveSettings.pauseBetweenRepsMs, sessionId);
        }
      }

      // Pause before next word
      if (wIdx < words.length - 1 && this.isRunning && this.currentSessionId === sessionId) {
        const liveSettings = getLiveSettings();
        await this.sleep(liveSettings.pauseBetweenWordsMs, sessionId);
      }
    }

    if (this.currentSessionId === sessionId && this.isRunning) {
      this.isRunning = false;
      this.stopKeepAlive();
      this.onStatusChange?.({
        wordIndex: words.length - 1,
        word: words[words.length - 1],
        repetitionIndex: getLiveSettings().repetitionCount,
        totalReps: getLiveSettings().repetitionCount,
        phase: 'pause',
        isComplete: true,
      });
      if (onComplete) onComplete();
    }
  }

  /**
   * Pronounce a single word on demand (e.g. card click, Quiz question, Tone guide)
   */
  public async speakSingleWord(word: MandarinWord, speed: number = 0.75, voiceURI?: string) {
    unlockAudioForAndroidWebView();
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch {}
    await this.playSpeechText(word.hanzi, 'zh-CN', speed, voiceURI, 1.0, false);
  }

  public async speakSingleMeaning(
    word: MandarinWord,
    speed: number = 0.85,
    lang: AppLanguage = 'id',
    voiceURI?: string
  ) {
    unlockAudioForAndroidWebView();
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch {}
    const meaningText = getWordMeaning(word, lang);
    const cleanMeaning = meaningText
      .replace(/\//g, lang === 'en' ? ' or ' : ' atau ')
      .replace(/[()]/g, '')
      .replace(/\s+\d+$/g, '')
      .trim();
    const langCode = lang === 'en' ? 'en-US' : lang === 'ms' ? 'ms-MY' : 'id-ID';
    await this.playSpeechText(cleanMeaning, langCode, speed, voiceURI, 1.0, false);
  }
}

export const speechService = new SpeechService();


