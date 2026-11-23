import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Proxies an MP4 URL so the browser can download it as a file
 * (avoids cross-origin download blocks on TikTok CDN).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const src = typeof req.query.src === 'string' ? req.query.src : ''
  const name = typeof req.query.name === 'string' ? req.query.name : 'keepclip-video.mp4'

  if (!src || !/^https?:\/\//i.test(src)) {
    return res.status(400).send('Missing src')
  }

  try {
    const upstream = await fetch(src, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Referer: 'https://www.tiktok.com/',
      },
    })

    if (!upstream.ok || !upstream.body) {
      return res.status(502).send('Upstream video fetch failed')
    }

    const contentType = upstream.headers.get('content-type') || 'video/mp4'
    const buf = Buffer.from(await upstream.arrayBuffer())

    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Length', String(buf.length))
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${name.replace(/[^\w.-]+/g, '_')}"`,
    )
    res.setHeader('Cache-Control', 'private, max-age=3600')
    return res.status(200).send(buf)
  } catch (err) {
    console.error('download proxy error', err)
    return res.status(500).send('Download failed')
  }
}
