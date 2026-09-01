import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // High-performance TTS Audio Proxy with global CORS and HTTP caching for Android WebView
  app.get('/api/tts', async (req, res) => {
    const text = ((req.query.text as string) || '').trim();
    const lang = ((req.query.lang as string) || 'zh-CN').trim();

    if (!text) {
      return res.status(400).send('Parameter text is required');
    }

    const cleanText = encodeURIComponent(text);
    const isZh = lang.toLowerCase().startsWith('zh');
    const isId = lang.toLowerCase().startsWith('id');
    const isMs = lang.toLowerCase().startsWith('ms');

    let targetUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${cleanText}`;
    if (isZh) {
      targetUrl = `https://dict.youdao.com/dictvoice?audio=${cleanText}&le=zh`;
    } else if (isId) {
      targetUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=id-ID&client=tw-ob&q=${cleanText}`;
    } else if (isMs) {
      targetUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ms-MY&client=tw-ob&q=${cleanText}`;
    }

    try {
      let fetchRes = await fetch(targetUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Referer: 'https://translate.google.com/',
        },
      });

      if (!fetchRes.ok) {
        const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${cleanText}`;
        fetchRes = await fetch(fallbackUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0',
          },
        });
      }

      if (fetchRes.ok) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
        const arrayBuf = await fetchRes.arrayBuffer();
        return res.send(Buffer.from(arrayBuf));
      }

      return res.status(502).send('Audio upstream unavailable');
    } catch (err) {
      console.warn('TTS streaming proxy error:', err);
      res.status(500).send('Internal TTS proxy error');
    }
  });

  // Vite Middleware (Dev) & Static Files (Prod)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
