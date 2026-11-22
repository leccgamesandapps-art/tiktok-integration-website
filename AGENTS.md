# AGENTS.md — Keepclip

**Continue from [PLAN.md](./PLAN.md).** Milestone 1 (UI surface with stub data) is done; start at Milestone 2.

## Architecture
- Vite multi-page app. Entry HTML files: `index.html` (`/`), `start/index.html` (`/start`), `dashboard/index.html` (`/dashboard`), wired in `vite.config.ts`. Each mounts `src/entry-*.tsx`.
- Sub-screens are addressed by URL hash (product requirement, e.g. `/dashboard#saved_<caption-slug>_<username>`). `useHash()` in `src/lib.ts` returns the decoded hash; `DashboardPage.tsx` switches views on it.
- `src/fixtures.ts` — ALL stub TikTok data and the fake link lookup. Swap for API calls.
- `src/lib.ts` — hash hook, formatters, `savedHash()` (canonical saved-video URL), and the stub store (`useStore`, `actions`) persisted to `localStorage`. Replace `actions.*` with API calls, keeping the same signatures where possible.
- `src/views/` — `HomePage`, `StartPage`, `DashboardPage`, and `dash/*View.tsx` for each dashboard section.
- `src/components/` — Icons (inline SVG; the TikTok button uses a generic music-note icon, not TikTok’s logo), Poster (gradient stand-in for video frames), Modal, Toast, Brand.

## Decisions
- No full-stack framework on purpose: later milestones add a Netlify Server at `netlify/server/index.mjs` for `/api/*`. Don't add a catch-all `/*` rewrite — it would shadow the server.
- Persistence must use Netlify Database (records) + Netlify Blobs (video files).
- Design: warm "archive" paper palette, Fraunces / Instrument Sans / IBM Plex Mono, CSS variables in `src/styles.css`. No Tailwind.
- One account per session; there is intentionally no "switch account".
