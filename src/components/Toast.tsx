import { useEffect, useState } from 'react'

type T = { id: number; text: string }
let push: (text: string) => void = () => {}
export const toast = (text: string) => push(text)

export function ToastHost() {
  const [items, setItems] = useState<T[]>([])
  useEffect(() => {
    push = (text) => {
      const id = Date.now() + Math.random()
      setItems((x) => [...x, { id, text }])
      setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 3200)
    }
  }, [])
  return (
    <div className="toasts" role="status" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className="toast">{t.text}</div>
      ))}
    </div>
  )
}
