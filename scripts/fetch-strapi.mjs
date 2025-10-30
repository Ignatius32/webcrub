#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

// Load .env if present (simple parser)
function loadDotEnv(envPath) {
  try {
    const content = fs.readFileSync(envPath, 'utf8')
    for (const line of content.split(/\r?\n/)) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line)
      if (!m) continue
      const key = m[1]
      let val = m[2]
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1)
      if (!(key in process.env)) process.env[key] = val
    }
  } catch {}
}

const root = process.cwd()
loadDotEnv(path.join(root, '.env'))
loadDotEnv(path.join(root, '.env.local'))

const API = process.env.STRAPI_API_URL || process.env.VITE_STRAPI_API_URL
if (!API) {
  console.error('Missing STRAPI_API_URL or VITE_STRAPI_API_URL in env')
  process.exit(1)
}
const TOKEN = process.env.STRAPI_TOKEN || process.env.VITE_STRAPI_TOKEN

const [, , rawPath] = process.argv
const thePath = rawPath || '/portada-principals?populate=*'

const url = `${API.replace(/\/$/, '')}${thePath.startsWith('/') ? '' : '/'}${thePath}`

const headers = {
  'Content-Type': 'application/json',
}
if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`

console.error('GET', url)
const res = await fetch(url, { headers })
if (!res.ok) {
  const text = await res.text().catch(() => '')
  console.error('HTTP', res.status, res.statusText)
  console.error(text)
  process.exit(2)
}
const json = await res.json()
console.log(JSON.stringify(json, null, 2))
