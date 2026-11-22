import type { Handler } from '@netlify/functions'

const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY || ''
const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET || ''
const REDIRECT_URI =
  process.env.TIKTOK_REDIRECT_URI ||
  'https://tiktok-integration-website.netlify.app/api/auth/tiktok/callback'
const SITE_URL = process.env.URL || 'https://tiktok-integration-website.netlify.app'

export const handler: Handler = async (event) => {
  const code = event.queryStringParameters?.code
  const state = event.queryStringParameters?.state
  const error = event.queryStringParameters?.error

  if (error) {
    return redirect(`${SITE_URL}/start.html#signin?error=${encodeURIComponent(error)}`)
  }

  if (!code) {
    return redirect(`${SITE_URL}/start.html#signin?error=missing_code`)
  }

  if (!CLIENT_KEY || !CLIENT_SECRET) {
    return {
      statusCode: 500,
      body: 'TikTok credentials are not configured on the server.',
    }
  }

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: CLIENT_KEY,
        client_secret: CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      }),
    })

    const tokenData = await tokenRes.json()

    if (!tokenRes.ok || tokenData.error || !tokenData.access_token) {
      console.error('TikTok token error', tokenData)
      return redirect(`${SITE_URL}/start.html#signin?error=token_failed`)
    }

    const accessToken = tokenData.access_token as string
    const openId = tokenData.open_id as string

    // 2. Fetch user profile
    const fields = 'open_id,union_id,avatar_url,display_name,username,bio_description'
    const userRes = await fetch(
      `https://open.tiktokapis.com/v2/user/info/?fields=${fields}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    )

    const userData = await userRes.json()
    const user = userData?.data?.user

    if (!userRes.ok || !user) {
      console.error('TikTok user info error', userData)
      return redirect(`${SITE_URL}/start.html#signin?error=profile_failed`)
    }

    // 3. Pass profile to the frontend via a short-lived payload in the URL hash
    // Frontend will create the local session (cloud library stays per-account).
    const profile = {
      openId: user.open_id || openId,
      username: user.username || user.display_name || 'tiktok_user',
      name: user.display_name || user.username || 'TikTok User',
      bio: user.bio_description || '',
      avatarUrl: user.avatar_url || '',
      connectedAt: new Date().toISOString(),
    }

    const payload = Buffer.from(JSON.stringify(profile)).toString('base64url')

    // Parse mode from state if present
    let mode = 'signin'
    try {
      if (state) {
        const parsed = JSON.parse(Buffer.from(state, 'base64url').toString())
        mode = parsed.mode || 'signin'
      }
    } catch {
      // ignore
    }

    const target =
      mode === 'connect'
        ? `${SITE_URL}/dashboard.html#home?tiktok=${payload}`
        : `${SITE_URL}/dashboard.html#home?tiktok=${payload}`

    return redirect(target)
  } catch (err) {
    console.error('TikTok callback error', err)
    return redirect(`${SITE_URL}/start.html#signin?error=server_error`)
  }
}

function redirect(location: string) {
  return {
    statusCode: 302,
    headers: {
      Location: location,
      'Cache-Control': 'no-store',
    },
    body: '',
  }
}
