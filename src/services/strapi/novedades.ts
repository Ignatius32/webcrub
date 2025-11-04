import { strapiFetch } from './client'
import type { StrapiListResponse, StrapiMedia } from './client'

export type Novedad = {
  id: number
  documentId?: string
  slug?: string
  titulo?: string
  contenido?: string
  createdAt?: string
  updatedAt?: string
  publishedAt?: string
  imagenPrincipal?: StrapiMedia
  categoria?: { id: number; documentId?: string; nombre?: string }
}

export async function fetchNovedades() {
  const q = '/novedades?populate=*'
  const json = await strapiFetch<StrapiListResponse<Novedad>>(q)
  return json.data
}

export async function fetchNovedadById(id: number | string) {
  const q = `/novedades/${id}?populate=*`
  const json = await strapiFetch<{ data: Novedad }>(q)
  return json.data
}

export async function fetchNovedadBySlug(slug: string) {
  const q = `/novedades?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=*`
  const json = await strapiFetch<StrapiListResponse<Novedad>>(q)
  return json.data[0]
}
