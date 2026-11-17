import type {
  KpiCard,
  LabelValue,
  PerformanceAllocationResponse,
  PerformanceRorResponse,
  PerformanceSummaryResponse,
  PerformanceTransactionsResponse,
  PerformanceXirrResponse,
  RorType,
  Tone,
  TransactionItem,
} from '../../api/performanceSummary'
import { formatAum, formatInr } from '../../utils/format'

// Turns the raw backend numbers into the display view-models the Performance tabs render.

export type PerformanceVariant = 'pms' | 'aif'
export type AllocationKey = 'equity' | 'cash' | 'debt' | 'derivatives' | 'other'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** ₹1,00,07,326 */
export const inr = (n: number) => `₹${formatInr(Math.abs(Math.round(n)))}`
/** +₹11,04,540 / −₹1,09,000 (zero stays unsigned) */
export const inrSigned = (n: number) => (n === 0 ? '₹0' : `${n > 0 ? '+' : '−'}${inr(n)}`)
const pct2 = (n: number) => `${n.toFixed(2)}%`
const signedPct = (n: number) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n).toFixed(2)}%`
const gainTone = (n: number): Tone => (n > 0 ? 'green' : n < 0 ? 'red' : 'slate')

/** "26/08/2025" -> Date (UTC midnight) */
const parseDate = (s: string) => {
  const [d, m, y] = s.split('/').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}
/** Date -> "Feb 24, 2026" */
const longDate = (d: Date) => `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`
const slashDate = (d: Date) => `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`

/** Responses are "as on T-1" (previous day), as the strategies API states. */
export function asOnDate(now = new Date()): Date {
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - 1))
}
export const asOnSlash = () => slashDate(asOnDate())
const asOnLong = () => longDate(asOnDate())

const returnsSub = (returns: number, invested: number) => `${invested ? signedPct((returns / invested) * 100) : '0.00%'} absolute`

/** The four tiles shared by the XIRR / Allocation / Performance tabs */
function kpis(d: { aum: number; invested: number; returns: number; xirr: number }, labels: [string, string, string, string], subs: [string, string, string?, string?] = ["Today's portfolio value", 'Total invested']): KpiCard[] {
  return [
    { label: labels[0], value: inr(d.aum), sub: subs[0] },
    { label: labels[1], value: inr(d.invested), sub: subs[1] },
    { label: labels[2], value: d.returns < 0 ? inrSigned(d.returns) : inr(d.returns), sub: subs[2] ?? returnsSub(d.returns, d.invested) },
    { label: labels[3], value: `${d.xirr.toFixed(1)}%`, sub: subs[3] ?? 'Annualized Return' },
  ]
}

// ----------------------------------------------------------------------------- Summary

export interface AllocationRow {
  key: AllocationKey
  label: string
  amount: string
  pct: number
}

const ALLOCATION_KEYS: AllocationKey[] = ['equity', 'cash', 'debt', 'derivatives', 'other']
/** "Cash & Equiv." -> cash; unknown names fall back to their position */
const allocationKey = (sector: string, index: number): AllocationKey => ALLOCATION_KEYS.find((k) => sector.toLowerCase().startsWith(k)) ?? ALLOCATION_KEYS[Math.min(index, 4)]

export function summaryView(d: PerformanceSummaryResponse['data']) {
  const p = d.performanceSummary
  return {
    disclaimer: 'The data below excludes transactions that are currently under processing.',
    cards: kpis({ ...d, xirr: p.xirr }, ['Current Value', 'Net Capital', 'Absolute Return', 'XIRR'], ["Today's portfolio value", 'Total invested', 'Total gain on investment', 'Annualised return']),
    performance: {
      inceptionDate: p.inceptionDate,
      netCapital: inr(d.invested),
      realisedGainLoss: inrSigned(p.realpnl),
      unrealisedGainLoss: inrSigned(p.unRealpnl),
      incomeReceived: inr(p.incomeReceived),
      feesExpenses: inr(p.feesnExp),
      accruedIncome: inr(p.accuredIncome),
      portfolioValueDate: asOnSlash(),
      portfolioValue: inr(d.aum),
    },
    allocation: {
      totalAum: d.aum >= 1e7 ? `₹${(d.aum / 1e7).toFixed(1)} Cr` : formatAum(d.aum),
      rows: d.allocationDetails.map((x, i): AllocationRow => ({ key: allocationKey(x.sector, i), label: x.sector, amount: inr(x.marketValue), pct: x.pct })),
    },
  }
}

// ----------------------------------------------------------------------------- XIRR

const PERIODS = [['1 Month', '1m'], ['3 Month', '3m'], ['6 Month', '6m'], ['1 Year', '1y'], ['Since Inception', 'All']] as const

export function xirrView(d: PerformanceXirrResponse['data']) {
  const get = (name: string) => (d as unknown as Record<string, number>)[name]
  return {
    cards: kpis(d, ['Current Value', 'Net Capital', 'Absolute Return', 'XIRR'], ["Today's portfolio value", 'Total invested', 'Total gain on investment', 'Annualised return']),
    rows: PERIODS.map(([period, k]) => ({ period, portfolio: get(`portfolio${k}`), benchmark: get(`benchmark${k}`) })),
  }
}

// ----------------------------------------------------------------------------- Allocation

export function allocationView(d: PerformanceAllocationResponse['data']) {
  return {
    cards: kpis(d, ['Current Value', 'Capital Invested', 'Absolute Return', 'XIRR'], ['Total market value of your portfolio today', 'Net Capital Investment']),
    sectors: d.sector.map((x) => ({ label: x.sectorName, amount: inr(x.marketValue), pct: x.pct })),
    securities: d.security.map((x) => ({ name: x.symbolName, sector: x.sectorName.toUpperCase(), pct: pct2(x.pct), value: inr(x.marketValue) })),
  }
}

// ----------------------------------------------------------------------------- Performance

/** XIRR view of the Active Summary card */
export interface OverviewView {
  key: string
  kind: 'overview'
  hero: { label: string; value: string; badge: string; note: string }
  metrics: { label: string; value: string; sub: string; tone?: Tone; icon: 'capital' | 'return' }[]
  compare: { title: string; rows: { label: string; pct: number; display: string }[]; badge: string }
  trajectory: { title: string; subtitle: string; categories: string[]; labelAt: number[]; ticks: number[]; series: { name: string; data: number[] }[] }
  summary: { title: string; subtitle: string; rows: LabelValue[] }
  pnl: { title: string; subtitle: string; rows: LabelValue[] }
}

/** TWRR view: a strip of label/value cells + a periodic returns chart */
export interface StripView {
  key: string
  kind: 'strip'
  strip: LabelValue[]
  chart: { title: string; subtitle: string; categories: string[]; portfolio: number[] }
}

export interface CapitalFlowView {
  title: string
  subtitle: string
  asOn: string
  items: { label: string; value: string; sub: string; tone: Tone; fill: number; marker: string }[]
}

const LABELS = {
  pms: { current: 'Current Value', invested: 'Capital Invested', gain: 'Absolute Gain / Loss', rate: 'XIRR', begin: 'Begin Value', capIn: 'Capital In', capOut: 'Capital Out', heroLabel: 'Current Portfolio Value', metricCapital: 'Net Capital', invNote: 'invested', summary: ['Performance Summary', 'Key performance indicators'], stripBegin: 'Begin Value', stripNet: 'Net Capital', stripEnd: 'Current Value', stripPortfolio: 'Portfolio', stripBench: 'Benchmark %' },
  aif: { current: 'Current NAV Value', invested: 'Capital Contributed', gain: 'Absolute Gain / Loss', rate: 'IRR', begin: 'Opening NAV', capIn: 'Contributions', capOut: 'Distributions', heroLabel: 'Current NAV Value', metricCapital: 'Net Contributions', invNote: 'contributed', summary: ['Fund Summary', 'Key fund indicators'], stripBegin: 'Opening NAV', stripNet: 'Contributions', stripEnd: 'Closing NAV', stripPortfolio: 'Fund', stripBench: 'Benchmark %' },
} as const

/** "01/03/2024" -> "Mar'24" */
const monthLabel = (s: string) => {
  const d = parseDate(s)
  return `${MONTHS[d.getUTCMonth()]}'${String(d.getUTCFullYear()).slice(2)}`
}
const monthYear = (s: string) => {
  const d = parseDate(s)
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

/** Highcharts needs explicit y ticks: min / mid / max rounded outward to whole numbers */
function niceTicks(values: number[]): number[] {
  const lo = Math.floor(Math.min(...values))
  const hi = Math.ceil(Math.max(...values))
  return [lo, Math.round((lo + hi) / 2), hi === lo ? hi + 1 : hi]
}

export function performanceKpis(d: PerformanceRorResponse['data'], variant: PerformanceVariant): KpiCard[] {
  const L = LABELS[variant]
  return kpis(d, [L.current, L.invested, L.gain, L.rate], ["Today's portfolio value", 'Net Capital Investment'])
}

function overview(d: PerformanceRorResponse['data'], variant: PerformanceVariant): OverviewView {
  const L = LABELS[variant]
  const trend = d.rorTrends
  const alpha = d.portfolio - d.benchmark
  return {
    key: 'XIRR',
    kind: 'overview',
    hero: { label: L.heroLabel, value: inr(d.aum), badge: `${inrSigned(d.returns)} · ${signedPct(d.returnPct)}`, note: `vs ${inr(d.invested)} ${L.invNote}` },
    metrics: [
      { label: L.metricCapital, value: inr(d.invested), sub: 'Invested Capital', icon: 'capital' },
      { label: 'Abs. Return', value: inr(d.returns), sub: 'Since inception', tone: gainTone(d.returns), icon: 'return' },
    ],
    compare: {
      title: 'Portfolio vs Benchmark',
      rows: [{ label: 'Portfolio', pct: d.portfolio, display: pct2(d.portfolio) }, { label: 'Benchmark', pct: d.benchmark, display: pct2(d.benchmark) }],
      badge: `${signedPct(alpha)} Alpha`,
    },
    trajectory: {
      title: 'XIRR Performance Trajectory',
      subtitle: trend.length ? `${monthYear(trend[0].date)} – ${monthYear(trend[trend.length - 1].date)} · Annualised return (%)` : 'Annualised return (%)',
      categories: trend.map((x) => monthLabel(x.date)),
      labelAt: trend.map((_, i) => i).filter((i) => i % 2 === 0 || i === trend.length - 1),
      ticks: niceTicks(trend.map((x) => x.ror)),
      series: [{ name: 'XIRR', data: trend.map((x) => x.ror) }],
    },
    summary: {
      title: L.summary[0],
      subtitle: L.summary[1],
      rows: [
        { label: L.begin, value: inr(d.beginValue) },
        { label: L.capIn, value: inr(d.capitalIn) },
        { label: L.capOut, value: inr(d.capitalOut) },
        { label: 'Profit / Loss', value: inrSigned(d.returns), tone: gainTone(d.returns) },
        { label: 'Current Value', value: inr(d.aum) },
        { label: 'Change %', value: signedPct(d.returnPct), tone: gainTone(d.returnPct) },
      ],
    },
    pnl: {
      title: 'Profit & Loss',
      subtitle: 'Financial gains and losses',
      rows: [
        { label: 'Realised Gain / Loss', value: inrSigned(d.realPnl), tone: 'slate' },
        { label: 'Unrealised Gain / Loss', value: inrSigned(d.unrealPnl), tone: gainTone(d.unrealPnl) },
        { label: 'Prior Gain', value: inr(d.priorGain), tone: 'green' },
        { label: 'Income Received', value: inr(d.incomeReceived), tone: 'green' },
        { label: 'Fees & Expenses', value: inr(d.feeAndExp), tone: 'red' },
        { label: 'Accrued Income', value: inr(d.accuredIncome), tone: 'green' },
      ],
    },
  }
}

function strip(d: PerformanceRorResponse['data'], variant: PerformanceVariant): StripView {
  const L = LABELS[variant]
  const trend = d.rorTrends
  return {
    key: 'TWRR',
    kind: 'strip',
    strip: [
      { label: L.stripBegin, value: compactInr(d.beginValue) },
      { label: L.stripNet, value: compactInr(d.capitalIn - d.capitalOut) },
      { label: 'Gain / Loss', value: compactInr(d.returns), tone: d.returns < 0 ? 'red' : d.returns > 0 ? 'green' : undefined },
      { label: L.stripEnd, value: compactInr(d.aum) },
      { label: L.stripPortfolio, value: `${d.portfolio}%` },
      { label: L.stripBench, value: pct2(d.benchmark) },
    ],
    chart: {
      title: 'Portfolio Performance',
      subtitle: 'TWRR by month',
      categories: trend.map((x) => monthLabel(x.date)),
      portfolio: trend.map((x) => x.ror),
    },
  }
}

/** Active Summary view for the chosen return basis (one response per `ror`). */
export function rorView(ror: RorType, d: PerformanceRorResponse['data'], variant: PerformanceVariant): OverviewView | StripView {
  return ror === 'twrr' ? strip(d, variant) : overview(d, variant)
}

export function capitalFlowView(d: PerformanceRorResponse['data'], variant: PerformanceVariant): CapitalFlowView {
  const L = LABELS[variant]
  const peak = Math.max(d.beginValue, d.capitalIn, d.capitalOut, d.aum, 1)
  const fill = (n: number) => Math.max(1, Math.round((n / peak) * 100))
  const asOn = longDate(asOnDate())
  return {
    title: 'Capital Flow',
    subtitle: 'Inception → current · portfolio movement',
    asOn: `As on ${asOn}`,
    items: [
      { label: L.begin, value: inr(d.beginValue), sub: 'At inception', tone: 'maroon', fill: fill(d.beginValue), marker: '' },
      { label: L.capIn, value: `+${inr(d.capitalIn)}`, sub: 'Inflows', tone: 'green', fill: fill(d.capitalIn), marker: '+ ' },
      { label: L.capOut, value: `−${inr(d.capitalOut)}`, sub: 'Outflows', tone: 'red', fill: fill(d.capitalOut), marker: '– ' },
      { label: 'Current Value', value: inr(d.aum), sub: `As on ${asOn}`, tone: 'navy', fill: fill(d.aum), marker: '' },
    ],
  }
}

export const activeSummarySubtitle = (strategy: string) => `${strategy} · ${asOnLong()}`

// ----------------------------------------------------------------------------- Transactions

export interface TransactionCell {
  d: string
  n: number | null
}

export interface TransactionRow {
  id: string
  account: string
  date: TransactionCell
  /** Short code shown in the pill (AS+, PRO…) */
  type: string
  security: string
  amount: TransactionCell
  /** Expanded details, one array per table column */
  details: [LabelValue[], LabelValue[], LabelValue[]]
}

const TRAN_TYPES: Record<string, string> = { 'AS+': 'Additional subscription', PRO: 'Profit distribution' }

/** 1225000 -> "₹12.25 L", -109000 -> "−₹1.09 L" */
const compactInr = (n: number) => (n < 0 ? `−${formatAum(-n)}` : formatAum(n))
const lv = (label: string, value: string): LabelValue => ({ label, value })

export function transactionRows(items: PerformanceTransactionsResponse['data']['transactions']): TransactionRow[] {
  return items.map((t: TransactionItem, i) => {
    const amount = t.units * t.unitPrice
    return {
      id: `${t.clientCode}-${t.tranDate}-${t.tranType}-${i}`,
      account: `${t.clientId} - ${t.clientCode} - ${t.clientName}`,
      date: { d: t.tranDate, n: parseDate(t.tranDate).getTime() },
      type: t.tranType,
      security: t.security,
      amount: { d: compactInr(amount), n: amount },
      details: [
        [lv('Date', t.tranDate), lv('Units', formatInr(t.units))],
        [lv('Amount', compactInr(amount)), lv('Tran Type', TRAN_TYPES[t.tranType] ?? t.tranType)],
        [lv('Security', t.security), lv('Price', formatInr(t.unitPrice)), lv('Exchange', t.exchange)],
      ],
    }
  })
}
