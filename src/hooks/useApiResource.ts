import { useEffect, useState } from 'react'

interface State<T> {
  data: T | null
  loading: boolean
  error: string | null
}

/** Calls a (mock) API once on mount; `loading` is true until it responds. */
export function useApiResource<T>(load: () => Promise<T>) {
  const [state, setState] = useState<State<T>>({ data: null, loading: true, error: null })

  useEffect(() => {
    let cancelled = false
    load()
      .then((data) => !cancelled && setState({ data, loading: false, error: null }))
      .catch((e: Error) => !cancelled && setState({ data: null, loading: false, error: e.message }))
    return () => {
      cancelled = true
    }
    // `load` is a stable module-level call per section
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return state
}
