import React from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { resolveItemBySlug } from '@/services/strapi/items'
import RichTextRenderer from '@/components/RichTextRenderer'
import { useHeaderStyle } from '@/components/headerMode'

export default function Pagina() {
  useHeaderStyle('solid')
  const { slug } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [state, setState] = React.useState<{ status: 'loading' | 'ready' | 'error'; item?: any; error?: string }>({ status: 'loading' })

  React.useEffect(() => {
    let alive = true
    if (!slug) return
    setState({ status: 'loading' })
    resolveItemBySlug(slug)
      .then((item) => {
        if (!alive) return
        if (!item) return setState({ status: 'error', error: 'Página no encontrada' })
        setState({ status: 'ready', item })
      })
      .catch((e) => {
        if (!alive) return
        setState({ status: 'error', error: e?.message || 'Error cargando página' })
      })
    return () => {
      alive = false
    }
  }, [slug])

  // Compute potential redirect target from the loaded item (if any)
  const itemHref: string | null = typeof state.item?.url === 'string' && state.item.url.trim() ? state.item.url : null
  React.useEffect(() => {
    if (!itemHref) return
    const isExternal = /^https?:\/\//i.test(itemHref)
    if (isExternal) {
      window.location.replace(itemHref)
    } else {
      const normalize = (p: string) => (p.length > 1 ? p.replace(/\/+$/, '') : p)
      const current = normalize(location.pathname)
      const target = normalize(itemHref)
      if (current !== target) {
        navigate(itemHref, { replace: true })
      }
    }
  }, [itemHref, navigate, location.pathname])
  if (itemHref) {
    return (
      <main className="container">
        <p>Redirigiendo…</p>
      </main>
    )
  }

  if (state.status === 'loading') return <main className="container"><p>Cargando...</p></main>
  if (state.status === 'error') return <main className="container"><p className="error">{state.error}</p></main>

  const item = state.item!
  const sections = [...(item.secciones || [])].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))

  return (
    <main className="container">
      <h1>{item.title}</h1>
      {item.subtitle && <p className="lead">{item.subtitle}</p>}

      {item.contenido && (
        <section>
          <RichTextRenderer nodes={[{ type: 'paragraph', children: [{ text: item.contenido }] }]} />
        </section>
      )}

      <h2>Secciones</h2>
      {sections.length === 0 && <p>No hay secciones.</p>}
      {sections.length > 0 && (
        <ul className="secciones-grid">
          {sections.map((s: any) => {
            const href = s.url && typeof s.url === 'string' && s.url.trim() ? s.url : null
            const isExternal = href ? /^https?:\/\//i.test(href) : false
            return (
              <li key={s.id} className={`seccion seccion--${s.estilo || 'plain'}`}>
                {href ? (
                  isExternal ? (
                    <a href={href} target="_blank" rel="noreferrer noopener">
                      <h3 className="seccion__title">{s.title}</h3>
                      {s.subtitle && <p className="seccion__subtitle">{s.subtitle}</p>}
                    </a>
                  ) : (
                    <Link to={href}>
                      <h3 className="seccion__title">{s.title}</h3>
                      {s.subtitle && <p className="seccion__subtitle">{s.subtitle}</p>}
                    </Link>
                  )
                ) : (
                  <Link to={`/pagina/${item.slug}/seccion/${s.id}`}>
                    <h3 className="seccion__title">{s.title}</h3>
                    {s.subtitle && <p className="seccion__subtitle">{s.subtitle}</p>}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
