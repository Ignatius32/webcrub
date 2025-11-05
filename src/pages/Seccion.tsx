import React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { resolveItemBySlug } from '@/services/strapi/items'
import RichTextRenderer from '@/components/RichTextRenderer'
import { useHeaderStyle } from '@/components/headerMode'

export default function Seccion() {
  useHeaderStyle('solid')
  const { slug, sid } = useParams()
  const navigate = useNavigate()
  const [state, setState] = React.useState<{ status: 'loading' | 'ready' | 'error'; item?: any; seccion?: any; error?: string }>({ status: 'loading' })

  React.useEffect(() => {
    let alive = true
    if (!slug || !sid) return
    setState({ status: 'loading' })
    resolveItemBySlug(slug)
      .then((item) => {
        if (!alive) return
        if (!item) return setState({ status: 'error', error: 'Página no encontrada' })
        const sec = (item.secciones || []).find((s: any) => String(s.id) === String(sid))
        if (!sec) return setState({ status: 'error', error: 'Sección no encontrada' })
        setState({ status: 'ready', item, seccion: sec })
      })
      .catch((e) => {
        if (!alive) return
        setState({ status: 'error', error: e?.message || 'Error cargando sección' })
      })
    return () => {
      alive = false
    }
  }, [slug, sid])
  // Compute potential redirect target from the loaded section (if any)
  const secHref: string | null = typeof state.seccion?.url === 'string' && state.seccion.url.trim() ? state.seccion.url : null
  React.useEffect(() => {
    if (!secHref) return
    const isExternal = /^https?:\/\//i.test(secHref)
    if (isExternal) {
      window.location.replace(secHref)
    } else {
      navigate(secHref, { replace: true })
    }
  }, [secHref, navigate])
  if (secHref) {
    return (
      <main className="container">
        <p>Redirigiendo…</p>
      </main>
    )
  }

  if (state.status === 'loading') return <main className="container"><p>Cargando...</p></main>
  if (state.status === 'error') return <main className="container"><p className="error">{state.error}</p></main>

  const item = state.item!
  const sec = state.seccion!

  return (
    <main className="container">
      <nav className="breadcrumb">
        <Link to={`/pagina/${item.slug}`}>{item.title}</Link> / <span>{sec.title}</span>
      </nav>
      <h1>{sec.title}</h1>
      {sec.subtitle && <p className="lead">{sec.subtitle}</p>}
      <RichTextRenderer nodes={sec.content || []} />
    </main>
  )
}
