export function Logo({ href = '/' }: { href?: string }) {
  return (
    <a className="logo" href={href} aria-label="Keepclip home">
      <span className="logo-mark">K</span>
      <span className="logo-word">Keepclip</span>
    </a>
  )
}

export function Avatar({ name, hue, size = 56 }: { name: string; hue: number; size?: number }) {
  const initials = name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, fontSize: size * 0.36, background: `linear-gradient(135deg, hsl(${hue} 62% 58%), hsl(${(hue + 40) % 360} 48% 32%))` }}
      aria-hidden
    >
      {initials}
    </span>
  )
}
