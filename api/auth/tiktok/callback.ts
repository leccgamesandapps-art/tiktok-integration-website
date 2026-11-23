import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getTikTokConfig } from '../../tiktok.credentials'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { clientKey, clientSecret, redirectUri, siteUrl } = getTikTokConfig()

  const code = req.query.code as string | undefined
  const state = req.query.state as string | undefined
  const error = req.query.error as string | undefined

  if (error) {
    return res.redirect(302, `${siteUrl}/start#signin?error=${encodeURIComponent(error)}`)
  }

  if (!code) {
    return res.redirect(302, `${siteUrl}/start#signin?error=missing_code`)
  }

  if (!clientKey || !clientSecret) {
    return res.status(500).send('TikTok credentials are not configured on the server.')
  }

  try {
    const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    })

    const tokenData = (await tokenRes.json()) as {
      error?: string
      access_token?: string
      open_id?: string
    }

    if (!tokenRes.ok || tokenData.error || !tokenData.access_token) {
      console.error('TikTok token error', tokenData)
      return res.redirect(302, `${siteUrl}/start#signin?error=token_failed`)
    }

    const accessToken = tokenData.access_token
    const openId = tokenData.open_id || ''

    const fields = 'open_id,union_id,avatar_url,display_name,username,bio_description'
    const userRes = await fetch(
      `https://open.tiktokapis.com/v2/user/info/?fields=${fields}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )

    const userData = (await userRes.json()) as {
      data?: {
        user?: {
          open_id?: string
          username?: string
          display_name?: string
          bio_description?: string
          avatar_url?: string
        }
      }
    }
    const user = userData?.data?.user

    if (!userRes.ok || !user) {
      console.error('TikTok user info error', userData)
      return res.redirect(302, `${siteUrl}/start#signin?error=profile_failed`)
    }

    const profile = {
      openId: user.open_id || openId,
      username: user.username || user.display_name || 'tiktok_user',
      name: user.display_name || user.username || 'TikTok User',
      bio: user.bio_description || '',
      avatarUrl: user.avatar_url || '',
      connectedAt: new Date().toISOString(),
    }

    const payload = Buffer.from(JSON.stringify(profile)).toString('base64url')

    let mode = 'signin'
    try {
      if (state) {
        const parsed = JSON.parse(Buffer.from(state, 'base64url').toString()) as { mode?: string }
        mode = parsed.mode || 'signin'
      }
    } catch {
      // ignore
    }

    void mode
    return res.redirect(302, `${siteUrl}/dashboard#home?tiktok=${payload}`)
  } catch (err) {
    console.error('TikTok callback error', err)
    return res.redirect(302, `${siteUrl}/start#signin?error=server_error`)
  }
}
