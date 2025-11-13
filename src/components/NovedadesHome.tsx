import { useEffect, useState } from 'react'
import { fetchNovedades, type Novedad } from '@/services/strapi'
import { withBaseURL } from '@/utils/urls'
import { Link } from 'react-router-dom'

export default function NovedadesHome() {
  const [novedades, setNovedades] = useState<Novedad[]>([])

  useEffect(() => {
    let active = true
    fetchNovedades()
      .then((novs) => {
        if (!active) return
        setNovedades(novs)
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : 'Unknown error'
        // eslint-disable-next-line no-console
        console.error('Error loading novedades', msg)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <section className="container novedades">
      <div className="section-header">
        <h2>Novedades</h2>
        <Link to="/novedades" className="see-all">Ver todas</Link>
      </div>
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
  )
}
