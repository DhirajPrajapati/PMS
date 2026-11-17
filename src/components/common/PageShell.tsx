import { Box } from '@mui/material'
import type { ReactNode } from 'react'
import { colors } from '../../theme'
import { rem } from '../../utils/format'

/** Full-height page (`embedded`: fills its parent, e.g. the AppLayout panel, instead of the viewport): `header` stays put, only the body scrolls. Both are centred to the same max width. */
export default function PageShell({ header, children, embedded = false }: { header: ReactNode; children: ReactNode; embedded?: boolean }) {
  return (
    <Box sx={{ height: embedded ? '100%' : '100vh', display: 'flex', flexDirection: 'column', bgcolor: colors.surface.page }}>
      <Box sx={{ width: '100%', maxWidth: embedded ? 'none' : rem(1400), mx: 'auto', flexShrink: 0 }}>{header}</Box>
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', backgroundImage: `linear-gradient(180deg,${colors.surface.page},${colors.cream[890]})` }}>
        <Box sx={{ maxWidth: embedded ? 'none' : rem(1400), mx: 'auto' }}>{children}</Box>
      </Box>
    </Box>
  )
}
