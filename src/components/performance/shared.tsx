import { Box, useMediaQuery } from '@mui/material'
import { IndianRupee, Percent, TrendingUp, Wallet } from 'lucide-react'
import type { ReactNode } from 'react'
import type { KpiCard } from '../../api/performanceSummary'
import { rem } from '../../utils/format'
import { colors } from '../../theme'
import { perfPalette as P } from '../../theme/pms'
import CardCarousel from '../common/CardCarousel'
import { Bone } from '../common/Skeleton'
import StatCard from '../common/StatCard'

export { MOBILE_Q, r, reset } from '../../utils/responsive'
import { MOBILE_Q, r } from '../../utils/responsive'

const KPI_STYLE = [
  { tint: P.statValue, Icon: Wallet },
  { tint: P.statCapital, Icon: IndianRupee },
  { tint: P.statReturn, Icon: TrendingUp },
  { tint: P.statXirr, Icon: Percent },
] as const

function StatSkeleton({ compact }: { compact?: boolean }) {
  return (
    <Box role="status" aria-busy="true" aria-label="Loading" sx={{ boxSizing: 'border-box', height: { xs: rem(115), sm: rem(compact ? 109 : 126) }, px: rem(21), pt: rem(20), borderRadius: rem(16), bgcolor: colors.base.white, border: `${rem(1)} solid ${colors.border.default}` }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: rem(10), height: rem(28) }}>
        <Bone w={28} h={28} r={8} />
        <Bone w={104} h={11} />
      </Box>
      <Bone w={132} h={19} sx={{ mt: { xs: rem(11), sm: rem(15) } }} />
      <Bone w={150} h={11} sx={{ mt: rem(10), display: { xs: 'block', sm: compact ? 'none' : 'block' } }} />
    </Box>
  )
}

/** The four KPI tiles (carousel on mobile); skeleton tiles while `cards` is null. */
export function KpiRow({ cards, styles = [0, 1, 2, 3], compact = false }: { cards: KpiCard[] | null; /** Which of the four tile styles each card uses */ styles?: number[]; compact?: boolean }) {
  const isMobile = useMediaQuery(MOBILE_Q)
  const tiles = cards
    ? cards.map((c, i) => {
        const { tint, Icon } = KPI_STYLE[styles[i] ?? i]
        return <StatCard key={c.label} tint={tint} icon={<Icon size={rem(15)} color={tint[1]} />} label={c.label} value={c.value} sub={c.sub} compact={compact} />
      })
    : styles.map((_, i) => <StatSkeleton key={i} compact={compact} />)
  return isMobile ? (
    <Box sx={{ mx: rem(-17) }}>
      <CardCarousel slideWidth={`calc(100vw - ${rem(71)})`} dotsMargin={13} dotsGap={5}>{tiles}</CardCarousel>
    </Box>
  ) : (
    <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${styles.length}, 1fr)`, gap: rem(15) }}>{tiles}</Box>
  )
}

/** Shared page-body frame + error state for a tab. */
export function TabFrame({ error, children }: { error: string | null; children: ReactNode }) {
  if (error) return <Box sx={{ p: rem(24), color: colors.status.error }}>{error}</Box>
  return <Box sx={{ px: r(21, 17), pt: rem(17), pb: rem(20) }}>{children}</Box>
}

export const DonutSkeleton = ({ size }: { size: number }) => <Bone r="round" sx={{ width: rem(size), height: rem(size), mx: 'auto' }} />
