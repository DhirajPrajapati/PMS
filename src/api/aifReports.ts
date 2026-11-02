import { wait } from './pagination'

export type AifCategory = 'CAT II' | 'CAT III'
export type AifDelivery = 'email' | 'download'

/* ---------- GET /api/aif/report-schemes?search=&category= ---------- */

export interface ApiAifFolio {
  folio_no: string
  holders: string[]
  broker: string
  /** Rupees */
  current_value: number
}

export interface ApiAifScheme {
  id: string
  provider: string
  name: string
  category: AifCategory
  folios: ApiAifFolio[]
}

export interface AifSchemesResponse {
  status: 'success' | 'error'
  message: string
  data: { total: number; schemes: ApiAifScheme[] }
}

/* ---------- GET /api/aif/report-options ---------- */

export interface ApiAifReport {
  id: string
  name: string
  /** Shows "Report Criteria" (consolidate by + date range) when ticked */
  requires_criteria: boolean
}

export interface AifOptionsResponse {
  status: 'success' | 'error'
  message: string
  data: { reports: ApiAifReport[]; consolidate_by: { value: string; label: string }[] }
}

/* ---------- POST /api/aif/reports/generate ---------- */

export interface AifGenerateRequest {
  scheme_id: string
  folio_no: string
  report_ids: string[]
  criteria?: { consolidate_by: string; from_date: string; to_date: string }
  delivery: AifDelivery
}

export interface AifGenerateResponse {
  status: 'success' | 'error'
  message: string
  data: { request_id: string; reports: { report_id: string; file_name: string | null }[]; emailed_to: string | null; generated_at: string }
}

const folio = (no: string, holders: string[], value: number): ApiAifFolio => ({ folio_no: no, holders, broker: 'WealthBridge Capital', current_value: value })
const NAIRS = ['Vikram Nair', 'Priya Nair', 'Arjun Nair']

const SCHEMES: ApiAifScheme[] = [
  {
    id: 'aif_001', provider: 'ICICI PRUDENTIAL', name: 'Multi Asset Absolute Return', category: 'CAT III',
    folios: [folio('AIF/001234/24', NAIRS, 24500000), folio('AIF/001235/24', NAIRS.slice(0, 2), 18200000), folio('AIF/001236/24', NAIRS.slice(0, 1), 9600000)],
  },
  {
    id: 'aif_002', provider: 'ICICI PRUDENTIAL', name: 'Long Short Equity', category: 'CAT III',
    folios: [folio('AIF/002567/24', NAIRS.slice(0, 2), 15400000), folio('AIF/002568/24', NAIRS.slice(0, 1), 7300000), folio('AIF/002569/24', NAIRS, 21100000)],
  },
  {
    id: 'aif_003', provider: 'ICICI PRUDENTIAL', name: 'Performing Credit', category: 'CAT II',
    folios: [folio('AIF/003891/24', NAIRS.slice(0, 2), 12800000), folio('AIF/003892/24', NAIRS.slice(0, 1), 5600000)],
  },
]

const REPORTS: ApiAifReport[] = [
  { id: 'income_statement', name: 'Income Statement', requires_criteria: false },
  { id: 'soa', name: 'Statement of Account (SOA)', requires_criteria: true },
  { id: 'form_64', name: 'Form 64', requires_criteria: false },
  { id: 'tds_certificate', name: 'TDS Certificate', requires_criteria: false },
  { id: 'distribution_letter', name: 'Distribution Letter', requires_criteria: false },
  { id: 'drawdown_letter', name: 'Drawdown Letter', requires_criteria: false },
]

export async function fetchAifSchemes(params: { search?: string; category?: AifCategory | 'All' } = {}, latencyMs = 300): Promise<AifSchemesResponse> {
  await wait(latencyMs)
  const q = (params.search ?? '').trim().toLowerCase()
  const schemes = SCHEMES.filter((s) => (!params.category || params.category === 'All' || s.category === params.category) && (!q || s.name.toLowerCase().includes(q) || s.folios.some((f) => f.folio_no.toLowerCase().includes(q))))
  return { status: 'success', message: 'Fetched Successfully', data: { total: schemes.length, schemes } }
}

export async function fetchAifOptions(latencyMs = 350): Promise<AifOptionsResponse> {
  await wait(latencyMs)
  return {
    status: 'success',
    message: 'Fetched Successfully',
    data: {
      reports: REPORTS,
      consolidate_by: [
        { value: 'consolidate_holder', label: 'Consolidate Holder' },
        { value: 'consolidate_client_code', label: 'Consolidate - Client Code' },
        { value: 'folio_number', label: 'Folio Number' },
        { value: 'scheme_name', label: 'Scheme Name (Invested in)' },
      ],
    },
  }
}

export async function generateAifReport(req: AifGenerateRequest, latencyMs = 700): Promise<AifGenerateResponse> {
  await wait(latencyMs)
  const email = req.delivery === 'email'
  return {
    status: 'success',
    message: email ? 'Report generated and email queued' : 'Report generated',
    data: {
      request_id: `aif_${req.scheme_id}_${req.folio_no.replace(/\W/g, '')}`,
      reports: req.report_ids.map((id) => ({ report_id: id, file_name: email ? null : `${id}_${req.folio_no.replace(/\W/g, '')}.pdf` })),
      emailed_to: email ? 'm****h@gmail.com' : null,
      generated_at: new Date().toISOString(),
    },
  }
}
