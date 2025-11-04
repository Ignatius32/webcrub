import { useEffect, useMemo, useState } from 'react'
import { HeroItem } from '@/types/hero'

type Props = {
  items?: HeroItem[]
  loadItems?: () => Promise<HeroItem[]>
  badge?: string
  className?: string
  startIndex?: number
  autoPlay?: boolean
}

function getDurationMs(it?: HeroItem | null) {
  const DEFAULT_MS = 8000
  if (!it) return DEFAULT_MS
  const v = it.durationMs
  if (v == null) return DEFAULT_MS
  const n = Number(v)
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_MS
  // clamp 1s-10m
  return Math.max(1000, Math.min(n >= 1000 ? n : n * 1000, 10 * 60 * 1000))
}

export default function Hero({ items: itemsProp, loadItems, badge = 'Hero', className = '', startIndex = 0, autoPlay = true }: Props) {
  const [items, setItems] = useState<HeroItem[]>(() => itemsProp ?? [])
  const [idx, setIdx] = useState(startIndex)
  const [loading, setLoading] = useState(!itemsProp && !!loadItems)
  const [error, setError] = useState<string | null>(null)
  const [dragStartX, setDragStartX] = useState<number | null>(null)

  // Load when a loader is provided and no initial items
  useEffect(() => {
    let active = true
    if (!loadItems) return
    setLoading(true)
    loadItems()
      .then((list) => {
        if (!active) return
        setItems(list || [])
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Unknown error'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [loadItems])

  // Keep internal items in sync if itemsProp changes
  useEffect(() => {
    if (itemsProp) setItems(itemsProp)
  }, [itemsProp])

  useEffect(() => {
    if (!autoPlay) return
    if (items.length <= 1) return
    const ms = getDurationMs(items[idx % items.length])
    const t = setTimeout(() => setIdx((i) => (i + 1) % (items.length || 1)), ms)
    return () => clearTimeout(t)
  }, [idx, items, autoPlay])

  const current = useMemo(() => (items.length ? items[idx % items.length] : null), [items, idx])

  function go(delta: number) {
    if (!items.length) return
    setIdx((i) => (i + delta + items.length) % items.length)
  }

  function onTouchStart(e: React.TouchEvent) {
    setDragStartX(e.touches[0].clientX)
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (dragStartX == null) return
    const dx = e.changedTouches[0].clientX - dragStartX
    const threshold = 40
    if (Math.abs(dx) > threshold) go(dx < 0 ? 1 : -1)
    setDragStartX(null)
  }
  function onMouseDown(e: React.MouseEvent) {
    setDragStartX(e.clientX)
  }
  function onMouseUp(e: React.MouseEvent) {
    if (dragStartX == null) return
    const dx = e.clientX - dragStartX
    const threshold = 40
    if (Math.abs(dx) > threshold) go(dx < 0 ? 1 : -1)
    setDragStartX(null)
  }

  if (loading) return <section className={`hero ${className}`}><p className="status">Cargando…</p></section>
  if (error) return <section className={`hero ${className}`}><p className="status error">Error: {error}</p></section>
  if (!current) return null

  return (
    <section className={`hero ${className}`}>
      <div className="hero-media" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} onMouseDown={onMouseDown} onMouseUp={onMouseUp}>
        {current.imageUrl && (
          <img key={current.imageUrl} className="hero-img fade-img" src={current.imageUrl} alt={current.imageAlt || current.title} />
        )}
        {badge && <span className="badge">{badge}</span>}
        <button type="button" className="nav prev" aria-label="Anterior" onClick={() => go(-1)} hidden={items.length <= 1}>
          ‹
        </button>
        <button type="button" className="nav next" aria-label="Siguiente" onClick={() => go(1)} hidden={items.length <= 1}>
          ›
        </button>
        <div className="hero-overlay" />
        <div key={idx} className="hero-content fade-text">
          {current.href ? (
            <h1>
              <a href={current.href} target="_blank" rel="noreferrer noopener">
                {current.title}
              </a>
            </h1>
          ) : (
            <h1>{current.title}</h1>
          )}
          {current.subtitle && <p className="subtitle">{current.subtitle}</p>}
        </div>
      </div>
    </section>
  )
}
