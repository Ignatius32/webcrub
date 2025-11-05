import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import * as MenuService from '@/services/strapi/menu'
import type { MenuGroup } from '@/services/strapi/menu'
import { Menu as MenuIcon, X, ChevronDown } from 'lucide-react'

export default function Header() {
  const [menuGroups, setMenuGroups] = useState<MenuGroup[]>([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const location = useLocation()

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
    <header className="header">
      <div className="header-container">
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
                  <ChevronDown size={16} />
                </button>
                <div className={`dropdown ${openDropdown === group.titulo ? 'open' : ''}`}>
                  <div className="dropdown-content">
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
