import { useState } from 'react'
import { Avatar } from '../../components/Brand'
import { IconArrow, IconNote } from '../../components/Icons'
import { Poster } from '../../components/Poster'
import { toast } from '../../components/Toast'
import { actions, fmtCount, fmtDate, savedHash, useStore } from '../../lib'

export function HomeView() {
  const { user, saved } = useStore()
  if (!user) return null
  const t = user.tiktok

  if (!t) {
    return (
      <section className="view rise">
        <p className="kicker">Home</p>
        <h1 className="view-title">Hi, {user.displayName.split(' ')[0]}.</h1>
        <div className="connect-card">
          <span className="consent-ico"><IconNote size={28} /></span>
          <h2>Connect your TikTok account</h2>
          <p className="muted">Your account details appear here once TikTok is connected.</p>
          <ConnectButton />
        </div>
      </section>
    )
  }

  return (
    <section className="view rise">
      <p className="kicker">Home · account details</p>
      <div className="profile">
        <Avatar name={t.name} hue={t.avatarHue} size={104} />
        <div className="profile-text">
          <p className="mono accent">@{t.username}</p>
          <h1 className="view-title">{t.name}</h1>
          <p className="profile-bio">{t.bio}</p>
          <dl className="stats">
            <div><dt>Followers</dt><dd>{fmtCount(t.followers)}</dd></div>
            <div><dt>Following</dt><dd>{fmtCount(t.following)}</dd></div>
            <div><dt>Likes</dt><dd>{fmtCount(t.likes)}</dd></div>
            <div><dt>Saved here</dt><dd>{saved.length}</dd></div>
          </dl>
        </div>
      </div>

      <div className="row-head">
        <h2>Recently saved</h2>
        <a href="#saved" className="textlink">Open library <IconArrow size={14} /></a>
      </div>
      {saved.length ? (
        <div className="recent">
          {saved.slice(0, 4).map((v) => (
            <a key={v.videoId} className="recent-item" href={`#${savedHash(v)}`}>
              <Poster {...v} removed={v.sourceRemoved} compact />
              <p>{v.caption}</p>
              <span className="mono dim">saved {fmtDate(v.savedAt)}</span>
            </a>
          ))}
        </div>
      ) : (
        <div className="empty">
          <p>No saved videos yet.</p>
          <a className="btn btn-ink" href="#link">Save your first link</a>
        </div>
      )}
    </section>
  )
}

export function ConnectButton() {
  const [busy, setBusy] = useState(false)
  return (
    <button
      className="btn btn-tiktok btn-lg"
      disabled={busy}
      onClick={() => {
        setBusy(true)
        setTimeout(() => {
          actions.connectTikTok()
          toast('TikTok connected')
        }, 1000)
      }}
    >
      {busy ? <><span className="spinner" /> Waiting for TikTok…</> : <><IconNote /> Connect to TikTok</>}
    </button>
  )
}
