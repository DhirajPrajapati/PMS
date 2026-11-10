import { useCallback, useState } from 'react'

/** Set of open ids with a toggle, e.g. for expandable rows. */
export function useToggleSet<T = string>() {
  const [open, setOpen] = useState<Set<T>>(() => new Set())
  const toggle = useCallback((id: T) => setOpen((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n }), [])
  return { open, toggle, isOpen: (id: T) => open.has(id) }
}
