import { Box } from '@mui/material'
import type { ReactNode } from 'react'
import { rem } from '../../utils/format'

/** Rounded square holding an icon on a tinted background. */
export default function IconChip({ tint, size = 28, children }: { tint: string; size?: number; children: ReactNode }) {
  return <Box sx={{ width: rem(size), height: rem(size), borderRadius: rem(8), flexShrink: 0, display: 'grid', placeItems: 'center', bgcolor: tint }}>{children}</Box>
}
