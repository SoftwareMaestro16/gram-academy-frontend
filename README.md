# gram-academy-frontend

Telegram Mini App for Gram Academy — React 19 + Vite + Tailwind v4 + Zustand +
TanStack Query + TON Connect. Deployed on Vercel.

## Layout

```
src/                React app (no router — Zustand view-stack + Telegram BackButton)
packages/i18n/      @gram-academy/i18n — VENDORED from gram-academy-backend (dist only)
packages/protocol/  @gram-academy/protocol — VENDORED from gram-academy-contracts (dist only)
public/             static assets (tonconnect-manifest.json, etc.)
tools/              sync-vendored.mjs
```

## Setup

```
npm install
npm run sync:vendored     # vendor @gram-academy/{protocol,i18n} dist from sibling repos
cp .env.example .env      # then fill public VITE_* values
npm run dev               # dev server on :5173, proxies /api -> 127.0.0.1:8080
```

Both shared packages are vendored (prebuilt `dist/` copied in). After the contracts SDK or the
i18n copy changes, rebuild them in their source repos and re-run `npm run sync:vendored`.

## Deploy (Vercel)

- Root Directory: this repo's root.
- Build: `npm run build`, Output: `dist`.
- `vercel.json` rewrites `/api/:path*` to the backend origin.
