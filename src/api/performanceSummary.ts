import { DEFAULT_LIMIT, paginate, wait, type PageMeta, type PageParams } from './pagination'

export type AllocationKey = 'equity' | 'cash' | 'debt' | 'derivatives' | 'other'

export interface AllocationRow {
  key: AllocationKey
  label: string
  /** Display string exactly as the backend formats it */
  amount: string
  /** Percent of total AUM */
  pct: number
}

/** One KPI tile; every tab returns its own four */
export interface KpiCard {
  label: string
  value: string
  sub: string
}

interface Envelope<T> {
  status: 'success' | 'error'
  message: string
  data: T
}

/** GET /api/pms/strategies/:clientCode/performance/header (shown above every tab) */
export type PerformanceHeaderResponse = Envelope<{
  clientName: string
  clientCode: string
  type: string
  strategy: string
  provider: string
}>

/** GET /api/pms/strategies/:clientCode/performance/summary */
export type PerformanceSummaryResponse = Envelope<{
  disclaimer: string
  cards: KpiCard[]
  performance: {
    inceptionDate: string
    netCapital: string
    realisedGainLoss: string
    /** Signed, rendered green when positive */
    unrealisedGainLoss: string
    incomeReceived: string
    feesExpenses: string
    accruedIncome: string
    portfolioValueDate: string
    portfolioValue: string
  }
  allocation: { totalAum: string; rows: AllocationRow[] }
}>

/** GET /api/pms/strategies/:clientCode/performance/xirr (percent values) */
export type PerformanceXirrResponse = Envelope<{
  cards: KpiCard[]
  rows: { period: string; portfolio: number; benchmark: number }[]
}>

/** GET /api/pms/strategies/:clientCode/performance/allocation */
export type PerformanceAllocationResponse = Envelope<{
  cards: KpiCard[]
  sectors: { label: string; amount: string; pct: number }[]
  securities: { name: string; sector: string; pct: string; value: string }[]
}>

const ok = <T>(data: T): Envelope<T> => ({ status: 'success', message: 'Fetched Successfully', data })

export async function fetchPerformanceHeader(_clientCode: string, latencyMs = 400): Promise<PerformanceHeaderResponse> {
  await wait(latencyMs)
  return ok({ clientName: 'Amit Deshmukh', clientCode: 'DI01366A', type: 'PMS', strategy: 'PMS Contra Strategy', provider: 'ICICI Prudential' })
}

export async function fetchPerformanceSummary(_clientCode: string, latencyMs = 700): Promise<PerformanceSummaryResponse> {
  await wait(latencyMs)
  return ok({
    disclaimer: 'The data below excludes transactions that are currently under processing.',
    cards: [
      { label: 'Current Value', value: '₹1,00,07,326', sub: "Today's portfolio value" },
      { label: 'Net Capital', value: '₹88,50,000', sub: 'Total invested' },
      { label: 'Absolute Return', value: '₹11,57,326', sub: 'Total gain on investment' },
      { label: 'XIRR', value: '18.4%', sub: 'Annualised return' },
    ],
    performance: {
      inceptionDate: '26/08/2025',
      netCapital: '₹88,50,000',
      realisedGainLoss: '₹0',
      unrealisedGainLoss: '+₹11,04,540',
      incomeReceived: '₹52,786',
      feesExpenses: '₹1,24,500',
      accruedIncome: '₹28,000',
      portfolioValueDate: '20/08/2026',
      portfolioValue: '₹1,00,07,326',
    },
    allocation: {
      totalAum: '₹1.0 Cr',
      rows: [
        { key: 'equity', label: 'Equity', amount: '₹74,89,123', pct: 74.81 },
        { key: 'cash', label: 'Cash & Equiv.', amount: '₹15,42,000', pct: 15.42 },
        { key: 'debt', label: 'Debt', amount: '₹ 6,23,452', pct: 6.23 },
        { key: 'derivatives', label: 'Derivatives', amount: '₹ 2,89,341', pct: 2.89 },
        { key: 'other', label: 'Other', amount: '₹ 65,410', pct: 0.65 },
      ],
    },
  })
}

