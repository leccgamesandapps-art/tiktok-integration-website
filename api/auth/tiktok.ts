import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getTikTokConfig } from '../tiktok.credentials'

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { clientKey, redirectUri } = getTikTokConfig()

  if (!clientKey) {
    return res.status(500).send('TikTok Client Key is not configured.')
  }

  const mode = (req.query.mode as string) || 'signin'
  const state = Buffer.from(JSON.stringify({ mode, t: Date.now() })).toString('base64url')

  const params = new URLSearchParams({
    client_key: clientKey,
    scope: 'user.info.basic',
    response_type: 'code',
    redirect_uri: redirectUri,
    state,
  })

  const authUrl = `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`
  res.redirect(302, authUrl)
}
