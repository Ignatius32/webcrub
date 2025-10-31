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

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <ScrollToHash />
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
        </Routes>
      </div>
    </BrowserRouter>
  )
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
