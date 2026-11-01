import type { PmsStrategy } from '../components/cards/PmsCard'
import { DEFAULT_LIMIT, paginate, wait, type PageMeta, type PageParams, type Paged } from './pagination'

/** Shape of the (mock) backend response. Amounts are in rupees. */
export interface ApiRedemptionOption {
  code: string
  /** Button label */
  label: string
  /** Text shown once chosen (when no amount is needed) */
  summary_label: string
  /** true = show an amount input after choosing */
  requires_amount: boolean
  /** true = show the "View RD File" link after choosing */
  rd_file_available: boolean
}

export interface ApiStrategy {
  id: string
  provider_name: string
  strategy_code: string
  strategy_name: string
  distributor_name: string
  current_aum: number
  /** Signed percentage, may be negative */
  xirr_percent: number
  /** Chart series, may contain negative values */
  xirr_trend: number[]
  minimum_additional_amount: number
  /** Quick-add chip values, in rupees */
  quick_add_amounts: number[]
  /** Which card layout to render */
  card_type: 'purchase' | 'summary' | 'redemption'
  /** Redemption cards: show the "View Pending Partial Redemptions" link */
  has_pending_partial_redemptions: boolean
  /** Redemption cards: choices shown under "Redemption Type" */
  redemption_options: ApiRedemptionOption[]
}

export interface ApiResponse<T> {
  status: 'success' | 'error'
  message: string
  data: T
}

const REDEMPTION_OPTIONS: ApiRedemptionOption[] = [
  { code: 'PARTIAL', label: 'Partial', summary_label: 'Partial Redemption', requires_amount: true, rd_file_available: false },
  { code: 'FULL', label: 'Full', summary_label: 'Full Redemption', requires_amount: false, rd_file_available: true },
]

const BASE: ApiStrategy[] = [
      {
        id: 'str_001',
        provider_name: 'ICICI Prudential',
        strategy_code: 'DI13745A',
        strategy_name: 'PMS Largecap Strategy',
        distributor_name: 'XYZ Distributors',
        current_aum: 12400000,
        xirr_percent: 15.2,
        xirr_trend: [10, 12, 11.5, 14, 15, 16.5, 18],
        minimum_additional_amount: 500000,
        quick_add_amounts: [500000, 1000000, 2500000],
        card_type: 'purchase',
        has_pending_partial_redemptions: false,
        redemption_options: [],
      },
      {
        id: 'str_002',
        provider_name: 'ICICI Prudential',
        strategy_code: 'DI14520F',
        strategy_name: 'PMS Contrarian Strategy',
        distributor_name: 'XYZ Distributors',
        current_aum: 8260000,
        xirr_percent: 12.8,
        xirr_trend: [10, 11, 12.5, 12, 14.5, 16, 17],
        minimum_additional_amount: 500000,
        quick_add_amounts: [500000, 1000000, 2500000],
        card_type: 'purchase',
        has_pending_partial_redemptions: false,
        redemption_options: [],
      },
      {
        id: 'str_003',
        provider_name: 'ICICI Prudential',
        strategy_code: 'DI14742H',
        strategy_name: 'PMS Multicap Strategy',
        distributor_name: 'ABC Wealth Mgmt',
        current_aum: 6890000,
        xirr_percent: 10.6,
        xirr_trend: [10, 11, 10.5, 12, 11.5, 13, 14],
        minimum_additional_amount: 500000,
        quick_add_amounts: [500000, 1000000, 2500000],
        card_type: 'purchase',
        has_pending_partial_redemptions: false,
        redemption_options: [],
      },
      {
        id: 'str_004',
        provider_name: 'ICICI Prudential',
        strategy_code: 'DI15033K',
        strategy_name: 'PMS Smallcap Strategy',
        distributor_name: 'XYZ Distributors',
        current_aum: 4530000,
        xirr_percent: -4.7,
        xirr_trend: [6, 4, 5, 1, -2, -1, -5],
        minimum_additional_amount: 500000,
        quick_add_amounts: [500000, 1000000, 2500000],
        card_type: 'purchase',
        has_pending_partial_redemptions: false,
        redemption_options: [],
      },
      {
        id: 'str_101',
        provider_name: 'ICICI Prudential',
        strategy_code: 'DI13745A',
        strategy_name: 'PMS Largecap Strategy',
        distributor_name: 'XYZ Distributors',
        current_aum: 12400000,
        xirr_percent: 15.2,
        xirr_trend: [10, 12, 11.5, 14, 15, 16.5, 18],
        minimum_additional_amount: 500000,
        quick_add_amounts: [],
        card_type: 'summary',
        has_pending_partial_redemptions: false,
        redemption_options: [],
      },
      {
        id: 'str_102',
        provider_name: 'ICICI Prudential',
        strategy_code: 'DI14520F',
        strategy_name: 'PMS Contrarian Strategy',
        distributor_name: 'XYZ Distributors',
        current_aum: 8260000,
        xirr_percent: 12.8,
        xirr_trend: [10, 11, 12.5, 12, 14.5, 16, 17],
        minimum_additional_amount: 500000,
        quick_add_amounts: [],
        card_type: 'summary',
        has_pending_partial_redemptions: false,
        redemption_options: [],
      },
      {
        id: 'str_201',
        provider_name: 'ICICI Prudential',
        strategy_code: 'DI13745A',
        strategy_name: 'PMS Largecap Strategy',
        distributor_name: 'XYZ Distributors',
        current_aum: 12400000,
        xirr_percent: 15.2,
        xirr_trend: [10, 12, 11.5, 14, 15, 16.5, 18],
        minimum_additional_amount: 500000,
        quick_add_amounts: [],
        card_type: 'redemption',
        has_pending_partial_redemptions: true,
        redemption_options: REDEMPTION_OPTIONS,
      },
      {
        id: 'str_202',
        provider_name: 'ICICI Prudential',
        strategy_code: 'DI14520F',
        strategy_name: 'PMS Contrarian Strategy',
        distributor_name: 'XYZ Distributors',
        current_aum: 8260000,
        xirr_percent: 12.8,
        xirr_trend: [10, 11, 12.5, 12, 14.5, 16, 17],
        minimum_additional_amount: 500000,
        quick_add_amounts: [],
        card_type: 'redemption',
        has_pending_partial_redemptions: false,
        redemption_options: REDEMPTION_OPTIONS,
      },
]



