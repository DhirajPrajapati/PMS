import { DEFAULT_LIMIT, paginate, wait, type PageMeta, type PageParams } from './pagination'

// Mock APIs for the Strategy Performance Summary page. Every endpoint below returns the
// backend contract as-is (raw numbers, DD/MM/YYYY dates, { status, message, data } envelope).
// Display formatting (₹ grouping, labels, colours) happens in components/performance/adapters.ts.

/** Header-card helper used by Holding (display strings the backend formats itself) */
export interface LabelValue {
  label: string
  value: string
  /** Colours the value (green gain, red loss…) */
  tone?: Tone
}

/** One KPI tile (label, display value, caption) */
export interface KpiCard {
  label: string
  value: string
  sub: string
}

export type Tone = 'maroon' | 'green' | 'red' | 'navy' | 'slate'

interface Envelope<T> {
  status: 'success' | 'error'
  message: string
  data: T
}

const ok = <T>(data: T): Envelope<T> => ({ status: 'success', message: 'Fetched Successfully', data })

// ---------------------------------------------------------------------------
// Header (not part of the pasted contract; kept as before)
// ---------------------------------------------------------------------------

/** GET /api/pms/strategies/:clientCode/performance/header (shown above every tab) */
export type PerformanceHeaderResponse = Envelope<{
  clientName: string
  clientCode: string
  type: string
  strategy: string
  provider: string
}>

export async function fetchPerformanceHeader(_clientCode: string, latencyMs = 400): Promise<PerformanceHeaderResponse> {
  await wait(latencyMs)
  return ok({ clientName: 'Amit Deshmukh', clientCode: 'DI01366A', type: 'PMS', strategy: 'PMS Contra Strategy', provider: 'ICICI Prudential' })
}

// ---------------------------------------------------------------------------
// Summary tab
// ---------------------------------------------------------------------------

/** GET api/v2/dashboard/portfolio/{clientCode}/performance-summary */
export type PerformanceSummaryResponse = Envelope<{
  aum: number
  invested: number
  returns: number
  performanceSummary: {
    xirr: number
    /** DD/MM/YYYY */
    inceptionDate: string
    realpnl: number
    unRealpnl: number
    incomeReceived: number
    feesnExp: number
    accuredIncome: number
  }
  allocationDetails: { sector: string; marketValue: number; pct: number }[]
}>

export async function fetchPerformanceSummary(_clientCode: string, latencyMs = 700): Promise<PerformanceSummaryResponse> {
  await wait(latencyMs)
  return ok({
    aum: 10007326.0,
    invested: 8850000.0,
    returns: 1157326.0,
    performanceSummary: {
      xirr: 18.4,
      inceptionDate: '26/08/2025',
      realpnl: 0,
      unRealpnl: 1104540.0,
      incomeReceived: 52786,
      feesnExp: 124500,
      accuredIncome: 28000,
    },
    allocationDetails: [
      { sector: 'Equity', marketValue: 7489123.0, pct: 74.81 },
      { sector: 'Cash & Equiv.', marketValue: 1542000.0, pct: 15.42 },
      { sector: 'Debt', marketValue: 623452.0, pct: 6.23 },
      { sector: 'Derivatives', marketValue: 289341.0, pct: 2.89 },
      { sector: 'Other', marketValue: 65410.0, pct: 0.65 },
    ],
  })
}

// ---------------------------------------------------------------------------
// XIRR tab
// ---------------------------------------------------------------------------

/** GET api/v2/dashboard/portfolio/{clientCode}/xirrtrends (percent values) */
export type PerformanceXirrResponse = Envelope<{
  invested: number
  aum: number
  xirr: number
  returns: number
  benchmark1m: number
  portfolio1m: number
  benchmark3m: number
  portfolio3m: number
  benchmark6m: number
  portfolio6m: number
  benchmark1y: number
  portfolio1y: number
  benchmarkAll: number
  portfolioAll: number
}>

export async function fetchPerformanceXirr(_clientCode: string, latencyMs = 700): Promise<PerformanceXirrResponse> {
  await wait(latencyMs)
  return ok({
    invested: 8850000.0,
    aum: 10007326.0,
    xirr: 16.2,
    returns: 1157326.0,
    benchmark1m: 0.95,
    portfolio1m: 1.2,
    benchmark3m: 3.1,
    portfolio3m: 3.85,
    benchmark6m: 6.3,
    portfolio6m: 7.42,
    benchmark1y: 12.8,
    portfolio1y: 14.6,
    benchmarkAll: 18.5,
    portfolioAll: 21.4,
  })
}

