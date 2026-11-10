import { Box } from '@mui/material'
import type { ReactNode } from 'react'

/** Dims its content while a refetch is in flight (but only once there is something to dim). */
export default function BusyRegion({ busy, hasData, role, label, children }: { busy: boolean; hasData: boolean; role?: string; label?: string; children: ReactNode }) {
  return (
    <Box role={role} aria-label={label} aria-busy={busy} sx={{ opacity: busy && hasData ? 0.55 : 1, transition: 'opacity .25s' }}>{children}</Box>
  )
}
