import { useEffect, useState, useSyncExternalStore } from 'react'
import { DEMO_TIKTOK_PROFILE, type TikTokProfile, type TikTokVideo } from './fixtures'

export function useHash() {
  const [hash, setHash] = useState(() => decodeURIComponent(location.hash.slice(1)))
  useEffect(() => {
    const on = () => setHash(decodeURIComponent(location.hash.slice(1)))
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return hash
}
export const go = (hash: string) => {
  location.hash = hash
}

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
export const fmtCount = (n: number) =>
  n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e4 ? `${(n / 1e3).toFixed(1)}K` : n.toLocaleString()
export const fmtDuration = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
export const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .slice(0, 48)
    .replace(/-+$/, '')

export const savedHash = (v: { videoId: string }) => `saved_${v.videoId}`

export function openTikTok(link: string) {
  try {
    const url = new URL(link.startsWith('http') ? link : `https://${link}`)
    const host = url.hostname.replace(/^www\.|^m\./, '')
    if (!['tiktok.com', 'vm.tiktok.com', 'vt.tiktok.com'].includes(host)) {
      window.open(link, '_blank', 'noopener,noreferrer')
      return
    }
    const match = url.pathname.match(/\/video\/(\d+)/)
    if (match) {
      const deep = `snssdk1233://aweme/detail/${match[1]}`
      const a = document.createElement('a')
      a.href = deep
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => window.open(link, '_blank', 'noopener,noreferrer'), 900)
      return
    }
  } catch {
    // ignore
  }
  window.open(link, '_blank', 'noopener,noreferrer')
}

export type User = {
  id: string
  email: string | null
  displayName: string
  createdAt: string
  signInMethod: 'email' | 'tiktok'
  tiktok: TikTokProfile | null
}
export type SavedVideo = TikTokVideo & { savedAt: string; sourceRemoved: boolean; sizeMB: number }
type State = { user: User | null; saved: SavedVideo[] }

const KEY = 'keepclip.cloud.v2'
let state: State = load()
const listeners = new Set<() => void>()

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { user: null, saved: [] }
}
function set(next: Partial<State>) {
  state = { ...state, ...next }
  localStorage.setItem(KEY, JSON.stringify(state))
  listeners.forEach((l) => l())
}
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}
export const useStore = () => useSyncExternalStore(subscribe, () => state)

const connectedProfile = (): TikTokProfile => ({ ...DEMO_TIKTOK_PROFILE, connectedAt: new Date().toISOString() })

function hueFromString(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h % 360
}

export function applyTikTokProfile(raw: {
  openId?: string
  username: string
  name: string
  bio?: string
  avatarUrl?: string
  connectedAt?: string
}) {
  const profile: TikTokProfile = {
    username: raw.username,
    name: raw.name,
    bio: raw.bio || '',
    avatarHue: hueFromString(raw.username || raw.name),
    avatarUrl: raw.avatarUrl,
    followers: 0,
    following: 0,
    likes: 0,
    videoCount: 0,
    connectedAt: raw.connectedAt || new Date().toISOString(),
  }

  if (state.user) {
    set({
      user: {
        ...state.user,
        displayName: profile.name,
        signInMethod: state.user.signInMethod || 'tiktok',
        tiktok: profile,
      },
    })
  } else {
    set({
      user: {
        id: raw.openId || crypto.randomUUID(),
        email: null,
        displayName: profile.name,
        createdAt: new Date().toISOString(),
        signInMethod: 'tiktok',
        tiktok: profile,
      },
      saved: state.saved,
    })
  }
}

export const actions = {
  signUpEmail(name: string, email: string) {
    set({
      user: {
        id: crypto.randomUUID(),
        email,
        displayName: name,
        createdAt: new Date().toISOString(),
        signInMethod: 'email',
        tiktok: null,
      },
      saved: [],
    })
  },
  signInEmail(email: string) {
    if (state.user?.email === email) return set({ user: state.user })
    set({
      user: {
        id: crypto.randomUUID(),
        email,
        displayName: email.split('@')[0],
        createdAt: new Date().toISOString(),
        signInMethod: 'email',
        tiktok: null,
      },
      saved: state.saved,
    })
  },
  continueWithTikTok() {
    const p = connectedProfile()
    set({
      user: {
        id: crypto.randomUUID(),
        email: null,
        displayName: p.name,
        createdAt: new Date().toISOString(),
        signInMethod: 'tiktok',
        tiktok: p,
      },
      saved: state.saved,
    })
  },
  connectTikTok() {
    if (state.user) set({ user: { ...state.user, tiktok: connectedProfile() } })
  },
  logout() {
    set({ user: null })
  },
  save(v: TikTokVideo) {
    if (state.saved.some((s) => s.videoId === v.videoId)) return
    const sizeMB = v.duration ? +(v.duration * 0.25).toFixed(1) : 5
    set({
      saved: [
        {
          ...v,
          savedAt: new Date().toISOString(),
          sourceRemoved: false,
          sizeMB,
        },
        ...state.saved,
      ],
    })
  },
  remove(videoId: string) {
    set({ saved: state.saved.filter((s) => s.videoId !== videoId) })
  },
}

/** Download real MP4 through our proxy (works for saved cloud videos). */
export function downloadVideo(v: SavedVideo) {
  const src = v.downloadUrl || v.playUrl
  if (!src) {
    alert('No video file is stored for this entry yet. Paste the link again and Save.')
    return
  }
  const filename = `${slug(v.caption) || 'tiktok'}_${v.username || 'video'}.mp4`
  const a = document.createElement('a')
  a.href = `/api/tiktok/download?src=${encodeURIComponent(src)}&name=${encodeURIComponent(filename)}`
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
