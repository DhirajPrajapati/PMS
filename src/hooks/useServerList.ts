import { useEffect, useRef, useState } from 'react'

/**
 * Refetches whenever `query` changes (compared by value). Keeps the previous `data` while the
 * next call is in flight (`busy`), and bumps `gen` per answer so rows can re-run their entry animation.
 */
export function useServerList<Q, R>(fetcher: (q: Q) => Promise<R>, query: Q) {
  const [state, setState] = useState<{ data: R | null; error: string | null; busy: boolean; gen: number }>({ data: null, error: null, busy: true, gen: 0 })
  const fetchRef = useRef(fetcher)
  fetchRef.current = fetcher
  const key = JSON.stringify(query)

  useEffect(() => {
    let cancelled = false
    setState((s) => ({ ...s, busy: true }))
    fetchRef.current(JSON.parse(key) as Q)
      .then((data) => { if (!cancelled) setState((s) => ({ data, error: null, busy: false, gen: s.gen + 1 })) })
      .catch((e: Error) => { if (!cancelled) setState((s) => ({ ...s, error: e.message, busy: false })) })
    return () => { cancelled = true }
  }, [key])

  return state
}
