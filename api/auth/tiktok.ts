import type { VercelRequest, VercelResponse } from '@vercel/node'

const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY || ''
const REDIRECT_URI =
  process.env.TIKTOK_REDIRECT_URI ||
  'https://keepclip.vercel.app/api/auth/tiktok/callback'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (!CLIENT_KEY) {
    return res.status(500).send(
      'TikTok Client Key is not configured. Set TIKTOK_CLIENT_KEY in Vercel environment variables.',
    )
  }

  const mode = (req.query.mode as string) || 'signin'
  const state = Buffer.from(JSON.stringify({ mode, t: Date.now() })).toString('base64url')

  const params = new URLSearchParams({
    client_key: CLIENT_KEY,
    scope: 'user.info.basic',
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    state,
  })

  const authUrl = `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`
  res.redirect(302, authUrl)
}
