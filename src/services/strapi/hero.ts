import type { StrapiListResponse } from './client'
import { strapiFetch, withBaseURL, normalizeUrl } from './client'
import type { HeroItem } from '@/types/hero'

export async function fetchPortadaPrincipals() {
  const q = '/portada-principals?populate=*'
  const json = await strapiFetch<StrapiListResponse<any>>(q)
  return json.data as any[]
}

// Loader that adapts portada principals into generic hero items
export async function loadHomeHeroItems(): Promise<HeroItem[]> {
  const list = await fetchPortadaPrincipals()
  return (list || []).map((it: any): HeroItem => {
    const candidate =
      it?.imagen?.formats?.large?.url ||
      it?.imagen?.formats?.medium?.url ||
      it?.imagen?.formats?.small?.url ||
      it?.imagen?.url || null
    const imageUrl = candidate ? withBaseURL(candidate) : null
    const href = it?.url && String(it.url).trim() ? normalizeUrl(String(it.url).trim()) : null
    return {
      id: it?.id ?? it?.documentId ?? Math.random().toString(36).slice(2),
      title: it?.titulo ?? `Item #${it?.id ?? ''}`,
      subtitle: it?.subtitulo ?? undefined,
      imageUrl,
      imageAlt: it?.imagen?.alternativeText ?? it?.titulo ?? undefined,
      href,
      durationMs: it?.duration ?? null,
    }
  })
}

// Generic factory to build hero loaders for other pages/endpoints
export function createHeroLoader<T>(path: string, map: (raw: T) => HeroItem) {
  return async (): Promise<HeroItem[]> => {
    const json = await strapiFetch<StrapiListResponse<T>>(`${path}?populate=*`)
    return (json.data || []).map(map)
  }
}
