# Huayca Frontend (Vite + React)

[README en Español](./README.es.md)

Modern React app powered by Vite. Content is fetched from Strapi using a small modular service layer. The homepage shows a reusable Hero and the latest news (Novedades).

## Quick start

1) Copy env template and configure:

```
cp .env.example .env.local
# edit .env.local and set VITE_STRAPI_API_URL, optionally VITE_STRAPI_TOKEN
```

2) Install and run dev server:

```
npm install
npm run dev
```

Open http://localhost:5173

## Project structure

- `src/components/Hero.tsx` — Reusable Hero component. Accepts either `items` or `loadItems` to stay data-source agnostic.
- `src/types/hero.ts` — Shared `HeroItem` type used by the Hero component and service mappers.
- `src/pages/Home.tsx` — Home page wiring: uses `<Hero loadItems={loadHomeHeroItems} />` and renders "Novedades".
- `src/services/strapi/` — Modular Strapi service layer:
	- `client.ts` — Base `strapiFetch()`, common Strapi types (`StrapiListResponse`, `StrapiMedia`), and utilities passthrough (`withBaseURL`, `normalizeUrl`).
	- `hero.ts` — Hero-related fetches and mappers. Exports `loadHomeHeroItems()` that adapts Strapi data to `HeroItem[]`.
	- `novedades.ts` — News (Novedades) fetches.
	- `index.ts` — Barrel export.
- `src/services/strapi.ts` — Backward-compatibility barrel that re-exports `src/services/strapi/*` so existing imports keep working.
- `src/utils/urls.ts` — `withBaseURL()` to compose media URLs; `normalizeUrl()` to ensure external links include protocol.

## Extending the Hero per page

The Hero component takes a `loadItems` prop that returns `Promise<HeroItem[]>`. Each page can provide its own loader that hits a different Strapi endpoint and maps to `HeroItem[]`.

Example pattern:

```ts
// src/services/strapi/hero.ts
export async function loadDocentesHeroItems(): Promise<HeroItem[]> {
	const json = await strapiFetch<StrapiListResponse<any>>('/docentes-hero?populate=*')
	return (json.data || []).map((it) => ({
		id: it.id ?? it.documentId,
		title: it.titulo,
		subtitle: it.subtitulo ?? undefined,
		imageUrl: it.imagen?.url ? withBaseURL(it.imagen.url) : null,
		imageAlt: it.imagen?.alternativeText ?? it.titulo,
		href: it.url ? normalizeUrl(it.url) : null,
		durationMs: it.duration ?? null,
	}))
}
```

Use it in a page:

```tsx
<Hero loadItems={loadDocentesHeroItems} badge="Docentes" />
```

If you expect many pages, consider a tiny factory:

```ts
type Mapper<T> = (raw: T) => HeroItem
export function createHeroLoader<T>(path: string, map: Mapper<T>) {
	return async () => {
		const json = await strapiFetch<StrapiListResponse<T>>(`${path}?populate=*`)
		return (json.data || []).map(map)
	}
}
```

## Environment

Set variables in `.env.local` (see `.env.example`):

- `VITE_STRAPI_API_URL` — Base API URL (must include `/api`, e.g. `https://host/strapi/api`).
- `VITE_STRAPI_TOKEN` — Optional bearer token when content requires auth.
- `VITE_STRAPI_FILES_BASE_URL` — Optional override for composing media URLs. If not set, it’s derived from `VITE_STRAPI_API_URL` by dropping trailing `/api`.

During development, requests to `/strapi-api` are proxied to `VITE_STRAPI_API_URL` and the token is injected (see `vite.config.ts`). In production, the app calls `VITE_STRAPI_API_URL` directly and attaches the token if set.

## CLI helpers

- Inspect arbitrary Strapi endpoints:

```
npm run fetch:portada
node ./scripts/fetch-strapi.mjs '/novedades?populate=*'
```

- Extra example script:

```
npm run fetch:huayca
```

## Development conventions

- Co-locate service logic under `src/services/<domain>/`. Keep the public surface small and typed.
- Map backend shapes to UI-friendly types early (e.g., map Strapi entities to `HeroItem`).
- Keep components data-source agnostic by accepting ready-to-render props or `loadItems` functions.
- Use `@` alias for imports from `src/`.
- Run `npm run build` to typecheck and build; Vite will show errors quickly during `npm run dev`.

## Notes

- Ensure Strapi CORS allows http://localhost:5173.
- For draft/publish content, publish entries or use a token with sufficient permissions.
