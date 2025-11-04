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

const DEFAULT_BASE = 'https://huayca.crub.uncoma.edu.ar/strapi/api'
const API =
  process.env.HUAYCA_API_URL ||
  process.env.STRAPI_API_URL ||
  process.env.VITE_STRAPI_API_URL ||
  DEFAULT_BASE

const TOKEN = process.env.HUAYCA_TOKEN || process.env.STRAPI_TOKEN || process.env.VITE_STRAPI_TOKEN

// Path can be passed as argument to override the default endpoint
const [, , rawPath] = process.argv
const thePath = rawPath || '/Menu-p-investigacion-items?populate=*'

const url = `${API.replace(/\/$/, '')}${thePath.startsWith('/') ? '' : '/'}${thePath}`

const headers = { 'Content-Type': 'application/json' }
if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`

console.error('GET', url)
const res = await fetch(url, { headers })
if (!res.ok) {
  const text = await res.text().catch(() => '')
  console.error('HTTP', res.status, res.statusText)
  if (text) console.error(text)
  process.exit(2)
}
const json = await res.json()
console.log(JSON.stringify(json, null, 2))
