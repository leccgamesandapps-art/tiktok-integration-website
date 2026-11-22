import { fmtDuration } from '../lib'

/** Stand-in video frame until real thumbnails/files come from storage. */
export function Poster({ caption, username, hue, duration, removed, compact }: { caption: string; username: string; hue: number; duration: number; removed?: boolean; compact?: boolean }) {
  return (
    <div
      className={`poster ${compact ? 'poster-compact' : ''}`}
      style={{
        background: `radial-gradient(120% 80% at 20% 10%, hsl(${hue} 70% 62% / .95), transparent 60%), radial-gradient(90% 70% at 90% 90%, hsl(${(hue + 50) % 360} 55% 38%), transparent 70%), hsl(${(hue + 20) % 360} 30% 18%)`,
      }}
    >
      <span className="poster-time">{fmtDuration(duration)}</span>
      {removed && <span className="poster-stamp">Removed from TikTok · kept here</span>}
      <div className="poster-text">
        <span className="poster-user">@{username}</span>
        {!compact && <p>{caption}</p>}
      </div>
    </div>
  )
}
