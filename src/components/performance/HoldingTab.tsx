import { Box, ButtonBase, useMediaQuery } from '@mui/material'
import { Layers } from 'lucide-react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { fetchPerformanceHolding, type HoldingRow, type PerformanceHoldingResponse } from '../../api/performanceSummary'
import { useClientSort } from '../../hooks/useSort'
import { useApiResource } from '../../hooks/useApiResource'
import { rem } from '../../utils/format'
import { colors } from '../../theme'
import { perfPalette as P } from '../../theme/pms'
import DonutChart from '../common/DonutChart'
import DownloadButton from '../common/DownloadButton'
import IconChip from '../common/IconChip'
import Pill from '../common/Pill'
import Panel from '../common/Panel'
import SortHeader from '../common/SortHeader'
import { Bone } from '../common/Skeleton'
import { MOBILE_Q, r, reset, TabFrame } from './shared'

type Data = PerformanceHoldingResponse['data']
type SortKey = 'name' | 'asset' | 'units' | 'cost' | 'price' | 'marketValue' | 'gain' | 'gainPct'

const COLUMNS: { key: SortKey; label: string; width: string }[] = [
  { key: 'name', label: 'Security', width: '21.9%' },
  { key: 'asset', label: 'Asset', width: '10.4%' },
  { key: 'units', label: 'Units', width: '10.4%' },
  { key: 'cost', label: 'Cost', width: '10.4%' },
  { key: 'price', label: 'Market Price', width: '10.4%' },
  { key: 'marketValue', label: 'Market Value', width: '12.5%' },
  { key: 'gain', label: 'Gain / Loss', width: '12.5%' },
  { key: 'gainPct', label: '% Gain/Loss', width: '1fr' },
]
const GRID = COLUMNS.map((c) => c.width).join(' ')
const PAGE_SIZE = 3
const MIN_TABLE_WIDTH = 1000

const sortValue = (row: HoldingRow, key: SortKey): string | number | null => (key === 'name' ? row.name : key === 'asset' ? row.asset : row[key].n)
const isGain = (n: number | null) => n !== null && n > 0


function GainPill({ d, n }: { d: string; n: number | null }) {
  if (n === null) return <Dash />
  return <Pill tone="green" variant="badge" sx={{ height: r(18, 17), px: rem(7), fontSize: r(12.3, 10) }}>{d}</Pill>
}

const Dash = () => <Box component="span" sx={{ color: P.chartGrid }}>—</Box>

/** Cost / Market value / Gain stats with an optional progress ring (desktop). */
function SummaryPanel({ s, isMobile }: { s: Data['summaries'][number]; isMobile: boolean }) {
  const cellSx = { px: 0 }
  return (
    <Panel icon={<Layers size={rem(16)} color={colors.gold.base} />} tint={colors.cream[920]} title={s.title} subtitle={s.subtitle}>
      <Box sx={{ display: 'flex', alignItems: 'center', minHeight: { sm: rem(172) }, py: { xs: rem(22), sm: 0 } }}>
        <Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: { xs: '53% 47%', sm: '1fr 1fr' }, rowGap: { xs: rem(17), sm: rem(19) }, pl: r(25, 23.5), pr: rem(8), minWidth: 0 }}>
          {s.items.map((x) => (
            <Box key={x.label} sx={cellSx}>
              <Box sx={{ ...reset, fontSize: r(12.3, 11.4), lineHeight: rem(18), color: colors.text.mutedWarm }}>{x.label}</Box>
              <Box sx={{ ...reset, mt: rem(6), fontSize: r(18.9, 16.3), fontWeight: 800, lineHeight: rem(28), color: colors.text.ink }}>{x.value}</Box>
            </Box>
          ))}
        </Box>
        {!isMobile && (
          <>
            <Box sx={{ width: rem(1), height: rem(104), bgcolor: colors.border.default, flexShrink: 0 }} />
            <Box sx={{ width: rem(153), flexShrink: 0, display: 'grid', placeItems: 'center' }}>
              <DonutChart gauge ariaLabel={`${s.title} share of portfolio`} size={101} innerRatio={0.835} data={[{ name: s.title, y: s.ring, color: P.barPortfolio }, { name: 'Rest', y: Math.max(100 - s.ring, 0.0001), color: 'transparent' }]}>
                <Box sx={{ ...reset, fontSize: rem(14), fontWeight: 700, color: P.barPortfolio }}>{s.ring}%</Box>
              </DonutChart>
            </Box>
          </>
        )}
      </Box>
    </Panel>
  )
}

