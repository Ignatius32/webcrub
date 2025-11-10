import { Menu as MenuIcon, X } from 'lucide-react'
import { useMenu } from './menuContext'

export default function FloatingMenuButton() {
  const { isMenuOpen, setIsMenuOpen } = useMenu()

  return (
    <button 
      className="floating-menu-btn" 
      onClick={() => setIsMenuOpen(!isMenuOpen)}
      aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
    >
      {isMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
    </button>
  )
}
