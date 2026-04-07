import './utils/shims.js';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
// PDF text extraction helper
import Tesseract from 'tesseract.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import axios from 'axios';
import { extractPdfText } from './utils/pdf.js';

// Load env values
dotenv.config();

const app = express();
const port = process.env.PORT || 8080;
const clientOrigin = process.env.CLIENT_ORIGIN || '*';

// Allow frontend calls
app.use(cors({ origin: clientOrigin === '*' ? true : clientOrigin }));
// Read JSON bodies
app.use(express.json({ limit: '10mb' }));

// Put uploads in a temp folder
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]/gi, '_');
    cb(null, `${base}-${unique}${ext}`);
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ok = ['application/pdf', 'image/png', 'image/jpeg'];
    if (!ok.includes(file.mimetype)) return cb(new Error('Only PDF, PNG, and JPG files are allowed'));
    cb(null, true);
  },
  limits: { fileSize: 15 * 1024 * 1024 }
});

// Health check
app.get('/health', (req, res) => res.json({ ok: true }));

// Upload a file and extract text
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const { mimetype, path: filePath } = req.file;
    let text = '';

    // PDF -> text, Image -> OCR
    if (mimetype === 'application/pdf') {
      text = (await extractPdfText(filePath)).trim();
    } else if (mimetype === 'image/png' || mimetype === 'image/jpeg') {
      const result = await Tesseract.recognize(filePath, 'eng', { logger: () => {} });
      text = (result.data.text || '').trim();
    }

    // Delete temp file
    try { fs.unlinkSync(filePath); } catch {}

    if (!text) return res.status(422).json({ error: 'No text could be extracted from the file' });
    res.json({ text });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'Failed to process file' });
  }
});

// Break long text into chunks
function chunkText(str, size) {
  const out = [];
  for (let i = 0; i < str.length; i += size) out.push(str.slice(i, i + size));
  return out;
}

// Call the Gemini API
async function callGemini(apiKey, model, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const payload = { contents: [{ role: 'user', parts: [{ text: prompt }] }] };
  const { data } = await axios.post(url, payload, { headers: { 'Content-Type': 'application/json' }, timeout: 90000 });
  const cand = data?.candidates?.find(c => c?.content?.parts?.[0]?.text);
  return cand?.content?.parts?.[0]?.text?.trim() || '';
}

// Summarize text with Gemini
app.post('/summarize', async (req, res) => {
  try {
    const { text, length } = req.body || {};
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const lengthMap = {
      short: 'about 3-4 sentences',
      medium: 'about 2 short paragraphs',
      long: 'about 4-6 paragraphs with bullets for key points'
    };
    const style = lengthMap[length] || lengthMap.medium;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Missing GEMINI_API_KEY on server' });

  const model = 'gemini-flash-latest'; // fast and good
    const MAX_CHARS = 12000;
    const clean = String(text).slice(0, 800000).replace(/\s+$/g, '');
    let summary = '';

    if (clean.length <= MAX_CHARS) {
      const prompt = `Summarize the following text in ${style}.\n\nText:\n${clean}\n\nRules:\n- Use clear, concise language.\n- Preserve important facts, figures, names, and dates.\n- If the text seems OCR-noisy, try to infer corrections.\n- Return only the summary, no preamble.`;
      summary = await callGemini(apiKey, model, prompt);
    } else {
      const parts = chunkText(clean, MAX_CHARS);
      const bullets = [];
      for (let i = 0; i < parts.length; i++) {
        const p = `Summarize chunk ${i + 1}/${parts.length} in 3-5 bullet points focusing on facts, names, and numbers.\n\nChunk:\n${parts[i]}`;
        const s = await callGemini(apiKey, model, p);
        bullets.push(s || '');
      }
      const combine = `Combine the bullet summaries into one summary in ${style}. Return only the final summary.\n\n${bullets.join('\n\n')}`;
      summary = await callGemini(apiKey, model, combine);
    }

    if (!summary) return res.status(502).json({ error: 'No summary returned by Gemini' });
    res.json({ summary });
  } catch (err) {
    console.error('Summarize error:', err?.response?.data || err.message || err);
    const status = err?.response?.status || 500;
    const message = err?.response?.data?.error?.message || err.message || 'Failed to generate summary';
    res.status(status).json({ error: message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
