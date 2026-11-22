import { Logo } from '../components/Brand'
import { IconArrow, IconNote, IconLink, IconArchive, IconDownload, IconLock } from '../components/Icons'
import { Poster } from '../components/Poster'
import { KNOWN_VIDEOS } from '../fixtures'
import { fmtDate, useStore } from '../lib'

const STEPS = [
  {
    n: '01',
    icon: <IconNote size={22} />,
    title: 'Create your account — or just use TikTok',
    body: 'Sign up with email, or skip the form and continue with TikTok. Email accounts can connect TikTok later from the dashboard.',
    where: '/start#signup',
  },
  {
    n: '02',
    icon: <IconLink size={22} />,
    title: 'Paste any TikTok video link',
    body: 'Open Link in your dashboard and drop in a link copied from the TikTok share sheet. We show the caption, the creator and the publish date before you commit.',
    where: '/dashboard#link',
  },
  {
    n: '03',
    icon: <IconArchive size={22} />,
    title: 'Press Save — the video goes to your cloud',
    body: 'The video file and its details are copied into your private Keepclip library. The record notes who published it, when, and the day you saved it.',
    where: '/dashboard#saved',
  },
  {
    n: '04',
    icon: <IconDownload size={22} />,
    title: 'Watch, download, or delete — even if TikTok forgets',
    body: 'If a creator removes the original, your saved copy stays playable here. Download it any time, or delete it permanently (with a last-chance download).',
    where: '/dashboard#saved',
  },
]

export function HomePage() {
  const { user } = useStore()
  const [a, b, c] = KNOWN_VIDEOS
  return (
    <div className="page home">
      <div className="grain" aria-hidden />
      <header className="topbar">
        <Logo />
        <nav className="topnav">
          <a href="#how">How it works</a>
          <a href="#record">What gets saved</a>
          {user ? (
            <a className="btn btn-ink" href="/dashboard#home">Open dashboard <IconArrow size={16} /></a>
          ) : (
            <>
              <a href="/start#signin">Log in</a>
              <a className="btn btn-ink" href="/start#signup">Get started</a>
            </>
          )}
        </nav>
      </header>

      <section className="hero">
        <div className="hero-copy rise">
          <p className="kicker">A private archive for TikTok videos</p>
          <h1>
            Keep the clips <em>you’d hate</em> to lose.
          </h1>
          <p className="lede">
            Keepclip saves TikTok videos into your own cloud library — with the caption, the creator, and the date it was posted. Deleted on TikTok? Still here, still playable, still downloadable.
          </p>
          <div className="hero-ctas">
            <a className="btn btn-accent btn-lg" href="/start#signup_usingTiktok"><IconNote /> Sign up with TikTok</a>
            <a className="btn btn-ghost btn-lg" href="/start#signup">Use email instead</a>
          </div>
          <p className="fine">Already saving? <a href="/start#signin">Log in</a> · <a href="/start#signin_usingTiktok">Log in with TikTok</a></p>
        </div>

        <div className="hero-stack rise d2" aria-hidden>
          <div className="stack-card s1"><Poster {...a} compact /></div>
          <div className="stack-card s2">
            <Poster {...b} removed />
          </div>
          <div className="stack-card s3"><Poster {...c} compact /></div>
          <div className="catalog-tag">
            <span className="mono">No. 0002 · saved {fmtDate('2026-08-04T21:10:00Z')}</span>
            <strong>@{b.username}</strong>
            <span className="mono">posted {fmtDate(b.publishedAt)}</span>
          </div>
        </div>
      </section>

      <section id="how" className="how">
        <div className="section-head">
          <p className="kicker">How it works</p>
          <h2>Four steps, one library that’s yours.</h2>
        </div>
        <ol className="steps">
          {STEPS.map((s, i) => (
            <li key={s.n} className={`step ${i % 2 ? 'step-alt' : ''}`}>
              <span className="step-n">{s.n}</span>
              <div className="step-body">
                <span className="step-icon">{s.icon}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
                <code className="mono step-where">{s.where}</code>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="record" className="record">
        <div className="record-copy">
          <p className="kicker">What gets saved</p>
          <h2>Every clip is filed like a library card.</h2>
          <p>
            We store the video itself plus the facts you’ll want later. Nothing is shared — your library is tied to your account and lives in Keepclip’s cloud storage, not on your phone.
          </p>
          <p className="lock"><IconLock size={16} /> One account, one library. Logging out keeps everything safe for next time.</p>
        </div>
        <dl className="card-spec">
          <div><dt>Video file</dt><dd>Original quality, playable in the browser</dd></div>
          <div><dt>Caption</dt><dd>Exactly as the creator wrote it</dd></div>
          <div><dt>Published by</dt><dd>@username and display name</dd></div>
          <div><dt>Published on</dt><dd>The date it went up on TikTok</dd></div>
          <div><dt>Saved on</dt><dd>The date you saved it here</dd></div>
          <div><dt>Status</dt><dd>Flags when the original has been removed</dd></div>
        </dl>
      </section>

      <section className="closer">
        <h2>Start your archive in under a minute.</h2>
        <div className="hero-ctas">
          <a className="btn btn-accent btn-lg" href="/start#signup_usingTiktok"><IconNote /> Continue with TikTok</a>
          <a className="btn btn-ghost btn-lg" href="/start#signup">Sign up with email</a>
        </div>
      </section>

      <footer className="foot">
        <Logo />
        <span className="mono">Keepclip is an independent service and is not affiliated with TikTok.</span>
      </footer>
    </div>
  )
}