// ---------------------------------------------------------------------------
// Allocation tab
// ---------------------------------------------------------------------------

/** GET api/v2/dashboard/portfolio/{clientCode}/allocation */
export type PerformanceAllocationResponse = Envelope<{
  invested: number
  aum: number
  xirr: number
  returns: number
  sector: { sectorName: string; marketValue: number; pct: number }[]
  security: { sectorName: string; marketValue: number; pct: number; symbolName: string }[]
}>

export async function fetchPerformanceAllocation(_clientCode: string, latencyMs = 700): Promise<PerformanceAllocationResponse> {
  await wait(latencyMs)
  return ok({
    invested: 8850000.0,
    aum: 10007326.0,
    xirr: 9.11,
    returns: 1157326.0,
    sector: [
      { sectorName: 'Financial Services', marketValue: 2842000.0, pct: 28.4 },
      { sectorName: 'Information Tech.', marketValue: 1872000.0, pct: 18.7 },
      { sectorName: 'Automobile', marketValue: 1231000.0, pct: 12.3 },
      { sectorName: 'Healthcare', marketValue: 961000.0, pct: 9.6 },
      { sectorName: 'Energy', marketValue: 821000.0, pct: 8.2 },
      { sectorName: 'Consumer Goods', marketValue: 780000.0, pct: 7.8 },
      { sectorName: 'Services', marketValue: 640000.0, pct: 6.4 },
      { sectorName: 'Others', marketValue: 861000.0, pct: 8.6 },
    ],
    security: [
      { symbolName: 'Cash', sectorName: 'Miscellaneous', marketValue: 388249.0, pct: 12.38 },
      { symbolName: 'Bharti Airtel Ltd', sectorName: 'Telecom - Services', marketValue: 251344.0, pct: 8.02 },
      { symbolName: 'Hindalco Industries Ltd', sectorName: 'Metals', marketValue: 239753.0, pct: 7.65 },
      { symbolName: 'Tata Steel Ltd', sectorName: 'Metals', marketValue: 232178.0, pct: 7.41 },
      { symbolName: 'Great Eastern Shipping Co. Ltd', sectorName: 'Trans', marketValue: 214153.0, pct: 6.83 },
      { symbolName: 'Larsen & Toubro Ltd', sectorName: 'Construction', marketValue: 203870.0, pct: 6.5 },
      { symbolName: 'State Bank of India', sectorName: 'Financial Services', marketValue: 189036.0, pct: 6.03 },
      { symbolName: 'Muthoot Finance Limited', sectorName: 'Financial Services', marketValue: 184740.0, pct: 5.89 },
      { symbolName: 'Bharat Forge Ltd', sectorName: 'Industrial Mfg', marketValue: 165135.0, pct: 5.27 },
    ],
  })
}

// ---------------------------------------------------------------------------
// Performance tab: one endpoint, `ror` picks the return basis
// ---------------------------------------------------------------------------

export type RorType = 'xirr' | 'twrr'

/** GET api/v2/dashboard/portfolio/{clientCode}/ror-trends/{ror} */
export type PerformanceRorResponse = Envelope<{
  invested: number
  aum: number
  xirr: number
  returns: number
  returnPct: number
  portfolio: number
  benchmark: number
  beginValue: number
  capitalIn: number
  capitalOut: number
  inceptionDate: string
  realPnl: number
  unrealPnl: number
  priorGain: number
  incomeReceived: number
  feeAndExp: number
  accuredIncome: number
  /** DD/MM/YYYY + return in percent */
  rorTrends: { date: string; ror: number }[]
}>

const XIRR_SERIES = [7.24, 7.15, 7.05, 7.2, 7.45, 7.4, 7.35, 7.5, 7.75, 7.95, 8.15, 8.35, 8.5, 8.45, 8.3, 8.55, 8.9, 9.2, 9.5, 9.4, 9.1, 9.45, 9.76, 9.8, 9.7, 9.6]
const TWRR_SERIES = [-4.5, 2.5, 1.55, -0.25, 5.2, 0.1, -0.2, 0.05, 0.05, -3.6, 0.03, 0.03]
const dd = (n: number) => String(n).padStart(2, '0')
/** First of each month starting Jan 2024 / Oct 2025 */
const monthly = (values: number[], startYear: number, startMonth: number) =>
  values.map((ror, i) => {
    const m = startMonth + i
    return { date: `01/${dd((m % 12) + 1)}/${startYear + Math.floor(m / 12)}`, ror }
  })

