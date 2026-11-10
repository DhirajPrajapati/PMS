import { useMemo, useState } from 'react'

export type Dir = 'asc' | 'desc'
export interface SortState<K extends string> { key: K; dir: Dir }

/** Next sort after clicking a header: same key flips direction, a new key starts at `firstDir(key)`. */
export function nextSort<K extends string>(s: SortState<K>, key: K, firstDir: (k: K) => Dir = () => 'asc'): SortState<K> {
  return s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: firstDir(key) }
}

/** Compare for sorting; null values always sort last regardless of direction. */
export function compareValues(a: string | number | null, b: string | number | null, dir: Dir): number {
  if (a === null && b === null) return 0
  if (a === null) return 1
  if (b === null) return -1
  return (typeof a === 'string' ? a.localeCompare(b as string) : a - (b as number)) * (dir === 'asc' ? 1 : -1)
}

/** Client-side sorting: state, header handler and the sorted copy of `rows`. */
export function useClientSort<T, K extends string>(rows: T[], value: (row: T, key: K) => string | number | null, initial: SortState<K>) {
  const [sort, setSort] = useState(initial)
  const sorted = useMemo(() => [...rows].sort((a, b) => compareValues(value(a, sort.key), value(b, sort.key), sort.dir)), [rows, sort]) // eslint-disable-line react-hooks/exhaustive-deps
  return { sort, sorted, onSort: (key: K) => setSort((s) => nextSort(s, key)) }
}
