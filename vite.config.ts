import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// Local proxy for ElevenLabs text-to-speech: keeps the API key server-side.
// POST /api/tts { text, era } -> audio/mpeg (voice only; music mixing happens client-side)
function elevenLabsProxy(env: Record<string, string>): Plugin {
  return {
    name: 'elevenlabs-proxy',
    configureServer(server) {
      // POST /api/send-email { to, audio (base64 mp3), text, product, era } -> sends the spot by mail via Resend
      server.middlewares.use('/api/send-email', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end();
          return;
        }
        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', async () => {
          try {
            const { to, audio, text, product, era } = JSON.parse(body) as { to?: string; audio?: string; text?: string; product?: string; era?: string };
            if (!env.RESEND_API_KEY) {
              res.statusCode = 500;
              res.end('RESEND_API_KEY manquante dans le .env');
              return;
            }
            if (!to || !/^\S+@\S+\.\S+$/.test(to) || !audio) {
              res.statusCode = 400;
              res.end('Adresse e-mail ou audio manquant');
              return;
            }
            const escape = (value = '') => value.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
            const upstream = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                from: env.MAIL_FROM || 'Dploy <onboarding@resend.dev>',
                to: [to],
                subject: `Votre spot Dploy : ${product ?? ''} (${era ?? ''})`,
                html: `<p>Voici votre spot audio, en pièce jointe.</p><p><em>${escape(text)}</em></p>`,
                attachments: [{ filename: 'spot-dploy.mp3', content: audio }],
              }),
            });
            if (!upstream.ok) {
              res.statusCode = upstream.status;
              res.end(await upstream.text());
              return;
            }
            res.end('ok');
          } catch (error) {
            res.statusCode = 500;
            res.end(String(error));
          }
        });
      });

      server.middlewares.use('/api/tts', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end();
          return;
        }
        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', async () => {
          try {
            const { text, era } = JSON.parse(body) as { text?: string; era?: string };
            const apiKey = env.ELEVENLABS_API_KEY;
            const voiceId = env[`ELEVENLABS_VOICE_${era}`] || env.ELEVENLABS_VOICE_ID;
            if (!apiKey || !voiceId || !text?.trim()) {
              res.statusCode = 400;
              res.end('Missing ELEVENLABS_API_KEY, voice id or text');
              return;
            }
            const upstream = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
              method: 'POST',
              headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
              body: JSON.stringify({
                text: text.slice(0, 300),
                model_id: env.ELEVENLABS_MODEL || 'eleven_multilingual_v2',
                voice_settings: { stability: 0.35, similarity_boost: 0.75, style: 0.45, use_speaker_boost: true },
              }),
            });
            if (!upstream.ok) {
              res.statusCode = upstream.status;
              res.end(await upstream.text());
              return;
            }
            const audio = Buffer.from(await upstream.arrayBuffer());
            res.setHeader('Content-Type', 'audio/mpeg');
            res.end(audio);
          } catch (error) {
            res.statusCode = 500;
            res.end(String(error));
          }
        });
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), elevenLabsProxy(env)],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});
