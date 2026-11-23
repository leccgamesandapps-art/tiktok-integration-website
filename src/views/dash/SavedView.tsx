import { useState } from 'react'
import { IconBack, IconDownload, IconExternal, IconPlay, IconTrash } from '../../components/Icons'
import { Modal } from '../../components/Modal'
import { Poster } from '../../components/Poster'
import { toast } from '../../components/Toast'
import {
  actions,
  downloadVideo,
  fmtDate,
  fmtDateTime,
  fmtDuration,
  go,
  openTikTok,
  savedHash,
  useStore,
  type SavedVideo,
} from '../../lib'

type Sort = 'saved' | 'published'

export function SavedView() {
  const { saved } = useStore()
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<Sort>('saved')
  const [toDelete, setToDelete] = useState<SavedVideo | null>(null)

  const list = saved
    .filter((v) => `${v.caption} ${v.username} ${v.authorName}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) =>
      sort === 'saved' ? b.savedAt.localeCompare(a.savedAt) : b.publishedAt.localeCompare(a.publishedAt),
    )
  const totalMB = saved.reduce((n, v) => n + v.sizeMB, 0)

  return (
    <section className="view rise">
      <p className="kicker">Saved · {saved.length} videos · {totalMB.toFixed(1)} MB in your cloud</p>
      <h1 className="view-title">Your cloud library</h1>

      {saved.length > 0 && (
        <div className="toolbar">
          <input
            className="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search caption or @username"
            aria-label="Search saved videos"
          />
          <div className="seg" role="group" aria-label="Sort">
            <button type="button" className={sort === 'saved' ? 'on' : ''} onClick={() => setSort('saved')}>
              Date saved
            </button>
            <button
              type="button"
              className={sort === 'published' ? 'on' : ''}
              onClick={() => setSort('published')}
            >
              Date published
            </button>
          </div>
        </div>
      )}

      {saved.length === 0 ? (
        <div className="empty">
          <p>Nothing in your cloud yet. Paste a TikTok link to start your archive.</p>
          <a className="btn btn-ink" href="#link">
            Add a link
          </a>
        </div>
      ) : list.length === 0 ? (
        <div className="empty">
          <p>No saved videos match “{q}”.</p>
        </div>
      ) : (
        <ul className="lib">
          {list.map((v) => (
            <li key={v.videoId} className="lib-item">
              <a href={`#${savedHash(v)}`} className="lib-poster" aria-label={`Watch ${v.caption}`}>
                <Poster {...v} removed={v.sourceRemoved} compact />
                <span className="lib-play">
                  <IconPlay size={20} />
                </span>
              </a>
              <div className="lib-body">
                <a href={`#${savedHash(v)}`} className="lib-caption">
                  {v.caption}
                </a>
                <dl className="lib-meta">
                  <div>
                    <dt>By</dt>
                    <dd>@{v.username}</dd>
                  </div>
                  <div>
                    <dt>Published</dt>
                    <dd>{fmtDate(v.publishedAt)}</dd>
                  </div>
                  <div>
                    <dt>Saved</dt>
                    <dd>{fmtDate(v.savedAt)}</dd>
                  </div>
                </dl>
                <div className="lib-actions">
                  <a className="btn btn-sm btn-ink" href={`#${savedHash(v)}`}>
                    <IconPlay size={14} /> Watch
                  </a>
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    onClick={() => {
                      downloadVideo(v)
                      toast('Downloading MP4…')
                    }}
                  >
                    <IconDownload size={14} /> Download
                  </button>
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => setToDelete(v)}>
                    <IconTrash size={14} /> Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <DeleteDialog video={toDelete} onClose={() => setToDelete(null)} />
    </section>
  )
}

