# Huayca Frontend (Vite + React)

[README en Español](./README.es.md)

Basic React app that fetches Strapi collection `portada-principals` and renders a simple homepage.

## Setup

1. Create a `.env.local` file at the project root with:

```
VITE_STRAPI_API_URL=https://huayca.crub.uncoma.edu.ar/strapi/api
# Optional if your Strapi requires auth for content:
# VITE_STRAPI_TOKEN=...
# If your file URLs from Strapi are relative and not under the API base, set:
# VITE_STRAPI_FILES_BASE_URL=https://huayca.crub.uncoma.edu.ar
```

2. Install and run:

```
npm install
npm run dev
```

Open http://localhost:5173

## Notes
- Ensure Strapi CORS allows http://localhost:5173
- If the collection type uses draft/publish, ensure entries are published or the token has access.