const ROR_XIRR: PerformanceRorResponse['data'] = {
  invested: 8850000.0,
  aum: 10007326.0,
  xirr: 9.11,
  returns: 1157326.0,
  returnPct: 13.08,
  portfolio: 9.11,
  benchmark: 8.45,
  beginValue: 8850000.0,
  capitalIn: 2600000.0,
  capitalOut: 1442674.0,
  inceptionDate: '26/08/2025',
  realPnl: 0.0,
  unrealPnl: 1104540.0,
  priorGain: 52786.0,
  incomeReceived: 52786.0,
  feeAndExp: 124500.0,
  accuredIncome: 28000.0,
  rorTrends: monthly(XIRR_SERIES, 2024, 0),
}

const ROR_TWRR: PerformanceRorResponse['data'] = {
  invested: 5000000.0,
  aum: 3135000.0,
  xirr: 9.11,
  returns: -109000.0,
  returnPct: -3.36,
  portfolio: 0.0,
  benchmark: 0.0,
  beginValue: 3244000.0,
  capitalIn: 5000000.0,
  capitalOut: 0.0,
  inceptionDate: '31/10/2025',
  realPnl: 0.0,
  unrealPnl: -109000.0,
  priorGain: 0.0,
  incomeReceived: 0.0,
  feeAndExp: 0.0,
  accuredIncome: 0.0,
  rorTrends: monthly(TWRR_SERIES, 2025, 9),
}

export async function fetchPerformanceRor(_clientCode: string, ror: RorType = 'xirr', latencyMs = 800): Promise<PerformanceRorResponse> {
  await wait(latencyMs)
  return ok(ror === 'twrr' ? ROR_TWRR : ROR_XIRR)
}

// ---------------------------------------------------------------------------
// Holding tab
// ---------------------------------------------------------------------------

/** A table cell: `d` is shown exactly as formatted by the backend, `n` is the raw number used for sorting (null = no value). */
export interface HoldingCell {
  d: string
  n: number | null
}

export interface HoldingRow {
  name: string
  asset: string
  units: HoldingCell
  cost: HoldingCell
  price: HoldingCell
  marketValue: HoldingCell
  gain: HoldingCell
  gainPct: HoldingCell
}

/** GET /api/pms/strategies/:clientCode/performance/holding */
export type PerformanceHoldingResponse = Envelope<{
  summaries: {
    title: string
    subtitle: string
    /** Row-major: Cost, Gain / Loss, Market Value, Gain / Loss % */
    items: LabelValue[]
    /** Share of the portfolio shown in the ring (0-100) */
    ring: number
  }[]
  holdings: {
    title: string
    subtitle: string
    rows: HoldingRow[]
    footer: { count: string; label: string; total: string }
  }
}>

const cell = (d: string, n: number | null): HoldingCell => ({ d, n })
const NONE = cell('—', null)
const eq = (name: string, units: number, cost: [string, number], price: [string, number], mv: [string, number], gain: [string, number], pct: [string, number]): HoldingRow => ({
  name, asset: 'Equity', units: cell(units.toLocaleString('en-IN'), units), cost: cell(...cost), price: cell(...price), marketValue: cell(...mv), gain: cell(...gain), gainPct: cell(...pct),
})

