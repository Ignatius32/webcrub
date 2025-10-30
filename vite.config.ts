import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = (env.VITE_STRAPI_API_URL || env.STRAPI_API_URL || '').replace(/\/$/, '')
  const token = env.VITE_STRAPI_TOKEN || env.STRAPI_TOKEN || ''
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
      },
    },
    server: {
      port: 5173,
      strictPort: true,
      proxy: target
        ? {
            '/strapi-api': {
              target,
              changeOrigin: true,
              secure: true,
              rewrite: (p) => p.replace(/^\/strapi-api/, ''),
              configure: (proxy) => {
                proxy.on('proxyReq', (proxyReq) => {
                  if (token) proxyReq.setHeader('Authorization', `Bearer ${token}`)
                })
              },
            },
          }
        : undefined,
    },
  }
})
