/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STRAPI_API_URL?: string
  readonly VITE_STRAPI_TOKEN?: string
  readonly VITE_STRAPI_FILES_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
