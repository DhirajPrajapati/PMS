import { Box } from '@mui/material'
import { ChevronRight } from 'lucide-react'
import { colors } from '../../theme'
import { rem } from '../../utils/format'
import { r, reset } from '../../utils/responsive'

/** "Dashboard > Current page" trail. */
export default function Breadcrumb({ current }: { current: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: rem(9), height: rem(20), ...reset, fontSize: r(12.3, 11.5), color: colors.text.mutedWarm }}>
      <Box component="a" href="#/" sx={{ color: 'inherit', textDecoration: 'none' }}>Dashboard</Box>
      <ChevronRight size={rem(14)} />
      <Box component="span" sx={{ fontWeight: 700, color: colors.text.ink }}>{current}</Box>
    </Box>
  )
}
