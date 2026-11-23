import { useEffect } from 'react'
import { Logo } from '../components/Brand'
import { IconArchive, IconGear, IconHome, IconLink } from '../components/Icons'
import { applyTikTokProfile, useHash, useStore } from '../lib'
import { HomeView } from './dash/HomeView'
import { LinkView, LinkResultView } from './dash/LinkView'
import { SavedView, SavedDetailView } from './dash/SavedView'
import { SettingsView } from './dash/SettingsView'

const NAV = [
  { id: 'home', label: 'Home', icon: <IconHome /> },
  { id: 'link', label: 'Link', icon: <IconLink /> },
  { id: 'saved', label: 'Saved', icon: <IconArchive /> },
  { id: 'settings', label: 'Settings', icon: <IconGear /> },
]

export function DashboardPage() {
  const { user, saved } = useStore()
  const hash = useHash() || 'home'

  // OAuth return: /dashboard#home?tiktok=...
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search)
      const payload = params.get('tiktok')
      if (payload) {
        const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
        applyTikTokProfile(json)
        history.replaceState(null, '', location.pathname + (location.hash || '#home'))
      }
    } catch (e) {
      console.error('Failed to apply TikTok profile', e)
    }
  }, [])

  useEffect(() => {
    if (!user) {
      const t = setTimeout(() => {
        if (!useStore().user) location.replace('/start#signin')
      }, 400)
      return () => clearTimeout(t)
    }
  }, [user])

  useEffect(() => {
    if (!location.hash) location.hash = 'home'
    window.scrollTo(0, 0)
  }, [hash])

  if (!user) return null

  // Routing:
  // #home #link #saved #settings
  // #link_tiktoklink  → preview after paste
  // #saved_<videoId>  → saved video detail
  const section = hash.split('_')[0]
  let view
  if (hash === 'link_tiktoklink' || hash.startsWith('link_')) {
    const rest = hash === 'link_tiktoklink' ? 'tiktoklink' : hash.slice(5)
    view = <LinkResultView link={rest} />
  } else if (hash.startsWith('saved_')) {
    view = <SavedDetailView hash={hash} />
  } else if (section === 'link') {
    view = <LinkView />
  } else if (section === 'saved') {
    view = <SavedView />
  } else if (section === 'settings') {
    view = <SettingsView />
  } else {
    view = <HomeView />
  }

  return (
    <div className="page dash">
      <div className="grain" aria-hidden />
      <aside className="dash-side">
        <Logo href="/" />
        <nav className="dash-nav">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} className={section === n.id ? 'on' : ''}>
              {n.icon}
              <span>{n.label}</span>
              {n.id === 'saved' && saved.length > 0 && <span className="count">{saved.length}</span>}
            </a>
          ))}
        </nav>
        <div className="dash-user mono">
          {user.tiktok ? `@${user.tiktok.username}` : user.email}
        </div>
      </aside>
      <main className="dash-main" key={hash}>
        {view}
      </main>
    </div>
  )
}
