# Document Summary Assistant

A full-stack app to upload PDF or images, extract text, and generate summaries using Google Gemini.

- Frontend: React + Vite + TailwindCSS
- Backend: Node.js + Express

## Monorepo layout
client/ # React frontend (Vite)
server/ # Express API

## Prerequisites
- Node.js 18+
- NPM

## Quick start (local)

### 1) Backend
cd server
cp .env.example .env

edit .env and set GEMINI_API_KEY
npm install
npm run dev

Server: http://localhost:8080

### 2) Frontend
cd ../client
npm install

optional: set VITE_API_BASE_URL in .env to http://localhost:8080
npm run dev

Frontend: http://localhost:5173

## API Overview
- POST /upload — multipart/form-data with field `file` (PDF/JPG/PNG). Returns `{ text }`.
- POST /summarize — JSON `{ text, length }`. Returns `{ summary }`.

**Notes:**
- OCR with tesseract.js can be slower for large images; consider compressing before upload.
- CORS is configured via `CLIENT_ORIGIN`.

## Build & Deployment

### Frontend
- Platforms: Vercel or Netlify
  - Build: `npm run build`
  - Output: `dist`
  - Env: `VITE_API_BASE_URL` → your backend URL

### Backend
- Platforms: Render or Railway
  - Env: `GEMINI_API_KEY`, `CLIENT_ORIGIN` (your frontend URL), `PORT` if needed
- File upload limit: 15MB

## Running Locally After Build
- Backend: `npm run dev` in `server/`
- Frontend: `npm run preview` in `client/`

## Deployed Project
Check out the live version here:https://document-summary-analyzer-ruby.vercel.app/
