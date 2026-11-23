import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Resolves any TikTok URL (including vt.tiktok.com / vm.tiktok.com)
 * to metadata + playable/download MP4 URLs via tikwm.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(204).end()

  const url =
    (typeof req.query.url === 'string' ? req.query.url : '') ||
    (typeof req.body?.url === 'string' ? req.body.url : '')

  if (!url || !url.includes('tiktok')) {
    return res.status(400).json({ ok: false, error: 'Provide a TikTok URL.' })
  }

  try {
    const form = new URLSearchParams({ url, hd: '1' })
    const upstream = await fetch('https://tikwm.com/api/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        Accept: 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
      body: form.toString(),
    })

    const json = (await upstream.json()) as {
      code?: number
      msg?: string
      data?: {
        id?: string
        title?: string
        duration?: number
        play?: string
        hdplay?: string
        wmplay?: string
        cover?: string
        origin_cover?: string
        play_count?: number
        create_time?: number
        author?: { unique_id?: string; nickname?: string; avatar?: string }
        music?: string
        music_info?: { title?: string }
      }
    }

    if (json.code !== 0 || !json.data) {
      return res.status(502).json({
        ok: false,
        error: json.msg || 'Could not resolve this TikTok link.',
      })
    }

    const d = json.data
    const playUrl = d.hdplay || d.play || d.wmplay || ''
    if (!playUrl) {
      return res.status(502).json({ ok: false, error: 'No playable video URL found.' })
    }

    const publishedAt = d.create_time
      ? new Date(d.create_time * 1000).toISOString()
      : new Date().toISOString()

    return res.status(200).json({
      ok: true,
      video: {
        videoId: String(d.id || Date.now()),
        link: url,
        caption: d.title || 'TikTok video',
        username: d.author?.unique_id || 'tiktok',
        authorName: d.author?.nickname || d.author?.unique_id || 'TikTok',
        publishedAt,
        duration: Math.max(1, Math.round(d.duration || 0)),
        views: d.play_count || 0,
        hue: 210,
        playUrl,
        coverUrl: d.origin_cover || d.cover || '',
        downloadUrl: playUrl,
      },
    })
  } catch (err) {
    console.error('resolve error', err)
    return res.status(500).json({ ok: false, error: 'Server failed to resolve the link.' })
  }
}
