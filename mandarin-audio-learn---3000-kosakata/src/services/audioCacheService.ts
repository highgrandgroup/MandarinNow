// Audio Cache and Offline HTML5 Audio Player Service for Android WebView & Median APK

interface AudioCacheItem {
  key: string;
  blob: Blob;
  updatedAt: number;
}

class AudioCacheService {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private currentAudioElement: HTMLAudioElement | null = null;
  private isMuted: boolean = false;

  constructor() {
    this.initDB();
  }

  private initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    if (typeof window === 'undefined' || !window.indexedDB) {
      return Promise.reject(new Error('IndexedDB not supported'));
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open('MandarinAudioOfflineDB', 1);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('audio_cache')) {
          db.createObjectStore('audio_cache', { keyPath: 'key' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (e) => {
        console.warn('IndexedDB open error:', e);
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  private getCacheKey(text: string, lang: string): string {
    return `${lang.toLowerCase()}__${text.trim().toLowerCase()}`;
  }

  public async getCachedAudioBlob(text: string, lang: string): Promise<Blob | null> {
    try {
      const db = await this.initDB();
      return new Promise((resolve) => {
        const tx = db.transaction('audio_cache', 'readonly');
        const store = tx.objectStore('audio_cache');
        const key = this.getCacheKey(text, lang);
        const req = store.get(key);

        req.onsuccess = () => {
          if (req.result && req.result.blob) {
            resolve(req.result.blob);
          } else {
            resolve(null);
          }
        };

        req.onerror = () => {
          resolve(null);
        };
      });
    } catch {
      return null;
    }
  }

  public async saveAudioBlob(text: string, lang: string, blob: Blob): Promise<void> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('audio_cache', 'readwrite');
        const store = tx.objectStore('audio_cache');
        const key = this.getCacheKey(text, lang);
        const item: AudioCacheItem = {
          key,
          blob,
          updatedAt: Date.now(),
        };
        const req = store.put(item);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('Failed to save audio to cache:', e);
    }
  }

  public getAudioUrls(text: string, lang: string): string[] {
    const cleanText = encodeURIComponent(text.trim());
    const isZh = lang.toLowerCase().startsWith('zh');
    const isId = lang.toLowerCase().startsWith('id');
    const isEn = lang.toLowerCase().startsWith('en');
    const isMs = lang.toLowerCase().startsWith('ms');

    const urls: string[] = [];

    // 1. Primary Internal App Proxy (Always works, 0 CORS issues in Android WebView / Browser)
    urls.push(`/api/tts?text=${cleanText}&lang=${encodeURIComponent(lang)}`);

    if (isZh) {
      // Direct mirrors
      urls.push(`https://dict.youdao.com/dictvoice?audio=${cleanText}&le=zh`);
      urls.push(`https://translate.google.com/translate_tts?ie=UTF-8&tl=zh-CN&client=tw-ob&q=${cleanText}`);
      urls.push(`https://translate.google.com/translate_tts?ie=UTF-8&tl=zh-TW&client=tw-ob&q=${cleanText}`);
    } else if (isId) {
      urls.push(`https://translate.google.com/translate_tts?ie=UTF-8&tl=id-ID&client=tw-ob&q=${cleanText}`);
      urls.push(`https://translate.google.com/translate_tts?ie=UTF-8&tl=id&client=tw-ob&q=${cleanText}`);
    } else if (isEn) {
      urls.push(`https://translate.google.com/translate_tts?ie=UTF-8&tl=en-US&client=tw-ob&q=${cleanText}`);
      urls.push(`https://dict.youdao.com/dictvoice?audio=${cleanText}&type=2`);
    } else if (isMs) {
      urls.push(`https://translate.google.com/translate_tts?ie=UTF-8&tl=ms-MY&client=tw-ob&q=${cleanText}`);
      urls.push(`https://translate.google.com/translate_tts?ie=UTF-8&tl=id-ID&client=tw-ob&q=${cleanText}`);
    } else {
      urls.push(`https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${cleanText}`);
    }

    return urls;
  }

  /**
   * Fetch audio blob with fallback URLs and store to cache
   */
  public async fetchAndCacheAudio(text: string, lang: string): Promise<Blob | null> {
    // 1. Check cache first
    const cached = await this.getCachedAudioBlob(text, lang);
    if (cached) return cached;

    // 2. Fetch from remote
    const urls = this.getAudioUrls(text, lang);

    for (const url of urls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Accept': 'audio/mpeg, audio/mp3, audio/*; q=0.9',
          }
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const blob = await response.blob();
          if (blob.size > 200) {
            // Save to offline IndexedDB
            await this.saveAudioBlob(text, lang, blob);
            return blob;
          }
        }
      } catch {
        // Continue to next mirror URL
      }
    }

    return null;
  }

  /**
   * Play audio directly via HTML5 Audio element
   */
  public async playAudio(
    text: string,
    lang: string,
    rate: number = 1.0
  ): Promise<boolean> {
    this.stopAudio();

    try {
      // 1. Get or fetch audio blob
      let blob = await this.getCachedAudioBlob(text, lang);
      if (!blob) {
        blob = await this.fetchAndCacheAudio(text, lang);
      }

      let audioSrc = '';
      let isObjectUrl = false;

      if (blob) {
        audioSrc = URL.createObjectURL(blob);
        isObjectUrl = true;
      } else {
        // Direct stream URL fallback if CORS or fetch failed
        const urls = this.getAudioUrls(text, lang);
        if (urls.length > 0) {
          audioSrc = urls[0];
        } else {
          return false;
        }
      }

      return new Promise<boolean>((resolve) => {
        const audio = new Audio();
        this.currentAudioElement = audio;

        audio.src = audioSrc;
        audio.playbackRate = Math.max(0.5, Math.min(2.0, rate));

        let isResolved = false;
        const cleanup = (success: boolean) => {
          if (!isResolved) {
            isResolved = true;
            if (this.currentAudioElement === audio) {
              this.currentAudioElement = null;
            }
            if (isObjectUrl) {
              try {
                URL.revokeObjectURL(audioSrc);
              } catch {}
            }
            clearTimeout(timeoutId);
            resolve(success);
          }
        };

        const maxDuration = Math.max(3000, text.length * 400);
        const timeoutId = setTimeout(() => {
          cleanup(true);
        }, maxDuration);

        audio.onended = () => {
          cleanup(true);
        };

        audio.onerror = () => {
          cleanup(false);
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((e) => {
            console.warn('HTML5 Audio play rejected:', e);
            cleanup(false);
          });
        }
      });
    } catch (err) {
      console.warn('playAudio exception:', err);
      return false;
    }
  }

  public stopAudio(): void {
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch {}
      this.currentAudioElement = null;
    }
  }

  public pauseAudio(): void {
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
      } catch {}
    }
  }

  public resumeAudio(): void {
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.play().catch(() => {});
      } catch {}
    }
  }

  /**
   * Get total count of cached audio words in IndexedDB
   */
  public async getCachedCount(): Promise<number> {
    try {
      const db = await this.initDB();
      return new Promise((resolve) => {
        const tx = db.transaction('audio_cache', 'readonly');
        const store = tx.objectStore('audio_cache');
        const req = store.count();
        req.onsuccess = () => resolve(req.result || 0);
        req.onerror = () => resolve(0);
      });
    } catch {
      return 0;
    }
  }

  /**
   * Clear all cached audio
   */
  public async clearCache(): Promise<void> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('audio_cache', 'readwrite');
        const store = tx.objectStore('audio_cache');
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {}
  }
}

export const audioCacheService = new AudioCacheService();
