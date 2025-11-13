import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Facebook, Instagram, Youtube } from 'lucide-react'
import * as MenuService from '@/services/strapi/menu'
import type { MenuGroup } from '@/services/strapi/menu'

export default function Footer() {
  const [menuGroups, setMenuGroups] = useState<MenuGroup[]>([])

  useEffect(() => {
    let active = true
    MenuService.fetchMenuPpl()
      .then((groups) => {
        if (active) setMenuGroups(groups)
      })
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : 'Unknown error'
        console.error('Error loading menu', msg)
      })
    return () => {
      active = false
    }
  }, [])
  return (
    <footer className="footer">
      <div className="footer-container">
        <nav className="footer-nav">
          {menuGroups.map((group) => (
            <div key={group.titulo} className="footer-group">
              <h3 className="footer-group-title">{group.titulo}</h3>
              {(group.sections || []).map((section) => (
                <div key={section.id} className="footer-section">
                  <h4 className="footer-section-title">{section.titulo}</h4>
                  <ul className="footer-links">
                    {(section.items || []).map((item) => {
                      const isExternal = item.enlace.startsWith('http://') || item.enlace.startsWith('https://')
                      
                      return (
                        <li key={item.id}>
                          {isExternal ? (
                            <a 
                              href={item.enlace} 
                              className="footer-link"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {item.titulo}
                            </a>
                          ) : (
                            <Link 
                              to={item.enlace} 
                              className="footer-link"
                            >
                              {item.titulo}
                            </Link>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </nav>
        <div className="footer-bottom-info">
          <div className="footer-contact">
            <h3 className="footer-contact-title">Contacto</h3>
            <div className="footer-contact-info">
              <p><strong>Centro Regional Universitario Bariloche</strong></p>
              <p>Universidad Nacional del Comahue</p>
              <p>Quintral 1250 - San Carlos de Bariloche</p>
              <p>Río Negro - Argentina (8400)</p>
              <p>Tel: +54 294 442-6727</p>
              <p>Email: crub@uncoma.edu.ar</p>
            </div>
            <div className="footer-social">
              <a href="https://www.facebook.com/UncoBariloche/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Facebook size={24} />
              </a>
              <a href="https://www.instagram.com/uncobariloche/?hl=es" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram size={24} />
              </a>
              <a href="https://www.youtube.com/c/Comunicaci%C3%B3nUNCoBariloche" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <Youtube size={24} />
              </a>
            </div>
          </div>
          <div className="footer-map">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3004.4447892547154!2d-71.31841842346857!3d-41.13413297132598!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x961c7e573e3b1b1d%3A0x9f9f9f9f9f9f9f9f!2sQuintral%201250%2C%20R8400%20San%20Carlos%20de%20Bariloche%2C%20R%C3%ADo%20Negro!5e0!3m2!1ses!2sar!4v1699999999999!5m2!1ses!2sar"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación del CRUB"
            ></iframe>
          </div>
        </div>
        <div className="footer-logo-bottom">
          <img src="/logo-footer.png" alt="CRUB" />
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} CRUB - Centro Regional Universitario Bariloche. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
