import { wait } from './pagination'

export type Product = 'PMS' | 'AIF'
export type DeliveryMode = 'download' | 'email' | 'download_email'

/* ---------- GET /api/reports/holders?product=PMS ---------- */

export interface ApiDiCode {
  di_code: string
  /** Shown in the dropdown, e.g. "DI01366A · Vikram Nair" */
  label: string
}

export interface ApiHolder {
  id: string
  name: string
  holder_type: 'single' | 'joint'
}

/* ---------- GET /api/reports/holders/:holderId/di-codes?product=PMS ---------- */

export interface DiCodesResponse {
  status: 'success' | 'error'
  message: string
  data: { product: Product; holder_id: string; holder_name: string; di_codes: ApiDiCode[] }
}

export interface HoldersResponse {
  status: 'success' | 'error'
  message: string
  data: { product: Product; holders: ApiHolder[] }
}

/* ---------- GET /api/reports/catalog?product=PMS ---------- */

export interface ApiReport {
  id: string
  name: string
  /** Shows the "Advance Options" link when selected */
  has_advance_options: boolean
}

export interface ApiReportCategory {
  id: string
  name: string
  reports: ApiReport[]
}

export interface ApiCriteria {
  id: string
  label: string
  /** "Date Range" needs a from and to date before the report can be generated */
  requires_dates: boolean
}

export interface CatalogResponse {
  status: 'success' | 'error'
  message: string
  data: { product: Product; categories: ApiReportCategory[]; criteria: ApiCriteria[] }
}

/* ---------- POST /api/reports/generate ---------- */

/* ---------- GET /api/reports/:reportId/advanced-options ---------- */

export interface ApiAdvancedOption {
  value: string
  label: string
}

export interface ApiAdvancedSection {
  id: string
  title: string
  default_value: string
  options: ApiAdvancedOption[]
}

export interface AdvancedOptionsResponse {
  status: 'success' | 'error'
  message: string
  data: { report_id: string; sections: ApiAdvancedSection[] }
}

export interface GenerateRequest {
  product: Product
  di_code: string
  report_id: string
  criteria: { type: string; from_date?: string; to_date?: string }
  delivery: DeliveryMode
  /** Section id -> chosen option value; only sent when the user applied advanced options */
  advanced_options?: Record<string, string>
}

export interface GenerateResponse {
  status: 'success' | 'error'
  message: string
  data: { request_id: string; report_name: string; file_name: string | null; emailed_to: string | null; generated_at: string }
}

const CRITERIA: ApiCriteria[] = [
  { id: 'since_inception', label: 'Since Inception', requires_dates: false },
  { id: 'current_fy', label: 'Current FY', requires_dates: false },
  { id: 'previous_fy', label: 'Previous FY', requires_dates: false },
  { id: 'date_range', label: 'Date Range', requires_dates: true },
]

const r = (id: string, name: string, adv = true): ApiReport => ({ id, name, has_advance_options: adv })

const PMS_CATEGORIES: ApiReportCategory[] = [
  {
    id: 'portfolio_snapshot',
    name: 'Portfolio Snapshot',
    reports: [
      r('portfolio_factsheet', 'Portfolio Factsheet', true),
      r('current_portfolio', 'Current Portfolio'),
      r('portfolio_appraisal', 'Portfolio Appraisal'),
      r('pms_investor_report', 'PMS Investor Report'),
      r('statement_of_holding', 'Statement of Holding'),
      r('performance_by_investment', 'Performance by Investment'),
      r('portfolio_factsheet_aif', 'Portfolio Factsheet (AIF)'),
    ],
  },
  {
    id: 'asset_performance',
    name: 'Asset Performance',
    reports: [r('asset_allocation', 'Asset Allocation'), r('sector_exposure', 'Sector Exposure'), r('top_holdings', 'Top Holdings'), r('benchmark_comparison', 'Benchmark Comparison')],
  },
  {
    id: 'transaction_records',
    name: 'Transaction Records',
    reports: [r('transaction_statement', 'Transaction Statement'), r('capital_register', 'Capital Register'), r('contract_notes', 'Contract Notes')],
  },
  {
    id: 'income_gains',
    name: 'Income & Gains',
    reports: [r('realised_gains', 'Realised Gains'), r('dividend_income', 'Dividend Income'), r('income_summary', 'Income Summary'), r('capital_gains_statement', 'Capital Gains Statement')],
  },
  { id: 'fund_overview', name: 'Fund Overview', reports: [r('strategy_factsheet', 'Strategy Factsheet'), r('strategy_overview', 'Strategy Overview')] },
  { id: 'compliance', name: 'Compliance', reports: [r('fee_statement', 'Fee Statement'), r('compliance_certificate', 'Compliance Certificate'), r('tax_statement', 'Tax Statement')] },
]

