import { Box, ButtonBase, useMediaQuery } from '@mui/material'
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { rem } from '../utils/format'
import CardCarousel from './common/CardCarousel'
import { MyStrategyCard, MyStrategyCardSkeleton, type MyStrategy } from './cards/MyStrategyCard'
import { Bone } from './common/Skeleton'
import StrategyTable from './StrategyTable'
import { colors, shadows } from '../theme'

const MOBILE = '@media (max-width:40rem)'
const CARD_W = 280
const GAP = 13

type View = 'grid' | 'list'

interface Props {
  total: number
  asOnDate: string
  strategies: MyStrategy[]
}

function GridIcon() {
  return (
    <Box component="svg" viewBox="0 0 16 16" sx={{ width: rem(15), height: rem(15) }} aria-hidden>
      {[
        [1, 1],
        [9, 1],
        [1, 9],
        [9, 9],
      ].map(([x, y]) => (
        <rect key={`${x}${y}`} x={x} y={y} width="6" height="6" rx="1.6" fill="currentColor" />
      ))}
    </Box>
  )
}

function ViewToggle({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  const btn = (v: View, label: string, icon: React.ReactNode) => {
    const on = view === v
    return (
      <ButtonBase
        aria-label={label}
        aria-pressed={on}
        onClick={() => onChange(v)}
        sx={{
          width: rem(28), height: rem(28), borderRadius: rem(8), transition: 'background-color .15s',
          bgcolor: on ? colors.base.white : 'transparent', color: on ? colors.red[300] : colors.text.mutedWarm,
          boxShadow: on ? shadows.toggle : 'none',
        }}
      >
        {icon}
      </ButtonBase>
    )
  }
  return (
    <Box sx={{ display: 'flex', gap: rem(4), p: rem(4), borderRadius: rem(12), bgcolor: colors.border.default }}>
      {btn('grid', 'Grid view', <GridIcon />)}
      {btn('list', 'List view', <Menu size="1.125rem" strokeWidth={3} />)}
    </Box>
  )
}

/** Horizontal scroller with prev/next arrows pinned to the edges. */
function HScroller({ children }: { children: React.ReactNode[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(false)

  const update = useCallback(() => {
    const el = ref.current
    if (!el) return
    setCanLeft(el.scrollLeft > 1)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [])

  useEffect(() => {
    update()
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [update, children.length])

  const step = (dir: 1 | -1) => {
    const el = ref.current
    if (!el) return
    const px = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
    el.scrollBy({ left: dir * (CARD_W + GAP) * (px / 16), behavior: 'smooth' })
  }

  const arrow = (dir: 1 | -1, enabled: boolean) => (
    <Box
      component="button"
      type="button"
      aria-label={dir === -1 ? 'Scroll left' : 'Scroll right'}
      disabled={!enabled}
      onClick={() => step(dir)}
      sx={{
        position: 'absolute', top: '50%', [dir === -1 ? 'left' : 'right']: 0, transform: 'translateY(-50%)', zIndex: 2,
        width: rem(29), height: rem(29), p: 0, borderRadius: '50%', display: 'grid', placeItems: 'center',
        cursor: enabled ? 'pointer' : 'default', transition: 'background-color .15s',
        border: enabled ? `${rem(1)} solid ${colors.sand[835]}` : 0,
        bgcolor: enabled ? colors.base.white : colors.cream[890], color: enabled ? colors.brown[180] : colors.sand[686],
        boxShadow: enabled ? shadows.arrow : 'none',
      }}
    >
      {dir === -1 ? <ChevronLeft size="1rem" strokeWidth={2.5} /> : <ChevronRight size="1rem" strokeWidth={2.5} />}
    </Box>
  )

  return (
    <Box sx={{ position: 'relative' }}>
      {arrow(-1, canLeft)}
      {arrow(1, canRight)}
      <Box
        ref={ref}
        onScroll={update}
        sx={{
          display: 'flex', alignItems: 'stretch', gap: rem(GAP), px: rem(14), pb: rem(4), overflowX: 'auto',
          scrollSnapType: 'x proximity', scrollPaddingInline: rem(14), scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {children.map((c, i) => (
          <Box key={i} sx={{ flex: `0 0 ${rem(CARD_W)}`, minWidth: 0, scrollSnapAlign: 'start' }}>
            {c}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default function MyStrategiesSection({ total, asOnDate, strategies }: Props) {
  const isMobile = useMediaQuery('(max-width:40rem)')
  const [view, setView] = useState<View>('grid')
  const cards = strategies.map((s) => <MyStrategyCard key={s.id} strategy={s} />)

  const dateOnly = asOnDate.split(',')[0]

  return (
    <Box component="section" sx={{ py: rem(16) }}>
      <Box
        sx={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: rem(12),
          px: rem(14), mb: rem(15), [MOBILE]: { mb: rem(12) },
        }}
      >
        <Box>
          <Box
            component="h2"
            sx={{
              m: 0, fontFamily: 'inherit', fontSize: rem(16), fontWeight: 700, lineHeight: rem(22), color: colors.text.strong,
              [MOBILE]: { fontSize: rem(20), lineHeight: rem(28) },
            }}
          >
            My Strategies <Box component="span" sx={{ fontWeight: 400, color: colors.gray[569] }}>({String(total).padStart(2, '0')})</Box>
          </Box>
          <Box sx={{ mt: rem(2), fontSize: rem(12), lineHeight: rem(18), color: colors.text.faint, [MOBILE]: { fontSize: rem(10.5) } }}>
            Number strategies you have invested in
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: rem(12) }}>
          {/* Desktop: full timestamp. Mobile: date only, no label. */}
          <Box sx={{ fontSize: rem(12), lineHeight: rem(18), color: colors.text.faint, textAlign: 'right', [MOBILE]: { display: 'none' } }}>
            As on Date: <Box component="span" sx={{ color: colors.text.ink, fontWeight: 500 }}>{asOnDate}</Box>
          </Box>
          <Box sx={{ display: 'none', fontSize: rem(10.5), fontWeight: 500, color: colors.text.ink, pb: rem(1), [MOBILE]: { display: 'block' } }}>
            {dateOnly}
          </Box>
          <Box sx={{ [MOBILE]: { display: 'none' } }}>
            <ViewToggle view={view} onChange={setView} />
          </Box>
        </Box>
      </Box>

      {view === 'list' && !isMobile ? (
        <StrategyTable strategies={strategies} />
      ) : isMobile ? (
        <CardCarousel arrows slideWidth={`min(calc(100vw - ${rem(28)}), ${rem(512)})`} dotsMargin={29} dotsGap={9.5}>
          {cards}
        </CardCarousel>
      ) : (
        <HScroller>{cards}</HScroller>
      )}
    </Box>
  )
}

/** Placeholder for the whole section while the API is loading. */
export function MyStrategiesSkeleton() {
  return (
    <Box role="status" aria-busy="true" aria-label="Loading my strategies" sx={{ pt: rem(26.5) }}>
      <Box sx={{ px: rem(14), mb: rem(15), display: 'grid', gap: rem(8) }}>
        <Bone w={150} h={18} />
        <Bone w={200} h={10} />
      </Box>
      <Box sx={{ px: rem(14), display: 'flex', gap: rem(GAP), overflow: 'hidden', [MOBILE]: { '& > *:nth-of-type(n+2)': { display: 'none' } } }}>
        {[0, 1, 2, 3].map((i) => (
          <Box key={i} sx={{ width: rem(CARD_W), flexShrink: 0, [MOBILE]: { width: '100%' } }}>
            <MyStrategyCardSkeleton />
          </Box>
        ))}
      </Box>
    </Box>
  )
}
