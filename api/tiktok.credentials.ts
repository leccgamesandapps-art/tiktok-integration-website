/**
 * SERVER-ONLY TikTok credentials.
 * Used by /api/auth/* routes. Never import this from frontend/src.
 *
 * Priority: process.env > this file
 * Currently set to SANDBOX (Production app is still Draft).
 * When Production is approved, switch to production key/secret below.
 */

export const TIKTOK_CREDENTIALS = {
  // --- SANDBOX (active for testing) ---
  clientKey: 'sbawm6a9sm8ieqe6kj',
  clientSecret: '9FucqaRYBjpR4OdUcA9BEghAwZTRWKyt',

  // --- PRODUCTION (use after app is approved) ---
  // clientKey: 'awfbpi23q6j68szr',
  // clientSecret: 'uxqBXDnw5F8mhPNPRhGC6GRuwMfDiN1r',

  redirectUri: 'https://keepclip.vercel.app/api/auth/tiktok/callback',
  siteUrl: 'https://keepclip.vercel.app',
} as const

export function getTikTokConfig() {
  return {
    clientKey: process.env.TIKTOK_CLIENT_KEY || TIKTOK_CREDENTIALS.clientKey,
    clientSecret: process.env.TIKTOK_CLIENT_SECRET || TIKTOK_CREDENTIALS.clientSecret,
    redirectUri: process.env.TIKTOK_REDIRECT_URI || TIKTOK_CREDENTIALS.redirectUri,
    siteUrl:
      process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : TIKTOK_CREDENTIALS.siteUrl,
  }
}
