# Sitio web del Centro Regional Universitario Bariloche (UNCo)

Proyecto frontend moderno construido con Vite + React, que consume contenido desde Strapi.

## Características
- Portada principal con imagen a pantalla ancha (70vh), título y subtítulo superpuestos, y navegación con flechas/gestos.
- Sección de Novedades: tarjetas (3 en desktop, swipe en mobile) con acceso al detalle.
- Página de detalle de Novedad: imagen principal y contenido con soporte Markdown (GFM) renderizado de forma segura.
- Enrutamiento con `react-router-dom` y URLs amigables usando `slug` en Novedades.
- Helper CLI para inspeccionar endpoints de Strapi.

## Requisitos
- Node.js 18+
- Acceso a la API de Strapi del CRUB (con CORS habilitado para `http://localhost:5173`).

## Configuración
1. Copiar y ajustar variables de entorno:

```
cp .env.example .env.local
# Editar .env.local según el entorno
VITE_STRAPI_API_URL=https://huayca.crub.uncoma.edu.ar/strapi/api
# Opcional si se requiere autenticación:
# VITE_STRAPI_TOKEN=...
# Opcional para componer URLs de archivos:
# VITE_STRAPI_FILES_BASE_URL=https://huayca.crub.uncoma.edu.ar/strapi
```

2. Instalar dependencias y ejecutar en desarrollo:

```
npm install
npm run dev
```

Abrir: http://localhost:5173

## Comandos útiles
- Ejecutar helper para inspección rápida:

```
npm run fetch:portada
node ./scripts/fetch-strapi.mjs '/novedades?populate=*'
```

- Compilar para producción:

```
npm run build
```

## Estructura
- `src/pages/Home.tsx`: Portada y sección Novedades.
- `src/pages/NovedadDetail.tsx`: Detalle de novedad.
- `src/services/strapi.ts`: Cliente y helpers de Strapi.
- `src/utils/urls.ts`: Utilidades para componer URLs de medios.
- `scripts/fetch-strapi.mjs`: Helper CLI para Strapi.

## Licencia
MIT