const AIF_CATEGORIES: ApiReportCategory[] = [
  {
    id: 'portfolio_snapshot',
    name: 'Portfolio Snapshot',
    reports: [r('aif_factsheet', 'Portfolio Factsheet (AIF)', true), r('capital_account_statement', 'Capital Account Statement'), r('unit_holding_statement', 'Unit Holding Statement')],
  },
  {
    id: 'asset_performance',
    name: 'Asset Performance',
    reports: [r('aif_performance', 'Fund Performance'), r('aif_irr', 'IRR Summary')],
  },
  {
    id: 'transaction_records',
    name: 'Transaction Records',
    reports: [r('drawdown_notices', 'Drawdown Notices'), r('distribution_register', 'Distribution Register'), r('contribution_statement', 'Contribution Statement')],
  },
  { id: 'income_gains', name: 'Income & Gains', reports: [r('aif_income', 'Income Distribution'), r('aif_gains', 'Capital Gains Statement')] },
  { id: 'fund_overview', name: 'Fund Overview', reports: [r('ppm_summary', 'PPM Summary'), r('fund_factsheet', 'Fund Factsheet')] },
  { id: 'compliance', name: 'Compliance', reports: [r('aif_fee_statement', 'Fee Statement'), r('aif_tax_statement', 'Tax Statement')] },
]

type HolderRecord = ApiHolder & { di_codes: ApiDiCode[] }

const HOLDERS: Record<Product, HolderRecord[]> = {
  PMS: [
    { id: 'hld_001', name: 'Vikram Nair', holder_type: 'single', di_codes: [{ di_code: 'DI01366A', label: 'DI01366A · Vikram Nair' }, { di_code: 'DI13745A', label: 'DI13745A · Vikram Nair' }] },
    { id: 'hld_002', name: 'Priya Sharma', holder_type: 'single', di_codes: [{ di_code: 'DI02211B', label: 'DI02211B · Priya Sharma' }] },
    { id: 'hld_003', name: 'Arjun Mehta', holder_type: 'single', di_codes: [{ di_code: 'DI03388C', label: 'DI03388C · Arjun Mehta' }] },
    { id: 'hld_004', name: 'Nair, Sharma', holder_type: 'joint', di_codes: [{ di_code: 'DI13896B', label: 'DI13896B · Nair, Sharma' }] },
    { id: 'hld_005', name: 'Mehta, Patel', holder_type: 'joint', di_codes: [{ di_code: 'DI04410D', label: 'DI04410D · Mehta, Patel' }] },
  ],
  AIF: [
    { id: 'hld_001', name: 'Vikram Nair', holder_type: 'single', di_codes: [{ di_code: 'AI01366A', label: 'AI01366A · Vikram Nair' }] },
    { id: 'hld_002', name: 'Priya Sharma', holder_type: 'single', di_codes: [{ di_code: 'AI02211B', label: 'AI02211B · Priya Sharma' }] },
    { id: 'hld_004', name: 'Nair, Sharma', holder_type: 'joint', di_codes: [{ di_code: 'AI13896B', label: 'AI13896B · Nair, Sharma' }] },
  ],
}