function Footer({ f, isMobile }: { f: Data['holdings']['footer']; isMobile: boolean }) {
  return (
    <Box sx={isMobile
      ? { mt: rem(10), height: rem(40), px: rem(19), display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: rem(16), bgcolor: colors.base.white, border: `${rem(1)} solid ${colors.border.default}` }
      : { height: rem(41), px: rem(18), display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: P.tableHead, borderTop: `${rem(1)} solid ${colors.border.default}` }}>
      <Box sx={{ ...reset, fontSize: r(12.3, 10.5), color: colors.text.mutedWarm }}>{f.count} · {isMobile ? 'Total' : f.label}</Box>
      <Box sx={{ ...reset, fontSize: r(12.3, 11.5), fontWeight: 700, color: colors.text.ink }}>{f.total}</Box>
    </Box>
  )
}

/** Sortable holdings table (desktop). */
function HoldingsTable({ d }: { d: Data['holdings'] }) {
  const { sort, sorted: rows, onSort } = useClientSort<HoldingRow, SortKey>(d.rows, sortValue, { key: 'name', dir: 'asc' })
  const num = { ...reset, fontSize: rem(12.3), color: colors.text.secondary } as const
  return (
    <Panel icon={<Layers size={rem(16)} color={colors.gold.base} />} tint={colors.cream[920]} title={d.title} subtitle={d.subtitle} action={<DownloadButton ariaLabel="Download holdings" />}>
      <Box sx={{ overflowX: 'auto' }}>
        <Box role="table" aria-label="Holdings" sx={{ minWidth: rem(MIN_TABLE_WIDTH) }}>
          <SortHeader columns={COLUMNS} grid={GRID} sort={sort} onSort={onSort} height={39} />
          {rows.map((x) => (
            <Box role="row" key={x.name} sx={{ display: 'grid', gridTemplateColumns: GRID, height: rem(44.4), alignItems: 'center', borderBottom: `${rem(1)} solid ${colors.border.default}` }}>
              <Box role="cell" sx={{ pl: rem(14.5), ...reset, fontSize: rem(14.2), fontWeight: 600, color: colors.text.ink }}>{x.name}</Box>
              <Box role="cell"><Pill tone={x.asset === 'Equity' ? 'maroon' : 'slate'} variant="badge">{x.asset}</Pill></Box>
              <Box role="cell" sx={num}>{x.units.n === null ? <Dash /> : x.units.d}</Box>
              <Box role="cell" sx={num}>{x.cost.n === null ? <Dash /> : x.cost.d}</Box>
              <Box role="cell" sx={num}>{x.price.n === null ? <Dash /> : x.price.d}</Box>
              <Box role="cell" sx={{ ...num, fontWeight: 600, color: colors.text.ink }}>{x.marketValue.d}</Box>
              <Box role="cell" sx={{ ...num, fontWeight: 600, color: isGain(x.gain.n) ? P.positive : colors.text.secondary }}>{x.gain.n === null ? <Dash /> : x.gain.d}</Box>
              <Box role="cell"><GainPill d={x.gainPct.d} n={x.gainPct.n} /></Box>
            </Box>
          ))}
        </Box>
      </Box>
      <Footer f={d.footer} isMobile={false} />
    </Panel>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Box sx={{ ...reset, fontSize: rem(9.4), fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: P.slate }}>{label}</Box>
      <Box sx={{ ...reset, mt: rem(2), fontSize: rem(11.2), color: colors.text.secondary }}>{value}</Box>
    </Box>
  )
}

