import { useEffect, useState } from 'react'
import { listActividades, type Actividad } from '@/services/agenda'
import { Link } from 'react-router-dom'

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

export default function AgendaHome() {
  const [items, setItems] = useState<Actividad[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const from = new Date()
    const to = new Date()
    to.setMonth(to.getMonth() + 1)
    listActividades({ from, to, pageSize: 4 })
      .then((res) => setItems(res.items))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Error'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section id="agenda" className="container agenda-home">
      <div className="section-header">
        <h2>Agenda</h2>
        <Link to="/agenda" className="see-all">Ver todas</Link>
      </div>
      {loading && <p className="status">Cargando…</p>}
      {error && <p className="status error">{error}</p>}
      {!loading && !error && (
        items.length === 0 ? (
          <p>No hay actividades en el próximo mes</p>
        ) : (
          <ul className="agenda-cols">
            {chunkPairs(items).map((pair, colIdx) => (
              <li key={colIdx} className="agenda-col">
                <ul className="agenda-col-list">
                  {pair.map((a) => (
                    <li key={a.id} className={`agenda-item estado-${a.estado}`}>
                      <Link to={`/agenda/${a.id}`} state={{ from: 'home' }} className="agenda-link">
                        <div className="agenda-date">
                          <time dateTime={a.datetime}>{formatDateTime(a.datetime)}</time>
                        </div>
                        <div className="agenda-info">
                          <h3 className="agenda-title">{a.titulo}</h3>
                          <p className="agenda-meta">{a.espacio} • {a.estado.replace('_', ' ')}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )
      )}
    </section>
  )
}

function chunkPairs<T>(arr: T[]): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += 2) {
    out.push(arr.slice(i, i + 2))
  }
  return out
}