export function DeleteDialog({
  video,
  onClose,
  onDone,
}: {
  video: SavedVideo | null
  onClose: () => void
  onDone?: () => void
}) {
  const finish = (download: boolean) => {
    if (!video) return
    if (download) downloadVideo(video)
    actions.remove(video.videoId)
    toast(download ? 'Downloaded and permanently deleted' : 'Permanently deleted')
    onClose()
    onDone?.()
  }
  return (
    <Modal open={!!video} onClose={onClose} title="Delete this video?">
      {video && (
        <>
          <p className="muted">
            “{video.caption}” by @{video.username} will be removed from your Keepclip cloud.
            {video.sourceRemoved && (
              <strong className="warn"> The original is no longer on TikTok — this is the only copy.</strong>
            )}
          </p>
          <div className="modal-actions">
            <button type="button" className="btn btn-ink" onClick={() => finish(true)}>
              <IconDownload size={16} /> Download & delete permanently
            </button>
            <button type="button" className="btn btn-danger" onClick={() => finish(false)}>
              <IconTrash size={16} /> Delete permanently
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
          </div>
        </>
      )}
    </Modal>
  )
}

export function SavedDetailView({ hash }: { hash: string }) {
  const { saved } = useStore()
  const video = saved.find((v) => savedHash(v) === hash)
  const [toDelete, setToDelete] = useState<SavedVideo | null>(null)

  if (!video) {
    return (
      <section className="view rise">
        <a className="back" href="#saved">
          <IconBack size={16} /> All saved
        </a>
        <div className="empty">
          <p>This video isn’t in your library anymore.</p>
          <a className="btn btn-ink" href="#saved">
            Back to saved
          </a>
        </div>
      </section>
    )
  }

  return (
    <section className="view rise">
      <a className="back" href="#saved">
        <IconBack size={16} /> All saved
      </a>
      <div className="detail">
        <RealPlayer video={video} />
        <div className="detail-info">
          <p className="kicker">Saved in your cloud</p>
          <h1 className="view-title sm">{video.caption}</h1>
          <dl className="facts">
            <div>
              <dt>Published by</dt>
              <dd>
                @{video.username} <span className="dim">· {video.authorName}</span>
              </dd>
            </div>
            <div>
              <dt>Published on TikTok</dt>
              <dd>{fmtDateTime(video.publishedAt)}</dd>
            </div>
            <div>
              <dt>Saved on Keepclip</dt>
              <dd>{fmtDateTime(video.savedAt)}</dd>
            </div>
            <div>
              <dt>Length · size</dt>
              <dd>
                {fmtDuration(video.duration)} · {video.sizeMB} MB
              </dd>
            </div>
            <div>
              <dt>Original</dt>
              <dd>
                {video.sourceRemoved ? (
                  <span className="badge badge-warn">Removed from TikTok — your copy is safe</span>
                ) : (
                  <span className="badge">Still on TikTok</span>
                )}
              </dd>
            </div>
          </dl>
          <div className="actions">
            <button
              type="button"
              className="btn btn-ink"
              onClick={() => {
                downloadVideo(video)
                toast('Downloading MP4…')
              }}
            >
              <IconDownload /> Download MP4
            </button>
            {!video.sourceRemoved && (
              <button type="button" className="btn btn-ghost" onClick={() => openTikTok(video.link)}>
                <IconExternal /> View on TikTok
              </button>
            )}
            <button type="button" className="btn btn-danger" onClick={() => setToDelete(video)}>
              <IconTrash /> Delete
            </button>
          </div>
          {!video.playUrl && (
            <p className="field-error">
              This entry was saved before real video storage. Paste the TikTok link again and Save to get a playable
              copy.
            </p>
          )}
        </div>
      </div>
      <DeleteDialog video={toDelete} onClose={() => setToDelete(null)} onDone={() => go('saved')} />
    </section>
  )
}

/** Real HTML5 player for saved cloud videos */
function RealPlayer({ video }: { video: SavedVideo }) {
  const src = video.playUrl || video.downloadUrl

  if (!src) {
    return (
      <div className="player">
        <Poster {...video} removed={video.sourceRemoved} />
        <p className="fine center" style={{ padding: 12 }}>
          No playable file stored. Re-save the link from the Link tab.
        </p>
      </div>
    )
  }

  return (
    <div className="player is-playing">
      <video
        key={src}
        controls
        playsInline
        preload="metadata"
        poster={video.coverUrl || undefined}
        style={{ width: '100%', borderRadius: 16, background: '#000', maxHeight: '70vh' }}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support video playback.
      </video>
    </div>
  )
}
