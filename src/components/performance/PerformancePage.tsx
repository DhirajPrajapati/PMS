import { Box, ButtonBase, useMediaQuery } from '@mui/material'
import { Activity, PieChart, RotateCcw, Table2, Target, TriangleAlert } from 'lucide-react'
import { useMemo, useState } from 'react'
import { fetchPerformanceAllocation, fetchPerformanceHeader, fetchPerformanceSummary, fetchPerformanceXirr, type AllocationRow, type PerformanceHeaderResponse, type PerformanceSummaryResponse } from '../../api/performanceSummary'
import { useApiResource } from '../../hooks/useApiResource'
import { rem } from '../../utils/format'
import { colors } from '../../theme'
import { perfPalette as P } from '../../theme/pms'
import Avatar from '../common/Avatar'
import Breadcrumb from '../common/Breadcrumb'
import PageShell from '../common/PageShell'
import TopBar from '../common/TopBar'
import DonutChart from '../common/DonutChart'
import IconChip from '../common/IconChip'
import Panel from '../common/Panel'
import { Bone } from '../common/Skeleton'
import Tabs from '../common/Tabs'
import { DonutSkeleton, KpiRow, MOBILE_Q, r, reset, TabFrame } from './shared'
import HoldingTab from './HoldingTab'
import PerformanceTab from './PerformanceTab'
import TransactionTab from './TransactionTab'
import XirrChart from '../common/XirrChart'

const TABS = ['Summary', 'XIRR', 'Allocation', 'Performance', 'Holding', 'Transaction'] as const
type TabName = (typeof TABS)[number]
function Dot() {
  return <Box sx={{ width: rem(6), height: rem(6), borderRadius: '50%', bgcolor: colors.sand[686], flexShrink: 0 }} />
}

function Header({ h, tab, setTab }: { h: PerformanceHeaderResponse['data'] | null; tab: TabName; setTab: (t: TabName) => void }) {
  return (
    <Box sx={{ flexShrink: 0, bgcolor: colors.base.white }}>
      <TopBar name={h?.clientName ?? ''} />
      <Box sx={{ px: r(21, 21), pt: r(27, 19), pb: r(15, 11), borderBottom: { xs: `${rem(1)} dashed ${colors.border.input}`, sm: `${rem(1)} solid ${colors.border.default}` } }}>
        <Breadcrumb current="Strategy Performance Summary" />
        <Box sx={{ mt: r(17, 14), display: 'flex', alignItems: 'center', gap: rem(16) }}>
          {h ? <Avatar name={h.clientName} size={r(47, 45)} fontSize={r(16, 15)} /> : <Bone r="round" sx={{ width: r(47, 45), height: r(47, 45) }} />}
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Box component="h1" sx={{ ...reset, fontSize: r(16.4, 15.1), fontWeight: 700, lineHeight: rem(24), color: colors.text.ink }}>{h ? h.clientName : <Bone w={140} h={16} sx={{ mt: rem(4) }} />}</Box>
            {h && (
              <Box sx={{ mt: rem(3), display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: rem(9), rowGap: r(2, 7.5), ...reset, fontSize: r(12.3, 11), color: colors.text.secondary }}>
                <Box component="span">Client Code: <Box component="span" sx={{ fontWeight: 600 }}>{h.clientCode}</Box></Box>
                <Dot />
                <Box component="span" sx={{ height: rem(21), px: rem(11), display: 'inline-flex', alignItems: 'center', borderRadius: rem(11), bgcolor: colors.rose[967], border: `${rem(1)} solid ${colors.rose[906]}`, color: colors.brand.accent, fontWeight: 800, fontSize: r(11.5, 10.5) }}>{h.type}</Box>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}><Dot /></Box>
                <Box component="span" sx={{ width: { xs: '100%', sm: 'auto' }, mt: { xs: rem(0), sm: 0 } }}>{h.provider} — {h.strategy}</Box>
              </Box>
            )}
            {!h && <Bone w={260} h={12} sx={{ mt: rem(9) }} />}
          </Box>
          <ButtonBase aria-label="Refresh" sx={{ width: r(35, 37), height: r(35, 37), borderRadius: rem(10), border: `${rem(1)} solid ${colors.border.default}`, color: colors.brand.accent, boxShadow: '0 1px 2px rgba(0,0,0,.04)' }}>
            <RotateCcw size={rem(17)} />
          </ButtonBase>
        </Box>
      </Box>
      <Tabs items={TABS} value={tab} onChange={setTab} ariaLabel="Strategy views" />
    </Box>
  )
}

