// Mock Agenda service. TODO: Replace with real API integration when backend is ready.
// This module provides types, dummy data, and async-like helpers to fetch activities.

export type ActividadEstado = 'programada' | 'en_curso' | 'suspendida' | 'finalizada'

export type Actividad = {
  id: number
  titulo: string
  datetime: string // ISO string
  espacio: string
  estado: ActividadEstado
}

export type Pagination = {
  page: number
  pageSize: number
  total: number
  pageCount: number
}

export type ListOptions = {
  from?: Date
  to?: Date
  page?: number
  pageSize?: number
}

// --- Dummy dataset ---------------------------------------------------------

const now = new Date()

function addDays(d: Date, days: number) {
  const copy = new Date(d)
  copy.setDate(copy.getDate() + days)
  return copy
}

function atHour(d: Date, hour: number, minute = 0) {
  const copy = new Date(d)
  copy.setHours(hour, minute, 0, 0)
  return copy
}

const D: Actividad[] = [
  { id: 1, titulo: 'Charla de bienvenida', datetime: atHour(addDays(now, 2), 10).toISOString(), espacio: 'Aula Magna', estado: 'programada' },
  { id: 2, titulo: 'Taller de React', datetime: atHour(addDays(now, 5), 14, 30).toISOString(), espacio: 'Lab 2', estado: 'programada' },
  { id: 3, titulo: 'Feria de proyectos', datetime: atHour(addDays(now, 9), 9).toISOString(), espacio: 'Hall central', estado: 'en_curso' },
  { id: 4, titulo: 'Capacitación Docente', datetime: atHour(addDays(now, 12), 16).toISOString(), espacio: 'Sala de reuniones', estado: 'programada' },
  { id: 5, titulo: 'Asamblea Estudiantil', datetime: atHour(addDays(now, 15), 11).toISOString(), espacio: 'Patio', estado: 'suspendida' },
  { id: 6, titulo: 'Jornada de Puertas Abiertas', datetime: atHour(addDays(now, 20), 10).toISOString(), espacio: 'Campus', estado: 'programada' },
  { id: 7, titulo: 'Hackatón', datetime: atHour(addDays(now, 25), 9).toISOString(), espacio: 'Lab 1', estado: 'programada' },
  { id: 8, titulo: 'Seminario de IA', datetime: atHour(addDays(now, 32), 15).toISOString(), espacio: 'Auditorio', estado: 'programada' },
  { id: 9, titulo: 'Encuentro de Graduados', datetime: atHour(addDays(now, -3), 18).toISOString(), espacio: 'Salón principal', estado: 'finalizada' },
  { id: 10, titulo: 'Mesa de Examen', datetime: atHour(addDays(now, 1), 8).toISOString(), espacio: 'Aula 101', estado: 'programada' },
]

// Sorted ascending by datetime for predictable paging
const DATA = [...D].sort((a, b) => a.datetime.localeCompare(b.datetime))

// --- Helpers ---------------------------------------------------------------

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms))
}

export async function listActividades(opts: ListOptions = {}) {
  // Simulate network latency a bit
  await sleep(50)

  const { from, to, page = 1, pageSize = 10 } = opts

  let filtered = DATA
  if (from) {
    const f = from.toISOString()
    filtered = filtered.filter((a) => a.datetime >= f)
  }
  if (to) {
    const t = to.toISOString()
    filtered = filtered.filter((a) => a.datetime <= t)
  }

  const total = filtered.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const clampedPage = Math.min(Math.max(1, page), pageCount)
  const start = (clampedPage - 1) * pageSize
  const end = start + pageSize
  const items = filtered.slice(start, end)

  const pagination: Pagination = { page: clampedPage, pageSize, total, pageCount }
  return { items, pagination }
}

export async function getActividad(id: number) {
  await sleep(30)
  const found = DATA.find((a) => a.id === id)
  if (!found) throw new Error('Actividad no encontrada')
  return found
}