export async function fetchHolders(product: Product, latencyMs = 450): Promise<HoldersResponse> {
  await wait(latencyMs)
  return { status: 'success', message: 'Fetched Successfully', data: { product, holders: HOLDERS[product].map(({ id, name, holder_type }) => ({ id, name, holder_type })) } }
}

export async function fetchDiCodes(holderId: string, product: Product, latencyMs = 400): Promise<DiCodesResponse> {
  await wait(latencyMs)
  const h = HOLDERS[product].find((x) => x.id === holderId)
  if (!h) return { status: 'error', message: 'Holder not found', data: { product, holder_id: holderId, holder_name: '', di_codes: [] } }
  return { status: 'success', message: 'Fetched Successfully', data: { product, holder_id: h.id, holder_name: h.name, di_codes: h.di_codes } }
}

export async function fetchCatalog(product: Product, latencyMs = 450): Promise<CatalogResponse> {
  await wait(latencyMs)
  return { status: 'success', message: 'Fetched Successfully', data: { product, categories: product === 'PMS' ? PMS_CATEGORIES : AIF_CATEGORIES, criteria: CRITERIA } }
}

export async function generateReport(req: GenerateRequest, latencyMs = 700): Promise<GenerateResponse> {
  await wait(latencyMs)
  const report = [...PMS_CATEGORIES, ...AIF_CATEGORIES].flatMap((c) => c.reports).find((x) => x.id === req.report_id)
  const emails = req.delivery !== 'download'
  return {
    status: 'success',
    message: emails ? 'Report generated and email queued' : 'Report generated',
    data: {
      request_id: `rpt_${req.di_code.toLowerCase()}_${req.report_id}`,
      report_name: report?.name ?? req.report_id,
      file_name: req.delivery === 'email' ? null : `${req.report_id}_${req.di_code}.pdf`,
      emailed_to: emails ? 'm****h@gmail.com' : null,
      generated_at: new Date().toISOString(),
    },
  }
}

const opt = (label: string, value = label.toLowerCase().replace(/[^a-z0-9]+/g, '_')): ApiAdvancedOption => ({ value, label })
const section = (id: string, title: string, labels: string[]): ApiAdvancedSection => ({
  id,
  title,
  default_value: opt(labels[0]).value,
  options: labels.map((l) => opt(l)),
})

const ADVANCED_SECTIONS: ApiAdvancedSection[] = [
  section('security_type', 'Security Type', ['All', 'Equity', 'Plain Debt', 'Fixed Deposit', 'Money Market Discounted', 'Options', 'Futures', 'Mutual Funds', 'Cash and equivalent', 'Other Assets']),
  section('security_type_detail', 'Security Type Detail', ['All', 'Listed Equity', 'Unlisted Equity', 'Listed Debt', 'Unlisted Debt', 'Structured Products']),
  section('transaction_type', 'Transaction Type', ['All', 'Purchase', 'Sale', 'Transfer In', 'Transfer Out', 'Corporate Action']),
  section('group_by', 'Group by', ['Security Type Detail', 'Security Type', 'Account', 'Date']),
  section('report_type', 'Report Type', ['Regular Transaction Statement', 'Detailed Transaction Statement', 'Summary Statement']),
  section('show_report_for', 'Show report for', ['With Summary', 'Without Summary', 'Summary Only']),
  section('display_folio_numbers', 'Display Folio Numbers', ['Yes', 'No']),
]

export async function fetchAdvancedOptions(reportId: string, latencyMs = 350): Promise<AdvancedOptionsResponse> {
  await wait(latencyMs)
  return { status: 'success', message: 'Fetched Successfully', data: { report_id: reportId, sections: ADVANCED_SECTIONS } }
}
