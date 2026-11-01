export type RdRowType = 'item' | 'subtotal' | 'total'

export interface RdRow {
  label: string
  /** Market value in rupees (may be negative / fractional) */
  value: number
  /** item = normal row, subtotal = bold with rules, total = bold on tinted background */
  type: RdRowType
}

export interface RdFile {
  rows: RdRow[]
  disclaimer: string
  /** Where the real file would be served from */
  download_url: string
  file_name: string
}

/** Shape of GET /api/pms/strategies/:id/rd-file */
export interface RdFileResponse {
  status: 'success' | 'error'
  message: string
  data: RdFile
}

const DISCLAIMER =
  'This file is provided for reference purposes only. The values shown are tentative and may not reflect final figures. Actual values may vary.'

export const mockRdFileResponses: Record<string, RdFileResponse> = {
  str_201: {
    status: 'success',
    message: 'Fetched Successfully',
    data: {
      file_name: 'tentative-rd-file-DI13745A.csv',
      download_url: '/api/pms/strategies/str_201/rd-file/download',
      disclaimer: DISCLAIMER,
      rows: [
        { label: 'Management Fees - Jul 1, 2026 To Sep 29, 2026', value: -83820.98171934477, type: 'item' },
        { label: 'Custody Fees - Jul 1, 2026 To Sep 29, 2026', value: -16.764196343868974, type: 'item' },
        { label: 'Tentative - REDEEMABLE VALUE', value: -83837.74591568863, type: 'subtotal' },
        { label: 'Provision for Management Fee', value: 0, type: 'item' },
        { label: 'Other Expenses - Jul 1, 2026 To Sep 29, 2026', value: 0, type: 'item' },
        { label: 'Audit Fees 2026/2027', value: -1062, type: 'item' },
        { label: 'FA Fees', value: -1180, type: 'item' },
        {
          label: 'Tentative - REDEEMABLE VALUE BEFORE PERFORMANCE FEE and EXIT LOAD',
          value: -86079.74591568863,
          type: 'subtotal',
        },
        { label: 'Performance Fees', value: 0, type: 'subtotal' },
        { label: 'Exit Load', value: 0, type: 'subtotal' },
        { label: 'Interest And Dividend Due Not Received', value: 0, type: 'item' },
        { label: 'MARKET VALUE OF EQUITY/LIQUID', value: 0, type: 'item' },
        { label: 'Tentative - NET REDEEMABLE VALUE', value: -86079.74591568863, type: 'total' },
      ],
    },
  },
  str_202: {
    status: 'success',
    message: 'Fetched Successfully',
    data: {
      file_name: 'tentative-rd-file-DI14520F.csv',
      download_url: '/api/pms/strategies/str_202/rd-file/download',
      disclaimer: DISCLAIMER,
      rows: [
        { label: 'Management Fees - Jul 1, 2026 To Sep 29, 2026', value: -61240.5, type: 'item' },
        { label: 'Custody Fees - Jul 1, 2026 To Sep 29, 2026', value: -12.35, type: 'item' },
        { label: 'Tentative - REDEEMABLE VALUE', value: -61252.85, type: 'subtotal' },
        { label: 'Audit Fees 2026/2027', value: -1062, type: 'item' },
        { label: 'FA Fees', value: -1180, type: 'item' },
        { label: 'Tentative - NET REDEEMABLE VALUE', value: -63494.85, type: 'total' },
      ],
    },
  },
}

/** Simulates GET /api/pms/strategies/:id/rd-file */
export async function fetchRdFile(strategyId: string, latencyMs = 400): Promise<RdFile> {
  await new Promise((r) => setTimeout(r, latencyMs))
  const res = mockRdFileResponses[strategyId]
  if (!res) throw new Error('RD file not available')
  if (res.status !== 'success') throw new Error(res.message || 'Failed to load RD file')
  return res.data
}
