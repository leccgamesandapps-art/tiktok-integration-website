/**
 * STUB DATA + shared types.
 * Real TikTok profiles come from Login Kit OAuth; seed data is used for preview.
 */

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
  duration: number // seconds
  hue: number
  views: number
}

export const DEMO_TIKTOK_PROFILE: TikTokProfile = {
  username: 'marisol.bakes',
  name: 'Marisol Okafor-Lindqvist',
  bio: 'Sourdough at 4am, plant walks at noon. Lagos ↔ Malmö. Recipes in the comments, never in a link.',
  avatarHue: 18,
  followers: 48213,
  following: 391,
  likes: 1204877,
  videoCount: 286,
  connectedAt: '',
}

export const KNOWN_VIDEOS: TikTokVideo[] = [
  {
    videoId: '7301948822150432042',
    link: 'https://www.tiktok.com/@theo.restores/video/7301948822150432042',
    caption: 'Stripping 70 years of paint off a ferry bench — part 3 of the brass hinge saga',
    username: 'theo.restores',
    authorName: 'Theo Vantongeren',
    publishedAt: '2026-09-14T17:42:00Z',
    duration: 58,
    hue: 32,
    views: 812400,
  },
  {
    videoId: '7288810046021733662',
    link: 'https://www.tiktok.com/@nadiyacooks/video/7288810046021733662',
    caption: 'My grandmother’s jollof, measured in “until it smells right”',
    username: 'nadiyacooks',
    authorName: 'Nadiya Adebayo',
    publishedAt: '2026-08-02T09:15:00Z',
    duration: 74,
    hue: 8,
    views: 2310947,
  },
  {
    videoId: '7312200398817460522',
    link: 'https://www.tiktok.com/@kestrel.field/video/7312200398817460522',
    caption: 'A kestrel hovering in 40 km/h wind and not moving its head once',
    username: 'kestrel.field',
    authorName: 'Ines Halloran',
    publishedAt: '2026-10-21T06:03:00Z',
    duration: 23,
    hue: 160,
    views: 389112,
  },
  {
    videoId: '7259003214487120155',
    link: 'https://www.tiktok.com/@lowtide.jun/video/7259003214487120155',
    caption: 'Tide pool census, Sunday edition: 3 nudibranchs and one very offended crab',
    username: 'lowtide.jun',
    authorName: 'Jun Matsuda-Reyes',
    publishedAt: '2026-05-11T14:27:00Z',
    duration: 41,
    hue: 196,
    views: 97631,
  },
]

export const SEED_SAVED: { videoId: string; savedAt: string; sourceRemoved?: boolean; sizeMB: number }[] = [
  { videoId: '7288810046021733662', savedAt: '2026-08-04T21:10:00Z', sourceRemoved: true, sizeMB: 18.4 },
  { videoId: '7301948822150432042', savedAt: '2026-09-15T08:31:00Z', sizeMB: 12.7 },
  { videoId: '7259003214487120155', savedAt: '2026-11-02T19:58:00Z', sizeMB: 9.3 },
]

const CAPTION_BITS = [
  'Testing whether this trick actually works (it half works)',
  'Day 112 of learning the cello, neighbours still speaking to me',
  'Small studio, big lamp: rewiring a 1960s pendant',
  'The rain finally came and the whole street went outside',
  'Answering your questions about the overnight ferry',
]

function hash(str: string) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619)
  return h >>> 0
}

export type LinkParseResult = { ok: true; username: string | null; videoId: string | null; link: string } | { ok: false; reason: string }

export function parseTikTokLink(raw: string): LinkParseResult {
  const value = raw.trim()
  if (!value) return { ok: false, reason: 'Paste a TikTok link first.' }
  let url: URL
  try {
    url = new URL(value.startsWith('http') ? value : `https://${value}`)
  } catch {
    return { ok: false, reason: 'That doesn’t look like a link.' }
  }
  const host = url.hostname.replace(/^www\.|^m\./, '')
  if (!['tiktok.com', 'vm.tiktok.com', 'vt.tiktok.com'].includes(host)) {
    return { ok: false, reason: 'Only tiktok.com links can be saved.' }
  }
  const m = url.pathname.match(/@([\w.]+)\/(?:video|photo)\/(\d+)/)
  if (m) return { ok: true, username: m[1], videoId: m[2], link: `https://www.tiktok.com/@${m[1]}/video/${m[2]}` }
  if (host !== 'tiktok.com' && url.pathname.length > 2) return { ok: true, username: null, videoId: null, link: url.toString() }
  return { ok: false, reason: 'Use a video link, like tiktok.com/@user/video/123…' }
}

export async function lookupTikTokVideo(link: string): Promise<TikTokVideo> {
  await new Promise((r) => setTimeout(r, 900))
  const parsed = parseTikTokLink(link)
  if (!parsed.ok) throw new Error(parsed.reason)
  const known = KNOWN_VIDEOS.find((v) => v.videoId === parsed.videoId)
  if (known) return known
  const h = hash(parsed.link)
  const username = parsed.username ?? `creator${h % 9000}`
  const videoId = parsed.videoId ?? String(7200000000000000000n + BigInt(h))
  return {
    videoId,
    link: parsed.link,
    caption: CAPTION_BITS[h % CAPTION_BITS.length],
    username,
    authorName: username.replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    publishedAt: new Date(Date.UTC(2026, h % 10, (h % 27) + 1, h % 24, h % 60)).toISOString(),
    duration: 15 + (h % 90),
    hue: h % 360,
    views: 1000 + (h % 900000),
  }
}

export function videoById(id: string) {
  return KNOWN_VIDEOS.find((v) => v.videoId === id)
}
