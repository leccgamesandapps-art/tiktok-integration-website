# Keepclip roadmap

Keepclip is a private cloud archive for TikTok videos: users connect TikTok, paste a video link, save it, and can watch, download, or delete it later — even after the original is removed from TikTok.

## Milestone 1 — Product surface ✅
- Landing page (`/`, also `/index`) explaining how the site works.
- Start page: `/start#signup`, `#signin`, `#signup_usingTiktok`, `#signin_usingTiktok`.
- Dashboard: `#home`, `#link`, `#link_<tiktok link>`, `#saved`, `#saved_<caption>_<username>`, `#settings`.
- All data is stubbed in `src/fixtures.ts`; the session/library is kept in the browser (`src/lib.ts`) so every flow is clickable.

## Milestone 2 — Accounts & sessions
- Add a Netlify Server (`netlify/server/index.mjs`, Hono) for `/api/*`.
- Netlify Database (Drizzle) schema: `users`, `tiktok_accounts`, `sessions`.
- Email/password signup and login with hashed passwords and an HTTP-only session cookie.
- Replace `actions.signUpEmail / signInEmail / logout` with API calls; dashboard guard checks the server session.

## Milestone 3 — TikTok Login Kit
- Register a TikTok developer app (client key + secret as environment variables).
- OAuth flow for `#signup_usingTiktok`, `#signin_usingTiktok`, and the dashboard "Connect to TikTok" button.
- Fetch profile (avatar, username, display name, bio) via the TikTok API; store tokens encrypted; refresh on expiry.

## Milestone 4 — Link lookup & cloud video storage
- `POST /api/lookup` resolves a TikTok link (incl. short `vm.tiktok.com` links) to caption, author, publish date, thumbnail.
- `POST /api/saved` downloads the video file server-side and stores it in Netlify Blobs (one store per user prefix); metadata row in a `saved_videos` table with `saved_at`, `published_at`, `author_username`.
- Background function for large downloads so saving never times out.
- Real `<video>` playback streamed from Blobs; real MP4 downloads (replaces the metadata-receipt preview).
- Delete permanently / download-then-delete removes both Blob and row.

## Milestone 5 — Keep-alive & polish
- Scheduled function that re-checks saved links and flags `source_removed` when the original disappears.
- Real thumbnails through Netlify Image CDN, storage quota display, account deletion, error/rate-limit handling.

## Notes
- Check TikTok's developer terms for video download/storage before launching Milestone 4; the API approach may need adjusting to what TikTok permits.
