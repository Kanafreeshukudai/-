// Mochi AI — Groq backend
// Vazifasi: GROQ_API_KEY'ni brauzerdan yashirish va ikkita xizmatni taqdim etish:
//   1) POST /api/transcribe — ovozni matnga aylantirish (Groq Whisper)
//   2) POST /api/chat       — matnli suhbat javobi (Groq LLM)

require('dotenv').config();
const fs = require('fs');
const os = require('os');
const path = require('path');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const Groq = require('groq-sdk');

if (!process.env.GROQ_API_KEY) {
  console.error('XATOLIK: .env faylida GROQ_API_KEY topilmadi. .env.example asosida .env yarating.');
  process.exit(1);
}

const app = express();
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json({ limit: '2mb' }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB — ovozli xabar uchun yetarli
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ---------- 1) Ovozni matnga aylantirish (Speech-to-Text) ----------
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  let tmpPath = null;
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Audio fayl yuborilmadi" });
    }

    // groq-sdk fayl oqimini talab qiladi, shuning uchun vaqtinchalik faylga yozamiz
    tmpPath = path.join(os.tmpdir(), `mochi_audio_${Date.now()}.webm`);
    fs.writeFileSync(tmpPath, req.file.buffer);

    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(tmpPath),
      model: 'whisper-large-v3-turbo',
      language: 'uz', // o'zbek tili — aniqlikni oshiradi
      response_format: 'json',
      temperature: 0
    });

    res.json({ text: (transcription.text || '').trim() });
  } catch (err) {
    console.error('Transkripsiya xatosi:', err);
    res.status(500).json({ error: "Ovozni matnga aylantirib bo'lmadi" });
  } finally {
    if (tmpPath && fs.existsSync(tmpPath)) {
      fs.unlink(tmpPath, () => {});
    }
  }
});

// ---------- 2) Chat javobi (Groq LLM) ----------
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, system } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages massivi kerak" });
    }

    // Faqat kerakli maydonlarni o'tkazamiz (xavfsizlik uchun)
    const cleanMessages = messages
      .filter(m => m && typeof m.content === 'string' && (m.role === 'user' || m.role === 'assistant'))
      .slice(-16)
      .map(m => ({ role: m.role, content: m.content }));

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: system || '' },
        ...cleanMessages
      ],
      max_tokens: 800,
      temperature: 0.7
    });

    const reply = completion.choices?.[0]?.message?.content?.trim() || '';
    res.json({ reply });
  } catch (err) {
    console.error('Chat xatosi:', err);
    res.status(500).json({ error: "Javob olishda xatolik yuz berdi" });
  }
});

app.get('/health', (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Mochi Groq backend ${PORT}-portda ishlamoqda`);
});
