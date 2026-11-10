import { Box } from '@mui/material'
import type { ReactNode } from 'react'
import { rem } from '../../utils/format'
import { colors } from '../../theme'
import IconChip from './IconChip'

interface Props {
  icon: ReactNode
  tint: string
  title: string
  subtitle: string
  children: ReactNode
  /** Right-aligned control in the header band */
  action?: ReactNode
  /** Header height in px (default 66 desktop / 61 mobile) */
  headerHeight?: number
  /** Header height on phones (defaults to headerHeight) */
  headerHeightMobile?: number
  /** Fade the header band from this colour instead of cream */
  bandTint?: string
}

/** White card with an icon + title/subtitle header band. */
export default function Panel({ icon, tint, title, subtitle, children, action, headerHeight, headerHeightMobile, bandTint }: Props) {
  return (
    <Box component="section" sx={{ boxSizing: 'border-box', borderRadius: rem(20), bgcolor: colors.base.white, border: `${rem(1)} solid ${colors.border.default}`, overflow: 'hidden', boxShadow: '0 .75rem 1.5rem -.75rem rgba(90,60,40,.08)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: rem(10), sm: rem(12) }, height: headerHeight ? { xs: rem(headerHeightMobile ?? headerHeight), sm: rem(headerHeight) } : { xs: rem(61), sm: rem(66) }, px: { xs: rem(19), sm: rem(21) }, backgroundImage: `linear-gradient(90deg,${bandTint ?? colors.cream[971]},${colors.base.white})`, borderBottom: `${rem(1)} solid ${colors.border.default}` }}>
        <IconChip tint={tint} size={30}>{icon}</IconChip>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box component="h2" sx={{ fontFamily: 'inherit', m: 0, fontSize: { xs: rem(11.9), sm: rem(12.9) }, fontWeight: 700, lineHeight: rem(19), color: colors.text.ink }}>{title}</Box>
          <Box sx={{ fontFamily: 'inherit', m: 0, fontSize: { xs: rem(10.5), sm: rem(12.3) }, lineHeight: rem(17), color: colors.text.mutedWarm, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subtitle}</Box>
        </Box>
        {action}
      </Box>
      {children}
    </Box>
  )
}
