import type { VercelRequest, VercelResponse } from '@vercel/node'

// SERVER-ONLY
// Production Draft apps are REJECTED by TikTok authorize (client_key error).
// Use Sandbox until app status is Live/Approved.
const CLIENT_KEY = 'sbawm6a9sm8ieqe6kj' // Sandbox
const REDIRECT_URI = 'https://keepclip.vercel.app/api/auth/tiktok/callback'

export default function handler(req: VercelRequest, res: VercelResponse) {
  const mode = (req.query.mode as string) || 'signin'
  const state = Buffer.from(JSON.stringify({ mode, t: Date.now() })).toString('base64url')

  const params = new URLSearchParams({
    client_key: CLIENT_KEY,
    scope: 'user.info.basic',
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    state,
  })

  res.redirect(302, `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`)
}
