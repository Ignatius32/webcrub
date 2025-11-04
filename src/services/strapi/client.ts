import { normalizeUrl, withBaseURL } from '@/utils/urls'

export const API_URL = import.meta.env.DEV ? '/strapi-api' : import.meta.env.VITE_STRAPI_API_URL || ''
export const API_TOKEN = import.meta.env.VITE_STRAPI_TOKEN || ''

if (!API_URL) {
  // eslint-disable-next-line no-console
  console.warn('VITE_STRAPI_API_URL is not set. Set it in .env or .env.local')
}

export async function strapiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const base = API_URL.replace(/\/$/, '')
  const url = `${base}${path.startsWith('/') ? '' : '/'}${path}`
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...init.headers,
  }
  // Only send token directly when not using the dev proxy (i.e., in production build)
  if (!import.meta.env.DEV && API_TOKEN) {
    ;(headers as Record<string, string>)['Authorization'] = `Bearer ${API_TOKEN}`
  }

  const res = await fetch(url, {
    ...init,
    headers,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Strapi error ${res.status}: ${text || res.statusText}`)
  }
  return res.json() as Promise<T>
}

export type StrapiListResponse<T> = {
  data: Array<T>
  meta?: unknown
}

export type StrapiMedia = {
  url: string
  alternativeText?: string | null
  formats?: Record<string, { url: string; width?: number; height?: number }>
}

export { withBaseURL, normalizeUrl }
