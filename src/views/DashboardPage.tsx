import { useEffect } from 'react'
import { Logo } from '../components/Brand'
import { IconArchive, IconGear, IconHome, IconLink } from '../components/Icons'
import { useHash, useStore } from '../lib'
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

  useEffect(() => {
    if (!user) location.replace('/start#signin')
  }, [user])
  useEffect(() => window.scrollTo(0, 0), [hash])
  if (!user) return null

  const section = hash.split('_')[0]
  let view
  if (hash.startsWith('link_')) view = <LinkResultView link={hash.slice(5)} />
  else if (hash.startsWith('saved_')) view = <SavedDetailView hash={hash} />
  else if (section === 'link') view = <LinkView />
  else if (section === 'saved') view = <SavedView />
  else if (section === 'settings') view = <SettingsView />
  else view = <HomeView />

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
