import { Avatar } from '../../components/Brand'
import { IconLogout } from '../../components/Icons'
import { actions, fmtCount, fmtDate, useStore } from '../../lib'
import { ConnectButton } from './HomeView'

export function SettingsView() {
  const { user, saved } = useStore()
  if (!user) return null
  const t = user.tiktok
  const totalMB = saved.reduce((n, v) => n + v.sizeMB, 0)

  return (
    <section className="view rise">
      <p className="kicker">Settings</p>
      <h1 className="view-title">Account &amp; TikTok</h1>

      <div className="settings-grid">
        <div className="panel">
          <h2>Keepclip account</h2>
          <dl className="facts">
            <div><dt>Name</dt><dd>{user.displayName}</dd></div>
            <div><dt>Email</dt><dd>{user.email ?? <span className="dim">Not set — signed up with TikTok</span>}</dd></div>
            <div><dt>Signs in with</dt><dd>{user.signInMethod === 'tiktok' ? 'TikTok' : 'Email & password'}</dd></div>
            <div><dt>Member since</dt><dd>{fmtDate(user.createdAt)}</dd></div>
            <div><dt>Cloud library</dt><dd>{saved.length} videos · {totalMB.toFixed(1)} MB</dd></div>
          </dl>
        </div>

        <div className="panel">
          <h2>TikTok</h2>
          {t ? (
            <>
              <div className="mini-profile">
                <Avatar name={t.name} hue={t.avatarHue} size={52} />
                <div>
                  <strong>{t.name}</strong>
                  <span className="mono accent">@{t.username}</span>
                </div>
              </div>
              <dl className="facts">
                <div><dt>Description</dt><dd>{t.bio}</dd></div>
                <div><dt>Followers</dt><dd>{fmtCount(t.followers)}</dd></div>
                <div><dt>Videos</dt><dd>{t.videoCount}</dd></div>
                <div><dt>Connected</dt><dd>{fmtDate(t.connectedAt)}</dd></div>
              </dl>
            </>
          ) : (
            <div className="connect-inline">
              <p className="muted">No TikTok account connected.</p>
              <ConnectButton />
            </div>
          )}
        </div>
      </div>

      <div className="panel logout-panel">
        <div>
          <h2>Log out</h2>
          <p className="muted">Your saved videos stay in your cloud library and will be here when you log back in.</p>
        </div>
        <button
          className="btn btn-danger"
          onClick={() => {
            actions.logout()
            location.href = '/start#signin'
          }}
        >
          <IconLogout /> Log out
        </button>
      </div>
    </section>
  )
}