export async function fetchPerformanceXirr(_clientCode: string, latencyMs = 700): Promise<PerformanceXirrResponse> {
  await wait(latencyMs)
  return ok({
    cards: [
      { label: 'Current Value', value: '₹1,00,07,326', sub: "Today's portfolio value" },
      { label: 'Net Capital', value: '₹88,50,000', sub: 'Total invested' },
      { label: 'Absolute Return', value: '₹11,57,326', sub: 'Total gain on investment' },
      { label: 'XIRR', value: '16.2%', sub: 'Annualised return' },
    ],
    rows: [
      { period: '1 Month', portfolio: 1.2, benchmark: 0.95 },
      { period: '3 Month', portfolio: 3.85, benchmark: 3.1 },
      { period: '6 Month', portfolio: 7.42, benchmark: 6.3 },
      { period: '1 Year', portfolio: 14.6, benchmark: 12.8 },
      { period: 'Since Inception', portfolio: 21.4, benchmark: 18.5 },
    ],
  })
}

export async function fetchPerformanceAllocation(_clientCode: string, latencyMs = 700): Promise<PerformanceAllocationResponse> {
  await wait(latencyMs)
  return ok({
    cards: [
      { label: 'Current Value', value: '₹1,00,07,326', sub: 'Total market value of your portfolio today' },
      { label: 'Capital Invested', value: '₹88,50,000', sub: 'Net Capital Investment' },
      { label: 'Absolute Return', value: '₹11,57,326', sub: '+13.08% absolute' },
      { label: 'XIRR', value: '9.11%', sub: 'Annualized Return' },
    ],
    sectors: [
      { label: 'Financial Services', amount: '₹28,42,000', pct: 28.4 },
      { label: 'Information Tech.', amount: '₹18,72,000', pct: 18.7 },
      { label: 'Automobile', amount: '₹12,31,000', pct: 12.3 },
      { label: 'Healthcare', amount: '₹9,61,000', pct: 9.6 },
      { label: 'Energy', amount: '₹8,21,000', pct: 8.2 },
      { label: 'Consumer Goods', amount: '₹7,80,000', pct: 7.8 },
      { label: 'Services', amount: '₹6,40,000', pct: 6.4 },
      { label: 'Others', amount: '₹8,61,000', pct: 8.6 },
    ],
    securities: [
      { name: 'Cash', sector: 'MISCELLANEOUS', pct: '12.38%', value: '₹3,88,249' },
      { name: 'Bharti Airtel Ltd', sector: 'TELECOM - SERVICES', pct: '8.02%', value: '₹2,51,344' },
      { name: 'Hindalco Industries Ltd', sector: 'METALS', pct: '7.65%', value: '₹2,39,753' },
      { name: 'Tata Steel Ltd', sector: 'METALS', pct: '7.41%', value: '₹2,32,178' },
      { name: 'Great Eastern Shipping Co. Ltd', sector: 'TRANS', pct: '6.83%', value: '₹2,14,153' },
      { name: 'Larsen & Toubro Ltd', sector: 'CONSTRUCTION', pct: '6.50%', value: '₹2,03,870' },
      { name: 'State Bank of India', sector: 'FINANCIAL SERVICES', pct: '6.03%', value: '₹1,89,036' },
      { name: 'Muthoot Finance Limited', sector: 'FINANCIAL SERVICES', pct: '5.89%', value: '₹1,84,740' },
      { name: 'Bharat Forge Ltd', sector: 'INDUSTRIAL MFG', pct: '5.27%', value: '₹1,65,135' },
    ],
  })
}

// ---------------------------------------------------------------------------
// Performance tab. One response shape for every product variant: the UI renders
// whatever label/value arrays come back, so AIF only changes the data.
// ---------------------------------------------------------------------------

export type Tone = 'maroon' | 'green' | 'red' | 'navy' | 'slate'
export type PerformanceVariant = 'pms' | 'aif'

export interface LabelValue {
  label: string
  value: string
  /** Colours the value (green gain, red loss…) */
  tone?: Tone
}

