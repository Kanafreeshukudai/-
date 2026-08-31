# Mochi AI — Groq Backend

Bu kichik server GROQ_API_KEY'ni brauzerdan yashiradi va ikkita endpoint beradi:

- `POST /api/transcribe` — ovozli xabarni (audio blob) matnga aylantiradi (Groq Whisper, `whisper-large-v3-turbo`, `language: uz`)
- `POST /api/chat` — suhbat tarixi va tizim promptini oladi, Groq LLM (`llama-3.3-70b-versatile`) javobini qaytaradi

## O'rnatish

```bash
npm install
cp .env.example .env
```

`.env` faylini oching va `GROQ_API_KEY` qatoriga o'z key'ingizni yozing.
Key olish: https://console.groq.com/keys (bepul akkaunt yetarli).

## Ishga tushirish

```bash
npm start
```

Server standart holda `http://localhost:3000` da ishlaydi.

## Frontend bilan bog'lash

`index.html` faylidagi:

```js
const MOCHI_BACKEND_URL = 'http://localhost:3000';
```

qatorini serveringiz manzili bilan almashtiring (production'da masalan `https://api.mening-saytim.uz`).

## Joylashtirish (deploy)

Bepul/qulay variantlar:
- **Render.com** — "Web Service" sifatida GitHub repo'ni ulang, `GROQ_API_KEY`ni Environment Variables bo'limiga qo'shing
- **Railway.app** — shunga o'xshash, bir necha bosishda ishga tushadi
- **VPS** (masalan DigitalOcean) — `pm2 start server.js` bilan doimiy ishlatish mumkin

Muhim: `ALLOWED_ORIGIN`ni production'da `*` o'rniga o'z sayt domeningizga o'zgartiring — bu boshqa saytlar sizning key'ingiz hisobidan so'rov yubormasligini ta'minlaydi.

## Xarajat haqida

Groq'ning bepul tarifi kuniga ~2000 so'rov va ~28800 soniya audio beradi (shaxsiy loyiha uchun odatda yetarli). Undan oshsa, to'lov groq.com/pricing sahifasida ko'rsatilgan.
