import { Box, useMediaQuery } from '@mui/material'
import { Activity, ArrowUpRight, Target, TrendingUp } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { fetchPerformanceRor, type LabelValue, type RorType, type Tone } from '../../api/performanceSummary'
import { activeSummarySubtitle, capitalFlowView, performanceKpis, rorView, type CapitalFlowView, type OverviewView, type PerformanceVariant, type StripView } from './adapters'
import { useServerList } from '../../hooks/useServerList'
import { rem } from '../../utils/format'
import { colors } from '../../theme'
import { perfPalette as P } from '../../theme/pms'
import IconChip from '../common/IconChip'
import LabelValueList from '../common/LabelValueList'
import Panel from '../common/Panel'
import ReturnsBarChart from '../common/ReturnsBarChart'
import SegmentedToggle from '../common/SegmentedToggle'
import { Bone } from '../common/Skeleton'
import TrajectoryChart from '../common/TrajectoryChart'
import { KpiRow, MOBILE_Q, r, reset, TabFrame } from './shared'

type View = OverviewView | StripView
const ROR_OPTIONS = ['XIRR', 'TWRR'] as const
const toneColor = (t?: Tone) => (t ? P.tone[t][0] : colors.text.strong)
const card = { boxSizing: 'border-box', borderRadius: rem(20), bgcolor: colors.base.white, border: `${rem(1)} solid ${colors.border.default}`, overflow: 'hidden' } as const
const muted = { ...reset, fontSize: r(12.3, 11), color: colors.text.mutedWarm } as const
const caps = { ...reset, fontSize: r(12.2, 10.5), fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: colors.text.mutedWarm } as const

function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  const [fg, , bg, border] = P.tone[tone]
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: rem(6), height: rem(26), px: rem(11), borderRadius: rem(9), bgcolor: bg, border: `${rem(1)} solid ${border}`, color: fg, fontWeight: 700, fontSize: r(12.5, 11.5), whiteSpace: 'nowrap' }}>
      <ArrowUpRight size={rem(12)} />
      {children}
    </Box>
  )
}

/** XIRR view: big value, two metrics, portfolio-vs-benchmark bars. */
function Overview({ v }: { v: OverviewView }) {
  const max = Math.max(...v.compare.rows.map((x) => x.pct))
  const cell = (last = false) => ({ px: r(21, 19), py: r(19, 17), borderRight: { sm: last ? 'none' : `${rem(1)} solid ${colors.border.default}` }, borderBottom: { xs: last ? 'none' : `${rem(1)} solid ${colors.border.default}`, sm: 'none' } })
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.15fr 1fr 1fr 1.85fr' }, minHeight: { sm: rem(178) } }}>
      <Box sx={{ ...cell(), gridColumn: { xs: 'auto', sm: 'auto' } }}>
        <Box sx={{ ...muted, lineHeight: rem(18), fontSize: r(12.8, 10.2) }}>{v.hero.label}</Box>
        <Box sx={{ ...reset, mt: rem(5), fontSize: r(31, 22.3), fontWeight: 800, lineHeight: { xs: rem(30), sm: rem(38) }, color: colors.text.ink }}>{v.hero.value}</Box>
        <Box sx={{ mt: rem(10) }}><Badge tone="green">{v.hero.badge}</Badge></Box>
        <Box sx={{ ...muted, mt: rem(9), fontSize: r(12.8, 10), lineHeight: rem(18) }}>{v.hero.note}</Box>
      </Box>
      {v.metrics.map((m) => (
        <Box key={m.label} sx={{ ...cell(), display: 'flex', flexDirection: 'column', justifyContent: { sm: 'center' } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: rem(10) }}>
            <IconChip tint={P.tone.green[2]} size={23}>{m.icon === 'return' ? <TrendingUp size={rem(12)} color={P.tone.green[0]} /> : <ArrowUpRight size={rem(12)} color={P.tone.green[0]} />}</IconChip>
            <Box sx={caps}>{m.label}</Box>
          </Box>
          <Box sx={{ ...reset, mt: rem(10), fontSize: r(19.5, 18.2), fontWeight: 800, lineHeight: rem(28), color: m.tone ? toneColor(m.tone) : colors.text.ink, whiteSpace: 'nowrap' }}>{m.value}</Box>
          <Box sx={{ ...muted, mt: rem(3), fontSize: r(12.8, 10) }}>{m.sub}</Box>
        </Box>
      ))}
      <Box sx={{ ...cell(true), minWidth: { sm: rem(226) } }}>
        <Box sx={caps}>{v.compare.title}</Box>
        <Box sx={{ mt: rem(8) }}>
          {v.compare.rows.map((x, i) => {
            const primary = i === 0
            return (
              <Box key={x.label} sx={{ mb: rem(9) }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', ...reset, fontSize: r(12.8, 11), lineHeight: rem(20), color: primary ? P.tone.maroon[0] : P.slate }}>
                  <Box component="span">{x.label}</Box>
                  <Box component="span" sx={{ fontWeight: 700 }}>{x.display}</Box>
                </Box>
                <Box sx={{ mt: rem(4), height: rem(5.5), borderRadius: rem(3), bgcolor: P.track, overflow: 'hidden' }}>
                  <Box sx={{ width: `${(x.pct / max) * 92}%`, height: '100%', borderRadius: rem(3), bgcolor: primary ? P.tone.maroon[0] : P.tone.slate[0], opacity: primary ? 1 : 0.7 }} />
                </Box>
              </Box>
            )
          })}
          <Box sx={{ mt: rem(12) }}><Badge tone="green">{v.compare.badge}</Badge></Box>
        </Box>
      </Box>
    </Box>
  )
}

