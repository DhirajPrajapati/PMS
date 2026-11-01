import { DEFAULT_LIMIT, paginate, wait, type PageParams, type Paged } from './pagination'
import type { MyStrategy } from '../components/cards/MyStrategyCard'

/** Per-range returns as strings, e.g. { "1m": "10.23%", ..., "all": "30.2%" } */
export type ApiReturns = Record<string, string>

export interface ApiLoRow {
  /** Product type, shown as the corner tag */
  type: string
  /** Client code (unique per row). Spelling matches the backend. */
  CliendCode: string
  strategy: string
  /** Rupees */
  invested: number
  /** Rupees */
  aum: number
  /** Signed percentage, may be negative */
  xirr: number
  benchmark: ApiReturns
  portfolio: ApiReturns
}

/** GET /api/pms/my-strategies */
export interface MyStrategiesResponse {
  status: 'success' | 'error'
  message: string
  data: {
    /** Count across all pages */
    total: number
    page: number
    limit: number
    totalPages: number
    asOnDate: string
    los: ApiLoRow[]
  }
}

const returns = (b1: string, b3: string, b6: string, y1: string, all: string): ApiReturns => ({
  '1m': b1,
  '3m': b3,
  '6m': b6,
  '1y': y1,
  all,
})

const AS_ON_DATE = '3 Jun 2026, 09:30 AM'

const LOS: ApiLoRow[] = [
  {
    type: 'PMS',
    CliendCode: 'DI0001',
    strategy: 'PMS Contra Strategy',
    invested: 400000000.0,
    aum: 1120000000.0,
    xirr: 18.5,
    benchmark: returns('10.23%', '12.45%', '14.67%', '16.89%', '30.2%'),
    portfolio: returns('10.23%', '12.45%', '14.67%', '16.89%', '30.2%'),
  },
  {
    type: 'AIF',
    CliendCode: 'DI0002',
    strategy: 'Enhanced Dynamic Equity Fund',
    invested: 450000000.0,
    aum: 12400000000.0,
    xirr: 18.4,
    benchmark: returns('10.38%', '12.1%', '15.62%', '22.4%', '48.73%'),
    portfolio: returns('9.23%', '13.46%', '14.2%', '25.11%', '55.34%'),
  },
  {
    type: 'PMS',
    CliendCode: 'DI0003',
    strategy: 'PMS Growth Fund',
    invested: 300000000.0,
    aum: 9800000000.0,
    xirr: 16.2,
    benchmark: returns('10.38%', '11.7%', '13.9%', '19.6%', '41.05%'),
    portfolio: returns('9.23%', '12.8%', '15.4%', '21.3%', '44.9%'),
  },
  {
    type: 'PMS',
    CliendCode: 'DI0004',
    strategy: 'PMS Smallcap Strategy',
    invested: 82500000.0,
    aum: 4530000000.0,
    xirr: -4.7,
    benchmark: returns('-2.45%', '1.8%', '-4.12%', '8.9%', '21.5%'),
    portfolio: returns('-3.1%', '-2.26%', '-6.75%', '3.35%', '12.04%'),
  },
]

export interface MyStrategiesData {
  total: number
  asOnDate: string
  strategies: MyStrategy[]
}

/** "10.23%" -> 10.23 */
const pct = (s: string) => parseFloat(s)
/** "1m" -> "1M", "all" -> "All" */
const rangeLabel = (k: string) => (k.toLowerCase() === 'all' ? 'All' : k.toUpperCase())

// The response carries no provider name, so the logo row uses this label.
const PROVIDER = 'ICICI Prudential'

function mapRow(r: ApiLoRow): MyStrategy {
  const keys = Object.keys(r.benchmark)
  const performance: MyStrategy['performance'] = {}
  for (const k of keys) {
    performance[rangeLabel(k)] = { benchmark: pct(r.benchmark[k]), portfolio: pct(r.portfolio[k]) }
  }
  const ranges = keys.map(rangeLabel)
  return {
    id: r.CliendCode,
    provider: PROVIDER,
    tag: r.type,
    name: r.strategy,
    invested: r.invested,
    aum: r.aum,
    xirr: r.xirr,
    ranges,
    defaultRange: ranges[0],
    performance,
  }
}

export interface MyStrategiesPage extends Paged<MyStrategy, MyStrategiesResponse> {
  asOnDate: string
}

/** Simulates GET /api/pms/my-strategies?page=&limit= */
export async function fetchMyStrategies(params: PageParams = {}, latencyMs = 500): Promise<MyStrategiesPage> {
  await wait(latencyMs)
  const { rows, meta } = paginate(LOS, params, DEFAULT_LIMIT)
  const res: MyStrategiesResponse = {
    status: 'success',
    message: 'Fetched Successfully',
    data: { total: meta.total, page: meta.page, limit: meta.limit, totalPages: meta.total_pages, asOnDate: AS_ON_DATE, los: rows },
  }
  if (res.status !== 'success') throw new Error(res.message || 'Failed to load strategies')
  const d = res.data
  return { items: d.los.map(mapRow), response: res, page: d.page, limit: d.limit, total: d.total, totalPages: d.totalPages, asOnDate: d.asOnDate }
}
