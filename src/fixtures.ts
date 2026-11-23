export type TikTokProfile = {
  username: string
  name: string
  bio: string
  avatarHue: number
  avatarUrl?: string
  followers: number
  following: number
  likes: number
  videoCount: number
  connectedAt: string
}

export type TikTokVideo = {
  videoId: string
  link: string
  caption: string
  username: string
  authorName: string
  publishedAt: string
  duration: number
  hue: number
  views: number
  /** Real playable MP4 URL (saved with the cloud entry) */
  playUrl?: string
  coverUrl?: string
  downloadUrl?: string
}

export const DEMO_TIKTOK_PROFILE: TikTokProfile = {
  username: 'marisol.bakes',
  name: 'Marisol Okafor-Lindqvist',
  bio: 'Sourdough at 4am, plant walks at noon.',
  avatarHue: 18,
  followers: 48213,
  following: 391,
  likes: 1204877,
  videoCount: 286,
  connectedAt: '',
}

export const KNOWN_VIDEOS: TikTokVideo[] = []

export const SEED_SAVED: { videoId: string; savedAt: string; sourceRemoved?: boolean; sizeMB: number }[] = []

export type LinkParseResult =
  | { ok: true; username: string | null; videoId: string | null; link: string }
  | { ok: false; reason: string }

export function parseTikTokLink(raw: string): LinkParseResult {
  const value = raw.trim()
  if (!value) return { ok: false, reason: 'Paste a TikTok link first.' }

  let url: URL
  try {
    url = new URL(value.startsWith('http') ? value : `https://${value}`)
  } catch {
    return { ok: false, reason: 'That doesn’t look like a link.' }
  }

  const host = url.hostname.replace(/^www\.|^m\./, '').toLowerCase()
  if (!host.includes('tiktok.com')) {
    return { ok: false, reason: 'Only tiktok.com links can be saved.' }
  }

  const m = url.pathname.match(/@([\w.-]+)\/(?:video|photo)\/(\d+)/)
  if (m) {
    return {
      ok: true,
      username: m[1],
      videoId: m[2],
      link: `https://www.tiktok.com/@${m[1]}/video/${m[2]}`,
    }
  }

  const m2 = url.pathname.match(/\/video\/(\d+)/)
  if (m2) {
    return { ok: true, username: null, videoId: m2[1], link: url.toString() }
  }

  // Short links: vt.tiktok.com / vm.tiktok.com
  if (host === 'vm.tiktok.com' || host === 'vt.tiktok.com' || url.pathname.length > 1) {
    return { ok: true, username: null, videoId: null, link: url.toString() }
  }

  return { ok: false, reason: 'Use a video link, like tiktok.com/@user/video/123…' }
}

/** Resolve real metadata + MP4 via server API (supports vt.tiktok.com). */
export async function lookupTikTokVideo(link: string): Promise<TikTokVideo> {
  const parsed = parseTikTokLink(link)
  if (!parsed.ok) throw new Error(parsed.reason)

  const res = await fetch(`/api/tiktok/resolve?url=${encodeURIComponent(parsed.link)}`)
  const data = (await res.json()) as {
    ok: boolean
    error?: string
    video?: TikTokVideo
  }

  if (!res.ok || !data.ok || !data.video) {
    throw new Error(data.error || 'Could not load this TikTok video.')
  }

  return data.video
}

export function videoById(_id: string): TikTokVideo | undefined {
  return undefined
}
