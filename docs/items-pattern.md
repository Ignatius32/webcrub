# Generic Items & Secciones pattern

This project supports content-driven pages (Estudiantes, Docentes, etc.) backed by Strapi collections that share the same shape. It provides:

- A reusable list page that fetches items from a given endpoint
- A generic item page `/pagina/:slug`
- A generic section page `/pagina/:slug/seccion/:sid`
- Smart link behavior for both items and sections when a `url` field is present

## Data shape

The collections (e.g., `item-estudiantes`, `item-docentes`) return an array of items. Each item contains:

- id: number
- documentId: string
- title: string
- subtitle: string
- url: string | null
- orden: number
- estilo: string (e.g., `caja`, `plain`)
- contenido: string (optional page intro)
- slug: string
- createdAt, updatedAt, publishedAt: ISO strings
- secciones: Array<Seccion>

Seccion:
- id: number
- title: string
- subtitle?: string
- orden: number
- estilo: string
- url?: string | null
- content: RichText JSON (Slate-like)

See also: `src/types/items.ts` and the capture at `docs/raw/item-estudiantes.json`.

## Routes

- List pages (custom per domain):
  - `/estudiantes` (uses ItemsIndex with `/item-estudiantes?populate=*`)
  - You can add `/docentes`, `/nodocentes`, etc. with their respective endpoints
- Generic item page: `/pagina/:slug`
- Generic section page: `/pagina/:slug/seccion/:sid`

These generic pages resolve data by slug (and section id) across a configurable set of item endpoints.

## Link behavior (url field)

Both items and sections support an optional `url` field that overrides the default navigation.

- If `url` is present and non-empty:
  - Absolute URL (starts with `http://` or `https://`): open via `<a href target="_blank" rel="noreferrer noopener">`
  - Relative URL (does not start with `http`): use React Router `<Link to>` to navigate within the app
- If `url` is missing or empty:
  - Items: link to `/pagina/:slug`
  - Sections: link to `/pagina/:slug/seccion/:sid`

Direct navigation safety:
- Visiting `/pagina/:slug` for an item that has `url` will automatically redirect to its `url` (external or in-app). The page shows a short "Redirigiendo…" state during redirect.
- Visiting `/pagina/:slug/seccion/:sid` for a section that has `url` will also auto-redirect.

Relative URLs tips:
- Start with `/` to make the path relative to the app root (e.g., `/admision`).
- Avoid relative paths like `../foo` from within generic routes; prefer absolute-from-root.

## How to use in future pages (e.g., Docentes)

1) Create a route and page component:
   - In `src/App.tsx` add: `/<your-route>` → renders a page like `Docentes`
2) In `src/pages/Docentes.tsx`:
   - Use the generic list page:
     - `export default () => <ItemsIndex title="Docentes" endpoint="/item-docentes?populate=*" />`
3) No changes required in generic detail pages:
   - `/pagina/:slug` and `/pagina/:slug/seccion/:sid` already resolve data across all configured endpoints.

## Files involved

- Types: `src/types/items.ts`
- Service: `src/services/strapi/items.ts`
  - `fetchItems(path)`
  - `resolveItemBySlug(slug, endpoints)`
- Generic pages:
  - `src/pages/ItemsIndex.tsx`
  - `src/pages/Pagina.tsx`
  - `src/pages/Seccion.tsx`
- Renderer: `src/components/RichTextRenderer.tsx`
- Styles: `src/styles.css` (item/seccion classes, estilo modifiers)

## Visual styling via `estilo`

Both items and secciones support a visual style variant through the `estilo` field. This value is used to add BEM-like modifier classes to the base card containers. Current supported values are:

- `plain` (default/fallback)
- `caja` (prominent boxed style)

How it maps to CSS:

- Items list (`ItemsIndex`):
  - Base class: `item`
  - Modifier: `item--${it.estilo || 'plain'}` → e.g., `item item--caja`
  - See in: `src/pages/ItemsIndex.tsx`
- Secciones grid inside an item page (`Pagina`):
  - Base class: `seccion`
  - Modifier: `seccion--${s.estilo || 'plain'}` → e.g., `seccion seccion--caja`
  - See in: `src/pages/Pagina.tsx`

Styles defined in `src/styles.css`:

- `.item` and `.seccion` define the base card look (border, radius, padding).
- `.item--plain` / `.seccion--plain` provide a neutral background.
- `.item--caja` / `.seccion--caja` provide a more prominent background and can include enhanced spacing, shadow, and hover.

Responsive grids:

- Items use `.items-grid`; secciones use `.secciones-grid`.
- Both grids are responsive with up to 4 columns on wide screens, 2 on medium, and 1 on mobile.

Fallback behavior:

- If `estilo` is missing or unknown, components fall back to `plain` by using the expression `... || 'plain'` in className.

Extending with new estilos:

1) Decide the new `estilo` value, e.g., `destacado`.
2) Update the source content (Strapi) to set `estilo: 'destacado'` where needed.
3) Ensure components pass the value through (already generic). No code change needed unless you want a special layout.
4) Add CSS rules:
   - `.item--destacado { /* custom styles */ }`
   - `.seccion--destacado { /* custom styles */ }`
5) Optionally, tweak hover/focus and grid behavior if the variant needs a different layout.

Direct item/section pages:

- The list and grid tiles reflect `estilo`. The item detail (`/pagina/:slug`) and section detail (`/pagina/:slug/seccion/:sid`) currently render content in a neutral container. If you want detail pages to reflect `estilo`, wrap their main content with the same base classes and modifiers (e.g., `seccion seccion--caja`) and add matching CSS if necessary.

## Extending rich text

`RichTextRenderer` currently supports paragraphs and plain text. You can extend it to handle headings, links, lists, etc., based on the nodes Strapi sends. Keep fallbacks graceful.

## Error and edge cases

- Missing slug or not found → friendly error states already handled.
- Empty `secciones` → shows a message.
- Unknown `estilo` → falls back to `plain` styling.
- Redirect loops are avoided when the target equals the current path.

## Configuration

Default endpoints searched by the resolver (in order):
- `/item-estudiantes?populate=*`
- `/item-docentes?populate=*`
- `/item-nodocentes?populate=*`
- `/item-personas-graduadas?populate=*`

Customize in `src/services/strapi/items.ts` via `DEFAULT_ITEM_ENDPOINTS`.