/** One security as a card (mobile). */
function HoldingCard({ x }: { x: HoldingRow }) {
  return (
    <Box sx={{ boxSizing: 'border-box', p: rem(15), borderRadius: rem(16), bgcolor: colors.base.white, border: `${rem(1)} solid ${colors.border.default}`, boxShadow: '0 .5rem 1rem -.5rem rgba(90,60,40,.08)' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box sx={{ ...reset, fontSize: rem(12.6), fontWeight: 600, lineHeight: rem(20), color: colors.text.ink }}>{x.name}</Box>
        <Pill tone={x.asset === 'Equity' ? 'maroon' : 'slate'} variant="badge">{x.asset}</Pill>
      </Box>
      <Box sx={{ ...reset, mt: rem(6), fontSize: rem(14.6), fontWeight: 800, lineHeight: rem(22), color: colors.text.ink }}>{x.marketValue.d}</Box>
      {x.gain.n !== null && (
        <Box sx={{ mt: rem(4), display: 'flex', alignItems: 'center', gap: rem(8) }}>
          <Box component="span" sx={{ ...reset, fontSize: rem(10.8), fontWeight: 600, color: isGain(x.gain.n) ? P.positive : colors.text.secondary }}>{x.gain.d}</Box>
          <GainPill d={x.gainPct.d} n={x.gainPct.n} />
        </Box>
      )}
      <Box sx={{ mt: rem(11), pt: rem(10), borderTop: `${rem(1)} solid ${colors.border.default}`, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <Stat label="Units" value={x.units.n === null ? '—' : x.units.d} />
        <Stat label="Cost" value={x.cost.n === null ? '—' : x.cost.d} />
        <Stat label="Mkt Price" value={x.price.n === null ? '—' : x.price.d} />
      </Box>
    </Box>
  )
}

const SLIDE_MS = 550
const AUTO_MS = 4500
const EASE = 'cubic-bezier(.2,.7,.2,1)'

/**
 * Mobile holdings: header, three cards per page in a sliding track, page dots, total.
 * Pages advance on their own (looping) and pause while the user touches, hovers or focuses the list.
 */
function HoldingsCards({ d }: { d: Data['holdings'] }) {
  const pages = useMemo(() => Array.from({ length: Math.ceil(d.rows.length / PAGE_SIZE) }, (_, i) => d.rows.slice(i * PAGE_SIZE, i * PAGE_SIZE + PAGE_SIZE)), [d.rows])
  const [page, setPage] = useState(0)
  const [paused, setPaused] = useState(false)
  const [height, setHeight] = useState<number | undefined>()
  const start = useRef<number | null>(null)
  const refs = useRef<(HTMLDivElement | null)[]>([])
  const go = (p: number) => setPage(((p % pages.length) + pages.length) % pages.length)

  // Auto-advance (skipped while paused or when the user prefers reduced motion).
  useEffect(() => {
    if (paused || pages.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = window.setTimeout(() => setPage((p) => (p + 1) % pages.length), AUTO_MS)
    return () => window.clearTimeout(t)
  }, [page, paused, pages.length])

  // Track height follows the visible page so shorter pages don't leave a gap.
  useLayoutEffect(() => {
    const el = refs.current[page]
    if (!el) return
    const measure = () => setHeight(el.offsetHeight)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [page, pages])

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: rem(10) }}>
        <IconChip tint={colors.cream[920]} size={32}><Layers size={rem(15)} color={colors.gold.base} /></IconChip>
        <Box sx={{ flex: 1 }}>
          <Box component="h2" sx={{ ...reset, fontSize: rem(11.9), fontWeight: 700, lineHeight: rem(19), color: colors.text.ink }}>{d.title}</Box>
          <Box sx={{ ...reset, fontSize: rem(10.5), lineHeight: rem(17), color: colors.text.mutedWarm }}>{d.subtitle}</Box>
        </Box>
        <DownloadButton ariaLabel="Download holdings" />
      </Box>
      <Box
        aria-roledescription="carousel"
        aria-live={paused ? 'polite' : 'off'}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        onTouchStart={(e) => { setPaused(true); start.current = e.touches[0].clientX }}
        onTouchEnd={(e) => {
          if (start.current !== null) {
            const dx = e.changedTouches[0].clientX - start.current
            if (Math.abs(dx) > 40) go(page + (dx < 0 ? 1 : -1))
          }
          start.current = null
          setPaused(false)
        }}
        sx={{ mt: rem(14), overflow: 'hidden', height: height === undefined ? 'auto' : rem(height), transition: `height ${SLIDE_MS}ms ${EASE}`, '@media (prefers-reduced-motion: reduce)': { transition: 'none' } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', transform: `translateX(-${page * 100}%)`, transition: `transform ${SLIDE_MS}ms ${EASE}`, '@media (prefers-reduced-motion: reduce)': { transition: 'none' } }}>
          {pages.map((rows, i) => (
            <Box key={i} ref={(el: HTMLDivElement | null) => { refs.current[i] = el }} aria-hidden={i !== page} sx={{ flex: '0 0 100%', minWidth: 0, display: 'grid', gap: rem(10), py: rem(2), boxSizing: 'border-box' }}>
              {rows.map((x) => <HoldingCard key={x.name} x={x} />)}
            </Box>
          ))}
        </Box>
      </Box>
      <Box role="tablist" aria-label="Holdings pages" sx={{ mt: rem(14), display: 'flex', justifyContent: 'center', gap: rem(5) }}>
        {pages.map((_, i) => (
          <ButtonBase key={i} role="tab" aria-selected={i === page} aria-label={`Page ${i + 1}`} onClick={() => go(i)} sx={{ width: rem(i === page ? 17 : 7), height: rem(7), borderRadius: rem(4), bgcolor: i === page ? colors.brand.accent : colors.border.input, transition: `width ${SLIDE_MS / 2}ms ${EASE}, background-color ${SLIDE_MS / 2}ms` }} />
        ))}
      </Box>
      <Footer f={d.footer} isMobile />
    </Box>
  )
}

function SummarySkeleton({ ring }: { ring: boolean }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', minHeight: { sm: rem(172) }, py: { xs: rem(22), sm: 0 } }}>
      <Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: rem(19), pl: r(25, 23.5), pr: rem(8) }}>
        {[0, 1, 2, 3].map((i) => <Box key={i}><Bone w={70} h={11} /><Bone w={96} h={18} sx={{ mt: rem(9) }} /></Box>)}
      </Box>
      {ring && <Box sx={{ width: rem(153), display: { xs: 'none', sm: 'grid' }, placeItems: 'center' }}><Bone r="round" sx={{ width: rem(101), height: rem(101) }} /></Box>}
    </Box>
  )
}

function Skeleton({ isMobile }: { isMobile: boolean }) {
  return (
    <>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: { xs: rem(24), sm: rem(19) } }}>
        {[['Summary'], ['Equity']].map(([t]) => (
          <Panel key={t} icon={<Layers size={rem(16)} color={colors.gold.base} />} tint={colors.cream[920]} title={t} subtitle="">
            <SummarySkeleton ring />
          </Panel>
        ))}
      </Box>
      <Box sx={{ mt: { xs: rem(19), sm: rem(18) } }}>
        {isMobile ? (
          <Box sx={{ display: 'grid', gap: rem(10) }}>
            {[0, 1, 2].map((i) => <Box key={i} sx={{ height: rem(136), borderRadius: rem(16), bgcolor: colors.base.white, border: `${rem(1)} solid ${colors.border.default}`, p: rem(15) }}><Bone w={110} h={13} /><Bone w={90} h={16} sx={{ mt: rem(12) }} /><Bone w={80} h={11} sx={{ mt: rem(10) }} /><Bone h={26} sx={{ mt: rem(18) }} /></Box>)}
          </Box>
        ) : (
          <Panel icon={<Layers size={rem(16)} color={colors.gold.base} />} tint={colors.cream[920]} title="Holdings Detail" subtitle="" action={<Bone w={101} h={29} r={10} />}>
            <Box sx={{ height: rem(39), borderBottom: `${rem(1)} solid ${colors.border.default}` }} />
            {Array.from({ length: 8 }, (_, i) => (
              <Box key={i} sx={{ display: 'grid', gridTemplateColumns: GRID, height: rem(44.4), alignItems: 'center', borderBottom: `${rem(1)} solid ${colors.border.default}` }}>
                <Box sx={{ pl: rem(14.5) }}><Bone w={110} h={13} /></Box><Bone w={46} h={18} r={6} /><Bone w={40} h={12} /><Bone w={44} h={12} /><Bone w={44} h={12} /><Bone w={70} h={12} /><Bone w={56} h={12} /><Bone w={48} h={18} r={6} />
              </Box>
            ))}
          </Panel>
        )}
      </Box>
    </>
  )
}

export default function HoldingTab({ clientCode }: { clientCode: string }) {
  const isMobile = useMediaQuery(MOBILE_Q)
  const { data, error } = useApiResource(() => fetchPerformanceHolding(clientCode))
  const d = data?.data ?? null
  const body: ReactNode = d ? (
    <>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: { xs: rem(24), sm: rem(19) } }}>
        {d.summaries.map((s) => <SummaryPanel key={s.title} s={s} isMobile={isMobile} />)}
      </Box>
      <Box sx={{ mt: { xs: rem(19), sm: rem(18) } }}>{isMobile ? <HoldingsCards d={d.holdings} /> : <HoldingsTable d={d.holdings} />}</Box>
    </>
  ) : (
    <Skeleton isMobile={isMobile} />
  )
  return <TabFrame error={error}>{body}</TabFrame>
}
