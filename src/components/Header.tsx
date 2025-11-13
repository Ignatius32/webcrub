import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import * as MenuService from '@/services/strapi/menu'
import type { MenuGroup } from '@/services/strapi/menu'
import { Menu as MenuIcon, X, Undo2, Search } from 'lucide-react'
import { useHeaderMode } from './headerMode'
import { useMenu } from './menuContext'

export default function Header() {
  const { isMenuOpen, setIsMenuOpen } = useMenu()
  const [menuGroups, setMenuGroups] = useState<MenuGroup[]>([])
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchAnim, setSearchAnim] = useState(false)
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
    setIsSearchOpen(false)
  }, [location])

  // When a desktop dropdown is open, add a body class to blur background
  useEffect(() => {
    const hasDesktopDropdown = openDropdown && window.matchMedia('(min-width: 769px)').matches
    if (hasDesktopDropdown) {
      document.body.classList.add('menu-blur')
    } else {
      document.body.classList.remove('menu-blur')
    }
    return () => {
      document.body.classList.remove('menu-blur')
    }
  }, [openDropdown])

  // When desktop search is open, reuse blur effect like dropdown
  useEffect(() => {
    const isDesktop = window.matchMedia('(min-width: 769px)').matches
    if (isDesktop && isSearchOpen) {
      document.body.classList.add('menu-blur')
    } else {
      document.body.classList.remove('menu-blur')
    }
    return () => {
      document.body.classList.remove('menu-blur')
    }
  }, [isSearchOpen])

  // Apply body class to offset content when header is solid (non-home pages)
  useEffect(() => {
    if (mode === 'solid') {
      document.body.classList.add('solid-header-active')
    } else {
      document.body.classList.remove('solid-header-active')
    }
    return () => {
      document.body.classList.remove('solid-header-active')
    }
  }, [mode])

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

  // Close search when clicking outside the search pill
  useEffect(() => {
    if (!isSearchOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (target.closest('.nav-searchbar')) return
      // Close search with animation like the X button
      setSearchAnim(false)
      document.body.classList.remove('menu-blur')
      setTimeout(() => setIsSearchOpen(false), 700)
    }

    document.addEventListener('click', handleClickOutside, true)
    return () => {
      document.removeEventListener('click', handleClickOutside, true)
    }
  }, [isSearchOpen])

  const toggleDropdown = (titulo: string) => {
    // closing search if opening a dropdown
    if (openDropdown !== titulo) setIsSearchOpen(false)
    setOpenDropdown(openDropdown === titulo ? null : titulo)
  }

  return (
    <header className={`header ${mode === 'solid' ? 'solid' : ''} ${!isVisible ? 'hidden' : ''} ${hasScrolled && isVisible ? 'scrolled' : ''}`}>
      <div className="header-container">
        <Link to="/" className="header-logo">
          <img src={mode === 'solid' ? "/logo2.png" : (hasScrolled && isVisible ? "/logo2.png" : "/logo3.png")} alt="CRUB" />
        </Link>

        {/* <button 
          className="menu-toggle" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {isMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
        </button> */}

        {/* Mobile search bar - positioned above menu on mobile */}
        <div className={`mobile-search-container ${isMenuOpen ? 'show' : ''}`}>
          <input
            type="search"
            className="mobile-search-input"
            placeholder="Escribí lo que quieras buscar..."
          />
        </div>

        <nav className={`header-nav ${isMenuOpen ? 'open' : ''} ${isSearchOpen ? 'search-open' : ''}`}>
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
                  <span>{group.titulo}</span>
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
            {/* searchbar renders outside the list; keep list lean */}
          </ul>
        </nav>
        {/* Desktop search trigger aligned to screen right */}
        {!isSearchOpen && (
          <button
            type="button"
            className="header-search-btn"
            aria-label="Buscar"
            onClick={() => {
              setIsSearchOpen(true)
              setOpenDropdown(null)
              // Trigger animation after a small delay to ensure DOM is ready
              requestAnimationFrame(() => {
                setSearchAnim(true)
              })
            }}
          >
            <Search size={24} strokeWidth={3} />
          </button>
        )}
        {isSearchOpen && (
          <div className={`nav-searchbar ${searchAnim ? 'animating' : ''}`}>
            <div className="search-input-wrapper">
              <input
                type="search"
                className="nav-search-input"
                placeholder="Escribí lo que quieras buscar..."
                autoFocus
              />
              <button
                type="button"
                className="nav-search-toggle"
                aria-label="Cerrar búsqueda"
                onClick={() => {
                  setSearchAnim(false)
                  // Remove blur immediately
                  document.body.classList.remove('menu-blur')
                  // Wait for animation to complete before hiding
                  setTimeout(() => setIsSearchOpen(false), 700)
                }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="search-suggestions-content">
              <div>
                <h3 className="search-section-title">Enlaces rápidos</h3>
                <ul className="search-quick-links">
                  <li><Link to="/estudiantes" onClick={() => setIsSearchOpen(false)}>Estudiantes</Link></li>
                  <li><Link to="/docentes" onClick={() => setIsSearchOpen(false)}>Docentes</Link></li>
                  <li><Link to="/nodocentes" onClick={() => setIsSearchOpen(false)}>No Docentes</Link></li>
                  <li><Link to="/personas-graduadas" onClick={() => setIsSearchOpen(false)}>Personas Graduadas</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="search-section-title">Búsquedas más comunes</h3>
                <ul className="search-common-queries">
                  <li><button type="button">Inscripciones</button></li>
                  <li><button type="button">Calendario académico</button></li>
                  <li><button type="button">Mesa de exámenes</button></li>
                  <li><button type="button">Carreras de grado</button></li>
                  <li><button type="button">Becas</button></li>
                  <li><button type="button">Trámites</button></li>
                  <li><button type="button">Contacto</button></li>
                  <li><button type="button">Biblioteca</button></li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