const CHART_BARS_D = { height: 302, margin: [19, 12, 56, 41] as [number, number, number, number], fontSize: 11.8, legendSize: 12.1, labelWidth: undefined }
const CHART_BARS_M = { height: 289, margin: [29, 11, 53, 33] as [number, number, number, number], fontSize: 5.5, legendSize: 7.6, labelWidth: 26 }

/** Label/value strip + periodic returns chart. */
function Strip({ v, isMobile }: { v: StripView; isMobile: boolean }) {
  const c = isMobile ? CHART_BARS_M : CHART_BARS_D
  const { categories, portfolio } = v.chart
  return (
    <>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(3, 1fr)', sm: `repeat(${v.strip.length}, 1fr)` }, borderBottom: `${rem(1)} solid ${colors.border.default}` }}>
        {v.strip.map((x, i) => (
          <Box key={x.label} sx={{ px: r(21, 19), py: r(17, 14), boxSizing: 'border-box', borderRight: { xs: i % 3 !== 2 ? `${rem(1)} solid ${colors.border.default}` : 'none', sm: i === v.strip.length - 1 ? 'none' : `${rem(1)} solid ${colors.border.default}` }, borderTop: { xs: i > 2 ? `${rem(1)} solid ${colors.border.default}` : 'none', sm: 'none' } }}>
            <Box sx={{ ...muted, fontSize: r(12.5, 9.6), lineHeight: rem(18) }}>{x.label}</Box>
            <Box sx={{ ...reset, mt: rem(3), fontSize: r(12.8, 11.4), fontWeight: 700, lineHeight: rem(20), color: toneColor(x.tone ?? undefined) }}>{x.value}</Box>
          </Box>
        ))}
      </Box>
      <Box sx={{ px: r(18, 12), pt: rem(17), pb: rem(10) }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: rem(12) }}>
          <IconChip tint={colors.rose[949]} size={32}><Activity size={rem(15)} color={colors.brand.accent} /></IconChip>
          <Box>
            <Box component="h3" sx={{ ...reset, fontSize: r(12.9, 11.6), fontWeight: 700, lineHeight: rem(19), color: colors.text.ink }}>{v.chart.title}</Box>
            <Box sx={{ ...muted, fontSize: r(12.3, 10.3), lineHeight: rem(17) }}>{v.chart.subtitle}</Box>
          </Box>
        </Box>
        <Box sx={{ mt: rem(4), mx: rem(-18) }}>
          <ReturnsBarChart categories={categories} portfolio={portfolio} height={c.height} margin={c.margin} fontSize={c.fontSize} legendSize={c.legendSize} labelWidth={c.labelWidth} />
        </Box>
      </Box>
    </>
  )
}

const fade = { animation: 'perf-fade .35s ease both', '@keyframes perf-fade': { from: { opacity: 0, transform: 'translateY(4px)' }, to: { opacity: 1, transform: 'none' } }, '@media (prefers-reduced-motion: reduce)': { animation: 'none' } } as const

function ActiveSummary({ subtitle, view, ror, onChange, isMobile }: { subtitle: string; view: View; ror: RorType; onChange: (r: RorType) => void; isMobile: boolean }) {
  return (
    <Panel icon={<Target size={rem(15)} color={colors.brand.accent} />} tint={colors.rose[949]} title="Active Summary" subtitle={subtitle} headerHeight={72.5} headerHeightMobile={67} action={<SegmentedToggle options={ROR_OPTIONS} value={ror.toUpperCase() as (typeof ROR_OPTIONS)[number]} onChange={(k) => onChange(k.toLowerCase() as RorType)} ariaLabel="Return basis" />}>
      <Box key={view.key} sx={fade}>
        {view.kind === 'overview' ? <Overview v={view} /> : <Strip v={view} isMobile={isMobile} />}
      </Box>
    </Panel>
  )
}

