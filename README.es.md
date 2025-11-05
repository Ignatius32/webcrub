# Huayca Frontend (Vite + React)

## Notas
- Asegurá que CORS en Strapi permita http://localhost:5173.
- Para contenido draft/publish, publicá las entradas o usá un token con permisos suficientes.

## Modo de header (overlay vs solid)

El header soporta dos modos visuales que cada página puede activar en tiempo de ejecución:

- overlay (por defecto): el header se superpone sobre el contenido superior.
- solid: el header se muestra con fondo sólido (p. ej., para páginas de detalle).

Cómo funciona:

- La app envuelve las rutas con `HeaderModeProvider` (ver `src/App.tsx`).
- El `Header` lee el modo actual con `useHeaderMode()` y agrega la clase `solid` cuando corresponde.
- Las páginas pueden fijar el modo usando el hook de conveniencia `useHeaderStyle`.

Uso en una página:

```tsx
import { useHeaderStyle } from '@/components/headerMode'

export default function MiPagina() {
	useHeaderStyle('solid')
	// ... contenido de la página
}
```

Opcional: forzar overlay explícitamente

```tsx
import { useHeaderStyle } from '@/components/headerMode'

export default function OtraPagina() {
	useHeaderStyle('overlay')
	// ... contenido de la página
}
```

Notas:

- Al desmontar, `useHeaderStyle` restaura automáticamente `overlay` salvo que otro componente montado establezca un modo distinto.
- Ejemplos existentes: `NovedadDetail`, `Pagina` y `Seccion` usan `solid`.
# Sitio web del Centro Regional Universitario Bariloche (UNCo)

Proyecto frontend moderno construido con Vite + React, que consume contenido desde Strapi mediante una capa de servicios modular.

## Características
- Portada (Hero) reutilizable con imagen, título/subtítulo superpuestos, autoplay y navegación por flechas/gestos.
- Sección de Novedades: tarjetas con imagen y acceso al detalle.
- Detalle de Novedad con contenido Markdown (GFM) renderizado de forma segura.
- Enrutamiento con `react-router-dom` y URLs amigables usando `slug` en Novedades.
- Scripts CLI para inspección rápida de endpoints de Strapi.

## Requisitos
- Node.js 18+
- Acceso a la API de Strapi del CRUB (CORS habilitado para `http://localhost:5173`).

## Configuración
1. Copiar y ajustar variables de entorno:

```
cp .env.example .env.local
# Editar .env.local según el entorno
VITE_STRAPI_API_URL=https://huayca.crub.uncoma.edu.ar/strapi/api
# Opcional si se requiere autenticación:
# VITE_STRAPI_TOKEN=...
# Opcional para componer URLs de archivos (si no se deduce de la API):
# VITE_STRAPI_FILES_BASE_URL=https://huayca.crub.uncoma.edu.ar/strapi
```

2. Instalar dependencias y ejecutar en desarrollo:

```
npm install
npm run dev
```

Abrir: http://localhost:5173

## Estructura del proyecto

- `src/components/Hero.tsx` — Componente Hero reutilizable. Acepta `items` o `loadItems` para permanecer agnóstico de la fuente de datos.
- `src/types/hero.ts` — Tipo compartido `HeroItem` utilizado por componentes y servicios.
- `src/pages/Home.tsx` — Página de inicio; utiliza `<Hero loadItems={loadHomeHeroItems} />` y lista Novedades.
- `src/services/strapi/` — Capa de servicios modular para Strapi:
	- `client.ts` — `strapiFetch()` base, tipos comunes de Strapi (`StrapiListResponse`, `StrapiMedia`) y utilidades (`withBaseURL`, `normalizeUrl`).
	- `hero.ts` — Fetchers y mapeos para Hero. Exporta `loadHomeHeroItems()` que adapta a `HeroItem[]`.
	- `novedades.ts` — Fetchers para Novedades.
	- `index.ts` — Barrel export.
- `src/services/strapi.ts` — Barrel de compatibilidad que re-exporta `src/services/strapi/*` (importaciones existentes siguen funcionando).
- `src/utils/urls.ts` — `withBaseURL()` para componer URLs de medios; `normalizeUrl()` para asegurar protocolo en enlaces externos.
- `scripts/` — Scripts CLI (`fetch-strapi.mjs`, `fetch-huayca.mjs`).

## Extender el Hero por página

El componente Hero recibe la prop `loadItems` que retorna `Promise<HeroItem[]>`. Cada página puede proveer su propio loader apuntando a un endpoint distinto de Strapi y mapeando a `HeroItem[]`.

Ejemplo:

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

Uso en la página:

```tsx
<Hero loadItems={loadDocentesHeroItems} badge="Docentes" />
```

Si habrá muchos loaders, se puede crear una pequeña fábrica para evitar repetición:

```ts
type Mapper<T> = (raw: T) => HeroItem
export function createHeroLoader<T>(path: string, map: Mapper<T>) {
	return async () => {
		const json = await strapiFetch<StrapiListResponse<T>>(`${path}?populate=*`)
		return (json.data || []).map(map)
	}
}
```

## Variables de entorno

Ver `.env.example`.

- `VITE_STRAPI_API_URL` — URL base de la API (debe incluir `/api`).
- `VITE_STRAPI_TOKEN` — Token opcional para contenido protegido.
- `VITE_STRAPI_FILES_BASE_URL` — Base opcional para armar URLs de archivos (si no se deduce automáticamente).

En desarrollo, `vite.config.ts` proxya `/strapi-api` hacia `VITE_STRAPI_API_URL` e inyecta el token. En producción, la app llama directo a la API y adjunta el token si está configurado.

## Comandos útiles

- Inspección rápida de endpoints:

```
npm run fetch:portada
node ./scripts/fetch-strapi.mjs '/novedades?populate=*'
```

- Ejemplo adicional:

```
npm run fetch:huayca
```

- Compilar para producción:

```
npm run build
```

## Convenciones de desarrollo

- Agrupar servicios por dominio en `src/services/<dominio>/` y exponer una API tipada y pequeña.
- Mapear temprano las formas del backend a tipos amigables para UI (ej. mapear entidades de Strapi a `HeroItem`).
- Mantener componentes agnósticos a la fuente de datos mediante props listas para renderizar o funciones `loadItems`.
- Usar el alias `@` para importar desde `src/`.

## Licencia
MIT
