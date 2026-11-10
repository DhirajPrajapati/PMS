import { Box } from '@mui/material'
import type { ReactNode } from 'react'
import { rem } from '../../utils/format'
import { colors } from '../../theme'
import IconChip from './IconChip'

interface Props {
  /** [icon background, icon colour, top-strip gradient] */
  tint: readonly [string, string, string]
  icon: ReactNode
  label: string
  value: string
  sub: string
  /** Desktop only: drop the caption and shorten the tile */
  compact?: boolean
}

/** KPI tile: accent strip, icon + caps label, big value, caption. */
export default function StatCard({ tint, icon, label, value, sub, compact }: Props) {
  const text = { fontFamily: 'inherit', m: 0 }
  return (
    <Box sx={{ position: 'relative', overflow: 'hidden', boxSizing: 'border-box', height: { xs: rem(115), sm: rem(compact ? 109 : 126) }, px: rem(21), pt: rem(20), borderRadius: rem(16), bgcolor: colors.base.white, backgroundImage: `linear-gradient(135deg,${colors.cream[975]},${colors.base.white} 60%)`, border: `${rem(1)} solid ${colors.border.default}` }}>
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: rem(3), background: tint[2] }} />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: rem(10), height: rem(28) }}>
        <IconChip tint={tint[0]}>{icon}</IconChip>
        <Box sx={{ ...text, fontSize: { xs: rem(11), sm: rem(12.2) }, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: colors.text.mutedWarm }}>{label}</Box>
      </Box>
      <Box sx={{ ...text, mt: { xs: rem(11), sm: rem(15) }, fontSize: rem(18.9), fontWeight: 800, lineHeight: rem(28), color: colors.text.ink }}>{value}</Box>
      <Box sx={{ ...text, mt: rem(3), fontSize: { xs: rem(10.1), sm: rem(12.3) }, color: colors.text.faint, display: { xs: 'block', sm: compact ? 'none' : 'block' } }}>{sub}</Box>
    </Box>
  )
}
