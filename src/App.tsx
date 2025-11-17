import { Home } from './pages/Home'
import React from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { NovedadDetail } from './pages/NovedadDetail'
import Estudiantes from './pages/Estudiantes'
import Docentes from './pages/Docentes'
import NoDocentes from './pages/NoDocentes'
import PersonasGraduadas from './pages/PersonasGraduadas'
import AgendaList from './pages/AgendaList'
import AgendaDetail from './pages/AgendaDetail'
import Header from './components/Header'
import Footer from './components/Footer'
import FloatingMenuButton from './components/FloatingMenuButton'
import { HeaderModeProvider, useHeaderMode } from './components/headerMode'
import { MenuProvider } from './components/menuContext'
import Pagina from './pages/Pagina'
import Seccion from './pages/Seccion'

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <MenuProvider>
        <HeaderModeProvider>
        <div className="app">
          <HeaderModeAuto />
          <Header />
          <FloatingMenuButton />
          <ScrollToHash />
          <ScrollToTopOnRoute />
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/novedades/:slug" element={<NovedadDetail />} />
          <Route path="/novedades/id/:id" element={<NovedadDetail />} />
          <Route path="/agenda" element={<AgendaList />} />
          <Route path="/agenda/:id" element={<AgendaDetail />} />
          <Route path="/estudiantes" element={<Estudiantes />} />
          <Route path="/docentes" element={<Docentes />} />
          <Route path="/nodocentes" element={<NoDocentes />} />
          <Route path="/personas-graduadas" element={<PersonasGraduadas />} />
          <Route path="/pagina/:slug" element={<Pagina />} />
          <Route path="/pagina/:slug/seccion/:sid" element={<Seccion />} />
          </Routes>
          <Footer />
        </div>
      </HeaderModeProvider>
      </MenuProvider>
    </BrowserRouter>
  )
}

function HeaderModeAuto() {
  const { setMode } = useHeaderMode()
  const loc = useLocation()
  React.useEffect(() => {
    const isHome = loc.pathname === '/'
    setMode(isHome ? 'overlay' : 'solid')
  }, [loc.pathname, setMode])
  return null
}

function ScrollToHash() {
  const { hash } = useLocation()
  // Scroll smoothly to elements when navigating to a hash (e.g., /#agenda)
  // Needed because SPA routing prevents the browser's default anchor behavior.
  React.useEffect(() => {
    if (!hash) return
    const id = hash.replace('#', '')
    // Wait a microtask so the target section can mount
    const t = setTimeout(() => {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
    return () => clearTimeout(t)
  }, [hash])
  return null
}

function ScrollToTopOnRoute() {
  const location = useLocation() as { pathname: string; hash?: string; state?: any }
  // On route changes without hash or explicit anchor intent, jump to top
  React.useEffect(() => {
    if (location.hash) return // let hash scrolling handle it
    const st = (location.state as any) || {}
    if (st && (st.anchor || st.preserveScroll)) return // allow pages to handle their own scroll
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname, location.hash])
  return null
}
