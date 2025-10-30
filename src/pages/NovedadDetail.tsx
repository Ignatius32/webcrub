import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { fetchNovedadById, fetchNovedadBySlug, type Novedad, strapiFetch } from '@/services/strapi'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import { withBaseURL } from '@/utils/urls'

export function NovedadDetail() {
  const { slug, id } = useParams()
  const [item, setItem] = useState<Novedad | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const key = slug || id
    if (!key) return
    setLoading(true)
    const p = slug
      ? fetchNovedadBySlug(slug)
      : strapiFetch<{ data: Novedad }>(`/novedades/${id}?populate=*`).then((res) => res.data)
    p
      .then((data) => setItem(data ?? null))
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'Unknown error')
        setItem(null)
      })
      .finally(() => setLoading(false))
  }, [slug, id])

  if (!slug && !id) return <main className="container"><p>Falta identificador</p></main>
  if (loading) return <main className="container"><p>Cargando…</p></main>
  if (error) return <main className="container"><p>Error: {error}</p></main>
  if (!item) return <main className="container"><p>No encontrado</p></main>

  const title = item.titulo ?? `Novedad #${item.id}`
  const content = item.contenido ?? ''
  const hero = item.imagenPrincipal
  const heroUrl = hero?.url ? withBaseURL(hero.url) : undefined
  const heroAlt = hero?.alternativeText || title

  return (
    <main className="container">
      {heroUrl && (
        <img
          src={heroUrl}
          alt={heroAlt}
          style={{ width: '100%', height: 'auto', maxHeight: '60vh', objectFit: 'cover', borderRadius: 8, marginBottom: '1rem' }}
        />
      )}
      <h1>{title}</h1>
      <article className="post">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSanitize]}>
          {content}
        </ReactMarkdown>
      </article>
    </main>
  )
}
