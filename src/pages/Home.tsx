import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { fetchNovedades, type Novedad, loadHomeHeroItems } from '@/services/strapi'
import { withBaseURL } from '@/utils/urls'
import { Link } from 'react-router-dom'
import { BookOpen, UsersRound, Briefcase, Award } from 'lucide-react'
import AgendaHome from '@/components/AgendaHome'
import Hero from '@/components/Hero'

export function Home() {
  const location = useLocation() as { state?: { anchor?: string } }
  const [novedades, setNovedades] = useState<Novedad[]>([])

  useEffect(() => {
    let active = true
    Promise.all([fetchNovedades()])
      .then(([novs]) => {
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

  return (
    <main>
      <Hero loadItems={loadHomeHeroItems} badge="Portada principal" />

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

// normalizeUrl moved to utils/urls