const HOLDING: PerformanceHoldingResponse['data'] = {
  summaries: [
    { title: 'Summary', subtitle: 'As of Feb 24, 2026', ring: 100, items: [{ label: 'Cost', value: '₹19.99 L' }, { label: 'Gain / Loss', value: '₹11.31 L' }, { label: 'Market Value', value: '₹31.31 L' }, { label: 'Gain / Loss %', value: '56.62%' }] },
    { title: 'Equity', subtitle: 'As of Feb 24, 2026', ring: 87.61, items: [{ label: 'Cost', value: '₹16.1 L' }, { label: 'Gain / Loss', value: '₹11.31 L' }, { label: 'Market Value', value: '₹27.42 L' }, { label: 'Gain / Loss %', value: '70.27%' }] },
  ],
  holdings: {
    title: 'Holdings Detail',
    subtitle: 'As of Feb 24, 2026',
    rows: [
      eq('Bank of Baroda', 2100, ['₹ 244', 244], ['₹ 266', 266], ['₹ 5,58,400', 558400], ['+₹46,200', 46200], ['+9.02%', 9.02]),
      eq('Bharti Airtel', 400, ['₹1,312', 1312], ['₹1,451', 1451], ['₹ 5,80,500', 580500], ['+₹55,600', 55600], ['+10.59%', 10.59]),
      { name: 'Cash', asset: 'Cash', units: NONE, cost: NONE, price: NONE, marketValue: cell('₹26,00,000', 2600000), gain: NONE, gainPct: NONE },
      eq('HDFC Bank', 320, ['₹1,398', 1398], ['₹1,485', 1485], ['₹ 4,75,000', 475000], ['+₹27,840', 27840], ['+6.22%', 6.22]),
      eq('Infosys Ltd', 295, ['₹1,472', 1472], ['₹1,573', 1573], ['₹ 4,64,250', 464250], ['+₹29,795', 29795], ['+6.86%', 6.86]),
      eq('Larsen & Toubro', 148, ['₹3,214', 3214], ['₹3,810', 3810], ['₹ 6,08,200', 608200], ['+₹88,208', 88208], ['+18.55%', 18.55]),
      eq('Reliance Industries', 192, ['₹2,460', 2460], ['₹2,662', 2662], ['₹ 5,11,050', 511050], ['+₹38,784', 38784], ['+8.22%', 8.22]),
      eq('State Bank of India', 740, ['₹ 682', 682], ['₹ 740', 740], ['₹ 5,47,200', 547200], ['+₹42,920', 42920], ['+8.50%', 8.5]),
    ],
    footer: { count: '8 securities', label: 'Total portfolio value', total: '₹1,00,07,326' },
  },
}

export async function fetchPerformanceHolding(_clientCode: string, latencyMs = 800): Promise<PerformanceHoldingResponse> {
  await wait(latencyMs)
  return ok(HOLDING)
}

// ---------------------------------------------------------------------------
// Transaction tab (paginated + sortable on the server)
// ---------------------------------------------------------------------------

export type TransactionSortKey = 'account' | 'date' | 'type' | 'security' | 'amount'

export interface TransactionItem {
  clientId: string
  clientCode: string
  clientName: string
  /** DD/MM/YYYY */
  tranDate: string
  /** Short code: AS+ (additional subscription), PRO… */
  tranType: string
  security: string
  units: number
  exchange: string
  unitPrice: number
}

/**
 * GET api/v2/dashboard/portfolio/{clientCode}/transaction-history?page=1&limit=10&sort=date&dir=desc
 * `transactions` is the pasted contract; the paging fields beside it are added by the mock (the tab has a pager).
 */
export type PerformanceTransactionsResponse = Envelope<PageMeta & { transactions: TransactionItem[] }>

const tx = (clientId: string, clientCode: string, clientName: string, tranDate: string, tranType: string, security: string, units: number, unitPrice: number): TransactionItem => ({
  clientId, clientCode, clientName, tranDate, tranType, security, units, exchange: 'DR', unitPrice,
})
const TRANSACTIONS: TransactionItem[] = [
  tx('10019723', 'DI19723A', 'G Injila', '14/08/2026', 'AS+', 'Cash', 1225000, 1),
  tx('10019723', 'DI19723A', 'G Injila', '18/11/2025', 'PRO', 'Cash', 400000, 1),
  tx('10019723', 'DI19723A', 'G Injila', '02/09/2025', 'AS+', 'Cash', 2000000, 1),
  tx('10019723', 'DI19723A', 'G Injila', '26/08/2025', 'AS+', 'Cash', 6000000, 1),
]

const toTime = (d: string) => {
  const [dayN, m, y] = d.split('/').map(Number)
  return Date.UTC(y, m - 1, dayN)
}

export async function fetchPerformanceTransactions(
  _clientCode: string,
  params: PageParams & { sort?: TransactionSortKey; dir?: 'asc' | 'desc' } = {},
  latencyMs = 600,
): Promise<PerformanceTransactionsResponse> {
  await wait(latencyMs)
  const { sort = 'date', dir = 'desc' } = params
  const key = (x: TransactionItem): string | number =>
    sort === 'date' ? toTime(x.tranDate) : sort === 'amount' ? x.units * x.unitPrice : sort === 'account' ? `${x.clientId} - ${x.clientCode} - ${x.clientName}` : sort === 'type' ? x.tranType : x.security
  const sorted = [...TRANSACTIONS].sort((a, b) => {
    const x = key(a)
    const y = key(b)
    return (typeof x === 'string' ? x.localeCompare(y as string) : x - (y as number)) * (dir === 'asc' ? 1 : -1)
  })
  const { rows, meta } = paginate(sorted, params, DEFAULT_LIMIT)
  return ok({ ...meta, transactions: rows })
}