/** XIRR view of the Active Summary card */
export interface OverviewView {
  key: string
  kind: 'overview'
  hero: { label: string; value: string; badge: string; note: string }
  metrics: { label: string; value: string; sub: string; tone?: Tone; icon: 'capital' | 'return' }[]
  compare: { title: string; rows: { label: string; pct: number; display: string }[]; badge: string }
  /** Sections that belong to the XIRR view only (the TWRR view has none) */
  trajectory: { title: string; subtitle: string; categories: string[]; labelAt: number[]; ticks: number[]; series: { name: string; data: number[] }[] }
  summary: { title: string; subtitle: string; rows: LabelValue[] }
  pnl: { title: string; subtitle: string; rows: LabelValue[] }
}

/** TWRR view: a strip of label/value cells + a periodic returns chart */
export interface StripView {
  key: string
  kind: 'strip'
  strip: LabelValue[]
  chart: { title: string; subtitle: string; categories: string[]; portfolio: number[]; benchmark: number[] }
}

/** GET /api/pms/strategies/:clientCode/performance (also /aif/… with the AIF labels) */
export type PerformanceTabResponse = Envelope<{
  variant: PerformanceVariant
  cards: KpiCard[]
  activeSummary: { subtitle: string; views: (OverviewView | StripView)[] }
  capitalFlow: { title: string; subtitle: string; asOn: string; items: { label: string; value: string; sub: string; tone: Tone; fill: number; marker: string }[] }
}>

const XIRR_SERIES = [7.24, 7.15, 7.05, 7.2, 7.45, 7.4, 7.35, 7.5, 7.75, 7.95, 8.15, 8.35, 8.5, 8.45, 8.3, 8.55, 8.9, 9.2, 9.5, 9.4, 9.1, 9.45, 9.76, 9.8, 9.7, 9.6]
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const TRAJ_CATEGORIES = XIRR_SERIES.map((_, i) => `${MONTHS[i % 12]}'${24 + Math.floor(i / 12)}`)

