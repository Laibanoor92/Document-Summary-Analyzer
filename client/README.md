# Document Summary Assistant - Client

## Setup

1. Install dependencies
```
npm install
```

2. Create `.env` and set your backend base URL (when different from default)
```
VITE_API_BASE_URL=http://localhost:8080
```

3. Run locally
```
npm run dev
```

Open the URL printed by Vite (likely http://localhost:5173).

## Build
```
npm run build
npm run preview
```

## Deploy
- Vercel / Netlify: import the repo, set build command `npm run build` and output directory `dist`.
- Environment variable: `VITE_API_BASE_URL` should point to your deployed backend URL.