function PerformanceRows({ d }: { d: PerformanceSummaryResponse['data']['performance'] }) {
  const rows: [string, string, boolean?][] = [
    ['Inception Date', d.inceptionDate],
    ['Net Capital (In +) / (Out -)', d.netCapital],
    ['Realised Gain/loss', d.realisedGainLoss],
    ['Unrealised Gain/loss', d.unrealisedGainLoss, d.unrealisedGainLoss.startsWith('+')],
    ['Income Received', d.incomeReceived],
    ['Fees & Expenses', d.feesExpenses],
    ['Accrued Income', d.accruedIncome],
    [`Portfolio Value as on ${d.portfolioValueDate}`, d.portfolioValue],
  ]
  return (
    <Box sx={{ px: r(17, 22), py: rem(0) }}>
      {rows.map(([k, v, pos]) => (
        <Box key={k} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: r(56.6, 42), ...reset, fontSize: r(12.8, 11.9) }}>
          <Box component="span" sx={{ color: colors.text.secondary }}>{k}</Box>
          <Box component="span" sx={{ fontWeight: 700, color: pos ? P.positive : colors.text.strong }}>{v}</Box>
        </Box>
      ))}
    </Box>
  )
}

const palette = (k: AllocationRow['key']) => P[k]

function Allocation({ d }: { d: PerformanceSummaryResponse['data']['allocation'] }) {
  const isMobile = useMediaQuery(MOBILE_Q)
  return (
    <Box sx={{ px: r(32, 31), pt: r(27, 25), pb: r(19.5, 18) }}>
      <DonutChart ariaLabel="Allocation by asset class" rounded={false} size={isMobile ? 154 : 166} data={d.rows.map((x) => ({ name: x.label, y: x.pct, color: palette(x.key)[0], detail: x.amount }))}>
        <Box sx={{ ...reset, fontSize: r(13.3, 12.5), fontWeight: 800, color: colors.text.ink }}>{d.totalAum}</Box>
        <Box sx={{ ...reset, mt: rem(3), fontSize: r(12, 8.4), letterSpacing: '0.06em', color: P.slate, textTransform: 'uppercase' }}>Total AUM</Box>
      </DonutChart>
      <Box sx={{ mt: r(27, 26), display: 'grid', rowGap: rem(0) }}>
        {d.rows.map((x) => {
          const [c, c2, pillBg, pillText] = palette(x.key)
          return (
            <Box key={x.key} sx={{ height: rem(43) }}>
              <Box sx={{ display: 'flex', alignItems: 'center', height: rem(20), ...reset, fontSize: r(12.2, 10.6) }}>
                <Box sx={{ width: rem(9), height: rem(9), borderRadius: '50%', bgcolor: c, mr: rem(10) }} />
                <Box component="span" sx={{ flex: 1, color: colors.text.secondary }}>{x.label}</Box>
                <Box component="span" sx={{ fontWeight: 600, color: colors.text.strong, mr: rem(8) }}>{x.amount}</Box>
                <Box component="span" sx={{ minWidth: rem(56), height: rem(20), px: rem(6), boxSizing: 'border-box', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: rem(10), bgcolor: pillBg, color: pillText, fontWeight: 700, fontSize: r(11.8, 10) }}>{x.pct.toFixed(2)}%</Box>
              </Box>
              <Box sx={{ mt: rem(6), height: rem(5.5), borderRadius: rem(3), bgcolor: P.track, overflow: 'hidden' }}>
                <Box sx={{ width: `${x.pct}%`, minWidth: rem(3), height: '100%', borderRadius: rem(3), background: `linear-gradient(90deg,${c},${c2})` }} />
              </Box>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

function SummaryTab({ clientCode }: { clientCode: string }) {
  const isMobile = useMediaQuery(MOBILE_Q)
  const { data, error } = useApiResource(() => fetchPerformanceSummary(clientCode))
  const d = data?.data ?? null
  return (
    <TabFrame error={error}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: rem(10), minHeight: r(50, 57), boxSizing: 'border-box', px: rem(13), py: rem(9), borderRadius: rem(14), background: P.disclaimerBg, border: `${rem(1)} solid ${P.disclaimerBorder}`, ...reset, fontSize: r(12.2, 10.6), color: P.disclaimerText }}>
        <IconChip tint={P.disclaimerIconBg} size={25}><TriangleAlert size={rem(14)} color={P.disclaimerIcon} /></IconChip>
        {d ? (
          <Box sx={{ lineHeight: { xs: rem(19), sm: 'normal' } }}><Box component="strong" sx={{ fontWeight: 800, color: P.disclaimerStrong }}>Disclaimer:</Box> {d.disclaimer}</Box>
        ) : (
          <Bone w="70%" h={11} />
        )}
      </Box>

      <Box sx={{ mt: r(17, 16) }}><KpiRow cards={d?.cards ?? null} /></Box>

      <Box sx={{ mt: r(17, 0), display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: rem(19), alignItems: 'stretch' }}>
        <Panel icon={<Activity size={rem(16)} color={colors.brand.accent} />} tint={colors.rose[949]} title="Performance Summary" subtitle="Key metrics for the current portfolio period">
          {d ? (
            <PerformanceRows d={d.performance} />
          ) : (
            <Box sx={{ px: r(17, 22) }}>
              {Array.from({ length: 8 }, (_, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: r(56.6, 42) }}><Bone w={150} h={12} /><Bone w={80} h={12} /></Box>
              ))}
            </Box>
          )}
        </Panel>
        <Panel icon={<Target size={rem(16)} color={colors.gold.base} />} tint={colors.cream[920]} title="Current Allocation" subtitle="Portfolio distribution by asset class">
          {d ? (
            <Allocation d={d.allocation} />
          ) : (
            <Box sx={{ px: r(32, 31), pt: r(27, 25), pb: r(19.5, 18) }}>
              <DonutSkeleton size={isMobile ? 154 : 166} />
              <Box sx={{ mt: r(27, 26) }}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Box key={i} sx={{ height: rem(43) }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: rem(20) }}><Bone w={120} h={12} /><Bone w={110} h={16} r={8} /></Box>
                    <Bone h={5.5} r={3} sx={{ mt: rem(6) }} />
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Panel>
      </Box>
    </TabFrame>
  )
}

const CHART_DESKTOP = { height: 579, margin: [48, 41, 84, 100] as [number, number, number, number], fontSize: 17 }
const CHART_MOBILE = { height: 170, margin: [22, 16, 23, 35] as [number, number, number, number], fontSize: 5.5 }
const cell = { ...reset, display: 'flex', alignItems: 'center' } as const

function XirrTab({ clientCode }: { clientCode: string }) {
  const isMobile = useMediaQuery(MOBILE_Q)
  const { data, error } = useApiResource(() => fetchPerformanceXirr(clientCode))
  const d = data?.data ?? null
  const rows = useMemo(() => d?.rows ?? [], [d])
  const categories = useMemo(() => rows.map((x) => x.period), [rows])
  const portfolio = useMemo(() => rows.map((x) => x.portfolio), [rows])
  const benchmark = useMemo(() => rows.map((x) => x.benchmark), [rows])
  const cfg = isMobile ? CHART_MOBILE : CHART_DESKTOP
  const cols = '50% 24.5% 1fr'
  const pill = (v: number, bg: string, fg: string) => (
    <Box component="span" sx={{ height: r(23, 25), px: rem(10), display: 'inline-flex', alignItems: 'center', borderRadius: rem(8), bgcolor: bg, color: fg, fontWeight: 700, fontSize: r(13, 10.6) }}>{v.toFixed(2)}%</Box>
  )
  return (
    <TabFrame error={error}>
      <KpiRow cards={d?.cards ?? null} />
      <Box sx={{ mt: r(17, 16) }}>
        <Panel icon={<Activity size={rem(16)} color={colors.brand.accent} />} tint={colors.rose[949]} title="XIRR Performance" subtitle="Annualised return benchmarked against portfolio index">
          {d ? (
            <XirrChart categories={categories} portfolio={portfolio} benchmark={benchmark} height={cfg.height} margin={cfg.margin} fontSize={cfg.fontSize} />
          ) : (
            <Box role="status" aria-busy="true" aria-label="Loading" sx={{ height: rem(cfg.height), boxSizing: 'border-box', pl: rem(cfg.margin[3]), pr: rem(cfg.margin[1]), pt: rem(cfg.margin[0]), pb: rem(cfg.margin[2]), display: 'flex', alignItems: 'flex-end' }}>
              {[[8, 6], [20, 15], [36, 30], [64, 56], [92, 80]].map(([a, b], i) => (
                <Box key={i} sx={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: rem(isMobile ? 3 : 12), height: '100%' }}>
                  <Bone h={`${a}%`} r={5} sx={{ width: rem(isMobile ? 14 : 58) }} />
                  <Bone h={`${b}%`} r={5} sx={{ width: rem(isMobile ? 14 : 58) }} />
                </Box>
              ))}
            </Box>
          )}
          <Box role="table" aria-label="XIRR by period">
            <Box role="row" sx={{ display: 'grid', gridTemplateColumns: cols, height: r(40, 35), bgcolor: P.tableHead, ...reset, fontSize: r(11.5, 10), fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: colors.text.mutedWarm }}>
              {['Time Period', 'Portfolio (%)', 'Benchmark (%)'].map((h, i) => <Box role="columnheader" key={h} sx={{ ...cell, pl: i === 0 ? r(14.5, 14) : 0 }}>{h}</Box>)}
            </Box>
            {!d && Array.from({ length: 5 }, (_, i) => (
              <Box key={i} sx={{ display: 'grid', gridTemplateColumns: cols, alignItems: 'center', height: r(44.5, 41), borderTop: `${rem(1)} solid ${colors.border.default}` }}>
                <Box sx={{ pl: r(14.5, 14) }}><Bone w={80} h={12} /></Box><Bone w={58} h={23} r={8} /><Bone w={58} h={23} r={8} />
              </Box>
            ))}
            {rows.map((x) => (
              <Box role="row" key={x.period} sx={{ display: 'grid', gridTemplateColumns: cols, height: r(44.5, 41), borderTop: `${rem(1)} solid ${colors.border.default}`, ...reset, fontSize: r(12.8, 11.5), color: colors.text.strong }}>
                <Box role="cell" sx={{ ...cell, pl: r(14.5, 14) }}>{x.period}</Box>
                <Box role="cell" sx={cell}>{pill(x.portfolio, P.chartPortfolioPill, P.chartPortfolio)}</Box>
                <Box role="cell" sx={cell}>{pill(x.benchmark, P.chartBenchmarkPill, P.chartBenchmark)}</Box>
              </Box>
            ))}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: rem(28), height: r(45, 41), borderTop: `${rem(1)} solid ${colors.border.default}`, bgcolor: P.tableFoot, ...reset, fontSize: r(12.3, 11.5), color: colors.text.secondary }}>
            {[['Portfolio', P.chartPortfolio], ['Benchmark', P.chartBenchmark]].map(([n, c]) => (
              <Box key={n} sx={{ display: 'flex', alignItems: 'center', gap: rem(8) }}><Box sx={{ width: rem(10), height: rem(10), borderRadius: '50%', bgcolor: c }} />{n}</Box>
            ))}
          </Box>
        </Panel>
      </Box>
    </TabFrame>
  )
}

