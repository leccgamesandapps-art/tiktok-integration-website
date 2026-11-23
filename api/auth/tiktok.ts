import type { VercelRequest, VercelResponse } from '@vercel/node'

const PRODUCTION_KEY = 'awfbpi23q6j68szr'
const SANDBOX_KEY = 'sbawm6a9sm8ieqe6kj'
const REDIRECT_URI = 'https://keepclip.vercel.app/api/auth/tiktok/callback'

export default function handler(req: VercelRequest, res: VercelResponse) {
  const mode = (req.query.mode as string) || 'signin'
  // Default to Sandbox while Production is Draft (TikTok rejects Draft client_key)
  // Explicit sandbox=1 or mode=connect → Sandbox
  // production=1 → force Production key
  const forceProd = req.query.production === '1'
  const useSandbox =
    !forceProd &&
    (req.query.sandbox === '1' || mode === 'connect' || mode === 'sandbox' || true)

  const clientKey = useSandbox ? SANDBOX_KEY : PRODUCTION_KEY

  const state = Buffer.from(
    JSON.stringify({ mode, sandbox: useSandbox, t: Date.now() }),
  ).toString('base64url')

  const params = new URLSearchParams({
    client_key: clientKey,
    scope: 'user.info.basic',
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    state,
  })

  res.redirect(302, `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`)
}