function CapitalFlow({ d }: { d: CapitalFlowView }) {
  return (
    <Box component="section" sx={{ ...card, px: r(21, 19), pt: rem(18), pb: rem(20) }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: rem(12) }}>
        <Box>
          <Box component="h3" sx={{ ...reset, fontSize: r(12.9, 12), fontWeight: 700, lineHeight: rem(20), color: colors.text.ink }}>{d.title}</Box>
          <Box sx={{ ...muted, mt: rem(2), lineHeight: rem(18) }}>{d.subtitle}</Box>
        </Box>
        <Box sx={{ ...muted, display: 'flex', alignItems: 'center', height: r(30, 31), px: rem(12), borderRadius: rem(8), bgcolor: P.chip, whiteSpace: 'nowrap', color: P.slate, fontSize: r(12.3, 10.3) }}>{d.asOn}</Box>
      </Box>
      <Box sx={{ mt: rem(20), display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: { xs: `${rem(18)} ${rem(14)}`, sm: rem(14) } }}>
        {d.items.map((x) => {
          const [fg, track] = P.tone[x.tone]
          return (
            <Box key={x.label}>
              <Box sx={{ height: rem(5.5), borderRadius: rem(3), bgcolor: track, overflow: 'hidden' }}>
                <Box sx={{ width: `${x.fill}%`, height: '100%', borderRadius: rem(3), bgcolor: fg, transition: 'width .6s cubic-bezier(.2,.7,.2,1)' }} />
              </Box>
              <Box sx={{ ...caps, mt: rem(15), display: 'flex', alignItems: 'center', gap: rem(7), lineHeight: rem(18), fontSize: r(12.2, 9.6) }}>
                <Box component="span" sx={{ width: rem(8), height: rem(8), borderRadius: '50%', bgcolor: fg }} />
                {x.marker}{x.label}
              </Box>
              <Box sx={{ ...reset, mt: rem(3), fontSize: r(13, 13), fontWeight: 700, lineHeight: rem(21), color: fg }}>{x.value}</Box>
              <Box sx={{ ...muted, mt: rem(2), lineHeight: rem(18), fontSize: r(12.3, 9.6) }}>{x.sub}</Box>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

const TRAJ_D = { height: 363, margin: [79, 22, 70, 55] as [number, number, number, number], inset: 18, fontSize: 11.4, titleSize: 12.3, subtitleSize: 12.3, legendSize: 12.3 }
const TRAJ_M = { height: 336, margin: [76, 17, 63, 27] as [number, number, number, number], inset: 16.5, fontSize: 6.4, titleSize: 11.5, subtitleSize: 10, legendSize: 9.6 }

function Trajectory({ d, isMobile }: { d: OverviewView['trajectory']; isMobile: boolean }) {
  const c = isMobile ? TRAJ_M : TRAJ_D
  const series = useMemo(() => d.series.map((s, i) => ({ ...s, color: i === 0 ? P.chartPortfolio : P.chartBenchmarkLine, dashed: i !== 0, fill: i === 0 })), [d.series])
  return (
    <Box component="section" sx={card}>
      <TrajectoryChart title={d.title} subtitle={d.subtitle} categories={d.categories} labelAt={isMobile ? d.labelAt.filter((_, i) => i % 2 === 0 || i === d.labelAt.length - 1) : d.labelAt} ticks={d.ticks} series={series} height={c.height} margin={c.margin} inset={c.inset} fontSize={c.fontSize} titleSize={c.titleSize} subtitleSize={c.subtitleSize} legendSize={c.legendSize} />
    </Box>
  )
}

function Rows({ rows }: { rows: LabelValue[] }) {
  return <LabelValueList rows={rows.map((x) => ({ ...x, color: toneColor(x.tone) }))} rowHeight={r(40.3, 35)} fontSize={r(12.8, 11)} sx={{ px: r(25, 23.5), pt: r(13, 11.5), pb: rem(12) }} />
}

function Skeleton() {
  const line = (key: number) => <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', height: rem(40.3), alignItems: 'center' }}><Bone w={130} h={12} /><Bone w={80} h={12} /></Box>
  return (
    <>
      <Panel icon={<Target size={rem(15)} color={colors.brand.accent} />} tint={colors.rose[949]} title="Active Summary" subtitle="" headerHeight={72.5} action={<Bone w={136} h={43} r={12} />}>
        <Box sx={{ p: rem(21), display: 'grid', gap: rem(14), minHeight: { sm: rem(178) } }}>
          <Bone w={160} h={12} /><Bone w={210} h={30} /><Bone w={170} h={24} r={9} /><Bone w={140} h={12} />
        </Box>
      </Panel>
      <Box sx={{ ...card, p: rem(21), minHeight: rem(168) }}>
        <Bone w={110} h={14} /><Bone w={210} h={11} sx={{ mt: rem(8) }} />
        <Box sx={{ mt: rem(20), display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: rem(14) }}>
          {[0, 1, 2, 3].map((i) => <Box key={i}><Bone h={5.5} r={3} /><Bone w={110} h={11} sx={{ mt: rem(15) }} /><Bone w={90} h={14} sx={{ mt: rem(8) }} /><Bone w={70} h={11} sx={{ mt: rem(8) }} /></Box>)}
        </Box>
      </Box>
      <Box sx={{ ...card, p: rem(21), height: { xs: rem(290), sm: rem(363) }, boxSizing: 'border-box' }}>
        <Bone w={190} h={14} /><Bone w={260} h={11} sx={{ mt: rem(8) }} /><Bone h="62%" r={12} sx={{ mt: rem(28) }} />
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: rem(19) }}>
        {[0, 1].map((i) => (
          <Panel key={i} icon={<Activity size={rem(16)} color={colors.brand.accent} />} tint={colors.rose[949]} title={i ? 'Profit & Loss' : 'Performance Summary'} subtitle={i ? 'Financial gains and losses' : 'Key performance indicators'}>
            <Box sx={{ px: r(25, 20), pt: rem(13), pb: rem(12) }}>{[0, 1, 2, 3, 4, 5].map(line)}</Box>
          </Panel>
        ))}
      </Box>
    </>
  )
}

function Content({ clientCode, variant, strategy }: { clientCode: string; variant: PerformanceVariant; strategy: string }) {
  const isMobile = useMediaQuery(MOBILE_Q)
  const [ror, setRor] = useState<RorType>('xirr')
  // One call per return basis; the previous answer stays on screen (dimmed) until the next one lands.
  const { data: res, error, busy } = useServerList((q: { ror: RorType }) => fetchPerformanceRor(clientCode, q.ror).then((r) => ({ ror: q.ror, r })), { ror })
  const model = useMemo(() => {
    if (!res) return null
    const d = res.r.data
    return { cards: performanceKpis(d, variant), view: rorView(res.ror, d, variant), flow: capitalFlowView(d, variant) }
  }, [res, variant])
  return (
    <TabFrame error={error}>
      <KpiRow cards={model?.cards ?? null} />
      <Box sx={{ mt: r(17.5, 16), display: 'flex', flexDirection: 'column', gap: rem(17.5), opacity: busy && model ? 0.55 : 1, transition: 'opacity .2s', pointerEvents: busy && model ? 'none' : 'auto' }} aria-busy={busy}>
        {model ? (
          <>
            <ActiveSummary subtitle={activeSummarySubtitle(strategy)} view={model.view} ror={ror} onChange={setRor} isMobile={isMobile} />
            <CapitalFlow d={model.flow} />
            {/* Trajectory + summary panels belong to the XIRR view only */}
            {model.view.kind === 'overview' && (
              <Box key={model.view.key} sx={{ ...fade, display: 'flex', flexDirection: 'column', gap: rem(17.5) }}>
                <Trajectory d={model.view.trajectory} isMobile={isMobile} />
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: { xs: rem(17.5), sm: rem(19) }, alignItems: 'stretch' }}>
                  <Panel icon={<Activity size={rem(16)} color={colors.gold.base} />} tint={colors.cream[920]} title={model.view.summary.title} subtitle={model.view.summary.subtitle}><Rows rows={model.view.summary.rows} /></Panel>
                  <Panel icon={<TrendingUp size={rem(16)} color={P.tone.green[0]} />} tint={P.tone.green[2]} bandTint={P.tone.green[2]} title={model.view.pnl.title} subtitle={model.view.pnl.subtitle}><Rows rows={model.view.pnl.rows} /></Panel>
                </Box>
              </Box>
            )}
          </>
        ) : (
          <Skeleton />
        )}
      </Box>
    </TabFrame>
  )
}

/**
 * Performance tab, shared by every product. `variant` ('pms' | 'aif') picks the API flavour;
 * everything on screen is rendered from the label/value arrays it returns.
 * `variant` is null until the header (which says PMS or AIF) has loaded.
 */
export default function PerformanceTab({ clientCode, variant, strategy }: { clientCode: string; variant: PerformanceVariant | null; strategy: string }) {
  if (variant) return <Content clientCode={clientCode} variant={variant} strategy={strategy} />
  return (
    <TabFrame error={null}>
      <KpiRow cards={null} />
      <Box sx={{ mt: r(17.5, 16), display: 'flex', flexDirection: 'column', gap: rem(17.5) }}><Skeleton /></Box>
    </TabFrame>
  )
}