const PMS_TAB: PerformanceTabResponse['data'] = {
  variant: 'pms',
  cards: [
    { label: 'Current Value', value: '₹1,00,07,326', sub: "Today's portfolio value" },
    { label: 'Capital Invested', value: '₹88,50,000', sub: 'Net Capital Investment' },
    { label: 'Absolute Gain / Loss', value: '₹11,57,326', sub: '+13.08% absolute' },
    { label: 'XIRR', value: '9.11%', sub: 'Annualized Return' },
  ],
  activeSummary: {
    subtitle: 'PMS Contra Strategy · Feb 24, 2026',
    views: [
      {
        key: 'XIRR', kind: 'overview',
        hero: { label: 'Current Portfolio Value', value: '₹1,00,07,326', badge: '+₹11,57,326 · +13.08%', note: 'vs ₹88,50,000 invested' },
        metrics: [
          { label: 'Net Capital', value: '₹88,50,000', sub: 'Invested Capital', icon: 'capital' },
          { label: 'Abs. Return', value: '₹11,57,326', sub: 'Since inception', tone: 'green', icon: 'return' },
        ],
        compare: { title: 'Portfolio vs Benchmark', rows: [{ label: 'Portfolio', pct: 9.11, display: '9.11%' }, { label: 'Benchmark', pct: 8.45, display: '8.45%' }], badge: '+0.66% Alpha' },
      trajectory: {
        title: 'XIRR Performance Trajectory', subtitle: 'Jan 2024 – Feb 2026 · Annualised return (%)',
        categories: TRAJ_CATEGORIES, labelAt: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 25], ticks: [6, 8, 11],
        series: [
          { name: 'XIRR', data: XIRR_SERIES },
          { name: 'Benchmark', data: XIRR_SERIES.map((v) => +(v - 0.55).toFixed(2)) },
        ],
      },
      summary: {
        title: 'Performance Summary', subtitle: 'Key performance indicators',
        rows: [
          { label: 'Begin Value', value: '₹88,50,000' },
          { label: 'Capital In', value: '₹26,00,000' },
          { label: 'Capital Out', value: '₹14,42,674' },
          { label: 'Profit / Loss', value: '+₹11,57,326', tone: 'green' },
          { label: 'Current Value', value: '₹1,00,07,326' },
          { label: 'Change %', value: '+13.08%', tone: 'green' },
        ],
      },
      pnl: {
        title: 'Profit & Loss', subtitle: 'Financial gains and losses',
        rows: [
          { label: 'Realised Gain / Loss', value: '₹0', tone: 'slate' },
          { label: 'Unrealised Gain / Loss', value: '+₹11,04,540', tone: 'green' },
          { label: 'Prior Gain', value: '₹52,786', tone: 'green' },
          { label: 'Income Received', value: '₹52,786', tone: 'green' },
          { label: 'Fees & Expenses', value: '₹1,24,500', tone: 'red' },
          { label: 'Accrued Income', value: '₹28,000', tone: 'green' },
        ],
      },
      },
      {
        key: 'TWRR', kind: 'strip',
        strip: [
          { label: 'Begin Value', value: '₹32.44 L' },
          { label: 'Net Capital', value: '₹50 L' },
          { label: 'Gain / Loss', value: '₹−1.09 L', tone: 'red' },
          { label: 'Current Value', value: '₹31.35 L' },
          { label: 'Portfolio', value: '0%' },
          { label: 'S&P BSE200 %', value: '0.00%' },
        ],
        chart: {
          title: 'Portfolio Performance', subtitle: 'TWRR vs BSE 500 TRI benchmark',
          categories: ['2025-10-31', '2025-11-30', '2025-12-31', '2026-01-31', '2026-02-28', '2026-03-31', '2026-04-30', '2026-05-31', '2026-06-30', '2026-07-31', '2026-08-31', '2026-09-08'],
          portfolio: [-4.5, 2.5, 1.55, -0.25, 5.2, 0.1, -0.2, 0.05, 0.05, -3.6, 0.03, 0.03],
          benchmark: [0.4, 0.6, -0.2, -0.5, 0.3, -0.1, 0.1, 0.02, 0.02, -0.25, 0.02, 0.02],
        },
      },
    ],
  },
  capitalFlow: {
    title: 'Capital Flow', subtitle: 'Inception → current · portfolio movement', asOn: 'As on 09 Sep 2026',
    items: [
      { label: 'Begin Value', value: '₹88,50,000', sub: 'At inception', tone: 'maroon', fill: 87, marker: '' },
      { label: 'Capital In', value: '+₹26,00,000', sub: 'Inflows', tone: 'green', fill: 26, marker: '+ ' },
      { label: 'Capital Out', value: '−₹14,42,674', sub: 'Outflows', tone: 'red', fill: 14, marker: '– ' },
      { label: 'Current Value', value: '₹1,00,07,326', sub: 'As on Feb 24, 2026', tone: 'navy', fill: 100, marker: '' },
    ],
  },
}

/** AIF flavour: same shape, fund-style labels. */
const AIF_TAB: PerformanceTabResponse['data'] = {
  ...PMS_TAB,
  variant: 'aif',
  cards: [
    { label: 'Current NAV Value', value: '₹1,00,07,326', sub: 'Value of your units today' },
    { label: 'Capital Contributed', value: '₹88,50,000', sub: 'Drawn down so far' },
    { label: 'Absolute Gain / Loss', value: '₹11,57,326', sub: '+13.08% absolute' },
    { label: 'IRR', value: '9.11%', sub: 'Annualized Return' },
  ],
  activeSummary: {
    subtitle: 'AIF Growth Fund · Feb 24, 2026',
    views: [
      { ...(PMS_TAB.activeSummary.views[0] as OverviewView), summary: { title: 'Fund Summary', subtitle: 'Key fund indicators', rows: [{ label: 'Commitment', value: '₹1,00,00,000' }, { label: 'Contributions', value: '₹88,50,000' }, { label: 'Distributions', value: '₹14,42,674' }, { label: 'Profit / Loss', value: '+₹11,57,326', tone: 'green' }, { label: 'Current NAV', value: '₹1,00,07,326' }, { label: 'Change %', value: '+13.08%', tone: 'green' }] }, hero: { label: 'Current NAV Value', value: '₹1,00,07,326', badge: '+₹11,57,326 · +13.08%', note: 'vs ₹88,50,000 contributed' } },
      { ...(PMS_TAB.activeSummary.views[1] as StripView), key: 'TWRR', strip: [{ label: 'Opening NAV', value: '₹32.44 L' }, { label: 'Contributions', value: '₹50 L' }, { label: 'Gain / Loss', value: '₹−1.09 L', tone: 'red' }, { label: 'Closing NAV', value: '₹31.35 L' }, { label: 'Fund', value: '0%' }, { label: 'Benchmark %', value: '0.00%' }] },
    ],
  },
  capitalFlow: {
    ...PMS_TAB.capitalFlow,
    items: [
      { label: 'Commitment', value: '₹1,00,00,000', sub: 'Total committed', tone: 'maroon', fill: 100, marker: '' },
      { label: 'Contributions', value: '+₹88,50,000', sub: 'Drawn down', tone: 'green', fill: 88, marker: '+ ' },
      { label: 'Distributions', value: '−₹14,42,674', sub: 'Returned', tone: 'red', fill: 14, marker: '– ' },
      { label: 'Current NAV', value: '₹1,00,07,326', sub: 'As on Feb 24, 2026', tone: 'navy', fill: 100, marker: '' },
    ],
  },
}

