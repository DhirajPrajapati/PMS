import { DEFAULT_LIMIT, paginate, wait, type PageMeta, type PageParams, type Paged } from './pagination'
import type { AifRedemptionFund } from '../components/cards/AifRedemptionCard'

export interface ApiRedemptionUnit {
  unit_class: string
  inception_date: string
  nav: number
  invested_value: number
  current_value: number
  /** ISO date */
  exit_load_date: string
}

export interface ApiRedemptionFund {
  id: string
  provider_name: string
  fund_name: string
  folio_no: string
  category: string
  broker: string
  commitment_amount: number
  capital_called: number
  amount_contributed: number
  current_value: number
  unit_classes: ApiRedemptionUnit[]
}

/** GET /api/aif/redemption */
export interface AifRedemptionResponse {
  status: 'success' | 'error'
  message: string
  data: PageMeta & { funds: ApiRedemptionFund[] }
}

const unit = (name: string): ApiRedemptionUnit => ({
  unit_class: name,
  inception_date: '2021-10-30',
  nav: 129.12,
  invested_value: 12500000,
  current_value: 15000000,
  exit_load_date: '2026-07-28',
})

const FIRST: ApiRedemptionFund[] = [
      {
        id: 'aifr_001',
        provider_name: 'ICICI Prudential',
        fund_name: 'Long Short Fund Series II',
        folio_no: '7400000562',
        category: 'CAT III',
        broker: 'Standard Chartered',
        commitment_amount: 20000000,
        capital_called: 15000000,
        amount_contributed: 15000000,
        current_value: 17500000,
        unit_classes: [unit('B1'), unit('B14'), unit('C1'), unit('B24')],
      },
]

const FUNDS = FIRST

export async function fetchAifRedemption(params: PageParams = {}, latencyMs = 500): Promise<Paged<AifRedemptionFund, AifRedemptionResponse>> {
  await wait(latencyMs)
  const { rows, meta } = paginate(FUNDS, params, DEFAULT_LIMIT)
  const res: AifRedemptionResponse = { status: 'success', message: 'Fetched Successfully', data: { ...meta, funds: rows } }
  if (res.status !== 'success') throw new Error(res.message || 'Failed to load AIF funds')
  const items = res.data.funds.map((f) => ({
    id: f.id,
    provider: f.provider_name,
    name: f.fund_name,
    folio: f.folio_no,
    category: f.category,
    broker: f.broker,
    commitment: f.commitment_amount,
    capitalCalled: f.capital_called,
    contributed: f.amount_contributed,
    currentValue: f.current_value,
    unitClasses: f.unit_classes.map((u) => ({
      name: u.unit_class,
      inceptionDate: u.inception_date,
      nav: u.nav,
      investedValue: u.invested_value,
      currentValue: u.current_value,
      exitLoadDate: u.exit_load_date,
    })),
  }))
  const d = res.data
  return { items, response: res, page: d.page, limit: d.limit, total: d.total, totalPages: d.total_pages }
}
