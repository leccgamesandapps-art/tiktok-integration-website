# Keepclip

A private cloud archive for TikTok videos. Sign up (email or TikTok), paste a TikTok link, save the video, and keep watching or downloading it — even if the original gets deleted from TikTok.

## Pages
| URL | What it does |
| --- | --- |
| `/` (`/index`) | How the website works |
| `/start#signup`, `#signin` | Email sign up / log in |
| `/start#signup_usingTiktok`, `#signin_usingTiktok` | Sign up / log in with TikTok |
| `/dashboard#home` | TikTok account details, or a "Connect to TikTok" button |
| `/dashboard#link` → `#link_<link>` | Enter a link, see caption/date/username, Save or View on TikTok |
| `/dashboard#saved` → `#saved_<caption>_<username>` | Library: watch, download, delete (delete permanently / download & delete) |
| `/dashboard#settings` | Account and TikTok details, Log out |

## Tech
Vite + React + TypeScript, plain CSS (`src/styles.css`), deployed on Netlify as a multi-page static build. Data is currently stubbed (`src/fixtures.ts`) and kept in the browser.

## Run locally
```bash
npm install
netlify dev   # or: npm run dev
```

## Roadmap
Real accounts, TikTok Login, link lookup, and cloud video storage (Netlify Server + Netlify Database + Netlify Blobs) are planned in [PLAN.md](./PLAN.md).
