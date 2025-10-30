import { Home } from './pages/Home'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { NovedadDetail } from './pages/NovedadDetail'

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/novedades/:slug" element={<NovedadDetail />} />
          <Route path="/novedades/id/:id" element={<NovedadDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
