# item-estudiantes endpoint (Huayca / Strapi)

This document captures the current data shape of `GET /item-estudiantes?populate=*` and provides a short reference for development.

## Endpoint

- Base: env `HUAYCA_API_URL` (fallbacks to `https://huayca.crub.uncoma.edu.ar/strapi/api`)
- Path: `/item-estudiantes?populate=*`
- Auth: optional Bearer token via `HUAYCA_TOKEN` (or `STRAPI_TOKEN` / `VITE_STRAPI_TOKEN`)

## Top-level response shape

- data: ItemEstudiantes[]
- meta.pagination: { page, pageSize, pageCount, total }

Example (trimmed):

```json
{
  "data": [
    {
      "id": 2,
      "documentId": "ghikrdl4iz9bqn4iw4n10now",
      "title": "Ingreso",
      "subtitle": "Inscribite para estudiar en el CRUB!",
      "url": null,
      "orden": 0,
      "estilo": "caja",
      "contenido": "Este es el megacontenido...",
      "slug": "ingreso",
      "createdAt": "2025-11-05T14:31:12.701Z",
      "updatedAt": "2025-11-05T14:31:12.701Z",
      "publishedAt": "2025-11-05T14:31:12.742Z",
      "secciones": [
        {
          "id": 3,
          "title": "Ingreso 2026",
          "subtitle": "ingresá al camino de la excelencia",
          "orden": 0,
          "estilo": "caja",
          "content": [
            { "type": "paragraph", "children": [ { "type": "text", "text": "aca sabes todo de como ingresar" } ] }
          ]
        },
        {
          "id": 4,
          "title": "Ingreso +25",
          "subtitle": "siempre hay tiempo para empezar!",
          "orden": 1,
          "estilo": "plain",
          "content": [
            { "type": "paragraph", "children": [ { "type": "text", "text": "si sos +25 ..." } ] }
          ]
        }
      ]
    }
  ],
  "meta": { "pagination": { "page": 1, "pageSize": 25, "pageCount": 1, "total": 1 } }
}
```

Raw capture stored at `docs/raw/item-estudiantes.json`.

## Field reference

ItemEstudiantes (inside `data[]`):
- id: number (Strapi numeric id)
- documentId: string (UID for draft/publish)
- title: string
- subtitle: string
- url: string | null
- orden: number (ordering index)
- estilo: string (e.g., "caja", "plain")
- contenido: string (long text)
- slug: string (URL-friendly identifier)
- createdAt: ISO string
- updatedAt: ISO string
- publishedAt: ISO string | null
- secciones: Seccion[]

Seccion:
- id: number
- title: string
- subtitle?: string
- orden: number
- estilo: string (e.g., "caja", "plain")
- url?: string | null (if present, clicking the section links to this URL)
- content: RichTextNode[] (Strapi JSON RTE; Slate-like)

RichTextNode example:
- type: "paragraph" | ...
- children: Array<{ type?: "text"; text: string } | RichTextNode>

## TypeScript model suggestion

```ts
export type ISODate = string

export interface RichTextTextNode {
  type?: 'text'
  text: string
}

export interface RichTextElementNode {
  type: string // e.g. 'paragraph', 'heading', 'link', etc.
  children: Array<RichTextTextNode | RichTextElementNode>
  // plus optional props like 'url' for links depending on node type
}

export type RichTextNode = RichTextTextNode | RichTextElementNode

export interface Seccion {
  id: number
  title: string
  subtitle?: string
  orden: number
  estilo: string
  content: RichTextNode[]
}

export interface ItemEstudiantes {
  id: number
  documentId: string
  title: string
  subtitle: string
  url: string | null
  orden: number
  estilo: string
  contenido: string
  slug: string
  createdAt: ISODate
  updatedAt: ISODate
  publishedAt: ISODate | null
  secciones: Seccion[]
}

export interface ItemEstudiantesResponse {
  data: ItemEstudiantes[]
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}
```

## UI/usage notes

- Sorting: `secciones` includes an `orden` field; render in ascending order.
- Styling: `estilo` hints at visual treatment (e.g., card vs plain). Support at least 'caja' and 'plain'.
- Rich text: `secciones[].content` is Slate-like JSON. Use your existing rich-text renderer pipeline (or simple paragraph/text fallback) to present content.
- Slug and URL: `slug` can be used to route to detail pages; `url` may be null.
- IDs: Prefer `documentId` for stable references across environments; `id` is the numeric DB id.
- Link behavior:
  - Items: if `item.url` exists → use it (absolute: new tab; relative: in-app Link). Otherwise → `/pagina/:slug`.
  - Secciones: if `seccion.url` exists → use it (absolute: new tab; relative: in-app Link). Otherwise → `/pagina/:slug/seccion/:id`.
  - Direct visits to `/pagina/:slug` or `/pagina/:slug/seccion/:id` will auto-redirect when `url` is set.

Relative URL tips:
- Use a leading `/` to link from the app root (e.g., `/admision`).
- Avoid `../` or relative-to-current-path references in CMS content.

## Open questions / to confirm

- Allowed enum values for `estilo` (both root and secciones).
- Whether `contenido` is redundant vs `secciones[].content` or intended as a page intro.
- Localization requirements (no i18n fields present in this capture).

## Next steps (dev)

- Add TS types above into `src/types/estudiantes.ts` and wire into services.
- Create a service method `getItemEstudiantes()` reusing your Strapi client.
- Build an `Estudiantes` page that lists `secciones` with `orden` sorting and renders `content`.
