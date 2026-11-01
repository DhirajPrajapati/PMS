import { Box } from '@mui/material'
import type { ReactNode } from 'react'

export const EASE = 'cubic-bezier(.4,0,.2,1)'
export const COLLAPSE_MS = 0.4

/** Collapsible region that animates height + fade without measuring. */
export default function Collapse({ open, children }: { open: boolean; children: ReactNode }) {
  return (
    <Box
      aria-hidden={!open}
      sx={{
        display: 'grid',
        gridTemplateRows: open ? '1fr' : '0fr',
        visibility: open ? 'visible' : 'hidden',
        transition: `grid-template-rows ${COLLAPSE_MS}s ${EASE}, visibility 0s linear ${open ? '0s' : `${COLLAPSE_MS}s`}`,
      }}
    >
      <Box sx={{ overflow: 'hidden', minHeight: 0, opacity: open ? 1 : 0, transition: `opacity ${COLLAPSE_MS * 0.75}s ${EASE}` }}>
        {children}
      </Box>
    </Box>
  )
}
