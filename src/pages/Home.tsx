import { useEffect, useState } from 'react'
import { fetchPortadaPrincipals, fetchNovedades, type Novedad } from '@/services/strapi'
import { withBaseURL } from '@/utils/urls'
import { Link } from 'react-router-dom'

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
  createdAt?: string
  updatedAt?: string
  publishedAt?: string
  imagen?: StrapiImage | null
}

export function Home() {
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
    </main>
  )
}

// moved to utils/urls

function normalizeUrl(u: string) {
  if (/^https?:\/\//i.test(u)) return u
  return `https://${u}`
}
