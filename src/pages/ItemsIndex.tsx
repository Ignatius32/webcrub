import React from 'react'
import { Link } from 'react-router-dom'
import { fetchItems } from '@/services/strapi/items'
import type { Item } from '@/types/items'

export default function ItemsIndex({ title, endpoint }: { title: string; endpoint: string }) {
  const [items, setItems] = React.useState<Item[] | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let alive = true
    setItems(null)
    setError(null)
    fetchItems(endpoint)
      .then((data) => {
        if (!alive) return
        const sorted = [...data].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
        setItems(sorted)
      })
      .catch((e) => {
        if (!alive) return
        setError(e?.message || 'Error cargando items')
      })
    return () => {
      alive = false
    }
  }, [endpoint])

  return (
    <main className="container">
      <h1>{title}</h1>
      {error && <p className="error">{error}</p>}
      {!items && !error && <p>Cargando...</p>}
      {items && items.length === 0 && <p>No hay elementos.</p>}
      {items && items.length > 0 && (
        <ul className="items-grid">
          {items.map((it) => {
            const href = it.url && typeof it.url === 'string' && it.url.trim() ? it.url : null
            const isExternal = href ? /^https?:\/\//i.test(href) : false
            return (
              <li key={it.id} className={`item item--${it.estilo || 'plain'}`}>
                {href ? (
                  isExternal ? (
                    <a href={href} target="_blank" rel="noreferrer noopener">
                      <h2 className="item__title">{it.title}</h2>
                      {it.subtitle && <p className="item__subtitle">{it.subtitle}</p>}
                    </a>
                  ) : (
                    <Link to={href}>
                      <h2 className="item__title">{it.title}</h2>
                      {it.subtitle && <p className="item__subtitle">{it.subtitle}</p>}
                    </Link>
                  )
                ) : (
                  <Link to={`/pagina/${it.slug}`}>
                    <h2 className="item__title">{it.title}</h2>
                    {it.subtitle && <p className="item__subtitle">{it.subtitle}</p>}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
