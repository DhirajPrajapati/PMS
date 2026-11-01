/** Request params accepted by every list endpoint: ?page=1&limit=4 */
export interface PageParams {
  page?: number
  limit?: number
}

/** Paging fields included in every list response's `data` */
export interface PageMeta {
  total: number
  page: number
  limit: number
  total_pages: number
}

/** What a fetch function hands to the UI: mapped rows, the raw envelope, and the paging state. */
export interface Paged<T, R = unknown> {
  items: T[]
  /** The raw { status, message, data } envelope for this page */
  response: R
  page: number
  limit: number
  total: number
  totalPages: number
}

/** Slice a dataset the way a backend would. Out-of-range pages are clamped. */
export function paginate<T>(rows: T[], params: PageParams, defaultLimit: number): { rows: T[]; meta: PageMeta } {
  const limit = Math.max(1, Math.floor(params.limit ?? defaultLimit))
  const total = rows.length
  const total_pages = Math.max(1, Math.ceil(total / limit))
  const page = Math.min(Math.max(1, Math.floor(params.page ?? 1)), total_pages)
  return { rows: rows.slice((page - 1) * limit, page * limit), meta: { total, page, limit, total_pages } }
}

/** "?page=2&limit=4" for display next to the endpoint */
export const query = (page: number, limit: number) => `?page=${page}&limit=${limit}`

/** Page size used when a request doesn't send `limit` */
export const DEFAULT_LIMIT = 10

export const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))
