import { useEffect, useState, type FormEvent } from 'react'
import { IconArchive, IconBack, IconBookmark, IconCheck, IconExternal } from '../../components/Icons'
import { Poster } from '../../components/Poster'
import { toast } from '../../components/Toast'
import { lookupTikTokVideo, parseTikTokLink, type TikTokVideo } from '../../fixtures'
import { actions, fmtCount, fmtDateTime, go, openTikTok, savedHash, useStore } from '../../lib'

const PENDING_KEY = 'keepclip.pendingLink'
const PREVIEW_KEY = 'keepclip.previewVideo'

const EXAMPLES = [
  'https://www.tiktok.com/@kestrel.field/video/7312200398817460522',
  'https://www.tiktok.com/@theo.restores/video/7301948822150432042',
]

export function LinkView() {
  const [value, setValue] = useState('')
  const [err, setErr] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const p = parseTikTokLink(value)
    if (!p.ok) return setErr(p.reason)
    // Store raw link, use clean hash (no full URL in hash — that breaks routing)
    sessionStorage.setItem(PENDING_KEY, p.link)
    go('link_tiktoklink')
  }

  return (
    <section className="view rise">
      <p className="kicker">Link</p>
      <h1 className="view-title">Paste a TikTok link</h1>
      <p className="muted">In TikTok, tap Share → Copy link, then paste it here. The video will be saved to your Keepclip cloud library.</p>
      <form className={`linkbar ${err ? 'has-error' : ''}`} onSubmit={submit}>
        <input
          autoFocus
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setErr('')
          }}
          placeholder="https://www.tiktok.com/@creator/video/…"
          aria-label="TikTok link"
          inputMode="url"
        />
        <button type="submit" className="btn btn-accent">Enter</button>
      </form>
      {err && <p className="field-error">{err}</p>}
      <div className="examples">
        <span className="mono dim">Try one:</span>
        {EXAMPLES.map((ex) => (
          <button key={ex} type="button" className="chip mono" onClick={() => setValue(ex)}>
            {ex.replace('https://www.tiktok.com/', '')}
          </button>
        ))}
      </div>
    </section>
  )
}

/** dashboard#link_tiktoklink — details after paste */
export function LinkResultView({ link: linkFromHash }: { link: string }) {
  const { saved } = useStore()
  const [video, setVideo] = useState<TikTokVideo | null>(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    let cancelled = false

    // Prefer sessionStorage (stable). Fall back to hash payload if present.
    const fromStore = sessionStorage.getItem(PENDING_KEY)
    let link = fromStore || ''
    if (!link && linkFromHash && linkFromHash !== 'tiktoklink') {
      try {
        link = decodeURIComponent(linkFromHash)
      } catch {
        link = linkFromHash
      }
    }

    if (!link) {
      setErr('No TikTok link found. Paste a link first.')
      return
    }

    setVideo(null)
    setErr('')
    lookupTikTokVideo(link)
      .then((v) => {
        if (cancelled) return
        setVideo(v)
        sessionStorage.setItem(PREVIEW_KEY, JSON.stringify(v))
      })
      .catch((e: Error) => {
        if (!cancelled) setErr(e.message || 'Could not load this TikTok link.')
      })

    return () => {
      cancelled = true
    }
  }, [linkFromHash])

  const isSaved = video ? saved.find((s) => s.videoId === video.videoId) : undefined

  return (
    <section className="view rise">
      <a className="back" href="#link"><IconBack size={16} /> New link</a>
      <p className="kicker">TikTok details</p>

      {err ? (
        <div className="empty">
          <p>{err}</p>
          <a className="btn btn-ink" href="#link">Try another link</a>
        </div>
      ) : !video ? (
        <div className="detail">
          <div className="skel skel-poster" />
          <div className="detail-info">
            <div className="skel skel-line w60" />
            <div className="skel skel-line w90" />
            <div className="skel skel-line w40" />
          </div>
        </div>
      ) : (
        <div className="detail">
          <Poster {...video} />
          <div className="detail-info">
            <dl className="facts">
              <div><dt>Caption</dt><dd className="caption">{video.caption}</dd></div>
              <div><dt>Username</dt><dd>@{video.username} <span className="dim">· {video.authorName}</span></dd></div>
              <div><dt>Published</dt><dd>{fmtDateTime(video.publishedAt)}</dd></div>
              <div><dt>Views</dt><dd>{fmtCount(video.views)}</dd></div>
            </dl>
            <div className="actions">
              {isSaved ? (
                <a className="btn btn-ink" href={`#${savedHash(isSaved)}`}>
                  <IconCheck /> Saved
                </a>
              ) : (
                <button
                  type="button"
                  className="btn btn-accent"
                  onClick={() => {
                    actions.save(video)
                    toast('Saved to your Keepclip cloud')
                    // Stay on page so Saved button appears; user can open detail
                  }}
                >
                  <IconBookmark /> Save
                </button>
              )}
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => openTikTok(video.link)}
              >
                <IconExternal /> View on TikTok
              </button>
            </div>
            {isSaved && (
              <a className="textlink" href="#saved">
                <IconArchive size={14} /> Go to all saved videos
              </a>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
