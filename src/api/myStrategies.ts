import { DEFAULT_LIMIT, paginate, wait, type PageParams, type Paged } from './pagination'
import type { MyStrategy } from '../components/cards/MyStrategyCard'

/** Return for one duration, in percent */
export interface ApiTrend {
  /** "1M" | "3M" | "6M" | "1Y" | "All" */
  duration: string
  benchmark: number
  portfolio: number
}

export interface ApiStrategyRow {
  /** Product type, shown as the corner tag */
  type: string
  clientCode: string
  strategy: string
  /** Rupees */
  invested: number
  /** Rupees */
  aum: number
  /** Signed percentage, may be negative */
  xirr: number
  trends: ApiTrend[]
  /** AIF rows only (not in the pasted contract; the AIF card needs them) */
  folio?: string
  category?: string
  /** Rupees, signed */
  absReturn?: number
  /** Percent, signed */
  absReturnPct?: number
  /** Sparkline series for the absolute return */
  trend?: number[]
  /** ISO date of the NAV */
  navDate?: string
  nav?: number
}

/** GET api/v2/dashboard/portfolio/strategies/{page}/{size} */
export interface MyStrategiesResponse {
  status: 'success' | 'error'
  message: string
  data: {
    /** Count across all pages */
    total: number
    asOnDate: string
    strategies: ApiStrategyRow[]
  }
}

const AS_ON_DATE = '3 Jun 2026, 09:30 AM'

const DURATIONS = ['1M', '3M', '6M', '1Y', 'All']
/** Builds the five trend entries from benchmark / portfolio percent lists */
const trends = (benchmark: number[], portfolio: number[]): ApiTrend[] => DURATIONS.map((duration, i) => ({ duration, benchmark: benchmark[i], portfolio: portfolio[i] }))

const STRATEGIES: ApiStrategyRow[] = [
  {
    type: 'PMS',
    clientCode: 'DI0001',
    strategy: 'PMS Contra Strategy',
    invested: 400000000.0,
    aum: 1120000000.0,
    xirr: 18.5,
    trends: trends([10.23, 12.45, 14.67, 16.89, 30.2], [10.23, 12.45, 14.67, 16.89, 30.2]),
  },
  {
    type: 'PMS',
    clientCode: 'DI0003',
    strategy: 'PMS Growth Fund',
    invested: 300000000.0,
    aum: 9800000000.0,
    xirr: 16.2,
    trends: trends([10.38, 11.7, 13.9, 19.6, 41.05], [9.23, 12.8, 15.4, 21.3, 44.9]),
  },
  {
    type: 'AIF',
    clientCode: 'DI0002',
    strategy: 'Corporate Credit Opportunities Fund AIF II',
    invested: 20000000.0,
    aum: 24500000.0,
    xirr: 22.5,
    trends: trends([10.38, 12.1, 15.62, 22.4, 48.73], [9.23, 13.46, 14.2, 25.11, 55.34]),
    folio: '7400001204',
    category: 'CAT II',
    absReturn: 4500000.0,
    absReturnPct: 22.5,
    trend: [14, 15, 15.5, 18, 29, 19, 22, 25, 23, 28, 26, 31, 29, 33, 30, 35],
    navDate: '2026-06-03',
    nav: 115.5,
  },
  {
    type: 'PMS',
    clientCode: 'DI0004',
    strategy: 'PMS Smallcap Strategy',
    invested: 82500000.0,
    aum: 4530000000.0,
    xirr: -4.7,
    trends: trends([-2.45, 1.8, -4.12, 8.9, 21.5], [-3.1, -2.26, -6.75, 3.35, 12.04]),
  },
]

export interface MyStrategiesData {
  total: number
  asOnDate: string
  strategies: MyStrategy[]
}

// The response carries no provider name, so the logo row uses this label.
const PROVIDER = 'ICICI Prudential'

function mapRow(r: ApiStrategyRow): MyStrategy {
  const performance: MyStrategy['performance'] = {}
  for (const t of r.trends) performance[t.duration] = { benchmark: t.benchmark, portfolio: t.portfolio }
  const ranges = r.trends.map((t) => t.duration)
  return {
    id: r.clientCode,
    provider: PROVIDER,
    tag: r.type,
    name: r.strategy,
    invested: r.invested,
    aum: r.aum,
    xirr: r.xirr,
    ranges,
    defaultRange: ranges[0],
    performance,
    aif:
      r.type.toUpperCase() === 'AIF'
        ? {
            folio: r.folio ?? '',
            category: r.category ?? '',
            absReturn: r.absReturn ?? 0,
            absReturnPct: r.absReturnPct ?? 0,
            trend: r.trend ?? [],
            navDate: r.navDate ?? '',
            nav: r.nav ?? 0,
          }
        : undefined,
  }
}

export interface MyStrategiesPage extends Paged<MyStrategy, MyStrategiesResponse> {
  asOnDate: string
}

/** Simulates GET api/v2/dashboard/portfolio/strategies/{page}/{size} (paging lives in the path) */
export async function fetchMyStrategies(params: PageParams = {}, latencyMs = 500): Promise<MyStrategiesPage> {
  await wait(latencyMs)
  const { rows, meta } = paginate(STRATEGIES, params, DEFAULT_LIMIT)
  const res: MyStrategiesResponse = {
    status: 'success',
    message: 'Fetched Successfully',
    data: { total: meta.total, asOnDate: AS_ON_DATE, strategies: rows },
  }
  if (res.status !== 'success') throw new Error(res.message || 'Failed to load strategies')
  const d = res.data
  return { items: d.strategies.map(mapRow), response: res, page: meta.page, limit: meta.limit, total: d.total, totalPages: meta.total_pages, asOnDate: d.asOnDate }
}
