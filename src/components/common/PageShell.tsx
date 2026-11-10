import { Box } from '@mui/material'
import type { ReactNode } from 'react'
import { colors } from '../../theme'
import { rem } from '../../utils/format'

/** Full-height page: `header` stays put, only the body scrolls. Both are centred to the same max width. */
export default function PageShell({ header, children }: { header: ReactNode; children: ReactNode }) {
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: colors.surface.page }}>
      <Box sx={{ width: '100%', maxWidth: rem(1400), mx: 'auto', flexShrink: 0 }}>{header}</Box>
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', backgroundImage: `linear-gradient(180deg,${colors.surface.page},${colors.cream[890]})` }}>
        <Box sx={{ maxWidth: rem(1400), mx: 'auto' }}>{children}</Box>
      </Box>
    </Box>
  )
}
