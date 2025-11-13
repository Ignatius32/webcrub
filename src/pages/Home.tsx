import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { loadHomeHeroItems } from '@/services/strapi'
import { Link } from 'react-router-dom'
import { BookOpen, UsersRound, Briefcase, Award } from 'lucide-react'
import AgendaHome from '@/components/AgendaHome'
import NovedadesHome from '@/components/NovedadesHome'
import Hero from '@/components/Hero'

export function Home() {
  const location = useLocation() as { state?: { anchor?: string } }

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
      <Hero loadItems={loadHomeHeroItems} badge="" />

      <section className="quick-links-hero">
        <ul className="ql-list-hero" aria-label="Accesos rápidos">
          <li>
            <Link to="/estudiantes" className="ql-item ql-estudiantes">
              <span className="ql-label">ESTUDIANTES</span>
            </Link>
          </li>
          <li>
            <Link to="/docentes" className="ql-item ql-docentes">
              <span className="ql-label">DOCENTES</span>
            </Link>
          </li>
          <li>
            <Link to="/nodocentes" className="ql-item ql-nodocentes">
              <span className="ql-label">NODOCENTES</span>
            </Link>
          </li>
          <li>
            <Link to="/personas-graduadas" className="ql-item ql-graduadas">
              <span className="ql-label">PERSONAS GRADUADAS</span>
            </Link>
          </li>
        </ul>
      </section>

      <NovedadesHome />

      <section className="gallery-section">
        <div className="gallery-carousel-container">
          <div className="gallery-carousel-wrapper">
            <div className="gallery-carousel">
              <img src="https://picsum.photos/400/300?random=1" alt="Gallery 1" />
              <img src="https://picsum.photos/400/300?random=2" alt="Gallery 2" />
              <img src="https://picsum.photos/400/300?random=3" alt="Gallery 3" />
              <img src="https://picsum.photos/400/300?random=4" alt="Gallery 4" />
              <img src="https://picsum.photos/400/300?random=5" alt="Gallery 5" />
              <img src="https://picsum.photos/400/300?random=1" alt="Gallery 1" />
              <img src="https://picsum.photos/400/300?random=2" alt="Gallery 2" />
              <img src="https://picsum.photos/400/300?random=3" alt="Gallery 3" />
              <img src="https://picsum.photos/400/300?random=4" alt="Gallery 4" />
              <img src="https://picsum.photos/400/300?random=5" alt="Gallery 5" />
              <img src="https://picsum.photos/400/300?random=1" alt="Gallery 1" />
              <img src="https://picsum.photos/400/300?random=2" alt="Gallery 2" />
              <img src="https://picsum.photos/400/300?random=3" alt="Gallery 3" />
              <img src="https://picsum.photos/400/300?random=4" alt="Gallery 4" />
              <img src="https://picsum.photos/400/300?random=5" alt="Gallery 5" />
            </div>
            <div className="gallery-carousel gallery-carousel-reverse">
              <img src="https://picsum.photos/400/300?random=6" alt="Gallery 6" />
              <img src="https://picsum.photos/400/300?random=7" alt="Gallery 7" />
              <img src="https://picsum.photos/400/300?random=8" alt="Gallery 8" />
              <img src="https://picsum.photos/400/300?random=9" alt="Gallery 9" />
              <img src="https://picsum.photos/400/300?random=10" alt="Gallery 10" />
              <img src="https://picsum.photos/400/300?random=6" alt="Gallery 6" />
              <img src="https://picsum.photos/400/300?random=7" alt="Gallery 7" />
              <img src="https://picsum.photos/400/300?random=8" alt="Gallery 8" />
              <img src="https://picsum.photos/400/300?random=9" alt="Gallery 9" />
              <img src="https://picsum.photos/400/300?random=10" alt="Gallery 10" />
              <img src="https://picsum.photos/400/300?random=6" alt="Gallery 6" />
              <img src="https://picsum.photos/400/300?random=7" alt="Gallery 7" />
              <img src="https://picsum.photos/400/300?random=8" alt="Gallery 8" />
              <img src="https://picsum.photos/400/300?random=9" alt="Gallery 9" />
              <img src="https://picsum.photos/400/300?random=10" alt="Gallery 10" />
            </div>
            <div className="gallery-carousel">
              <img src="https://picsum.photos/400/300?random=11" alt="Gallery 11" />
              <img src="https://picsum.photos/400/300?random=12" alt="Gallery 12" />
              <img src="https://picsum.photos/400/300?random=13" alt="Gallery 13" />
              <img src="https://picsum.photos/400/300?random=14" alt="Gallery 14" />
              <img src="https://picsum.photos/400/300?random=15" alt="Gallery 15" />
              <img src="https://picsum.photos/400/300?random=11" alt="Gallery 11" />
              <img src="https://picsum.photos/400/300?random=12" alt="Gallery 12" />
              <img src="https://picsum.photos/400/300?random=13" alt="Gallery 13" />
              <img src="https://picsum.photos/400/300?random=14" alt="Gallery 14" />
              <img src="https://picsum.photos/400/300?random=15" alt="Gallery 15" />
              <img src="https://picsum.photos/400/300?random=11" alt="Gallery 11" />
              <img src="https://picsum.photos/400/300?random=12" alt="Gallery 12" />
              <img src="https://picsum.photos/400/300?random=13" alt="Gallery 13" />
              <img src="https://picsum.photos/400/300?random=14" alt="Gallery 14" />
              <img src="https://picsum.photos/400/300?random=15" alt="Gallery 15" />
            </div>
          </div>
          <div className="gallery-content">
            <h2 className="gallery-title">Oferta Académica</h2>
            <Link to="/carreras" className="gallery-button">Conocé nuestras Carreras</Link>
          </div>
        </div>
      </section>

      <AgendaHome />
    </main>
  )
}

// normalizeUrl moved to utils/urls
