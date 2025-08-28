# Document Summary Assistant - Server

## Setup

1. Copy `.env.example` to `.env` and fill in values.

```
GEMINI_API_KEY=your_key_here
CLIENT_ORIGIN=http://localhost:5173
PORT=8080
```

2. Install dependencies
```
npm install
```

3. Run locally
```
npm run dev
```

The server will start on `http://localhost:8080`.

## API

- `POST /upload` — multipart/form-data with field `file` (PDF/JPG/PNG). Returns `{ text }`.
- `POST /summarize` — JSON `{ text: string, length: 'short'|'medium'|'long' }`. Returns `{ summary }`.

## Deployment

- Recommended platforms: Render or Railway.
- Ensure environment variables are configured:
  - `GEMINI_API_KEY`
  - `CLIENT_ORIGIN` (your frontend URL)
  - `PORT` (if required by the platform)

## Notes

- File size limit: 15MB.
- OCR via tesseract.js can be slow for large images; consider restricting resolution before upload if needed.
