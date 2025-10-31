import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { listActividades, type Actividad, type Pagination } from '@/services/agenda'

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

export default function AgendaList() {
  const [items, setItems] = useState<Actividad[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [params, setParams] = useSearchParams()

  const page = useMemo(() => {
    const p = Number(params.get('page') || '1')
    return Number.isFinite(p) && p > 0 ? p : 1
  }, [params])

  useEffect(() => {
    setLoading(true)
    setError(null)
    listActividades({ page, pageSize: 6 })
      .then((res) => { setItems(res.items); setPagination(res.pagination) })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Error'))
      .finally(() => setLoading(false))
  }, [page])

  function go(p: number) {
    const search = new URLSearchParams(params)
    search.set('page', String(p))
    setParams(search)
  }

  return (
    <main className="container agenda-page">
      <h1>Agenda</h1>
      {loading && <p className="status">Cargando…</p>}
      {error && <p className="status error">{error}</p>}
      {!loading && !error && (
        items.length === 0 ? (
          <p>No hay actividades</p>
        ) : (
          <>
            <ul className="agenda-list grid">
              {items.map((a) => (
                <li key={a.id} className={`agenda-item estado-${a.estado}`}>
                  <Link to={`/agenda/${a.id}`} state={{ from: 'agenda' }} className="agenda-link">
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

            {pagination && (
              <nav className="pagination" aria-label="Paginación">
                <button disabled={pagination.page <= 1} onClick={() => go(pagination.page - 1)}>Anterior</button>
                <span>
                  Página {pagination.page} de {pagination.pageCount}
                </span>
                <button disabled={pagination.page >= pagination.pageCount} onClick={() => go(pagination.page + 1)}>Siguiente</button>
              </nav>
            )}
          </>
        )
      )}
    </main>
  )
}
