import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { fetchPortadaPrincipals, fetchNovedades, type Novedad } from '@/services/strapi'
import { withBaseURL } from '@/utils/urls'
import { Link } from 'react-router-dom'
import { BookOpen, UsersRound, Briefcase, Award } from 'lucide-react'
import AgendaHome from '@/components/AgendaHome'

export type StrapiImageFormat = {
  url: string
  width?: number
  height?: number
}

export type StrapiImage = {
  url: string
  alternativeText?: string | null
  formats?: {
    thumbnail?: StrapiImageFormat
    small?: StrapiImageFormat
    medium?: StrapiImageFormat
    large?: StrapiImageFormat
  }
}

export type PortadaPrincipal = {
  id: number
  documentId?: string
  titulo?: string | null
  subtitulo?: string | null
  url?: string | null
  duration?: number | null
  createdAt?: string
  updatedAt?: string
  publishedAt?: string
  imagen?: StrapiImage | null
}

export function Home() {
  const location = useLocation() as { state?: { anchor?: string } }
  const [items, setItems] = useState<PortadaPrincipal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [idx, setIdx] = useState(0)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [novedades, setNovedades] = useState<Novedad[]>([])

  useEffect(() => {
    let active = true
    Promise.all([fetchPortadaPrincipals(), fetchNovedades()])
      .then(([list, novs]) => {
        if (!active) return
        setItems(list)
        setNovedades(novs)
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : 'Unknown error'
        setError(msg)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  // If we were navigated with an anchor state, scroll to that element smoothly
  useEffect(() => {
    const anchor = location.state?.anchor
    if (!anchor) return
    const t = setTimeout(() => {
      const el = document.getElementById(anchor)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
    return () => clearTimeout(t)
  }, [location.state])

  // Determine autoplay duration per item
  function getItemDurationMs(it: PortadaPrincipal | undefined): number {
    const DEFAULT_MS = 8000 // 8s fallback
    if (!it) return DEFAULT_MS
    const v = it.duration
    if (v == null || !isFinite(v as number) || Number(v) <= 0) return DEFAULT_MS
    const num = Number(v)
    // If value looks like milliseconds (>= 1000), use as-is; otherwise treat as seconds
    const ms = num >= 1000 ? num : num * 1000
    // Clamp to a reasonable range (1s - 10m)
    return Math.max(1000, Math.min(ms, 10 * 60 * 1000))
  }

  // Autoplay: advance after each item's configured duration
  useEffect(() => {
    if (items.length <= 1) return
    const current = items.length ? items[idx % items.length] : undefined
    const ms = getItemDurationMs(current)
    const t = setTimeout(() => {
      setIdx((i) => (i + 1) % (items.length || 1))
    }, ms)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, items.length])

  if (loading) return <p className="status">Cargando…</p>
  if (error) return <p className="status error">Error: {error}</p>

  if (items.length === 0) {
    return (
      <main className="container">
        <p>No hay elementos</p>
      </main>
    )
  }

  const item = items[idx % items.length]
  const title = item.titulo ?? `Item #${item.id}`
  const desc = item.subtitulo ?? ''
  const candidate =
    item.imagen?.formats?.large?.url ||
    item.imagen?.formats?.medium?.url ||
    item.imagen?.formats?.small?.url ||
    item.imagen?.url || null
  const imgUrl = candidate ? withBaseURL(candidate) : null
  const alt = item.imagen?.alternativeText ?? title
  const href = item.url && item.url.trim() ? normalizeUrl(item.url.trim()) : null

  function go(delta: number) {
    if (!items.length) return
    const next = (idx + delta + items.length) % items.length
    setIdx(next)
  }


  function onTouchStart(e: React.TouchEvent) {
    setTouchStartX(e.touches[0].clientX)
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX == null) return
    const dx = e.changedTouches[0].clientX - touchStartX
    const threshold = 40 // px
    if (Math.abs(dx) > threshold) {
      go(dx < 0 ? 1 : -1)
    }
    setTouchStartX(null)
  }

  function onMouseDown(e: React.MouseEvent) {
    setTouchStartX(e.clientX)
  }
  function onMouseUp(e: React.MouseEvent) {
    if (touchStartX == null) return
    const dx = e.clientX - touchStartX
    const threshold = 40
    if (Math.abs(dx) > threshold) {
      go(dx < 0 ? 1 : -1)
    }
    setTouchStartX(null)
  }

  return (
    <main>
      <section className="hero">
        <div
          className="hero-media"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
        >
          {imgUrl && (
            <img key={imgUrl} className="hero-img fade-img" src={imgUrl} alt={alt} />
          )}
          <span className="badge">Portada principal</span>
          <button type="button" className="nav prev" aria-label="Anterior" onClick={() => go(-1)} hidden={items.length <= 1}>
            ‹
          </button>
          <button type="button" className="nav next" aria-label="Siguiente" onClick={() => go(1)} hidden={items.length <= 1}>
            ›
          </button>
          <div className="hero-overlay" />
          <div key={idx} className="hero-content fade-text">
            {href ? (
              <h1>
                <a href={href} target="_blank" rel="noreferrer noopener">
                  {title}
                </a>
              </h1>
            ) : (
              <h1>{title}</h1>
            )}
            {desc && <p className="subtitle">{desc}</p>}
          </div>
        </div>
      </section>

      <section className="container novedades">
        <h2>Novedades</h2>
        {novedades.length === 0 ? (
          <p>No hay novedades</p>
        ) : (
          <ul className="novedades-grid">
            {novedades.slice(0, 3).map((n) => {
              const img = n.imagenPrincipal?.formats?.thumbnail?.url || n.imagenPrincipal?.url || null
              const imgUrl = img ? withBaseURL(img) : null
              const docId = n.slug || n.documentId || String(n.id)
              return (
                <li key={n.id} className="novedad-card">
                  <Link to={`/novedades/${docId}`} className="novedad-link">
                    {imgUrl && <img src={imgUrl} alt={n.imagenPrincipal?.alternativeText || n.titulo || ''} />}
                    <div className="novedad-body">
                      <span className="chip">{n.categoria?.nombre || 'novedad'}</span>
                      <h3 className="novedad-title">{n.titulo || `Novedad #${n.id}`}</h3>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>
        <section className="container quick-links">
          <ul className="ql-list" aria-label="Accesos rápidos">
            <li>
              <Link to="/estudiantes" className="ql-item ql-estudiantes">
                <span className="ql-icon" aria-hidden>
                  <BookOpen size={36} strokeWidth={2} />
                </span>
                <span className="ql-label">Estudiantes</span>
              </Link>
            </li>
            <li>
              <Link to="/docentes" className="ql-item ql-docentes">
                <span className="ql-icon" aria-hidden>
                  <UsersRound size={36} strokeWidth={2} />
                </span>
                <span className="ql-label">Docentes</span>
              </Link>
            </li>
            <li>
              <Link to="/nodocentes" className="ql-item ql-nodocentes">
                <span className="ql-icon" aria-hidden>
                  <Briefcase size={36} strokeWidth={2} />
                </span>
                <span className="ql-label">Nodocentes</span>
              </Link>
            </li>
            <li>
              <Link to="/personas-graduadas" className="ql-item ql-graduadas">
                <span className="ql-icon" aria-hidden>
                  <Award size={36} strokeWidth={2} />
                </span>
                <span className="ql-label">Personas graduadas</span>
              </Link>
            </li>
          </ul>
        </section>
      <AgendaHome />
    </main>
  )
}

// moved to utils/urls

function normalizeUrl(u: string) {
  if (/^https?:\/\//i.test(u)) return u
  return `https://${u}`
}
