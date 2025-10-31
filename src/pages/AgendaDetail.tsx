import { useEffect, useState } from 'react'
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom'
import { getActividad, type Actividad } from '@/services/agenda'

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function AgendaDetail() {
  const { id } = useParams()
  const location = useLocation() as { state?: { from?: 'home' | 'agenda' } }
  const navigate = useNavigate()
  const [item, setItem] = useState<Actividad | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const parsed = Number(id)
    if (!parsed) {
      setError('ID inválido')
      setLoading(false)
      return
    }
    getActividad(parsed)
      .then(setItem)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Error'))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <main className="container agenda-detail">
      <p>
        {location.state?.from === 'home' ? (
          <Link to="/" state={{ anchor: 'agenda' }}>← Volver al inicio</Link>
        ) : location.state?.from === 'agenda' ? (
          <Link to="/agenda">← Volver a agenda</Link>
        ) : (
          <button onClick={() => navigate(-1)} style={{ all: 'unset', cursor: 'pointer', color: '#a8d1ff' }}>← Volver</button>
        )}
      </p>
      {loading && <p className="status">Cargando…</p>}
      {error && <p className="status error">{error}</p>}
      {item && !loading && !error && (
        <article>
          <h1 className="agenda-title">{item.titulo}</h1>
          <p className="agenda-when"><time dateTime={item.datetime}>{formatDateTime(item.datetime)}</time></p>
          <p className="agenda-where"><strong>Espacio:</strong> {item.espacio}</p>
          <p className="agenda-status"><strong>Estado:</strong> {item.estado.replace('_', ' ')}</p>
        </article>
      )}
    </main>
  )
}
