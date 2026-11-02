import type { Profile } from '../components/cards/ProfileCard'
import { DEFAULT_LIMIT, paginate, wait, type PageMeta, type PageParams, type Paged } from './pagination'

export interface ApiProfileBank {
  bank_name: string
  /** Already masked by the backend, e.g. "XXXX 4521" */
  account_no_masked: string
}

export interface ApiProfile {
  id: string
  /** Investor code shown as the pill, e.g. "DI13745A" */
  investor_code: string
  name: string
  /** "Joint" pill is shown when true */
  is_joint: boolean
  /** Check icon state on the card */
  is_verified: boolean
  mobile: string
  /** Masked by the backend, e.g. "m****h@gmail.com" */
  email_masked: string
  address: string
  bank: ApiProfileBank
  nominee_count: number
  broker: string
}

/** Options for the "Account: All Numbers" dropdown */
export interface ApiAccountOption {
  mobile: string
  label: string
}

/** GET /api/profiles?page=1&limit=10&mobile=98765%2043210 (mobile omitted = All Numbers) */
export interface ProfilesResponse {
  status: 'success' | 'error'
  message: string
  data: PageMeta & {
    profiles: ApiProfile[]
    accounts: ApiAccountOption[]
  }
}

export interface ProfileParams extends PageParams {
  /** Filter by account mobile number; omit for "All Numbers" */
  mobile?: string
}

const PROFILES: ApiProfile[] = [
  {
    id: 'prf_001',
    investor_code: 'DI13745A',
    name: 'Vikram Nair',
    is_joint: false,
    is_verified: true,
    mobile: '98765 43210',
    email_masked: 'm****h@gmail.com',
    address: '42, Juhu Scheme, Vile Parle (W), Mumbai, Maharashtra – 400049',
    bank: { bank_name: 'HDFC Bank', account_no_masked: 'XXXX 4521' },
    nominee_count: 1,
    broker: 'ICICI Securities',
  },
  {
    id: 'prf_002',
    investor_code: 'DI13896B',
    name: 'Vikram Nair',
    is_joint: true,
    is_verified: true,
    mobile: '98765 43210',
    email_masked: 'm****h@gmail.com',
    address: '42, Juhu Scheme, Vile Parle (W), Mumbai, Maharashtra – 400049',
    bank: { bank_name: 'ICICI Bank', account_no_masked: 'XXXX 8762' },
    nominee_count: 2,
    broker: 'HDFC Securities',
  },
  {
    id: 'prf_003',
    investor_code: 'DI14012C',
    name: 'Vikram Kumar Nair',
    is_joint: false,
    is_verified: true,
    mobile: '98765 43210',
    email_masked: 'm****i@outlook.com',
    address: '15, Green Park Colony, Pune, Maharashtra – 411001',
    bank: { bank_name: 'Axis Bank', account_no_masked: 'XXXX 3341' },
    nominee_count: 1,
    broker: 'Kotak Securities',
  },
  {
    id: 'prf_004',
    investor_code: 'DI14201D',
    name: 'Ananya Nair',
    is_joint: false,
    is_verified: true,
    mobile: '87654 32109',
    email_masked: 'p****a@gmail.com',
    address: '42, Juhu Scheme, Vile Parle (W), Mumbai, Maharashtra – 400049',
    bank: { bank_name: 'HDFC Bank', account_no_masked: 'XXXX 7823' },
    nominee_count: 1,
    broker: 'ICICI Securities',
  },
]

const ACCOUNTS: ApiAccountOption[] = [
  { mobile: '98765 43210', label: '98765 43210' },
  { mobile: '87654 32109', label: '87654 32109' },
]

export async function fetchProfiles(params: ProfileParams = {}, latencyMs = 500): Promise<Paged<Profile, ProfilesResponse> & { accounts: ApiAccountOption[] }> {
  await wait(latencyMs)
  const filtered = params.mobile ? PROFILES.filter((p) => p.mobile === params.mobile) : PROFILES
  const { rows, meta } = paginate(filtered, params, DEFAULT_LIMIT)
  const res: ProfilesResponse = {
    status: 'success',
    message: 'Fetched Successfully',
    data: { ...meta, profiles: rows, accounts: ACCOUNTS },
  }
  if (res.status !== 'success') throw new Error(res.message || 'Failed to load profiles')
  const d = res.data
  const items: Profile[] = d.profiles.map((p) => ({
    id: p.id,
    investorCode: p.investor_code,
    name: p.name,
    joint: p.is_joint,
    verified: p.is_verified,
    mobile: p.mobile,
    email: p.email_masked,
    address: p.address,
    bankName: p.bank.bank_name,
    bankAccount: p.bank.account_no_masked,
    nominees: p.nominee_count,
    broker: p.broker,
  }))
  return { items, accounts: d.accounts, response: res, page: d.page, limit: d.limit, total: d.total, totalPages: d.total_pages }
}
