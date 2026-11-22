import { useState, type FormEvent, type ReactNode } from 'react'
import { Logo } from '../components/Brand'
import { IconArrow, IconBack, IconCheck, IconNote } from '../components/Icons'
import { actions, go, useHash, useStore } from '../lib'

type Mode = 'signup' | 'signin'

export function StartPage() {
  const hash = useHash()
  const { user } = useStore()
  const tiktok = hash.endsWith('_usingTiktok')
  const mode: Mode = hash.startsWith('signin') ? 'signin' : 'signup'

  return (
    <div className="page start">
      <div className="grain" aria-hidden />
      <aside className="start-side">
        <Logo />
        <blockquote>
          “The recipe video I’d watched forty times vanished overnight. My saved copy didn’t.”
          <cite className="mono">— early Keepclip tester, Oct 2026</cite>
        </blockquote>
        <ul className="start-points">
          <li><IconCheck size={16} /> Saved videos live in your cloud library</li>
          <li><IconCheck size={16} /> Caption, creator and dates kept with every clip</li>
          <li><IconCheck size={16} /> Watch and download even after TikTok removes it</li>
        </ul>
      </aside>

      <main className="start-main">
        {user && (
          <div className="notice">
            You’re logged in as <strong>{user.tiktok ? `@${user.tiktok.username}` : user.email}</strong>.
            <a href="/dashboard.html#home">Go to dashboard <IconArrow size={14} /></a>
          </div>
        )}

        {tiktok ? <TikTokConsent mode={mode} /> : <EmailForm key={mode} mode={mode} />}
      </main>
    </div>
  )
}

function EmailForm({ mode }: { mode: Mode }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)
  const up = mode === 'signup'

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (up && name.trim().length < 2) next.name = 'Tell us what to call you.'
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email address.'
    if (pw.length < (up ? 8 : 1)) next.pw = up ? 'Use at least 8 characters.' : 'Enter your password.'
    setErr(next)
    if (Object.keys(next).length) return
    setBusy(true)
    setTimeout(() => {
      up ? actions.signUpEmail(name.trim(), email.trim()) : actions.signInEmail(email.trim())
      location.href = '/dashboard.html#home'
    }, 700)
  }

  return (
    <div className="auth-card rise">
      <div className="tabs" role="tablist">
        <a role="tab" aria-selected={up} className={up ? 'on' : ''} href="#signup">Sign up</a>
        <a role="tab" aria-selected={!up} className={!up ? 'on' : ''} href="#signin">Log in</a>
      </div>
      <h1>{up ? 'Start your archive' : 'Welcome back'}</h1>
      <p className="muted">{up ? 'Create a Keepclip account. You can connect TikTok afterwards.' : 'Log in to open your saved library.'}</p>

      <a className="btn btn-tiktok btn-block" href={up ? '#signup_usingTiktok' : '#signin_usingTiktok'}>
        <IconNote /> {up ? 'Sign up with TikTok' : 'Log in with TikTok'}
      </a>
      <div className="or"><span>or with email</span></div>

      <form onSubmit={submit} noValidate>
        {up && (
          <Field label="Your name" error={err.name}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Priya Castellanos" autoComplete="name" />
          </Field>
        )}
        <Field label="Email" error={err.email}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
        </Field>
        <Field label="Password" error={err.pw}>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder={up ? 'At least 8 characters' : '••••••••'} autoComplete={up ? 'new-password' : 'current-password'} />
        </Field>
        <button className="btn btn-ink btn-block" disabled={busy}>
          {busy ? <span className="spinner" /> : up ? 'Create account' : 'Log in'}
        </button>
      </form>
      <p className="fine center">
        {up ? <>Have an account? <a href="#signin">Log in</a></> : <>New here? <a href="#signup">Create an account</a></>}
      </p>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className={`field ${error ? 'has-error' : ''}`}>
      <span>{label}</span>
      {children}
      {error && <em className="field-error">{error}</em>}
    </label>
  )
}

function TikTokConsent({ mode }: { mode: Mode }) {
  const [busy, setBusy] = useState(false)

  // DEMO until user says "start TikTok Auth".
  const authorize = () => {
    setBusy(true)
    setTimeout(() => {
      actions.continueWithTikTok()
      location.href = '/dashboard.html#home'
    }, 1100)
  }

  return (
    <div className="auth-card consent rise">
      <button className="back" onClick={() => go(mode)}><IconBack size={16} /> Back</button>
      <div className="consent-head">
        <span className="consent-ico"><IconNote size={26} /></span>
        <span className="consent-link" aria-hidden>⇄</span>
        <span className="logo-mark big">K</span>
      </div>
      <h1>{mode === 'signup' ? 'Sign up with TikTok' : 'Log in with TikTok'}</h1>
      <p className="muted">You’ll be sent to TikTok to approve access, then brought straight back to your dashboard.</p>
      <div className="perm">
        <p className="mono">Keepclip will be able to read</p>
        <ul>
          <li><IconCheck size={16} /> Your profile picture, display name and username</li>
          <li><IconCheck size={16} /> Your profile description</li>
          <li><IconCheck size={16} /> Public details of videos you choose to save</li>
        </ul>
        <p className="mono dim">Keepclip never posts, comments or follows on your behalf.</p>
      </div>
      <button className="btn btn-tiktok btn-block" onClick={authorize} disabled={busy}>
        {busy ? <><span className="spinner" /> Waiting for TikTok…</> : <>Continue to TikTok <IconArrow size={16} /></>}
      </button>
      <p className="fine center">
        {mode === 'signup' ? <>Prefer email? <a href="#signup">Sign up with email</a></> : <>Prefer email? <a href="#signin">Log in with email</a></>}
      </p>
    </div>
  )
}
