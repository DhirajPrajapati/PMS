import { wait } from './pagination'
import type { HoldingCell, KpiCard, LabelValue } from './performanceSummary'

interface Envelope<T> {
  status: 'success' | 'error'
  message: string
  data: T
}

export type StatementFilter = 'All' | 'Contribution' | 'Distributions' | 'Redemptions' | 'Others Fee / Charges'
export type StatementSortKey = 'date' | 'description' | 'nav' | 'units' | 'amount'

export interface StatementTransaction {
  id: string
  date: HoldingCell
  /** Pill label on phones: Contribution, Fee / Charges, Distribution, Redemption */
  type: string
  description: string
  nav: HoldingCell
  units: HoldingCell
  amount: HoldingCell
}

/** GET /api/aif/statements/:folio */
export type AifStatementResponse = Envelope<{
  provider: string
  fundName: string
  folio: string
  category: string
  /** e.g. "31 Jul 2024" */
  asOn: string
  cards: KpiCard[]
  capital: { title: string; subtitle: string; rows: LabelValue[] }
  valuation: { title: string; subtitle: string; rows: LabelValue[] }
  transactions: { title: string; subtitle: string; filters: StatementFilter[]; sortOptions: { key: StatementSortKey; label: string }[] }
}>

/** GET /api/aif/statements/:folio/transactions?filter=All&sort=date&dir=asc */
export type AifStatementTransactionsResponse = Envelope<{ filter: StatementFilter; sort: StatementSortKey; dir: 'asc' | 'desc'; rows: StatementTransaction[] }>

const ok = <T>(data: T): Envelope<T> => ({ status: 'success', message: 'Fetched Successfully', data })
const c = (d: string, n: number | null): HoldingCell => ({ d, n })
const lv = (label: string, value: string): LabelValue => ({ label, value })
const SEP_26 = Date.UTC(2023, 8, 26)

const STATEMENT: AifStatementResponse['data'] = {
  provider: 'ICICI Prudential',
  fundName: 'Corporate Credit Opportunities Fund AIF – II',
  folio: '7400001204',
  category: 'CAT II',
  asOn: '31 Jul 2024',
  cards: [
    { label: 'Net Contribution', value: '₹1,00,07,326', sub: 'Total capital contributed' },
    { label: 'Current Value', value: '₹11,57,326', sub: 'Statement valuation' },
    { label: 'XIRR', value: '18.4%', sub: 'Annualised return' },
  ],
  capital: {
    title: 'Capital Contribution', subtitle: 'Commitment and capital activity',
    rows: [lv('Capital Commitment', '₹1,00,00,000.00'), lv('Capital Called', '₹1,00,00,175.00'), lv('Capital Uncalled', '₹0'), lv('Total Distribution', '₹1,00,00,000.00'), lv('Amount Contributed', '₹1,00,00,225.00')],
  },
  valuation: {
    title: 'Valuation', subtitle: 'Unit balances and current valuation',
    rows: [lv('Face value per unit', '₹100.00'), lv('NAV as on 31 Jul 2024', '₹104.65'), lv('Current AUM as on 31Jul 2024', '₹1,05,27,857.15'), lv('Units Allotted', '1,15,049.995'), lv('Units Redeemed', '19,964.580'), lv('Balance Units', '95,085.415')],
  },
  transactions: {
    title: 'Transaction Details', subtitle: 'Transactions for this statement period',
    filters: ['All', 'Contribution', 'Distributions', 'Redemptions', 'Others Fee / Charges'],
    sortOptions: [{ key: 'date', label: 'Transaction Date' }, { key: 'description', label: 'Description' }, { key: 'nav', label: 'NAV(₹)' }, { key: 'units', label: 'Units' }, { key: 'amount', label: 'Amount(₹)' }],
  },
}

const TRANSACTIONS: StatementTransaction[] = [
  { id: 's1', date: c('26 Sep 2023', SEP_26), type: 'Contribution', description: 'Initial contribution', nav: c('-', null), units: c('-', null), amount: c('5,00,000.00', 500000) },
  { id: 's2', date: c('26 Sep 2023', SEP_26), type: 'Fee / Charges', description: 'Formation and offering expenses', nav: c('-', null), units: c('-', null), amount: c('0.00', 0) },
  { id: 's3', date: c('26 Sep 2023', SEP_26), type: 'Contribution', description: 'Net contribution', nav: c('100.00', 100), units: c('4,999.750', 4999.75), amount: c('4,99,975.00', 499975) },
  { id: 's4', date: c('26 Sep 2023', SEP_26), type: 'Fee / Charges', description: 'Stamp duty on contribution of ₹5,00,000 (inclusive)', nav: c('-', null), units: c('-', null), amount: c('25.00', 25) },
]
const FILTER_TYPE: Record<StatementFilter, string | null> = { All: null, Contribution: 'Contribution', Distributions: 'Distribution', Redemptions: 'Redemption', 'Others Fee / Charges': 'Fee / Charges' }

export async function fetchAifStatement(_folio: string, latencyMs = 700): Promise<AifStatementResponse> {
  await wait(latencyMs)
  return ok(STATEMENT)
}

export async function fetchAifStatementTransactions(
  _folio: string,
  params: { filter?: StatementFilter; sort?: StatementSortKey; dir?: 'asc' | 'desc' } = {},
  latencyMs = 500,
): Promise<AifStatementTransactionsResponse> {
  await wait(latencyMs)
  const { filter = 'All', sort = 'date', dir = 'asc' } = params
  const want = FILTER_TYPE[filter]
  const key = (x: StatementTransaction): string | number | null => (sort === 'description' ? x.description : sort === 'date' ? x.date.n : x[sort].n)
  const rows = TRANSACTIONS.filter((x) => !want || x.type === want).sort((a, b) => {
    const p = key(a)
    const q = key(b)
    if (p === null && q === null) return 0
    if (p === null) return 1
    if (q === null) return -1
    return (typeof p === 'string' ? p.localeCompare(q as string) : p - (q as number)) * (dir === 'asc' ? 1 : -1)
  })
  return ok({ filter, sort, dir, rows })
}