const RAW = BASE

const ok = <T>(data: T): ApiResponse<T> => ({ status: 'success', message: 'Fetched Successfully', data })
const of = (type: ApiStrategy['card_type']) => RAW.filter((s) => s.card_type === type)

/** Fields every PMS strategy row carries. */
type Core = Omit<ApiStrategy, 'card_type' | 'minimum_additional_amount' | 'quick_add_amounts' | 'has_pending_partial_redemptions' | 'redemption_options'>

export type ApiPurchaseStrategy = Core & Pick<ApiStrategy, 'minimum_additional_amount' | 'quick_add_amounts'>
export type ApiSummaryStrategy = Core
export type ApiRedemptionStrategy = Core & Pick<ApiStrategy, 'has_pending_partial_redemptions' | 'redemption_options'>

type Listing<S> = ApiResponse<PageMeta & { strategies: S[] }>

const core = (s: ApiStrategy): Core => ({
  id: s.id,
  provider_name: s.provider_name,
  strategy_code: s.strategy_code,
  strategy_name: s.strategy_name,
  distributor_name: s.distributor_name,
  current_aum: s.current_aum,
  xirr_percent: s.xirr_percent,
  xirr_trend: s.xirr_trend,
})

const mapCore = (s: Core, variant: PmsStrategy['variant']): PmsStrategy => ({
  id: s.id,
  provider: s.provider_name,
  code: s.strategy_code,
  name: s.strategy_name,
  distributor: s.distributor_name,
  aumRupees: s.current_aum,
  xirr: s.xirr_percent,
  trend: s.xirr_trend,
  variant,
  minAmount: 0,
  quickAdd: [],
  hasPendingPartial: false,
  redemptionOptions: [],
})

function build<S, T>(
  response: Listing<S>,
  map: (s: S) => T,
): Paged<T, Listing<S>> {
  const d = response.data
  return { items: d.strategies.map(map), response, page: d.page, limit: d.limit, total: d.total, totalPages: d.total_pages }
}

/** Simulates GET /api/pms/additional-purchase?page=&limit= */
export async function fetchAdditionalPurchase(params: PageParams = {}, latencyMs = 600): Promise<Paged<PmsStrategy, Listing<ApiPurchaseStrategy>>> {
  await wait(latencyMs)
  const { rows, meta } = paginate(of('purchase'), params, DEFAULT_LIMIT)
  const response = ok({
    ...meta,
    strategies: rows.map((s): ApiPurchaseStrategy => ({ ...core(s), minimum_additional_amount: s.minimum_additional_amount, quick_add_amounts: s.quick_add_amounts })),
  })
  return build(response, (s) => ({ ...mapCore(s, 'purchase'), minAmount: s.minimum_additional_amount, quickAdd: s.quick_add_amounts }))
}

/** Simulates GET /api/pms/summary?page=&limit= */
export async function fetchSummary(params: PageParams = {}, latencyMs = 450): Promise<Paged<PmsStrategy, Listing<ApiSummaryStrategy>>> {
  await wait(latencyMs)
  const { rows, meta } = paginate(of('summary'), params, DEFAULT_LIMIT)
  const response = ok({ ...meta, strategies: rows.map((s): ApiSummaryStrategy => core(s)) })
  return build(response, (s) => mapCore(s, 'summary'))
}

/** Simulates GET /api/pms/redemption?page=&limit= */
export async function fetchRedemption(params: PageParams = {}, latencyMs = 750): Promise<Paged<PmsStrategy, Listing<ApiRedemptionStrategy>>> {
  await wait(latencyMs)
  const { rows, meta } = paginate(of('redemption'), params, DEFAULT_LIMIT)
  const response = ok({
    ...meta,
    strategies: rows.map((s): ApiRedemptionStrategy => ({
      ...core(s),
      has_pending_partial_redemptions: s.has_pending_partial_redemptions,
      redemption_options: s.redemption_options,
    })),
  })
  return build(response, (s) => ({
    ...mapCore(s, 'redemption'),
    hasPendingPartial: s.has_pending_partial_redemptions,
    redemptionOptions: s.redemption_options.map((o) => ({
      code: o.code,
      label: o.label,
      summaryLabel: o.summary_label,
      requiresAmount: o.requires_amount,
      rdFileAvailable: o.rd_file_available,
    })),
  }))
}
