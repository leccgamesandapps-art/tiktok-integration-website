import { useEffect, useState, useSyncExternalStore } from 'react'
import { DEMO_TIKTOK_PROFILE, SEED_SAVED, videoById, type TikTokProfile, type TikTokVideo } from './fixtures'

/* ---------- hash routing ---------- */
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

/* ---------- formatting ---------- */
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

/** New format: #saved_<videoId>  (was #saved_caption_username) */
export const savedHash = (v: { videoId: string }) => `saved_${v.videoId}`

/**
 * Prefer opening the TikTok app when possible.
 * Falls back to the normal web link.
 */
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
      const videoId = match[1]
      const deep = `snssdk1233://aweme/detail/${videoId}`
      const a = document.createElement('a')
      a.href = deep
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      setTimeout(() => {
        window.open(link, '_blank', 'noopener,noreferrer')
      }, 900)
      return
    }
  } catch {
    // ignore
  }
  window.open(link, '_blank', 'noopener,noreferrer')
}

/* ---------- stub session + library ---------- */
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

const KEY = 'keepclip.preview.v1'
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

const seedLibrary = (): SavedVideo[] =>
  SEED_SAVED.map((s) => ({ ...videoById(s.videoId)!, savedAt: s.savedAt, sourceRemoved: !!s.sourceRemoved, sizeMB: s.sizeMB }))

const connectedProfile = (): TikTokProfile => ({ ...DEMO_TIKTOK_PROFILE, connectedAt: new Date().toISOString() })

export const actions = {
  signUpEmail(name: string, email: string) {
    set({
      user: { id: crypto.randomUUID(), email, displayName: name, createdAt: new Date().toISOString(), signInMethod: 'email', tiktok: null },
      saved: seedLibrary(),
    })
  },
  signInEmail(email: string) {
    if (state.user?.email === email) return set({ user: state.user })
    set({
      user: { id: crypto.randomUUID(), email, displayName: email.split('@')[0], createdAt: '2026-07-19T10:00:00Z', signInMethod: 'email', tiktok: null },
      saved: seedLibrary(),
    })
  },
  continueWithTikTok() {
    const p = connectedProfile()
    set({
      user: { id: crypto.randomUUID(), email: null, displayName: p.name, createdAt: new Date().toISOString(), signInMethod: 'tiktok', tiktok: p },
      saved: state.saved.length ? state.saved : seedLibrary(),
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
    set({ saved: [{ ...v, savedAt: new Date().toISOString(), sourceRemoved: false, sizeMB: +(v.duration * 0.21).toFixed(1) }, ...state.saved] })
  },
  remove(videoId: string) {
    set({ saved: state.saved.filter((s) => s.videoId !== videoId) })
  },
}

export function downloadVideo(v: SavedVideo) {
  const body = JSON.stringify(
    { caption: v.caption, username: `@${v.username}`, published: v.publishedAt, savedOnKeepclip: v.savedAt, link: v.link },
    null,
    2,
  )
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([body], { type: 'application/json' }))
  a.download = `${slug(v.caption)}_${v.username}.json`
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
