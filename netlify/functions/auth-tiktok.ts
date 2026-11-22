import type { Handler } from '@netlify/functions'

const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY || ''
const REDIRECT_URI =
  process.env.TIKTOK_REDIRECT_URI ||
  'https://tiktok-integration-website.netlify.app/api/auth/tiktok/callback'

export const handler: Handler = async (event) => {
  if (!CLIENT_KEY) {
    return {
      statusCode: 500,
      body: 'TikTok Client Key is not configured. Set TIKTOK_CLIENT_KEY in Netlify environment variables.',
    }
  }

  const mode = event.queryStringParameters?.mode || 'signin' // signup | signin | connect
  const state = Buffer.from(
    JSON.stringify({ mode, t: Date.now() }),
  ).toString('base64url')

  const params = new URLSearchParams({
    client_key: CLIENT_KEY,
    scope: 'user.info.basic',
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    state,
  })

  const authUrl = `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`

  return {
    statusCode: 302,
    headers: {
      Location: authUrl,
      'Cache-Control': 'no-store',
    },
    body: '',
  }
}
