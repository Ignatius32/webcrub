import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import * as MenuService from '@/services/strapi/menu'
import type { MenuGroup } from '@/services/strapi/menu'
import { Menu as MenuIcon, X, Undo2 } from 'lucide-react'
import { useHeaderMode } from './headerMode'
import { useMenu } from './menuContext'

export default function Header() {
  const { isMenuOpen, setIsMenuOpen } = useMenu()
  const [menuGroups, setMenuGroups] = useState<MenuGroup[]>([])
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [hasScrolled, setHasScrolled] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const location = useLocation()
  const { mode } = useHeaderMode()

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

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY < 10) {
        // Always show header at the top
        setIsVisible(true)
        setHasScrolled(false)
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setIsVisible(true)
        setHasScrolled(true)
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down
        setIsVisible(false)
        setHasScrolled(true)
        setOpenDropdown(null) // Close any open dropdown
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
    setOpenDropdown(null)
  }, [location])

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!openDropdown) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.nav-item')) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [openDropdown])

  const toggleDropdown = (titulo: string) => {
    setOpenDropdown(openDropdown === titulo ? null : titulo)
  }

  return (
    <header className={`header ${mode === 'solid' ? 'solid' : ''} ${!isVisible ? 'hidden' : ''} ${hasScrolled && isVisible ? 'scrolled' : ''}`}>
      <div className="header-container">
        <Link to="/" className="header-logo">
          <img src={hasScrolled && isVisible ? "/logo2.png" : "/logo3.png"} alt="CRUB" />
        </Link>

        <button 
          className="menu-toggle" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {isMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
        </button>

        <nav className={`header-nav ${isMenuOpen ? 'open' : ''}`}>
          <ul className="nav-list">
            {menuGroups.map((group) => (
              <li 
                key={group.titulo} 
                className={`nav-item ${openDropdown === group.titulo ? 'expanded' : ''}`}
              >
                <button 
                  className={`nav-link dropdown-trigger ${openDropdown === group.titulo ? 'active' : ''}`}
                  onClick={() => toggleDropdown(group.titulo)}
                >
                  {group.titulo}
                </button>
                <div className={`dropdown ${openDropdown === group.titulo ? 'open' : ''}`}>
                  <div className="dropdown-content">
                    {/* Mobile-only header bar with selected group title and back arrow */}
                    <div className="dropdown-header">
                      <div className="dropdown-title">{group.titulo}</div>
                      <button
                        type="button"
                        className="dropdown-back"
                        aria-label="Volver al menú principal"
                        onClick={() => setOpenDropdown(null)}
                      >
                        <Undo2 size={18} />
                      </button>
                    </div>
                    {(group.sections || []).map((section) => (
                      <div key={section.id} className="dropdown-section">
                        <div className="section-title">{section.titulo}</div>
                        <ul className="section-items">
                          {(section.items || []).map((item) => {
                            const isExternal = item.enlace.startsWith('http://') || item.enlace.startsWith('https://')
                            
                            return (
                              <li key={item.id}>
                                {isExternal ? (
                                  <a 
                                    href={item.enlace} 
                                    className="dropdown-link"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {item.titulo}
                                  </a>
                                ) : (
                                  <Link 
                                    to={item.enlace} 
                                    className="dropdown-link"
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
                </div>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