const sectorColors = P.sectors

function AllocationTab({ clientCode }: { clientCode: string }) {
  const { data, error } = useApiResource(() => fetchPerformanceAllocation(clientCode))
  const d = data?.data ?? null
  const sectors = d?.sectors ?? []
  const headCell = { ...reset, display: 'flex', alignItems: 'center', fontSize: r(11.5, 10), fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: colors.text.mutedWarm } as const
  const cols = '44.7% 29.8% 11.3% 1fr'
  return (
    <TabFrame error={error}>
      <KpiRow cards={d?.cards ?? null} />
      <Box sx={{ mt: r(17, 16), display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: rem(19), alignItems: 'stretch' }}>
        <Panel icon={<PieChart size={rem(16)} color={colors.brand.accent} />} tint={colors.rose[949]} title="Sector Allocation" subtitle="By portfolio weight">
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', pl: r(35, 20), pr: rem(16), pt: r(0, 22), height: { sm: rem(470) } }}>
            <Box sx={{ width: { sm: rem(199) }, flexShrink: 0 }}>
              {d ? (
<DonutChart ariaLabel="Allocation by sector" rounded={false} size={166} data={sectors.map((x, i) => ({ name: x.label, y: x.pct, color: sectorColors[i][0], detail: x.amount }))}>
                <Box sx={{ ...reset, fontSize: rem(18), fontWeight: 800, lineHeight: 1, color: colors.text.ink }}>{sectors.length}</Box>
                <Box sx={{ ...reset, mt: rem(5), fontSize: rem(12), letterSpacing: '0.08em', color: P.slate, textTransform: 'uppercase' }}>Sectors</Box>
              </DonutChart>
              ) : <DonutSkeleton size={166} />}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0, width: '100%', ml: { sm: rem(35) }, pt: r(29, 22), pb: rem(20) }}>
              {!d && Array.from({ length: 8 }, (_, i) => (
                <Box key={i} sx={{ height: i === 7 ? 'auto' : rem(55.7) }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: rem(20) }}><Bone w={140} h={12} /><Bone w={110} h={12} /></Box>
                  <Bone h={5.5} r={3} sx={{ mt: rem(6) }} />
                </Box>
              ))}
              {sectors.map((x, i) => {
                const [c, c2] = sectorColors[i]
                const last = i === sectors.length - 1
                return (
                  <Box key={x.label} sx={{ height: last ? 'auto' : rem(55.7) }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', height: rem(20), ...reset, fontSize: r(12.2, 11) }}>
                      <Box sx={{ width: rem(9), height: rem(9), borderRadius: '50%', bgcolor: c, mr: rem(10) }} />
                      <Box component="span" sx={{ flex: 1, color: colors.text.secondary }}>{x.label}</Box>
                      <Box component="span" sx={{ fontWeight: 700, color: colors.text.strong, mr: rem(8) }}>{x.amount}</Box>
                      <Box component="span" sx={{ width: rem(36), color: P.slate }}>{x.pct.toFixed(1)}%</Box>
                    </Box>
                    <Box sx={{ mt: rem(6), height: rem(5.5), borderRadius: rem(3), bgcolor: P.track, overflow: 'hidden' }}>
                      <Box sx={{ width: `${x.pct}%`, minWidth: rem(3), height: '100%', borderRadius: rem(3), background: `linear-gradient(90deg,${c},${c2})` }} />
                    </Box>
                  </Box>
                )
              })}
            </Box>
          </Box>
        </Panel>
        <Panel icon={<Table2 size={rem(16)} color={colors.gold.base} />} tint={colors.cream[920]} title="Security Allocation" subtitle="Detailed portfolio holdings">
          <Box sx={{ overflowX: 'auto' }}>
            <Box role="table" aria-label="Security allocation" sx={{ minWidth: { xs: rem(560), sm: 0 } }}>
              <Box role="row" sx={{ display: 'grid', gridTemplateColumns: cols, minHeight: r(59, 40), bgcolor: P.tableHead, alignItems: 'start', pt: r(19, 12) }}>
                <Box role="columnheader" sx={{ ...headCell, pl: rem(15) }}>Security</Box>
                <Box role="columnheader" sx={headCell}>Sector</Box>
                <Box role="columnheader" sx={{ ...headCell, display: 'block', lineHeight: rem(19), pr: rem(8) }}>Security %</Box>
                <Box role="columnheader" sx={headCell}>Value</Box>
              </Box>
              {!d && Array.from({ length: 9 }, (_, i) => (
                <Box key={i} sx={{ display: 'grid', gridTemplateColumns: cols, height: rem(44.4), borderTop: `${rem(1)} solid ${colors.border.default}`, alignItems: 'center' }}>
                  <Box sx={{ pl: rem(15) }}><Bone w={140} h={12} /></Box><Bone w={110} h={12} /><Bone w={44} h={12} /><Bone w={60} h={12} />
                </Box>
              ))}
              {(d?.securities ?? []).map((x) => (
                <Box role="row" key={x.name} sx={{ display: 'grid', gridTemplateColumns: cols, height: rem(44.4), borderTop: `${rem(1)} solid ${colors.border.default}`, alignItems: 'center', ...reset, fontSize: r(12.3, 11.5), color: colors.text.strong }}>
                  <Box role="cell" sx={{ pl: rem(15), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{x.name}</Box>
                  <Box role="cell" sx={{ color: colors.text.secondary, whiteSpace: 'nowrap' }}>{x.sector}</Box>
                  <Box role="cell">{x.pct}</Box>
                  <Box role="cell">{x.value}</Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Panel>
      </Box>
    </TabFrame>
  )
}

function ComingSoon({ tab }: { tab: string }) {
  return <Box sx={{ p: rem(48), textAlign: 'center', ...reset, fontSize: rem(14), color: colors.text.mutedWarm }}>{tab} view is not part of this build yet.</Box>
}

/** Strategy Performance Summary: opened from the "Performance" button on a My Strategies card or table row (#/performance/<clientCode>). */
export default function PerformancePage({ clientCode }: { clientCode: string }) {
  const [tab, setTab] = useState<TabName>('Summary')
  const { data, error } = useApiResource(() => fetchPerformanceHeader(clientCode))
  const h = data?.data ?? null
  if (error) return <Box sx={{ p: rem(24), color: colors.status.error }}>{error}</Box>
  return (
    <PageShell header={<Header h={h} tab={tab} setTab={setTab} />}>
      {/* Only the body scrolls; the header stays put. */}
      {/* Each tab owns its API call, so switching tabs shows that tab's skeleton until it responds. */}
          {tab === 'Summary' ? <SummaryTab clientCode={clientCode} /> : tab === 'XIRR' ? <XirrTab clientCode={clientCode} /> : tab === 'Allocation' ? <AllocationTab clientCode={clientCode} /> : tab === 'Holding' ? <HoldingTab clientCode={clientCode} /> : tab === 'Transaction' ? <TransactionTab clientCode={clientCode} /> : tab === 'Performance' ? <PerformanceTab clientCode={clientCode} variant={h ? (h.type.toUpperCase() === 'AIF' ? 'aif' : 'pms') : null} /> : <ComingSoon tab={tab} />}
    </PageShell>
  )
}
