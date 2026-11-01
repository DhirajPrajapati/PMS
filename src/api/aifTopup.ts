import { DEFAULT_LIMIT, paginate, wait, type PageMeta, type PageParams, type Paged } from './pagination'
import type { AifFund } from '../components/cards/AifTopupCard'

export interface ApiUnitClass {
  unit_class: string
  /** ISO date, YYYY-MM-DD */
  inception_date: string
  /** Rupees */
  commitment_amount: number
  capital_called: number
  amount_contributed: number
  current_value: number
  /** Pre-ticked when the card opens */
  default_selected: boolean
}

export interface ApiAifFund {
  id: string
  provider_name: string
  fund_name: string
  folio_no: string
  /** e.g. "CAT III" */
  category: string
  broker: string
  /** Rupees */
  commitment_amount: number
  capital_called: number
  amount_contributed: number
  current_value: number
  unit_classes: ApiUnitClass[]
}

/** GET /api/aif/topup */
export interface AifTopupResponse {
  status: 'success' | 'error'
  message: string
  data: PageMeta & { funds: ApiAifFund[] }
}

const unit = (name: string, selected = false): ApiUnitClass => ({
  unit_class: name,
  inception_date: '2021-10-30',
  commitment_amount: 10000000,
  capital_called: 10000000,
  amount_contributed: 10000000,
  current_value: 15000000,
  default_selected: selected,
})

const FIRST: ApiAifFund[] = [
      {
        id: 'aif_001',
        provider_name: 'ICICI Prudential',
        fund_name: 'Long Short Fund Series II',
        folio_no: '7400000562',
        category: 'CAT III',
        broker: 'Standard Chartered',
        commitment_amount: 20000000,
        capital_called: 15000000,
        amount_contributed: 15000000,
        current_value: 17500000,
        unit_classes: [unit('B1', true), unit('B14'), unit('C1'), unit('B24')],
      },
      {
        id: 'aif_002',
        provider_name: 'ICICI Prudential',
        fund_name: 'Real Estate Credit Fund III',
        folio_no: '7400000977',
        category: 'CAT II',
        broker: 'HDFC Securities',
        commitment_amount: 10000000,
        capital_called: 6000000,
        amount_contributed: 6000000,
        current_value: 6450000,
        unit_classes: [
          { ...unit('A1', true), commitment_amount: 5000000, capital_called: 3000000, amount_contributed: 3000000, current_value: 3250000 },
          { ...unit('A2'), commitment_amount: 5000000, capital_called: 3000000, amount_contributed: 3000000, current_value: 3200000 },
        ],
      },
]

const FUNDS = FIRST

export async function fetchAifTopup(params: PageParams = {}, latencyMs = 500): Promise<Paged<AifFund, AifTopupResponse>> {
  await wait(latencyMs)
  const { rows, meta } = paginate(FUNDS, params, DEFAULT_LIMIT)
  const res: AifTopupResponse = { status: 'success', message: 'Fetched Successfully', data: { ...meta, funds: rows } }
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
      commitment: u.commitment_amount,
      capitalCalled: u.capital_called,
      contributed: u.amount_contributed,
      currentValue: u.current_value,
      defaultSelected: u.default_selected,
    })),
  }))
  const d = res.data
  return { items, response: res, page: d.page, limit: d.limit, total: d.total, totalPages: d.total_pages }
}
