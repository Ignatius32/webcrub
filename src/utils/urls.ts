export function withBaseURL(path: string) {
  if (!path) return path
  if (path.startsWith('http')) return path
  const base = getFilesBase()
  if (!base) return path
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`
}

export function getFilesBase() {
  const override = import.meta.env.VITE_STRAPI_FILES_BASE_URL
  if (override) return override.replace(/\/$/, '')
  const api = import.meta.env.VITE_STRAPI_API_URL
  if (!api) return ''
  try {
    const u = new URL(api)
    // Include the '/strapi' base by dropping only the trailing '/api' from the API path
    // Example: https://host/strapi/api -> https://host/strapi
    let pathname = u.pathname.replace(/\/$/, '')
    if (pathname.endsWith('/api')) {
      pathname = pathname.slice(0, -4) || '/'
    }
    const base = `${u.origin}${pathname}`.replace(/\/$/, '')
    return base
  } catch {
    return ''
  }
}
