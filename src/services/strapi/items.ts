import { strapiFetch } from './client'
import type { Item, ItemsResponse } from '@/types/items'

export const DEFAULT_ITEM_ENDPOINTS = [
  '/item-estudiantes?populate=*',
  '/item-docentes?populate=*',
  '/item-nodocentes?populate=*',
  '/item-personas-graduadas?populate=*',
]

export async function fetchItems(path: string): Promise<Item[]> {
  const res = await strapiFetch<ItemsResponse>(path)
  return (res?.data ?? []).map(normalizeItem)
}

export async function resolveItemBySlug(slug: string, endpoints: string[] = DEFAULT_ITEM_ENDPOINTS): Promise<Item | null> {
  for (const ep of endpoints) {
    try {
      const items = await fetchItems(ep)
      const found = items.find((i) => i.slug === slug)
      if (found) return found
    } catch (e) {
      // ignore endpoint errors, try next
      // eslint-disable-next-line no-console
      console.warn('Failed endpoint', ep, e)
    }
  }
  return null
}

function normalizeItem(raw: any): Item {
  // The current API already returns fields at the top level (not attributes wrapper).
  // Keep as-is but ensure presence of required arrays
  const secciones = Array.isArray(raw.secciones) ? raw.secciones : []
  return {
    id: raw.id,
    documentId: raw.documentId,
    title: raw.title ?? '',
    subtitle: raw.subtitle ?? '',
    url: raw.url ?? null,
    orden: Number(raw.orden ?? 0),
    estilo: raw.estilo ?? 'plain',
    contenido: raw.contenido ?? '',
    slug: raw.slug ?? '',
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    publishedAt: raw.publishedAt ?? null,
    secciones: secciones.map((s: any) => ({
      id: s.id,
      title: s.title ?? '',
      subtitle: s.subtitle ?? undefined,
      orden: Number(s.orden ?? 0),
      estilo: s.estilo ?? 'plain',
      url: s.url ?? null,
      content: Array.isArray(s.content) ? s.content : [],
    })),
  }
}
