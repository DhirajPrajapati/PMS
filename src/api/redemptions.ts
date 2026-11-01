import { DEFAULT_LIMIT, paginate, wait, type PageMeta, type PageParams, type Paged } from './pagination'

export type RedemptionStatus = 'TRANSACTION_REJECTED' | 'PAYOUT_INITIATED'

export interface PendingRedemption {
  /** ISO date, YYYY-MM-DD */
  date: string
  /** Rupees */
  amount: number
  status: RedemptionStatus
}

/** GET /api/pms/strategies/:id/pending-partial-redemptions?page=&limit= */
export interface PendingRedemptionsResponse {
  status: 'success' | 'error'
  message: string
  data: PageMeta & {
    strategy_name: string
    strategy_code: string
    redemptions: PendingRedemption[]
  }
}

const DATASET: Record<string, { strategy_name: string; strategy_code: string; redemptions: PendingRedemption[] }> = {
  str_201: {
    strategy_name: 'PMS Largecap Strategy',
    strategy_code: 'DI13745A',
    redemptions: [
      { date: '2025-05-14', amount: 200000, status: 'TRANSACTION_REJECTED' },
      { date: '2024-07-17', amount: 1500, status: 'TRANSACTION_REJECTED' },
      { date: '2024-09-30', amount: 200000, status: 'PAYOUT_INITIATED' },
      { date: '2026-05-13', amount: 1000000, status: 'TRANSACTION_REJECTED' },
    ],
  },
}

/** Builds the response a backend would send for one page. Returns null for unknown strategies. */
export function pendingRedemptionsResponse(strategyId: string, params: PageParams = {}): PendingRedemptionsResponse | null {
  const set = DATASET[strategyId]
  if (!set) return null
  const { rows, meta } = paginate(set.redemptions, params, DEFAULT_LIMIT)
  return {
    status: 'success',
    message: 'Fetched Successfully',
    data: { ...meta, strategy_name: set.strategy_name, strategy_code: set.strategy_code, redemptions: rows },
  }
}

/** Simulates GET /api/pms/strategies/:id/pending-partial-redemptions?page=&limit= */
export async function fetchPendingPartialRedemptions(
  strategyId: string,
  params: PageParams = {},
  latencyMs = 400,
): Promise<Paged<PendingRedemption, PendingRedemptionsResponse>> {
  await wait(latencyMs)
  const res = pendingRedemptionsResponse(strategyId, params)
  if (!res) throw new Error('No pending partial redemptions found')
  if (res.status !== 'success') throw new Error(res.message || 'Failed to load redemptions')
  const d = res.data
  return { items: d.redemptions, response: res, page: d.page, limit: d.limit, total: d.total, totalPages: d.total_pages }
}