export async function fetchPerformanceTab(_clientCode: string, variant: PerformanceVariant = 'pms', latencyMs = 800): Promise<PerformanceTabResponse> {
  await wait(latencyMs)
  return ok(variant === 'aif' ? AIF_TAB : PMS_TAB)
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

export interface TransactionRow {
  id: string
  account: string
  date: HoldingCell
  /** Short code shown in the pill (AS+, PRO…) */
  type: string
  security: string
  amount: HoldingCell
  /** Expanded details, one array per table column: account, trans type, amount */
  details: [LabelValue[], LabelValue[], LabelValue[]]
}

/** GET /api/pms/strategies/:clientCode/performance/transactions?page=1&limit=10&sort=date&dir=desc */
export type PerformanceTransactionsResponse = Envelope<PageMeta & { subtitle: string; rows: TransactionRow[] }>

const lv = (label: string, value: string): LabelValue => ({ label, value })
const TRANSACTIONS: TransactionRow[] = [
  {
    id: 't1', account: '10019723 - DI19723A - G Injila', date: cell('14/08/2026', Date.UTC(2026, 7, 14)), type: 'AS+', security: 'Cash', amount: cell('₹12.25 L', 1225000),
    details: [
      [lv('Date', '14/08/2026'), lv('Units', '1225000'), lv('Trading A/c', '–')],
      [lv('Amount', '₹12.25 L'), lv('Tran Type', 'Additional subscription'), lv('DP', 'IN301348 - 20034802')],
      [lv('Security', 'Cash'), lv('Price', '1'), lv('Exchange', 'DIR')],
    ],
  },
  {
    id: 't2', account: '10019723 - DI19723A - G Injila', date: cell('18/11/2025', Date.UTC(2025, 10, 18)), type: 'PRO', security: 'Cash', amount: cell('₹4 L', 400000),
    details: [
      [lv('Date', '18/11/2025'), lv('Units', '400000'), lv('Trading A/c', '–')],
      [lv('Amount', '₹4 L'), lv('Tran Type', 'Profit distribution'), lv('DP', 'IN301348 - 20034802')],
      [lv('Security', 'Cash'), lv('Price', '1'), lv('Exchange', 'DIR')],
    ],
  },
]

export async function fetchPerformanceTransactions(
  _clientCode: string,
  params: PageParams & { sort?: TransactionSortKey; dir?: 'asc' | 'desc' } = {},
  latencyMs = 600,
): Promise<PerformanceTransactionsResponse> {
  await wait(latencyMs)
  const { sort = 'date', dir = 'desc' } = params
  const key = (x: TransactionRow): string | number => (sort === 'date' ? x.date.n ?? 0 : sort === 'amount' ? x.amount.n ?? 0 : x[sort])
  const sorted = [...TRANSACTIONS].sort((a, b) => {
    const x = key(a)
    const y = key(b)
    return (typeof x === 'string' ? x.localeCompare(y as string) : x - (y as number)) * (dir === 'asc' ? 1 : -1)
  })
  const { rows, meta } = paginate(sorted, params, DEFAULT_LIMIT)
  return ok({ ...meta, subtitle: 'PMS Contra Strategy', rows })
}
